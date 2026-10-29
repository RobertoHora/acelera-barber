import { prisma } from '@/lib/db';

export async function flushSimulatedOutbox(batchSize = 25): Promise<number> {
  let processed = 0;

  const queued = await prisma.outboxMessage.findMany({
    where: {
      status: 'QUEUED',
      availableAt: { lte: new Date() },
    },
    take: batchSize,
    orderBy: { createdAt: 'asc' },
  });

  for (const msg of queued) {
    await prisma.outboxMessage.update({
      where: { id: msg.id },
      data: {
        status: 'PROVIDER_ACCEPTED',
        sentAt: new Date(),
        waMessageId: `sim_${msg.id}_${Date.now()}`,
      },
    });
    processed++;
  }

  return processed;
}
