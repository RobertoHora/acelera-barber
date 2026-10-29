import {withTestAccess} from '@/lib/test-links';
import { prisma } from '@/lib/db';
import { getDayAvailability } from '@/lib/agenda/availability';
import { createBooking as internalCreateBooking, cancelBooking as internalCancelBooking } from '@/lib/agenda/booking-service';
import { normalizePhoneE164 } from '@/lib/auth';

export interface LauraToolContext {
  businessId: string;
  customerPhoneE164: string;
  conversationId?: string;
}

export const LAURA_TOOLS = {
  /**
   * Lista os serviços ativos, preços e duração da barbearia
   */
  listServices: async (context: LauraToolContext) => {
    const services = await prisma.service.findMany({
      where: { businessId: context.businessId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      priceFormatted: `R$ ${(s.priceCents / 100).toFixed(0)}`,
      durationMinutes: s.durationMinutes,
    }));
  },

  /**
   * Lista os barbeiros ativos da barbearia
   */
  listProfessionals: async (context: LauraToolContext) => {
    const professionals = await prisma.professional.findMany({
      where: { businessId: context.businessId, isActive: true },
    });

    return professionals.map((p) => ({
      id: p.id,
      name: p.nickname || p.name,
    }));
  },

  /**
   * Consulta horários livres para uma data específica
   */
  getAvailableSlots: async (
    params: { dateString: string; serviceId: string; professionalId?: string },
    context: LauraToolContext
  ) => {
    const slots = await getDayAvailability({
      businessId: context.businessId,
      dateString: params.dateString,
      serviceId: params.serviceId,
      professionalId: params.professionalId,
    });

    return slots.map((s) => ({
      displayTime: s.displayTime,
      startsAt: s.startsAt,
      professionalName: s.professionalName,
      professionalId: s.professionalId,
    }));
  },

  /**
   * Cria o agendamento em nome do cliente conectado no chat
   */
  createBooking: async (
    params: { serviceId: string; startsAt: string; customerName: string; professionalId?: string; notes?: string; idempotencyKey?: string },
    context: LauraToolContext
  ) => {
    // Verifica elegibilidade da barbearia para IA conversacional (Docs 06: plano agenda_ai_monthly ativo ou em teste)
    const business = await prisma.business.findUnique({
      where: { id: context.businessId },
      include: { trialBenefit: true, subscription: true },
    });

    const isAiTrial = business?.trialBenefit?.status === 'ACTIVE' && business.trialBenefit.selectedModality === 'agenda_ai_monthly' && !!business.trialBenefit.endsAt && business.trialBenefit.endsAt > new Date();
    const isAiSub = business?.subscription?.status === 'ACTIVE' && business.subscription.planCode === 'agenda_ai_monthly' && business.subscription.currentPeriodEnd > new Date();

    if (!isAiTrial && !isAiSub) {
      // Fallback gracioso: direciona para o link público se o plano não cobrir IA
      return {
        allowed: false,
        reason: 'PLAN_DOES_NOT_INCLUDE_AI',
        publicBookingUrl: withTestAccess(`${process.env.NEXT_PUBLIC_AGENDA_URL||'https://agenda.oracio.uk'}/${business?.slug}`),
        message: `Para agendar com rapidez, acesse o link de agendamento online da barbearia: https://agenda.oracio.uk/${business?.slug}`,
      };
    }

    try {
      const result = await internalCreateBooking(
        {
          businessId: context.businessId,
          serviceId: params.serviceId,
          professionalId: params.professionalId,
          startsAt: params.startsAt,
          customerName: params.customerName,
          customerPhone: context.customerPhoneE164,
          notes: params.notes,
          idempotencyKey: params.idempotencyKey,
        },
        {
          role: 'WHATSAPP_AI_AGENT',
          businessId: context.businessId,
          customerPhoneE164: context.customerPhoneE164,
          conversationId: context.conversationId,
        }
      );

      return {
        allowed: true,
        success: true,
        bookingId: result.booking.id,
        startsAt: result.booking.startsAt,
        serviceName: result.booking.service.name,
        professionalName: result.booking.professional.nickname || result.booking.professional.name,
        bookingToken: result.bookingToken,
        managementUrl: result.bookingToken ? withTestAccess(`${process.env.NEXT_PUBLIC_AGENDA_URL||'https://agenda.oracio.uk'}/b/${result.bookingToken}`) : undefined,
      };
    } catch (err: any) {
      if (err.code === 'SLOT_UNAVAILABLE') {
        return {
          allowed: true,
          success: false,
          code: 'SLOT_UNAVAILABLE',
          message: 'Este horário acabou de ser preenchido por outro cliente.',
          nextAvailableSlots: err.nextAvailableSlots || [],
        };
      }
      throw err;
    }
  },

  /**
   * Cancela agendamento do cliente conectado
   */
  cancelBooking: async (
    params: { bookingId: string; reason?: string },
    context: LauraToolContext
  ) => {
    const result = await internalCancelBooking(
      params.bookingId,
      params.reason || 'Cancelado pelo cliente via WhatsApp IA',
      {
        role: 'WHATSAPP_AI_AGENT',
        businessId: context.businessId,
        customerPhoneE164: context.customerPhoneE164,
      }
    );

    if ('alreadyCancelled' in result) {
      return {
        success: true,
        alreadyCancelled: true,
        isLateCancellation: false,
        voucherCode: null,
      };
    }

    return {
      success: true,
      alreadyCancelled: false,
      isLateCancellation: result.isLate,
      voucherCode: result.voucherCode,
    };
  },

  /**
   * Solicitação de encaminhamento para atendente humano
   */
  handoffToHuman: async (
    params: { reason: string },
    context: LauraToolContext
  ) => {
    const business = await prisma.business.findUnique({
      where: { id: context.businessId },
    });

    const bizPhone = business?.whatsapp || business?.phone;
    if (bizPhone) {
      await prisma.outboxMessage.create({
        data: {
          businessId: context.businessId,
          direction: 'OUTBOUND',
          destinationPhone: bizPhone,
          content: `👤 *Solicitação de Atendimento Humano!*\n\n` +
            `O cliente ${context.customerPhoneE164} solicitou falar com uma pessoa no WhatsApp da barbearia.\n` +
            `Motivo relatado: "${params.reason}"\n` +
            `Por favor, assuma a conversa diretamente.`,
          purpose: 'BOOKING_BUSINESS_NOTICE',
          dedupeKey: `handoff_notice:${context.businessId}:${context.customerPhoneE164}:${Date.now()}`,
          status: 'QUEUED',
        },
      });
    }

    return {
      success: true,
      message: 'Encaminhado para um profissional da barbearia. Um atendente responderá em breve.',
    };
  },
};
