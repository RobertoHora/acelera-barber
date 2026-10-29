import { describe, it, expect } from 'vitest';
import {
  PLANS_CONFIG,
  resolvePlanConfig,
  calculateTrialEndsAt,
  calculateUpgradeProRataCents,
  INFINITEPAY_CONFIG,
} from '@/lib/plans';
import { findTopCompetitors } from '@/lib/leads';

describe('Fase 0 - Catálogo Comercial e Regras de Negócio', () => {
  it('contém todos os 6 SKUs canônicos com preços e intervalos corretos', () => {
    expect(PLANS_CONFIG.eleva_free.priceCents).toBe(0);
    expect(PLANS_CONFIG.eleva_google_pro.priceCents).toBe(3700);
    expect(PLANS_CONFIG.eleva_google_pro.grantedTrialDays).toBe(14);

    expect(PLANS_CONFIG.eleva_complete.priceCents).toBe(5700);
    expect(PLANS_CONFIG.eleva_complete.grantedTrialDays).toBe(30);

    expect(PLANS_CONFIG.eleva_complete_upgrade.priceCents).toBe(2000);
    expect(PLANS_CONFIG.eleva_complete_upgrade.grantedTrialDaysDelta).toBe(16);

    expect(PLANS_CONFIG.agenda_basic_monthly.priceCents).toBe(3700);
    expect(PLANS_CONFIG.agenda_basic_monthly.billingInterval).toBe('MONTHLY');

    expect(PLANS_CONFIG.agenda_ai_monthly.priceCents).toBe(6700);
    expect(PLANS_CONFIG.agenda_ai_monthly.billingInterval).toBe('MONTHLY');
  });

  it('resolve referências legadas e canônicas de forma transparente', () => {
    expect(resolvePlanConfig('google_pro')?.id).toBe('eleva_google_pro');
    expect(resolvePlanConfig('complete')?.id).toBe('eleva_complete');
    expect(resolvePlanConfig('free')?.id).toBe('eleva_free');
    expect(resolvePlanConfig('eleva_complete_upgrade')?.id).toBe('eleva_complete_upgrade');
    expect(resolvePlanConfig('agenda_ai_monthly')?.id).toBe('agenda_ai_monthly');
  });

  it('calcula data de término de teste estendendo para 30 dias no upgrade sem reiniciar activatedAt', () => {
    const activatedAt = new Date('2026-10-01T12:00:00Z');
    
    // Teste inicial do Google Pro (14 dias)
    const initial = calculateTrialEndsAt('ACTIVE', activatedAt, 14, false);
    expect(initial.endsAt?.toISOString()).toBe(new Date('2026-10-15T12:00:00Z').toISOString());

    // Upgrade para Completo (R$ 20) -> estende para 30 dias a partir do activatedAt original
    const upgraded = calculateTrialEndsAt('ACTIVE', activatedAt, 14, true);
    expect(upgraded.activatedAt?.toISOString()).toBe(activatedAt.toISOString());
    expect(upgraded.endsAt?.toISOString()).toBe(new Date('2026-10-31T12:00:00Z').toISOString());
  });

  it('calcula upgrade pro-rata exato de R$ 37 para R$ 67/mês proporcional aos dias restantes', () => {
    const periodStart = new Date('2026-10-01T00:00:00Z');
    const periodEnd = new Date('2026-10-31T00:00:00Z'); // 30 dias totais

    // Meio do ciclo (15 dias restantes de 30) -> 50% de R$ 30,00 = R$ 15,00 (1500 centavos)
    const midCycle = new Date('2026-10-16T00:00:00Z');
    const costMid = calculateUpgradeProRataCents(periodStart, periodEnd, midCycle);
    expect(costMid).toBe(1500);

    // Início do ciclo (30 dias restantes) -> R$ 30,00 (3000 centavos)
    const costStart = calculateUpgradeProRataCents(periodStart, periodEnd, periodStart);
    expect(costStart).toBe(3000);

    // Fim do ciclo (últimas horas) -> trava no piso de segurança de R$ 1,00 (100 centavos)
    const costEnd = calculateUpgradeProRataCents(periodStart, periodEnd, new Date('2026-10-30T23:59:00Z'));
    expect(costEnd).toBe(100);
  });

  it('mantém a tag recebedora oficial como estudio-orc', () => {
    expect(INFINITEPAY_CONFIG.handle).toBe('estudio-orc');
    expect(INFINITEPAY_CONFIG.referralUrl).toBe('https://infinitepay.onelink.me/IGWD/estudio-orc');
  });

  it('retorna concorrentes com cidade parametrizada sem forçar neighborhood default fixo', () => {
    const comps = findTopCompetitors('Barbearia Teste', 'Ilha dos Araújos', 5, 2, 'Governador Valadares');
    expect(comps.length).toBeGreaterThanOrEqual(1);
    expect(comps[0].name).not.toBe('Barbearia Teste');
  });
});
