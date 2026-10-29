import { prisma } from './db';

export type CircuitState = 'CLOSED' | 'OPEN_TRANSIENT' | 'OPEN_RESTRICTION' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  cooldownMs?: number;
  useMemoryOnly?: boolean;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private openedAt = 0;
  private failureThreshold: number;
  private cooldownMs: number;
  private isKillSwitched = false;
  private lastDbSyncTime = 0;
  private restrictionReason = '';
  private useMemoryOnly: boolean;
  private syncError = false;
  private lastPersistSuccess = true;
  private pendingDbSync: Promise<boolean> | null = null;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.cooldownMs = options.cooldownMs || 300_000; // 5 minutos padrão
    this.useMemoryOnly = options.useMemoryOnly || false;
  }

  public getState(): CircuitState {
    return this.state;
  }

  public hasSyncError(): boolean {
    return this.syncError;
  }

  public getLastPersistSuccess(): boolean {
    return this.lastPersistSuccess;
  }

  public setKillSwitch(active: boolean) {
    this.isKillSwitched = active;
    if (active) {
      this.state = 'OPEN_RESTRICTION';
      this.restrictionReason = 'KILL_SWITCH_ACTIVATED';
      this.openedAt = Date.now();
      console.warn('🚨 [Circuit Breaker] KILL SWITCH ATIVADO manualmente. Estado: OPEN_RESTRICTION (bloqueando envios).');
      this.syncStateToDb('OPEN_RESTRICTION', 'KILL_SWITCH_ACTIVATED').catch(err => {
        console.error('❌ [Circuit Breaker] Falha ao persistir Kill Switch no banco:', err.message);
      });
    } else {
      this.reset();
    }
  }

  /**
   * Verifica se o circuito está aberto/bloqueado em memória.
   * 1. Kill Switch ou OPEN_RESTRICTION ou syncError: bloqueado permanentemente (SEM expiração por tempo).
   * 2. OPEN_TRANSIENT: bloqueado até expirar cooldown; após cooldown transita para HALF_OPEN.
   * 3. HALF_OPEN: permite probes sintéticos, mas bloqueia clientes (ver canDispatchToCustomer).
   */
  public isOpen(): boolean {
    if (this.isKillSwitched) return true;
    if (this.syncError) return true;

    if (this.state === 'OPEN_RESTRICTION') {
      return true;
    }

    if (this.state === 'OPEN_TRANSIENT') {
      const elapsed = Date.now() - this.openedAt;
      if (elapsed > this.cooldownMs) {
        this.state = 'HALF_OPEN';
        console.log('🟡 [Circuit Breaker] Cooldown transitório expirado. Estado: HALF_OPEN (aguardando probe sintético).');
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Sincroniza estado com o banco de dados de forma assíncrona.
   * POLÍTICA FAIL-SAFE ESTRITA:
   * 1. Single-Flight / Leitura Bloqueante: chamadas concorrentes compartilham a mesma promessa em andamento.
   * 2. O cache só se torna válido (atualizando lastDbSyncTime) após confirmação de leitura com sucesso no banco.
   * 3. Se a leitura do banco falhar, o circuito bloqueia preventivamente (retorna true) e permanece bloqueado.
   * 4. Estado ausente ou inválido no banco ativa fail-safe preventivo.
   */
  public async checkIsOpenAsync(): Promise<boolean> {
    if (this.isKillSwitched) return true;
    if (this.state === 'OPEN_RESTRICTION') return true;
    if (this.useMemoryOnly) return this.isOpen();

    // Se já houver uma sincronização em andamento, aguarda ela terminar (single-flight / lock de leitura)
    if (this.pendingDbSync) {
      return await this.pendingDbSync;
    }

    const now = Date.now();
    // Cache é considerado válido APENAS se lastDbSyncTime > 0 e não expirou TTL e não há syncError
    const cacheValid = !this.syncError && this.lastDbSyncTime > 0 && (now - this.lastDbSyncTime <= 3000);

    if (cacheValid) {
      return this.isOpen();
    }

    // Inicia sincronização single-flight
    this.pendingDbSync = (async () => {
      try {
        const row = await prisma.appSetting.findUnique({
          where: { id: 'circuit_breaker:channel_whatsapp' },
        });

        // Atualiza lastDbSyncTime APENAS após confirmação de leitura com sucesso no banco!
        this.lastDbSyncTime = Date.now();
        this.syncError = false;

        // Se o registro não existe ou é inválido: aplica fail-safe preventivo
        if (!row || !row.value || typeof row.value !== 'object') {
          console.warn('⚠️ [Circuit Breaker] Registro de estado no banco ausente ou inválido. Aplicando fail-safe.');
          this.syncError = true;
          return true;
        }

        const val = row.value as any;
        const validStates = ['CLOSED', 'HALF_OPEN', 'OPEN_TRANSIENT', 'OPEN_RESTRICTION'];
        if (!validStates.includes(val.state)) {
          console.warn('⚠️ [Circuit Breaker] Estado desconhecido no banco:', val.state);
          this.syncError = true;
          return true;
        }

        if (val.state === 'OPEN_RESTRICTION') {
          this.state = 'OPEN_RESTRICTION';
          this.restrictionReason = val.reason || 'REMOTE_RESTRICTION';
          this.openedAt = Number(val.openedAt) || Date.now();
          return true;
        } else if (val.state === 'OPEN_TRANSIENT' && val.openedAt) {
          const elapsed = Date.now() - Number(val.openedAt);
          if (elapsed <= this.cooldownMs) {
            this.state = 'OPEN_TRANSIENT';
            this.openedAt = Number(val.openedAt);
            return true;
          } else {
            this.state = 'HALF_OPEN';
            return false;
          }
        } else if (val.state === 'HALF_OPEN') {
          this.state = 'HALF_OPEN';
          return false;
        } else if (val.state === 'CLOSED') {
          this.state = 'CLOSED';
          return false;
        }

        return this.isOpen();
      } catch (err: any) {
        console.error('🛑 [Circuit Breaker] Erro ao sincronizar estado com o banco. Bloqueando preventivamente (fail-safe):', err.message);
        // Fail-safe mandatório: se o banco está inacessível ou desconhecido, BLOQUEIA todo envio
        this.syncError = true;
        // Não atualiza lastDbSyncTime
        return true;
      } finally {
        this.pendingDbSync = null;
      }
    })();

    return await this.pendingDbSync;
  }

  /**
   * Validação estrita para envios a clientes reais.
   * Retorna true estritamente se o circuito for CLOSED e o banco responder saudável.
   * Bloqueia em OPEN_RESTRICTION, OPEN_TRANSIENT, falhas de sincronização (syncError) e HALF_OPEN.
   */
  public async canDispatchToCustomerAsync(): Promise<boolean> {
    const isCircuitBlocked = await this.checkIsOpenAsync();
    if (isCircuitBlocked || this.syncError) {
      return false;
    }

    // Em HALF_OPEN, mensagens reais para clientes são terminantemente bloqueadas
    if (this.state === 'HALF_OPEN') {
      console.warn('⚠️ [Circuit Breaker] Estado HALF_OPEN ativo: envio a cliente real suprimido (apenas probes sintéticos permitidos).');
      return false;
    }

    return this.state === 'CLOSED';
  }

  public canDispatchToCustomer(): boolean {
    if (this.isOpen() || this.syncError) return false;
    if (this.state === 'HALF_OPEN') return false;
    return this.state === 'CLOSED';
  }

  public recordSuccess() {
    if (this.state === 'HALF_OPEN') {
      console.log('🟢 [Circuit Breaker] Probe sintético confirmado. Circuito normalizado (CLOSED: envios liberados).');
      this.reset();
    } else {
      this.failureCount = 0;
    }
  }

  public recordFailure(reason: string) {
    const now = Date.now();
    const isRestriction = /401|unauthorized|loggedout|restri[çc][ãa]o|ban|spam|account\s+restricted/i.test(reason);

    if (isRestriction) {
      this.state = 'OPEN_RESTRICTION';
      this.restrictionReason = reason;
      this.openedAt = now;
      console.error(`🛑 [Circuit Breaker] RESTRIÇÃO DE CONTA DETECTADA! Estado: OPEN_RESTRICTION (sem transição automática para HALF_OPEN). Motivo: ${reason}`);
      this.syncStateToDb('OPEN_RESTRICTION', reason).then((success) => {
        if (!success) {
          console.warn('⚠️ [Circuit Breaker] Falha ao persistir OPEN_RESTRICTION no banco remoto. Bloqueio mantido em memória local.');
        }
      }).catch(err => {
        console.error('❌ [Circuit Breaker] Falha ao persistir OPEN_RESTRICTION no banco:', err.message);
      });
      return;
    }

    // Falhas transitórias normais (500, network, etc.)
    this.failureCount++;
    this.lastFailureTime = now;

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN_TRANSIENT';
      this.openedAt = now;
      console.error(`🛑 [Circuit Breaker] Probe falhou em HALF_OPEN. Retornando para OPEN_TRANSIENT. Motivo: ${reason}`);
      this.syncStateToDb('OPEN_TRANSIENT', reason).catch(() => {});
      return;
    }

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN_TRANSIENT';
      this.openedAt = now;
      console.error(`🚨 [Circuit Breaker] Limiar de falhas transitórias atingido (${this.failureCount}). Estado: OPEN_TRANSIENT (cooldown de ${this.cooldownMs}ms). Motivo: ${reason}`);
      this.syncStateToDb('OPEN_TRANSIENT', reason).catch(() => {});
    }
  }

  public unlockAccountRestriction(operatorId: string, authorizationCode: string) {
    if (!authorizationCode || !operatorId) {
      throw new Error('Desbloqueio de restrição de conta exige operatorId e authorizationCode explícitos.');
    }
    console.log(`🔓 [Circuit Breaker] Restrição de conta liberada pelo operador ${operatorId}: ${authorizationCode}`);
    this.reset();
  }

  public reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.openedAt = 0;
    this.restrictionReason = '';
    this.isKillSwitched = false;
    this.syncError = false;
    this.lastDbSyncTime = 0;
    this.pendingDbSync = null;
    this.syncStateToDb('CLOSED', 'MANUAL_OR_AUTO_RESET').catch(() => {});
  }

  public async syncStateToDb(state: CircuitState, reason: string): Promise<boolean> {
    if (this.useMemoryOnly) return true;
    try {
      await prisma.appSetting.upsert({
        where: { id: 'circuit_breaker:channel_whatsapp' },
        update: {
          value: {
            state,
            reason,
            openedAt: this.openedAt,
            updatedAt: Date.now(),
          },
        },
        create: {
          id: 'circuit_breaker:channel_whatsapp',
          value: {
            state,
            reason,
            openedAt: this.openedAt,
            updatedAt: Date.now(),
          },
        },
      });
      this.lastPersistSuccess = true;
      return true;
    } catch (err: any) {
      this.lastPersistSuccess = false;
      this.syncError = true;
      console.error('❌ [Circuit Breaker] Erro ao sincronizar estado no banco de dados:', err.message);
      return false;
    }
  }
}

let defaultBreaker: CircuitBreaker | null = null;

export function getCircuitBreaker(): CircuitBreaker {
  if (!defaultBreaker) {
    defaultBreaker = new CircuitBreaker();
  }
  return defaultBreaker;
}
