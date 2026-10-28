import { prisma } from '@/lib/db';
import { normalizePhoneE164 } from '@/lib/auth';
import { getDayAvailability } from './availability';
import crypto from 'node:crypto';

export interface CreateBookingParams {
  businessId: string;
  serviceId: string;
  professionalId?: string; // Se omitido ou 'any', atribui o profissional com menos agendamentos no dia
  startsAt: string | Date; // ISO UTC string ou objeto Date
  customerName: string;
  customerPhone?: string;
  customerPhoneE164?: string;
  isPrepaid?: boolean;     // Se o corte foi pago antecipadamente
  prepaidAmountCents?: number;
  notes?: string;
  idempotencyKey?: string;
}

export interface ActorContext {
  role: 'PUBLIC_WEB' | 'CUSTOMER_TOKEN' | 'OWNER_SESSION' | 'WHATSAPP_AI_AGENT';
  businessId: string;
  customerPhoneE164?: string;
  tokenHash?: string;
  userId?: string;
  conversationId?: string;
}

export function hashBookingToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Criação segura e transacional de agendamento com proteção contra concorrência e double-booking
 */
export async function createBooking(params: CreateBookingParams, actorContext?: ActorContext) {
  const { businessId, serviceId, customerName, notes, idempotencyKey } = params;
  const rawPhone = params.customerPhone || params.customerPhoneE164;
  const rawStartsAt = params.startsAt;

  if (!businessId || !serviceId || !rawStartsAt || !customerName || !rawPhone) {
    throw new Error('Todos os campos obrigatórios devem ser preenchidos.');
  }

  const startsAt = typeof rawStartsAt === 'string' ? rawStartsAt : rawStartsAt.toISOString();

  const cleanPhone = rawPhone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    throw new Error('Número de WhatsApp inválido.');
  }
  const phoneE164 = normalizePhoneE164(rawPhone);

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      services: { where: { id: serviceId, isActive: true } },
      professionals: { where: { isActive: true } },
    },
  });

  if (!business || business.services.length === 0) {
    throw new Error('Serviço não encontrado ou inativo.');
  }

  const service = business.services[0];
  const startTime = new Date(startsAt);
  if (startTime.getTime() <= Date.now()) {
    throw new Error('Não é possível agendar em horários passados.');
  }

  const durationMs = service.durationMinutes * 60 * 1000;
  const endTime = new Date(startTime.getTime() + durationMs);

  // Determina o profissional
  let targetProId = params.professionalId;
  if (!targetProId || targetProId === 'any') {
    // Atribuição de menor carga: busca barbeiro com menos agendamentos naquele dia
    const startOfDay = new Date(startTime);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startTime);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const proLoadCounts = await prisma.booking.groupBy({
      by: ['professionalId'],
      where: {
        businessId,
        status: { in: ['PENDING_CONFIRMATION', 'CONFIRMED'] },
        startsAt: { gte: startOfDay, lte: endOfDay },
      },
      _count: { id: true },
    });

    const countMap = new Map(proLoadCounts.map((c) => [c.professionalId, c._count.id]));
    const sortedPros = [...business.professionals].sort((a, b) => {
      const countA = countMap.get(a.id) || 0;
      const countB = countMap.get(b.id) || 0;
      return countA - countB;
    });

    targetProId = sortedPros[0]?.id;
  }

  if (!targetProId) {
    throw new Error('Nenhum profissional disponível para este horário.');
  }

  // Idempotência
  const finalIdempKey = idempotencyKey || `booking_${businessId}_${phoneE164}_${startTime.getTime()}`;
  const existingBooking = await prisma.booking.findUnique({
    where: { idempotencyKey: finalIdempKey },
    include: { service: true, professional: true },
  });

  if (existingBooking) {
    return {
      booking: existingBooking,
      isExisting: true,
      bookingToken: null, // Token exposto apenas na criação inicial
    };
  }

  // Gera token seguro de 256 bits para cancelamento/reagendamento no link /b/{token}
  const rawBookingToken = crypto.randomBytes(32).toString('base64url');
  const cancelTokenHash = hashBookingToken(rawBookingToken);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Localiza ou cria o cliente
      const customer = await tx.customer.upsert({
        where: {
          businessId_phoneE164: {
            businessId,
            phoneE164,
          },
        },
        update: { name: customerName.trim() },
        create: {
          businessId,
          phoneE164,
          name: customerName.trim(),
        },
      });

      // 2. Insere a reserva (PostgreSQL EXCLUDE USING gist garante unicidade física)
      const booking = await tx.booking.create({
        data: {
          businessId,
          serviceId,
          professionalId: targetProId!,
          customerId: customer.id,
          customerName: customerName.trim(),
          customerPhoneE164: phoneE164,
          startsAt: startTime,
          endsAt: endTime,
          status: 'CONFIRMED',
          isPrepaid: Boolean(params.isPrepaid),
          prepaidAmountCents: params.prepaidAmountCents || null,
          cancelTokenHash,
          notes: notes?.trim() || null,
          idempotencyKey: finalIdempKey,
        },
        include: {
          service: true,
          professional: true,
        },
      });

      // 3. Enfileira notificação para o cliente final (Via Rápida Transacional)
      const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: business.timezone,
      }).format(startTime);

      const cancelLink = `https://agenda.oracio.uk/b/${rawBookingToken}`;

      await tx.outboxMessage.create({
        data: {
          businessId,
          direction: 'OUTBOUND',
          destinationPhone: phoneE164,
          content: `✂️ *Agendamento Confirmado!* na ${business.cleanName || business.name}\n\n` +
            `💈 *Serviço:* ${service.name}\n` +
            `👤 *Barbeiro:* ${booking.professional.nickname || booking.professional.name}\n` +
            `📅 *Horário:* ${formattedDate}\n\n` +
            `Para reagendar ou cancelar se precisar, acesse seu link exclusivo:\n${cancelLink}`,
          purpose: 'BOOKING_CUSTOMER_NOTICE',
          dedupeKey: `booking_notice:${booking.id}:created:customer:v1`,
          status: 'QUEUED',
        },
      });

      // 4. Enfileira notificação para o WhatsApp da barbearia
      const bizPhone = business.whatsapp || business.phone;
      if (bizPhone) {
        await tx.outboxMessage.create({
          data: {
            businessId,
            direction: 'OUTBOUND',
            destinationPhone: bizPhone,
            content: `🔔 *Novo Agendamento Marcado!*\n\n` +
              `👤 *Cliente:* ${customerName.trim()} (${phoneE164})\n` +
              `💈 *Serviço:* ${service.name}\n` +
              `✂️ *Barbeiro:* ${booking.professional.nickname || booking.professional.name}\n` +
              `📅 *Horário:* ${formattedDate}`,
            purpose: 'BOOKING_BUSINESS_NOTICE',
            dedupeKey: `booking_notice:${booking.id}:created:business:v1`,
            status: 'QUEUED',
          },
        });
      }

      // 5. Emite GrowthEvent
      await tx.growthEvent.create({
        data: {
          event: 'booking.created',
          businessId,
          bookingId: booking.id,
          metadata: { serviceId, professionalId: targetProId, startsAt: startTime.toISOString() },
          dedupeKey: `bk_evt:${booking.id}:created:v1`,
        },
      });

      return { booking, bookingToken: rawBookingToken };
    });

    return result;
  } catch (err: any) {
    // Trata violação da constraint de exclusão de horários concorrentes (PostgreSQL 23P01)
    if (err.code === '23P01' || err.message?.includes('Booking_no_overlapping_active_slots')) {
      const dateString = startTime.toISOString().slice(0, 10);
      const nextSlots = await getDayAvailability({
        businessId,
        dateString,
        serviceId,
        professionalId: targetProId,
      });

      const conflictError: any = new Error('Este horário acabou de ser reservado por outro cliente.');
      conflictError.status = 409;
      conflictError.code = 'SLOT_UNAVAILABLE';
      conflictError.nextAvailableSlots = nextSlots.slice(0, 3);
      throw conflictError;
    }

    throw err;
  }
}

/**
 * Busca reserva pelo token do link privado (/b/{token})
 */
export async function getBookingByToken(bookingToken: string) {
  const tokenHash = hashBookingToken(bookingToken);
  const booking = await prisma.booking.findUnique({
    where: { cancelTokenHash: tokenHash },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          cleanName: true,
          phone: true,
          whatsapp: true,
          timezone: true,
          cancellationNoticeHours: true,
        },
      },
      service: true,
      professional: true,
    },
  });

  return booking;
}

/**
 * Cancelamento de agendamento com aplicação da Trava Anti-Regressão #3
 * (Antecedência >= 1h: cancelamento gratuito; < 1h: cancelamento tardio com voucher de 50%)
 */
export async function cancelBooking(
  bookingId: string,
  reason = 'Cancelado pelo cliente',
  actorContext?: ActorContext
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { business: true, service: true, customer: true },
  });

  if (!booking) {
    throw new Error('Agendamento não encontrado.');
  }

  if (booking.status.startsWith('CANCELLED')) {
    return { booking, alreadyCancelled: true };
  }

  // Validação de Autorização
  if (actorContext?.role === 'CUSTOMER_TOKEN') {
    if (booking.cancelTokenHash !== actorContext.tokenHash) {
      throw new Error('Não autorizado a cancelar este agendamento.');
    }
  } else if (actorContext?.role === 'WHATSAPP_AI_AGENT') {
    if (booking.customerPhoneE164 !== actorContext.customerPhoneE164) {
      throw new Error('Não autorizado a cancelar agendamento de outro cliente.');
    }
  }

  const now = Date.now();
  const startsAtMs = booking.startsAt.getTime();
  const diffHours = (startsAtMs - now) / (3600 * 1000);

  // Trava Anti-Regressão #3: Janela canônica de 1 hora
  const isLate = diffHours < (booking.business.cancellationNoticeHours || 1);

  // O voucher de 50% só é gerado se:
  // 1. O cancelamento for tardio (isLate)
  // 2. O agendamento tiver sido PAGO ANTECIPADAMENTE (booking.isPrepaid === true)
  // 3. A barbearia estiver com a emissão de voucher habilitada (booking.business.lateCancellationVoucherEnabled !== false)
  const shouldIssueVoucher =
    isLate &&
    Boolean(booking.isPrepaid) &&
    booking.business.lateCancellationVoucherEnabled !== false;

  return await prisma.$transaction(async (tx) => {
    let voucherCode: string | null = null;

    if (shouldIssueVoucher) {
      // Gera voucher de 50% de desconto para o próximo agendamento (Trava #3)
      voucherCode = `DESC50-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      await tx.customerVoucher.create({
        data: {
          customerId: booking.customerId,
          businessId: booking.businessId,
          code: voucherCode,
          discountPercent: 50,
          expiresAt: new Date(Date.now() + 30 * 86400 * 1000), // Válido por 30 dias
        },
      });
    }

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED_BY_CUSTOMER',
        cancelledAt: new Date(),
        cancelReason: reason,
        isLateCancellation: isLate,
      },
      include: { service: true, professional: true },
    });

    // Envia mensagem WhatsApp sobre o cancelamento
    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: booking.business.timezone,
    }).format(booking.startsAt);

    let customerMsg = `❌ Seu agendamento para *${booking.service.name}* no dia *${formattedDate}* foi cancelado.`;
    if (isLate && voucherCode) {
      customerMsg += `\n\nComo o cancelamento foi feito com menos de 1h de antecedência, liberamos para você um cupom de *50% de desconto* no seu próximo agendamento: *${voucherCode}* (válido por 30 dias).`;
    }

    await tx.outboxMessage.create({
      data: {
        businessId: booking.businessId,
        direction: 'OUTBOUND',
        destinationPhone: booking.customerPhoneE164,
        content: customerMsg,
        purpose: 'BOOKING_CUSTOMER_NOTICE',
        dedupeKey: `booking_notice:${booking.id}:cancelled:customer:v1`,
        status: 'QUEUED',
      },
    });

    return { booking: updated, isLate, voucherCode };
  });
}
