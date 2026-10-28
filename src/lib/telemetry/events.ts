import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export type GrowthEventType =
  | 'diagnostic.completed'
  | 'benchmark.viewed'
  | 'checklist.item_completed'
  | 'offer.presented'
  | 'checkout.created'
  | 'order.paid'
  | 'trial.activated'
  | 'agenda.published'
  | 'booking.created'
  | 'subscription.renewed';

export interface RecordGrowthEventParams {
  event: GrowthEventType;
  businessId?: string;
  orderId?: string;
  bookingId?: string;
  metadata?: Record<string, any>;
  dedupeKey: string;
  occurredAt?: Date;
  producerSystem?: string;
}

/**
 * Registra evento canônico de crescimento com deduplicação idempotente.
 * Se o evento for 'order.paid', garante cancelamento imediato de cadências frias.
 */
export async function recordGrowthEvent(
  params: RecordGrowthEventParams,
  tx?: Prisma.TransactionClient
) {
  const db = tx || prisma;
  const canonicalEventId = `gev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    const created = await db.growthEvent.upsert({
      where: { dedupeKey: params.dedupeKey },
      create: {
        canonicalEventId,
        event: params.event,
        businessId: params.businessId,
        orderId: params.orderId,
        bookingId: params.bookingId,
        metadata: (params.metadata || {}) as Prisma.InputJsonValue,
        dedupeKey: params.dedupeKey,
        occurredAt: params.occurredAt || new Date(),
        producerSystem: params.producerSystem || 'eleva-orc',
      },
      update: {}, // Idempotente: se já existe, preserva o original
    });

    // Se o evento for 'order.paid' e tiver barbearia vinculada:
    // Transiciona imediatamente a etapa comercial e cancela cadências frias pendentes
    if (params.event === 'order.paid' && params.businessId) {
      await db.outboxMessage.updateMany({
        where: {
          businessId: params.businessId,
          purpose: { in: ['INITIAL_OUTREACH', 'CADENCE_FOLLOWUP'] },
          status: { in: ['QUEUED', 'CLAIMED'] },
        },
        data: {
          status: 'CANCELLED',
          error: 'CANCELLED_ALREADY_CUSTOMER',
          leaseExpiresAt: null,
        },
      });
    }

    return created;
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return await db.growthEvent.findUnique({
        where: { dedupeKey: params.dedupeKey },
      });
    }
    throw err;
  }
}
