import { prisma } from '@/lib/db';
import { NOTIFICATION_TEMPLATES } from './templates';

export type BookingEventKind =
  | 'booking.created'
  | 'booking.confirmed'
  | 'booking.rescheduled'
  | 'booking.cancelled_by_customer'
  | 'booking.cancelled_by_business'
  | 'booking.reminder_24h'
  | 'booking.reminder_2h'
  | 'booking.no_show_marked';

export interface EmitBookingNoticeParams {
  bookingId: string;
  event: BookingEventKind;
  rawBookingToken?: string;
  version?: number;
  reason?: string;
  voucherCode?: string | null;
}

/**
 * Emite notificações de agendamento na outbox transacional de forma determinística
 */
export async function emitBookingNotice(
  params: EmitBookingNoticeParams,
  txClient?: any
) {
  const db = txClient || prisma;
  const { bookingId, event, rawBookingToken, version = 1, reason, voucherCode } = params;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      business: true,
      service: true,
      professional: true,
      customer: true,
    },
  });

  if (!booking) {
    throw new Error(`Booking ${bookingId} não encontrado.`);
  }

  const managementUrl = rawBookingToken
    ? `https://agenda.oracio.uk/b/${rawBookingToken}`
    : `https://agenda.oracio.uk/s/${booking.business.slug}`;

  const formattedDateTime = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: booking.business.timezone || 'America/Sao_Paulo',
  }).format(booking.startsAt);

  const templateParams = {
    businessName: booking.business.cleanName || booking.business.name,
    serviceName: booking.service.name,
    professionalName: booking.professional.nickname || booking.professional.name,
    formattedDateTime,
    address: booking.business.address || undefined,
    managementUrl,
    voucherCode,
    customerName: booking.customerName,
    customerPhone: booking.customerPhoneE164,
    reason,
  };

  const enqueued: any[] = [];

  // Regra Estrita Docs 12: no_show_marked NUNCA enfileira mensagem para o cliente final!
  if (event === 'booking.no_show_marked') {
    // Apenas registra GrowthEvent interno, zero envio de mensagem
    await db.growthEvent.create({
      data: {
        event: 'booking.no_show_marked',
        businessId: booking.businessId,
        bookingId: booking.id,
        metadata: { customerPhone: booking.customerPhoneE164 },
        dedupeKey: `bk_evt:${booking.id}:no_show:v${version}`,
      },
    });
    return { enqueued: [] };
  }

  // Notificações para o Cliente Final
  if (
    event === 'booking.created' ||
    event === 'booking.rescheduled' ||
    event === 'booking.cancelled_by_customer' ||
    event === 'booking.cancelled_by_business' ||
    event === 'booking.reminder_24h' ||
    event === 'booking.reminder_2h'
  ) {
    let content = '';
    if (event === 'booking.created') content = NOTIFICATION_TEMPLATES.bookingCreatedCustomer(templateParams);
    else if (event === 'booking.rescheduled') content = NOTIFICATION_TEMPLATES.bookingRescheduledCustomer(templateParams);
    else if (event === 'booking.cancelled_by_customer') content = NOTIFICATION_TEMPLATES.bookingCancelledByCustomer(templateParams);
    else if (event === 'booking.cancelled_by_business') content = NOTIFICATION_TEMPLATES.bookingCancelledByBusiness(templateParams);
    else if (event === 'booking.reminder_24h') content = NOTIFICATION_TEMPLATES.bookingReminder24h(templateParams);
    else if (event === 'booking.reminder_2h') content = NOTIFICATION_TEMPLATES.bookingReminder2h(templateParams);

    const dedupeKey = `booking_notice:${booking.id}:${event}:customer:v${version}`;

    const msg = await db.outboxMessage.upsert({
      where: { dedupeKey },
      update: {},
      create: {
        businessId: booking.businessId,
        direction: 'OUTBOUND',
        destinationPhone: booking.customerPhoneE164,
        content,
        purpose: 'BOOKING_CUSTOMER_NOTICE',
        template: event,
        dedupeKey,
        status: 'QUEUED',
      },
    });
    enqueued.push(msg);
  }

  // Notificações para a Barbearia
  const bizPhone = booking.business.whatsapp || booking.business.phone;
  if (bizPhone && (event === 'booking.created' || event === 'booking.rescheduled')) {
    let content = '';
    if (event === 'booking.created') content = NOTIFICATION_TEMPLATES.bookingCreatedBusiness(templateParams);
    else if (event === 'booking.rescheduled') {
      content = `🔄 *Agendamento Reagendado!*\n\n` +
        `👤 *Cliente:* ${booking.customerName} (${booking.customerPhoneE164})\n` +
        `💈 *Serviço:* ${booking.service.name}\n` +
        `✂️ *Barbeiro:* ${booking.professional.nickname || booking.professional.name}\n` +
        `📅 *Novo Horário:* ${formattedDateTime}`;
    }

    const dedupeKey = `booking_notice:${booking.id}:${event}:business:v${version}`;

    const msg = await db.outboxMessage.upsert({
      where: { dedupeKey },
      update: {},
      create: {
        businessId: booking.businessId,
        direction: 'OUTBOUND',
        destinationPhone: bizPhone,
        content,
        purpose: 'BOOKING_BUSINESS_NOTICE',
        template: event,
        dedupeKey,
        status: 'QUEUED',
      },
    });
    enqueued.push(msg);
  }

  return { enqueued };
}
