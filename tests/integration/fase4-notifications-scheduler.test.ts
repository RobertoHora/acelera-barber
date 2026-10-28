import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/db';
import { emitBookingNotice } from '@/lib/notifications/booking-notifications';
import { runReminderCycle, runTrialAndSubscriptionCycle } from '@/lib/notifications/scheduler';
import { flushSimulatedOutbox } from '@/lib/notifications/simulated-transport';

describe('Fase 4 - Notificações Transacionais e Scheduler de Lembretes / Vencimentos', () => {
  let businessId: string;
  let bookingId: string;
  const testSlug = `teste-notif-${Date.now()}`;

  beforeAll(async () => {
    const biz = await prisma.business.create({
      data: {
        slug: testSlug,
        name: 'Barbearia Notificações',
        cleanName: 'Barbearia Notificações',
        phone: '+5533999990003',
        whatsapp: '+5533999990003',
        city: 'Governador Valadares',
        state: 'MG',
      },
    });
    businessId = biz.id;

    const svc = await prisma.service.create({
      data: {
        businessId,
        name: 'Corte Notificação',
        priceCents: 3500,
        durationMinutes: 30,
      },
    });

    const pro = await prisma.professional.create({
      data: {
        businessId,
        name: 'Barbeiro Notificação',
      },
    });

    const cust = await prisma.customer.create({
      data: {
        businessId,
        name: 'Cliente Notificação',
        phoneE164: '+5533988887777',
      },
    });

    const tomorrow24h = new Date(Date.now() + 24 * 3600 * 1000);
    const bk = await prisma.booking.create({
      data: {
        businessId,
        serviceId: svc.id,
        professionalId: pro.id,
        customerId: cust.id,
        customerName: cust.name,
        customerPhoneE164: cust.phoneE164,
        startsAt: tomorrow24h,
        endsAt: new Date(tomorrow24h.getTime() + 30 * 60 * 1000),
        status: 'CONFIRMED',
        cancelTokenHash: `hash_${Date.now()}`,
        idempotencyKey: `idemp_${Date.now()}`,
      },
    });
    bookingId = bk.id;
  });

  afterAll(async () => {
    await prisma.business.delete({ where: { id: businessId } }).catch(() => {});
  });

  it('emite notificações de criação com dedupeKey determinístico para cliente e barbearia', async () => {
    const res = await emitBookingNotice({
      bookingId,
      event: 'booking.created',
      rawBookingToken: 'token_raw_123',
    });

    expect(res.enqueued.length).toBe(2); // Cliente + Barbearia

    const customerMsg = res.enqueued.find((m) => m.purpose === 'BOOKING_CUSTOMER_NOTICE');
    expect(customerMsg).toBeDefined();
    expect(customerMsg.content).toContain('Agendamento Confirmado!');
    expect(customerMsg.content).toContain('https://agenda.oracio.uk/b/token_raw_123');

    const businessMsg = res.enqueued.find((m) => m.purpose === 'BOOKING_BUSINESS_NOTICE');
    expect(businessMsg).toBeDefined();
    expect(businessMsg.content).toContain('Novo Agendamento Marcado!');
  });

  it('Docs 12: no_show_marked NUNCA enfileira mensagem para o cliente final', async () => {
    const res = await emitBookingNotice({
      bookingId,
      event: 'booking.no_show_marked',
    });

    expect(res.enqueued.length).toBe(0);

    // Confirma que nenhum outboxMessage foi criado para no_show
    const messages = await prisma.outboxMessage.findMany({
      where: { template: 'booking.no_show_marked' },
    });
    expect(messages.length).toBe(0);
  });

  it('scheduler identifica agendamentos na janela de 24h e enfileira lembrete', async () => {
    const cycle = await runReminderCycle();
    expect(cycle.reminders24h).toBeGreaterThanOrEqual(1);

    const reminder = await prisma.outboxMessage.findFirst({
      where: {
        template: 'booking.reminder_24h',
        destinationPhone: '+5533988887777',
      },
    });
    expect(reminder).not.toBeNull();
    expect(reminder?.content).toContain('*Lembrete:* Seu corte');
  });

  it('Trava Anti-Regressão #5: scheduler expira trial vencido e atribui PAST_DUE com tolerância de 3 dias (72h)', async () => {
    // Cria trial vencido
    const expiredTrial = await prisma.trialBenefit.create({
      data: {
        businessId,
        sourcePlan: 'eleva_google_pro',
        grantedDays: 14,
        status: 'ACTIVE',
        activatedAt: new Date(Date.now() - 15 * 86400 * 1000),
        endsAt: new Date(Date.now() - 1000), // Venceu há 1 segundo
      },
    });

    const result = await runTrialAndSubscriptionCycle();
    expect(result.expiredTrials).toBeGreaterThanOrEqual(1);

    const updatedSub = await prisma.subscription.findUnique({
      where: { businessId },
    });
    expect(updatedSub?.status).toBe('PAST_DUE');
    expect(updatedSub?.gracePeriodEndsAt).not.toBeNull();

    // Tolerância de aproximadamente 72h
    const diffHours = (updatedSub!.gracePeriodEndsAt!.getTime() - Date.now()) / (3600 * 1000);
    expect(diffHours).toBeGreaterThan(70);
    expect(diffHours).toBeLessThanOrEqual(72);
  });

  it('processa a fila com transporte simulado e marca mensagens como aceitas', async () => {
    const count = await flushSimulatedOutbox(50);
    expect(count).toBeGreaterThan(0);

    const pending = await prisma.outboxMessage.count({
      where: { status: 'QUEUED' },
    });
    expect(pending).toBe(0);
  });
});
