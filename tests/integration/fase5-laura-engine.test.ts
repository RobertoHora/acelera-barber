import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/db';
import { LAURA_TOOLS } from '../../services/laura-engine/agenda-tools';
import { processLauraMessage, resolveSenderContext } from '../../services/laura-engine/laura-brain';
import { handleInboundMessage, flushBufferKey, setDebounceMsForTests } from '../../services/laura-engine/inbound-orchestrator';

describe('Fase 5 - Motor Laura: Atendimento Conversacional, Tools da Agenda e Desambiguação', () => {
  let businessId: string;
  let serviceId: string;
  let ownerPhone = '+5533999990005';
  const testSlug = `teste-laura-${Date.now()}`;

  beforeAll(async () => {
    const biz = await prisma.business.create({
      data: {
        slug: testSlug,
        name: 'Barbearia Laura IA',
        cleanName: 'Barbearia Laura IA',
        phone: ownerPhone,
        whatsapp: ownerPhone,
        city: 'Governador Valadares',
        state: 'MG',
      },
    });
    businessId = biz.id;

    const svc = await prisma.service.create({
      data: {
        businessId,
        name: 'Corte Tradicional Laura',
        priceCents: 3500,
        durationMinutes: 30,
      },
    });
    serviceId = svc.id;

    await prisma.professional.create({
      data: {
        businessId,
        name: 'Barbeiro Laura Pro',
        nickname: 'Laura Pro',
      },
    });
  });

  afterAll(async () => {
    await prisma.business.delete({ where: { id: businessId } }).catch(() => {});
  });

  it('Trava Anti-Regressão #1: Atendente identifica-se oficialmente como Laura', async () => {
    const res = await processLauraMessage('Olá, quem fala?', '+5533988880001');
    expect(res.replyText).toContain('Laura');
    expect(res.replyText).not.toContain('Lana'); // Lana permanece no Estúdio ORC!
  });

  it('LAURA_TOOLS: lista serviços e profissionais da barbearia', async () => {
    const services = await LAURA_TOOLS.listServices({ businessId, customerPhoneE164: '+5533988880002' });
    expect(services.length).toBeGreaterThanOrEqual(1);
    expect(services[0].name).toBe('Corte Tradicional Laura');
    expect(services[0].priceFormatted).toBe('R$ 35');

    const pros = await LAURA_TOOLS.listProfessionals({ businessId, customerPhoneE164: '+5533988880002' });
    expect(pros.length).toBeGreaterThanOrEqual(1);
    expect(pros[0].name).toBe('Laura Pro');
  });

  it('LAURA_TOOLS: respeita elegibilidade do plano - bloqueia agendamento por chat se não tiver agenda_ai_monthly', async () => {
    // Barbearia sem assinatura AI ativa: retorna allowed: false com link da web
    const res = await LAURA_TOOLS.createBooking(
      {
        serviceId,
        startsAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        customerName: 'Cliente Teste',
      },
      { businessId, customerPhoneE164: '+5533988880003' }
    );

    expect(res.allowed).toBe(false);
    expect(res.reason).toBe('PLAN_DOES_NOT_INCLUDE_AI');
    expect(res.message).toContain('https://agenda.oracio.uk/');
  });

  it('LAURA_TOOLS: permite agendamento quando o plano agenda_ai_monthly está ativo no teste', async () => {
    // Ativa teste com modalidade agenda_ai_monthly
    await prisma.trialBenefit.create({
      data: {
        businessId,
        sourcePlan: 'eleva_complete',
        grantedDays: 30,
        status: 'ACTIVE',
        selectedModality: 'agenda_ai_monthly',
        activatedAt: new Date(),
        endsAt: new Date(Date.now() + 30 * 86400 * 1000),
      },
    });

    const targetDate = new Date(Date.now() + 50 * 3600 * 1000);
    targetDate.setMinutes(0, 0, 0);

    const res = await LAURA_TOOLS.createBooking(
      {
        serviceId,
        startsAt: targetDate.toISOString(),
        customerName: 'Cliente VIP AI',
      },
      { businessId, customerPhoneE164: '+5533988880004' }
    );

    expect(res.allowed).toBe(true);
    expect(res.success).toBe(true);
    expect(res.serviceName).toBe('Corte Tradicional Laura');
    expect(res.bookingToken).toBeDefined();
  });

  it('resolveSenderContext: desambiguação multi-negócio quando o mesmo dono possui mais de uma barbearia', async () => {
    const ownerMultiPhone = '+5533999990099';
    const user = await prisma.user.create({
      data: {
        phone: ownerMultiPhone,
        name: 'Dono Multi-Lojas',
      },
    });

    // Cria 2 barbearias para o mesmo dono
    const b1 = await prisma.business.create({
      data: {
        slug: `b1-${Date.now()}`,
        name: 'Barbearia Alpha',
        userId: user.id,
      },
    });
    const b2 = await prisma.business.create({
      data: {
        slug: `b2-${Date.now()}`,
        name: 'Barbearia Beta',
        userId: user.id,
      },
    });

    const context = await resolveSenderContext(ownerMultiPhone);
    expect(context.role).toBe('AMBIGUOUS_MULTI_BUSINESS');
    expect(context.ambiguousBusinesses?.length).toBe(2);

    // Resposta automática da Laura lista as opções para desambiguação
    const msg = await processLauraMessage('Quero ver a agenda de hoje', ownerMultiPhone);
    expect(msg.replyText).toContain('Barbearia Alpha');
    expect(msg.replyText).toContain('Barbearia Beta');

    // Limpa
    await prisma.business.deleteMany({ where: { id: { in: [b1.id, b2.id] } } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('inbound-orchestrator: processa mensagem com debounce e envia resposta via outbox simulada', async () => {
    setDebounceMsForTests(50); // 50ms para teste rápido

    const clientPhone = '+5533988880099';
    await handleInboundMessage(clientPhone, 'Quais são os serviços de corte?');

    const flushed = await flushBufferKey(clientPhone, testSlug);
    expect(flushed?.outboxItem).toBeDefined();
    expect(flushed?.outboxItem.status).toBe('PROVIDER_ACCEPTED'); // Despachado no modo simulado
    expect(flushed?.outboxItem.content).toContain('Laura');
  });
});
