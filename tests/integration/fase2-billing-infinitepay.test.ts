import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/db';
import { grantOrderBenefits, activateTrial } from '@/lib/billing/entitlements';
import { generateInfinitePayCheckoutUrl } from '@/lib/billing/infinitepay';

describe('Fase 2 - Cobrança InfinitePay, Entitlements e Benefícios de Teste', () => {
  let testBusinessId: string;
  const testSlug = `teste-billing-${Date.now()}`;

  beforeAll(async () => {
    const biz = await prisma.business.create({
      data: {
        slug: testSlug,
        name: 'Barbearia Teste Billing',
        cleanName: 'Barbearia Teste Billing',
        phone: '+5533999990001',
        whatsapp: '+5533999990001',
        city: 'Governador Valadares',
        state: 'MG',
      },
    });
    testBusinessId = biz.id;
  });

  afterAll(async () => {
    await prisma.business.delete({ where: { id: testBusinessId } }).catch(() => {});
  });

  it('gera URL de checkout InfinitePay com prefixo obrigatório eleva_ no order_nsu', () => {
    const orderNsu = `eleva_${testSlug}_google_pro_12345`;
    const url = generateInfinitePayCheckoutUrl({
      orderId: 'ord_123',
      orderNsu,
      amountCents: 3700,
      customerName: 'Barbearia Teste Billing',
    });

    expect(url).toContain('https://loja.infinitepay.io/estudio-orc?');
    expect(url).toContain('order_nsu=eleva_');
    expect(url).toContain('amount=37.00');
  });

  it('concede direitos e 14 dias de teste após pagamento de eleva_google_pro', async () => {
    const orderNsu = `eleva_${testSlug}_google_pro_${Date.now()}`;
    const order = await prisma.order.create({
      data: {
        orderNsu,
        businessId: testBusinessId,
        sku: 'eleva_google_pro',
        amountCents: 3700,
        status: 'PAID',
        paidAt: new Date(),
        idempotencyKey: `idemp_${orderNsu}`,
      },
    });

    const result = await grantOrderBenefits(order.id);
    expect(result.sku).toBe('eleva_google_pro');
    expect(result.trialBenefit).not.toBeNull();
    expect(result.trialBenefit?.grantedDays).toBe(14);
    expect(result.trialBenefit?.status).toBe('GRANTED');
    expect(result.trialBenefit?.activatedAt).toBeNull(); // O relógio NÃO corre na compra!
  });

  it('ativa o teste da Agenda ORC definindo data de início e término exatas', async () => {
    const activated = await activateTrial(testBusinessId, 'agenda_basic_monthly');
    expect(activated.status).toBe('ACTIVE');
    expect(activated.activatedAt).not.toBeNull();
    expect(activated.endsAt).not.toBeNull();
    expect(activated.selectedModality).toBe('agenda_basic_monthly');

    // Confirma que a Subscription foi criada em status TRIALING
    const sub = await prisma.subscription.findUnique({
      where: { businessId: testBusinessId },
    });
    expect(sub?.status).toBe('TRIALING');
    expect(sub?.planCode).toBe('agenda_basic_monthly');
  });

  it('aplica upgrade de R$ 20 estendendo para 30 dias a partir do início sem reiniciar o relógio', async () => {
    const orderNsu = `eleva_${testSlug}_upgrade_${Date.now()}`;
    const upgradeOrder = await prisma.order.create({
      data: {
        orderNsu,
        businessId: testBusinessId,
        sku: 'eleva_complete_upgrade',
        amountCents: 2000,
        status: 'PAID',
        paidAt: new Date(),
        idempotencyKey: `idemp_${orderNsu}`,
      },
    });

    const originalTrial = await prisma.trialBenefit.findUnique({
      where: { businessId: testBusinessId },
    });
    const originalActivatedAt = originalTrial?.activatedAt?.getTime();

    const result = await grantOrderBenefits(upgradeOrder.id);
    expect(result.sku).toBe('eleva_complete'); // Desbloqueia o Completo!
    expect(result.trialBenefit?.grantedDays).toBe(30);
    expect(result.trialBenefit?.status).toBe('ACTIVE');
    // Trava: o activatedAt não pode mudar!
    expect(result.trialBenefit?.activatedAt?.getTime()).toBe(originalActivatedAt);
  });
});
