import { prisma } from '@/lib/db';
import { emitBookingNotice } from './booking-notifications';
import { NOTIFICATION_TEMPLATES } from './templates';

/**
 * Varredura periódica de lembretes de agendamento (24h e 2h antes)
 */
export async function runReminderCycle(now: Date = new Date()): Promise<{ reminders24h: number; reminders2h: number }> {
  let reminders24h = 0;
  let reminders2h = 0;

  // Janela de 24h: entre 23h e 25h a partir de agora
  const win24Start = new Date(now.getTime() + 23 * 3600 * 1000);
  const win24End = new Date(now.getTime() + 25 * 3600 * 1000);

  const bookings24h = await prisma.booking.findMany({
    where: {
      status: 'CONFIRMED',
      startsAt: { gte: win24Start, lte: win24End },
    },
  });

  for (const b of bookings24h) {
    try {
      const res = await emitBookingNotice({
        bookingId: b.id,
        event: 'booking.reminder_24h',
      });
      if (res.enqueued.length > 0) reminders24h++;
    } catch {}
  }

  // Janela de 2h: entre 1h45m e 2h15m a partir de agora
  const win2Start = new Date(now.getTime() + 105 * 60 * 1000);
  const win2End = new Date(now.getTime() + 135 * 60 * 1000);

  const bookings2h = await prisma.booking.findMany({
    where: {
      status: 'CONFIRMED',
      startsAt: { gte: win2Start, lte: win2End },
    },
  });

  for (const b of bookings2h) {
    try {
      const res = await emitBookingNotice({
        bookingId: b.id,
        event: 'booking.reminder_2h',
      });
      if (res.enqueued.length > 0) reminders2h++;
    } catch {}
  }

  return { reminders24h, reminders2h };
}

/**
 * Varredura periódica de vencimento de testes e tolerância de 3 dias (Trava Anti-Regressão #5)
 */
export async function runTrialAndSubscriptionCycle(now: Date = new Date()): Promise<{ expiredTrials: number; suspendedSubs: number }> {
  let expiredTrials = 0;
  let suspendedSubs = 0;

  // 1. Expiração de TrialBenefit ativo com endsAt <= NOW()
  const expiredList = await prisma.trialBenefit.findMany({
    where: {
      status: 'ACTIVE',
      endsAt: { lte: now },
    },
    include: { business: true },
  });

  for (const trial of expiredList) {
    await prisma.$transaction(async (tx) => {
      await tx.trialBenefit.update({
        where: { id: trial.id },
        data: { status: 'EXPIRED' },
      });

      // Aplica Trava #5: tolerância de 3 dias corridos (72h) com cobrança ativa
      const gracePeriodEndsAt = new Date(now.getTime() + 72 * 3600 * 1000);

      await tx.subscription.upsert({
        where: { businessId: trial.businessId },
        update: {
          status: 'PAST_DUE',
          gracePeriodEndsAt,
        },
        create: {
          businessId: trial.businessId,
          planCode: trial.selectedModality,
          status: 'PAST_DUE',
          currentPeriodStart: trial.activatedAt || now,
          currentPeriodEnd: trial.endsAt || now,
          gracePeriodEndsAt,
        },
      });

      // Notificação transacional para o dono sobre fim do teste e link de regularização
      const bizPhone = trial.business.whatsapp || trial.business.phone;
      if (bizPhone) {
        await tx.outboxMessage.create({
          data: {
            businessId: trial.businessId,
            direction: 'OUTBOUND',
            destinationPhone: bizPhone,
            content: `⏳ O período de teste gratuito da Agenda ORC na *${trial.business.cleanName || trial.business.name}* chegou ao fim.\n\n` +
              `Você tem *3 dias de tolerância* com a agenda funcionando normalmente para regularizar sua assinatura mensal sem pausar seus agendamentos: https://agenda.oracio.uk/painel`,
            purpose: 'PAYMENT_NOTICE',
            dedupeKey: `trial_expired_notice:${trial.id}`,
            status: 'QUEUED',
          },
        });
      }
    });

    expiredTrials++;
  }

  // 2. Suspensão de Subscription em PAST_DUE com gracePeriodEndsAt <= NOW() (Trava #5)
  const toSuspend = await prisma.subscription.findMany({
    where: {
      status: 'PAST_DUE',
      gracePeriodEndsAt: { lte: now },
    },
  });

  for (const sub of toSuspend) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'PAST_DUE_SUSPENDED' },
    });
    suspendedSubs++;
  }

  return { expiredTrials, suspendedSubs };
}
