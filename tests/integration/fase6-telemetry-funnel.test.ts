import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/db';
import { recordGrowthEvent } from '@/lib/telemetry/events';
import { buildConsultativeSummary } from '@/lib/telemetry/consultative-summary';
import { processLauraMessage } from '../../services/laura-engine/laura-brain';
import { GET as adminMetricsGet } from '@/app/api/v1/admin/metrics/route';
import { NextRequest } from 'next/server';

describe('Fase 6 - Telemetria, Funil Consultivo e Métricas de Operação', () => {
  let businessId: string;
  const ownerPhone = '+5533999990006';
  const testSlug = `teste-telemetria-${Date.now()}`;

  beforeAll(async () => {
    const biz = await prisma.business.create({
      data: {
        slug: testSlug,
        name: 'Barbearia Funil Teste',
        cleanName: 'Barbearia Funil Teste',
        phone: ownerPhone,
        whatsapp: ownerPhone,
        city: 'Governador Valadares',
        state: 'MG',
      },
    });
    businessId = biz.id;
  });

  afterAll(async () => {
    await prisma.growthEvent.deleteMany({ where: { businessId } });
    await prisma.outboxMessage.deleteMany({ where: { businessId } });
    await prisma.diagnosticReport.deleteMany({ where: { businessId } });
    await prisma.entitlement.deleteMany({ where: { businessId } });
    await prisma.trialBenefit.deleteMany({ where: { businessId } });
    await prisma.order.deleteMany({ where: { businessId } });
    await prisma.business.deleteMany({ where: { id: businessId } });
  });

  it('recordGrowthEvent: registra evento deduplicado e idempotente', async () => {
    const dedupeKey = `diag_comp:${businessId}:${Date.now()}`;

    const evt1 = await recordGrowthEvent({
      event: 'diagnostic.completed',
      businessId,
      dedupeKey,
      metadata: { score: 62 },
    });
    expect(evt1).toBeDefined();
    expect(evt1?.event).toBe('diagnostic.completed');

    // Tentar gravar novamente com a mesma dedupeKey não quebra nem duplica
    const evt2 = await recordGrowthEvent({
      event: 'diagnostic.completed',
      businessId,
      dedupeKey,
      metadata: { score: 62 },
    });
    expect(evt2?.id).toBe(evt1?.id);
  });

  it('Transição de Funil: evento order.paid cancela cadência fria de abordagem na outbox', async () => {
    // Enfileira mensagem de prospecção fria pendente
    const coldMsg = await prisma.outboxMessage.create({
      data: {
        businessId,
        direction: 'OUTBOUND',
        destinationPhone: ownerPhone,
        content: 'Olá! Sou a Laura e notei que sua barbearia no Google...',
        purpose: 'INITIAL_OUTREACH',
        dedupeKey: `cold_outreach:${businessId}`,
        status: 'QUEUED',
      },
    });
    expect(coldMsg.status).toBe('QUEUED');

    // Dispara evento de compra paga
    const paidDedupeKey = `order_paid:${businessId}:${Date.now()}`;
    await recordGrowthEvent({
      event: 'order.paid',
      businessId,
      dedupeKey: paidDedupeKey,
      metadata: { plan: 'eleva_google_pro', amountCents: 3700 },
    });

    // Mensagem fria deve ter sido cancelada imediatamente
    const reloadedColdMsg = await prisma.outboxMessage.findUnique({
      where: { id: coldMsg.id },
    });
    expect(reloadedColdMsg?.status).toBe('CANCELLED');
    expect(reloadedColdMsg?.error).toBe('CANCELLED_ALREADY_CUSTOMER');
  });

  it('buildConsultativeSummary: consolida estágio, score, gaps e próxima recomendação', async () => {
    // Cria diagnóstico para a barbearia
    await prisma.diagnosticReport.create({
      data: {
        businessId,
        score: 55,
        label: 'Melhorias Críticas',
        criteria: { photos: false, hours: true },
        gaps: ['Sem fotos de boa qualidade', 'Sem link de agendamento online'],
      },
    });

    const summaryLead = await buildConsultativeSummary(businessId);
    expect(summaryLead).not.toBeNull();
    expect(summaryLead?.currentStage).toBe('LEAD_DIAGNOSED');
    expect(summaryLead?.score).toBe(55);
    expect(summaryLead?.diagnosticGaps.length).toBe(2);
    expect(summaryLead?.nextRecommendedAction).toContain('Eleva Google Pro (R$ 37)');

    // Concede direito eleva_google_pro
    await prisma.entitlement.create({
      data: {
        businessId,
        sku: 'eleva_google_pro',
      },
    });

    // Cria benefício de teste de 14 dias ativo
    await prisma.trialBenefit.create({
      data: {
        businessId,
        sourcePlan: 'eleva_google_pro',
        grantedDays: 14,
        status: 'ACTIVE',
        activatedAt: new Date(),
        endsAt: new Date(Date.now() + 14 * 86400 * 1000),
      },
    });

    const summaryCustomer = await buildConsultativeSummary(businessId);
    expect(summaryCustomer?.currentStage).toBe('TRIAL_AGENDA_ACTIVE');
    expect(summaryCustomer?.trial.daysRemaining).toBe(14);
    expect(summaryCustomer?.conversationalSummaryText).toContain('Barbearia Funil Teste');
  });

  it('Laura Brain utiliza o resumo consultivo para orientar o dono da barbearia', async () => {
    const res = await processLauraMessage(
      'Olá Laura, o que eu devo fazer agora para melhorar minha barbearia?',
      ownerPhone
    );

    expect(res.replyText).toContain('análise gratuita');
    expect(res.replyText).not.toContain('Próximo passo recomendado:');
    expect(res.consultativeSummary).toBeDefined();
    expect(res.consultativeSummary?.businessId).toBe(businessId);
  });

  it('API /api/v1/admin/metrics: bloqueia sem segredo e retorna agregações operacionais com segredo', async () => {
    // 1. Sem autorização -> 403
    const unauthReq = new NextRequest('http://localhost:3000/api/v1/admin/metrics');
    const unauthRes = await adminMetricsGet(unauthReq);
    expect(unauthRes.status).toBe(403);

    // 2. Com segredo válido -> 200 e dados completos
    const authReq = new NextRequest(
      'http://localhost:3000/api/v1/admin/metrics?secret=orc_admin_secret_gv'
    );
    const authRes = await adminMetricsGet(authReq);
    expect(authRes.status).toBe(200);

    const body = await authRes.json();
    expect(body.success).toBe(true);
    expect(body.cohorts.totalBusinesses).toBeGreaterThan(0);
    expect(body.outbox.health).toBeDefined();
    expect(body.outbox.circuitBreakerStatus).toBe('HEALTHY');
  });
});
