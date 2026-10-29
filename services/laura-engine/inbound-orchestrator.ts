import { prisma } from '@/lib/db';
import { processLauraMessage } from './laura-brain';
import { claimNextOutboxMessage, processOutboxMessage } from './outbox-worker';

interface BufferedItem {
  phone: string;
  texts: string[];
  timer: NodeJS.Timeout;
}

const bufferMap = new Map<string, BufferedItem>();
let debounceMs = 20000; // 20s janela de debounce

export function setDebounceMsForTests(ms: number) {
  debounceMs = ms;
}

/**
 * Recebe mensagem inbound, agrupa no buffer de 20s e despacha resposta da Laura
 */
export async function handleInboundMessage(
  phone: string,
  text: string,
  explicitSlug?: string
): Promise<{ queued: boolean; immediateProcessed?: boolean }> {
  const cleanPhone = phone.replace(/\D/g, '');
  const key = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;

  const existing = bufferMap.get(key);
  if (existing) {
    existing.texts.push(text);
    clearTimeout(existing.timer);
    existing.timer = setTimeout(() => flushBufferKey(key, explicitSlug), debounceMs);
    return { queued: true };
  }

  const timer = setTimeout(() => flushBufferKey(key, explicitSlug), debounceMs);
  bufferMap.set(key, {
    phone: key,
    texts: [text],
    timer,
  });

  return { queued: true };
}

/**
 * Descarrega o buffer de mensagens agrupadas para o telefone
 */
export async function flushBufferKey(phoneE164: string, explicitSlug?: string) {
  const item = bufferMap.get(phoneE164);
  if (!item) return;
  clearTimeout(item.timer);
  bufferMap.delete(phoneE164);

  const aggregatedText = item.texts.join(' ');
  const result = await processLauraMessage(aggregatedText, phoneE164, explicitSlug);

  // Enfileira resposta na outbox transacional
  const dedupeKey = `inbound_reply:${phoneE164}:${Date.now()}`;
  const outboxItem = await prisma.outboxMessage.create({
    data: {
      direction: 'OUTBOUND',
      destinationPhone: phoneE164,
      content: result.replyText,
      purpose: 'INBOUND_REPLY',
      dedupeKey,
      status: 'QUEUED',
    },
  });

  let finalOutbox = outboxItem;
  // Disparo imediato se transporte for simulado
  const transportMode = process.env.WHATSAPP_TRANSPORT_MODE || 'SIMULATED';
  if (transportMode === 'SIMULATED') {
    const claimed = await prisma.outboxMessage.update({where:{id:outboxItem.id},data:{status:'CLAIMED',attempts:{increment:1},leaseExpiresAt:new Date(Date.now()+120000)}});
    await processOutboxMessage(claimed);
    const reloaded = await prisma.outboxMessage.findUnique({ where: { id: outboxItem.id } });
    if (reloaded) finalOutbox = reloaded;
  }

  return { result, outboxItem: finalOutbox };
}
