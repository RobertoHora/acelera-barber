import { CONFIG } from './config';

let lastProactiveDispatchTime = 0;

/**
 * Calcula o tempo de pacing humano e anti-ban entre disparos proativos.
 * Base: 900s (15 min) ± Jitter: 300s (5 min) => 600s (10 min) a 1200s (20 min).
 */
export function getAntiBanPacingSeconds(): number {
  const jitter = (Math.random() * 2 - 1) * CONFIG.PACING_JITTER_SECONDS;
  return Math.max(600, Math.min(1200, Math.round(CONFIG.PACING_SECONDS_BASE + jitter)));
}

/**
 * Registra o timestamp exato do envio de uma mensagem proativa.
 */
export function markProactiveDispatchExecuted(nowMs = Date.now()): void {
  lastProactiveDispatchTime = nowMs;
}

/**
 * Retorna o timestamp em ms do último envio proativo registrado em memória.
 */
export function getLastProactiveDispatchTime(): number {
  return lastProactiveDispatchTime;
}

/**
 * Trava Inviolável de Pacing Anti-Ban:
 * Garante que NENHUM disparo proativo ocorra se tiver menos de 10 minutos (600s)
 * desde o último disparo outbound no sistema (mesmo após reinício do processo via consulta no banco).
 */
export async function enforceProactivePacingGuard(
  prismaClient: any,
  options: {
    skipGuard?: boolean;
    minIntervalSeconds?: number;
    logPrefix?: string;
  } = {}
): Promise<number> {
  if (options.skipGuard) {
    return 0;
  }

  const minIntervalMs = (options.minIntervalSeconds ?? 600) * 1000;
  const now = Date.now();

  let lastDispatchMs = lastProactiveDispatchTime;

  // Se a variável em memória for 0 (ex: processo reiniciado no PM2),
  // busca no banco a data da última mensagem outbound proativa enviada
  if (lastDispatchMs === 0 && prismaClient?.prospectMessage) {
    try {
      const lastOutbound = await prismaClient.prospectMessage.findFirst({
        where: {
          direction: 'OUTBOUND',
          status: { in: ['SENT', 'DELIVERED', 'QUEUED', 'CLAIMED', 'DISPATCHING', 'PROVIDER_ACCEPTED', 'READ'] },
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });
      if (lastOutbound?.createdAt) {
        lastDispatchMs = new Date(lastOutbound.createdAt).getTime();
        lastProactiveDispatchTime = lastDispatchMs;
      }
    } catch (_) {}
  }

  if (lastDispatchMs > 0) {
    const elapsedMs = now - lastDispatchMs;
    if (elapsedMs < minIntervalMs) {
      const waitMs = minIntervalMs - elapsedMs;
      const waitSeconds = Math.round(waitMs / 1000);
      const prefix = options.logPrefix ? `[${options.logPrefix}] ` : '';
      console.log(`🛡️ ${prefix}[Trava Anti-Ban] Disparo proativo retido pela trava de segurança.`);
      console.log(`⏱️ Último disparo proativo ocorreu há ${(elapsedMs / 60000).toFixed(1)} min.`);
      console.log(`⏳ Aguardando ${waitSeconds}s (~${(waitSeconds / 60).toFixed(1)} min) para respeitar o piso mínimo de 10 min entre disparos...`);
      
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      lastProactiveDispatchTime = Date.now();
      return waitSeconds;
    }
  }

  return 0;
}
