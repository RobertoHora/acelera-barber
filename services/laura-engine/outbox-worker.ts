import { prisma } from '@/lib/db';

export interface WhatsAppTransportProvider {
  sendText: (toPhone: string, text: string) => Promise<{ success: boolean; externalId?: string; error?: string; ambiguousTimeout?: boolean }>;
}

export interface ClaimedOutboxItem {
  id: string;
  businessId: string | null;
  direction: string;
  destinationPhone: string;
  content: string;
  purpose: string;
  template: string | null;
  attempts: number;
}

/**
 * Busca e bloqueia a próxima mensagem elegível da outbox usando SKIP LOCKED
 */
export async function claimNextOutboxMessage(
  leaseSeconds = 60
): Promise<ClaimedOutboxItem | null> {
  return prisma.$transaction(async (tx) => {
    const raw = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT m.id
      FROM "OutboxMessage" m
      WHERE m.direction = 'OUTBOUND'
        AND (
          m.status = 'QUEUED'
          OR (m.status = 'CLAIMED' AND m."leaseExpiresAt" < NOW())
        )
        AND m."availableAt" <= NOW()
      ORDER BY m."createdAt" ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `;

    if (!raw || raw.length === 0) return null;
    const msgId = raw[0].id;

    const claimed = await tx.outboxMessage.update({
      where: { id: msgId },
      data: {
        status: 'CLAIMED',
        attempts: { increment: 1 },
        leaseExpiresAt: new Date(Date.now() + leaseSeconds * 1000),
      },
    });

    return claimed as ClaimedOutboxItem;
  });
}

/**
 * Processa o despacho de uma mensagem da outbox com via rápida transacional
 */
export async function processOutboxMessage(
  item: ClaimedOutboxItem,
  providerOverride?: WhatsAppTransportProvider
) {
  const isTransactional =
    item.purpose === 'AUTH_OTP' ||
    item.purpose === 'BOOKING_CUSTOMER_NOTICE' ||
    item.purpose === 'BOOKING_BUSINESS_NOTICE' ||
    item.purpose === 'PAYMENT_NOTICE';

  // 1. Revalidação pré-disparo para mensagens comerciais frias
  if (!isTransactional && item.businessId) {
    const biz = await prisma.business.findUnique({
      where: { id: item.businessId },
      include: { entitlements: true },
    });

    // Se já comprou (CUSTOMER), cancela cadência fria de abordagem
    const hasPaidEntitlement = biz?.entitlements.some((e) => e.status === 'ACTIVE');
    if (hasPaidEntitlement) {
      await prisma.outboxMessage.update({
        where: { id: item.id },
        data: { status: 'CANCELLED', error: 'CANCELLED_ALREADY_CUSTOMER', leaseExpiresAt: null },
      });
      return { dispatched: false, reason: 'CANCELLED_ALREADY_CUSTOMER' };
    }
  }

  // 2. Modo Simulado / Test Guard
  const transportMode = process.env.WHATSAPP_TRANSPORT_MODE || 'SIMULATED';
  if (transportMode === 'SIMULATED' && !providerOverride) {
    const mockWaId = `sim_laura_${Date.now()}_${item.id}`;
    await prisma.outboxMessage.update({
      where: { id: item.id },
      data: {
        status: 'PROVIDER_ACCEPTED',
        waMessageId: mockWaId,
        sentAt: new Date(),
        leaseExpiresAt: null,
      },
    });
    return { dispatched: true, externalId: mockWaId, mode: 'SIMULATED' };
  }

  // 3. Despacho Real via Provider
  const provider = providerOverride || {
    sendText: async (toPhone: string, text: string) => {
      const gatewayUrl = process.env.LAURA_WHATSAPP_GATEWAY_URL || 'http://localhost:3343';
      const res = await fetch(`${gatewayUrl}/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: toPhone, text }),
      });
      if (!res.ok) throw new Error(`Gateway HTTP ${res.status}`);
      return await res.json();
    },
  };

  try {
    const sendResult = await provider.sendText(item.destinationPhone, item.content);

    if (sendResult.ambiguousTimeout) {
      // Estado de incerteza (Docs 14: transiciona para UNCERTAIN e bloqueia novos envios para o mesmo lead)
      await prisma.outboxMessage.update({
        where: { id: item.id },
        data: {
          status: 'UNCERTAIN',
          error: 'GATEWAY_AMBIGUOUS_TIMEOUT',
          leaseExpiresAt: null,
        },
      });
      return { dispatched: false, status: 'UNCERTAIN' };
    }

    if (sendResult.success) {
      await prisma.outboxMessage.update({
        where: { id: item.id },
        data: {
          status: 'PROVIDER_ACCEPTED',
          waMessageId: sendResult.externalId || `wa_${Date.now()}`,
          sentAt: new Date(),
          leaseExpiresAt: null,
        },
      });
      return { dispatched: true, externalId: sendResult.externalId };
    }

    throw new Error(sendResult.error || 'Falha no envio');
  } catch (err: any) {
    const isRetryable = item.attempts < 3;
    await prisma.outboxMessage.update({
      where: { id: item.id },
      data: {
        status: isRetryable ? 'QUEUED' : 'FAILED',
        error: err.message,
        availableAt: isRetryable ? new Date(Date.now() + 60 * 1000) : new Date(),
        leaseExpiresAt: null,
      },
    });
    return { dispatched: false, error: err.message };
  }
}
