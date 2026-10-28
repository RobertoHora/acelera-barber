import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/db';
import { createBooking, cancelBooking } from '@/lib/agenda/booking-service';
import { calculateAvailableSlots } from '@/lib/agenda/availability';
import { grantOrderBenefits, calculateUpgradePrice } from '@/lib/billing/entitlements';
import { emitBookingNotice } from '@/lib/notifications/booking-notifications';
import { PLANS_CONFIG } from '@/lib/plans';

describe('Fase 7 - Validação Completa das 3 Barbearias-Piloto e Isolamento Multi-Tenant', () => {
  // Piloto 1: Solo
  let pilot1BizId: string;
  let pilot1ProfId: string;
  let pilot1SvcId: string;
  const pilot1Slug = `piloto-solo-${Date.now()}`;

  // Piloto 2: Multi-profissional (3 barbeiros)
  let pilot2BizId: string;
  let pilot2ProfAId: string;
  let pilot2ProfBId: string;
  let pilot2ProfCId: string;
  let pilot2SvcId: string;
  const pilot2Slug = `piloto-multi-${Date.now()}`;

  // Piloto 3: Crua com ciclo completo de upgrade e voucher
  let pilot3BizId: string;
  let pilot3ProfId: string;
  let pilot3SvcId: string;
  const pilot3Slug = `piloto-crua-${Date.now()}`;

  beforeAll(async () => {
    // 1. Setup Piloto Solo
    const b1 = await prisma.business.create({
      data: {
        slug: pilot1Slug,
        name: 'Barbearia Solo do Mestre',
        cleanName: 'Solo do Mestre',
        phone: '+5533999911111',
        whatsapp: '+5533999911111',
        city: 'Governador Valadares',
        state: 'MG',
      },
    });
    pilot1BizId = b1.id;
    const p1 = await prisma.professional.create({
      data: {
        businessId: b1.id,
        name: 'Mestre Silva',
        nickname: 'Silva',
      },
    });
    pilot1ProfId = p1.id;
    const s1 = await prisma.service.create({
      data: {
        businessId: b1.id,
        name: 'Corte Solo Clássico',
        priceCents: 4000,
        durationMinutes: 30,
      },
    });
    pilot1SvcId = s1.id;

    // 2. Setup Piloto Multi-Profissional (3 barbeiros)
    const b2 = await prisma.business.create({
      data: {
        slug: pilot2Slug,
        name: 'Barbearia Elite Multi',
        cleanName: 'Elite Multi',
        phone: '+5533999922222',
        whatsapp: '+5533999922222',
        city: 'Governador Valadares',
        state: 'MG',
      },
    });
    pilot2BizId = b2.id;
    const p2A = await prisma.professional.create({
      data: { businessId: b2.id, name: 'Barbeiro André' },
    });
    pilot2ProfAId = p2A.id;
    const p2B = await prisma.professional.create({
      data: { businessId: b2.id, name: 'Barbeiro Bruno' },
    });
    pilot2ProfBId = p2B.id;
    const p2C = await prisma.professional.create({
      data: { businessId: b2.id, name: 'Barbeiro Carlos' },
    });
    pilot2ProfCId = p2C.id;
    const s2 = await prisma.service.create({
      data: {
        businessId: b2.id,
        name: 'Corte + Barboterapia',
        priceCents: 6500,
        durationMinutes: 45,
      },
    });
    pilot2SvcId = s2.id;

    // 3. Setup Piloto Crua
    const b3 = await prisma.business.create({
      data: {
        slug: pilot3Slug,
        name: 'Barbearia Nova Esperança',
        cleanName: 'Nova Esperança',
        phone: '+5533999933333',
        whatsapp: '+5533999933333',
        city: 'Governador Valadares',
        state: 'MG',
      },
    });
    pilot3BizId = b3.id;
    const p3 = await prisma.professional.create({
      data: { businessId: b3.id, name: 'Barbeiro João' },
    });
    pilot3ProfId = p3.id;
    const s3 = await prisma.service.create({
      data: {
        businessId: b3.id,
        name: 'Corte Simples',
        priceCents: 3000,
        durationMinutes: 30,
      },
    });
    pilot3SvcId = s3.id;
  });

  afterAll(async () => {
    const ids = [pilot1BizId, pilot2BizId, pilot3BizId];
    await prisma.customerVoucher.deleteMany({ where: { businessId: { in: ids } } });
    await prisma.outboxMessage.deleteMany({ where: { businessId: { in: ids } } });
    await prisma.growthEvent.deleteMany({ where: { businessId: { in: ids } } });
    await prisma.booking.deleteMany({ where: { businessId: { in: ids } } });
    await prisma.customer.deleteMany({ where: { businessId: { in: ids } } });
    await prisma.service.deleteMany({ where: { businessId: { in: ids } } });
    await prisma.professional.deleteMany({ where: { businessId: { in: ids } } });
    await prisma.trialBenefit.deleteMany({ where: { businessId: { in: ids } } });
    await prisma.entitlement.deleteMany({ where: { businessId: { in: ids } } });
    await prisma.order.deleteMany({ where: { businessId: { in: ids } } });
    await prisma.business.deleteMany({ where: { id: { in: ids } } });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO PILOTO 1: Barbeiro Solo
  // ───────────────────────────────────────────────────────────────────────────
  it('Piloto 1 (Solo): agendamento público sem senha e geração de avisos na outbox', async () => {
    const startsAt = new Date(Date.now() + 48 * 3600 * 1000); // Em 48 horas
    startsAt.setMinutes(0, 0, 0);

    const bookingRes = await createBooking({
      businessId: pilot1BizId,
      serviceId: pilot1SvcId,
      professionalId: pilot1ProfId,
      customerName: 'Marcos Vinicius',
      customerPhoneE164: '+5533988881111',
      startsAt,
    });

    expect(bookingRes.booking).toBeDefined();
    expect(bookingRes.bookingToken).toBeDefined();
    expect(bookingRes.booking.customerName).toBe('Marcos Vinicius');

    // Emite notificações da reserva
    const notices = await emitBookingNotice({
      bookingId: bookingRes.booking.id,
      event: 'booking.created',
    });
    expect(notices.enqueued.length).toBe(2); // Cliente + Barbearia
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO PILOTO 2: Multi-Profissional (3 Barbeiros) & Concorrência
  // ───────────────────────────────────────────────────────────────────────────
  it('Piloto 2 (Multi): permite agendamentos simultâneos para profissionais diferentes no mesmo slot', async () => {
    const sameSlot = new Date(Date.now() + 72 * 3600 * 1000);
    sameSlot.setMinutes(0, 0, 0);

    // Cliente 1 agenda com André, Cliente 2 agenda com Bruno no MESMO horário
    const [resA, resB] = await Promise.all([
      createBooking({
        businessId: pilot2BizId,
        serviceId: pilot2SvcId,
        professionalId: pilot2ProfAId,
        customerName: 'Cliente do André',
        customerPhoneE164: '+5533988882221',
        startsAt: sameSlot,
      }),
      createBooking({
        businessId: pilot2BizId,
        serviceId: pilot2SvcId,
        professionalId: pilot2ProfBId,
        customerName: 'Cliente do Bruno',
        customerPhoneE164: '+5533988882222',
        startsAt: sameSlot,
      }),
    ]);

    expect(resA.booking.id).toBeDefined();
    expect(resB.booking.id).toBeDefined();
    expect(resA.booking.professionalId).toBe(pilot2ProfAId);
    expect(resB.booking.professionalId).toBe(pilot2ProfBId);
  });

  it('Piloto 2 (Multi): bloqueia 2 agendamentos simultâneos para o MESMO barbeiro no mesmo slot', async () => {
    const conflictSlot = new Date(Date.now() + 96 * 3600 * 1000);
    conflictSlot.setMinutes(0, 0, 0);

    const results = await Promise.allSettled([
      createBooking({
        businessId: pilot2BizId,
        serviceId: pilot2SvcId,
        professionalId: pilot2ProfCId,
        customerName: 'Concorrente 1',
        customerPhoneE164: '+5533988882223',
        startsAt: conflictSlot,
      }),
      createBooking({
        businessId: pilot2BizId,
        serviceId: pilot2SvcId,
        professionalId: pilot2ProfCId,
        customerName: 'Concorrente 2',
        customerPhoneE164: '+5533988882224',
        startsAt: conflictSlot,
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO PILOTO 3: Barbearia Crua com Upgrade e Cancelamento Tardio com Voucher
  // ───────────────────────────────────────────────────────────────────────────
  it('Piloto 3 (Crua): compra Pro (R$37/14d), faz upgrade Completo (R$20/30d) e gera voucher no cancelamento tardio', async () => {
    // 1. Compra Eleva Google Pro
    const orderPro = await prisma.order.create({
      data: {
        orderNsu: `eleva_pilot3_pro_${Date.now()}`,
        businessId: pilot3BizId,
        sku: 'eleva_google_pro',
        amountCents: 3700,
        status: 'PAID',
        idempotencyKey: `idemp_pilot3_pro_${Date.now()}`,
        paidAt: new Date(),
      },
    });

    await grantOrderBenefits(orderPro.id);

    const trialPro = await prisma.trialBenefit.findUnique({
      where: { businessId: pilot3BizId },
    });
    expect(trialPro?.grantedDays).toBe(14);
    expect(trialPro?.status).toBe('GRANTED');

    // 2. Trava #4: Upgrade Pro -> Completo por R$ 20 estende teste para 30 dias a partir da ativação
    const upgradeCalc = calculateUpgradePrice('eleva_google_pro', 'eleva_complete');
    expect(upgradeCalc.allowed).toBe(true);
    expect(upgradeCalc.priceCents).toBe(2000);

    // Simula compra do Upgrade
    const orderUpgrade = await prisma.order.create({
      data: {
        orderNsu: `eleva_pilot3_upg_${Date.now()}`,
        businessId: pilot3BizId,
        sku: 'eleva_complete_upgrade',
        amountCents: 2000,
        status: 'PAID',
        idempotencyKey: `idemp_pilot3_upg_${Date.now()}`,
        paidAt: new Date(),
      },
    });

    await grantOrderBenefits(orderUpgrade.id);

    const trialUpgraded = await prisma.trialBenefit.findUnique({
      where: { businessId: pilot3BizId },
    });
    expect(trialUpgraded?.grantedDays).toBe(30);

    // 3. Cliente final agenda um corte para daqui a 30 minutos com pagamento antecipado (janela menor que 1h)
    const lateSlot = new Date(Date.now() + 30 * 60 * 1000);
    const bookingLate = await createBooking({
      businessId: pilot3BizId,
      serviceId: pilot3SvcId,
      professionalId: pilot3ProfId,
      customerName: 'Cliente Atrasado',
      customerPhoneE164: '+5533988883331',
      startsAt: lateSlot,
      isPrepaid: true,
      prepaidAmountCents: 3000,
    });

    // 4. Trava #3: Cancelamento com < 1h gera voucher de 50% para o cliente
    const cancelRes = await cancelBooking(
      bookingLate.booking.id,
      'Imprevisto de última hora',
      {
        role: 'CUSTOMER_TOKEN',
        tokenHash: bookingLate.booking.cancelTokenHash,
      }
    );

    expect(cancelRes.isLate).toBe(true);
    expect(cancelRes.voucherCode).toBeDefined();
    expect(cancelRes.voucherCode).toContain('DESC50-');

    // Verifica que o voucher foi gravado no banco de dados
    const savedVoucher = await prisma.customerVoucher.findFirst({
      where: { code: cancelRes.voucherCode! },
    });
    expect(savedVoucher).not.toBeNull();
    expect(savedVoucher?.discountPercent).toBe(50);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CENÁRIO 4: Isolamento Multi-Tenant Estrito
  // ───────────────────────────────────────────────────────────────────────────
  it('Isolamento Multi-Tenant: agendamento de barbearia A não pode ser cancelado por cliente com contexto de barbearia B', async () => {
    const slot = new Date(Date.now() + 120 * 3600 * 1000);
    const bookingBiz1 = await createBooking({
      businessId: pilot1BizId,
      serviceId: pilot1SvcId,
      professionalId: pilot1ProfId,
      customerName: 'Cliente da Barbearia 1',
      customerPhoneE164: '+5533988884441',
      startsAt: slot,
    });

    // Cliente da Barbearia 2 tentando cancelar a reserva da Barbearia 1 via agente IA com telefone diferente
    await expect(
      cancelBooking(
        bookingBiz1.booking.id,
        'Tentativa indevida cross-tenant',
        {
          role: 'WHATSAPP_AI_AGENT',
          businessId: pilot2BizId,
          customerPhoneE164: '+5533988885552', // Telefone de outro cliente
        }
      )
    ).rejects.toThrow('Não autorizado');
  });
});
