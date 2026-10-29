import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/db';
import { createBooking, cancelBooking, getBookingByToken } from '@/lib/agenda/booking-service';
import { getDayAvailability } from '@/lib/agenda/availability';

describe('Fase 3 - Agenda ORC: Disponibilidade, Concorrência e Cancelamento com Voucher', () => {
  let businessId: string;
  let serviceId: string;
  let professionalId: string;
  const testSlug = `teste-agenda-${Date.now()}`;

  beforeAll(async () => {
    const biz = await prisma.business.create({
      data: {
        slug: testSlug,
        name: 'Barbearia Agenda Concorrência',
        cleanName: 'Barbearia Agenda Concorrência',
        phone: '+5533999990002',
        whatsapp: '+5533999990002',
        city: 'Governador Valadares',
        state: 'MG',
        cancellationNoticeHours: 1, // Janela padrão: 1 hora
      },
    });
    businessId = biz.id;

    const svc = await prisma.service.create({
      data: {
        businessId,
        name: 'Corte Degradê Concorrência',
        priceCents: 4000,
        durationMinutes: 30,
      },
    });
    serviceId = svc.id;

    const pro = await prisma.professional.create({
      data: {
        businessId,
        name: 'Barbeiro Mestre',
        nickname: 'Mestre',
        workingHours: [
          { day: 1, open: '08:00', close: '20:00' },
          { day: 2, open: '08:00', close: '20:00' },
          { day: 3, open: '08:00', close: '20:00' },
          { day: 4, open: '08:00', close: '20:00' },
          { day: 5, open: '08:00', close: '20:00' },
          { day: 6, open: '08:00', close: '20:00' },
          { day: 0, open: '08:00', close: '20:00' },
        ],
      },
    });
    professionalId = pro.id;
  });

  afterAll(async () => {
    await prisma.business.delete({ where: { id: businessId } }).catch(() => {});
  });

  it('calcula slots disponíveis em fuso local sem retornar horários passados', async () => {
    const tomorrow = new Date(Date.now() + 86400 * 1000).toISOString().slice(0, 10);
    const slots = await getDayAvailability({
      businessId,
      dateString: tomorrow,
      serviceId,
      professionalId,
    });

    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].displayTime).toBeDefined();
    expect(slots[0].professionalId).toBe(professionalId);
  });

  it('cria agendamento e gera token de gerenciamento privado', async () => {
    // Horário futuro garantido (daqui a 48 horas)
    const futureDate = new Date(Date.now() + 48 * 3600 * 1000);
    futureDate.setMinutes(0, 0, 0);

    const result = await createBooking({
      businessId,
      serviceId,
      professionalId,
      startsAt: futureDate.toISOString(),
      customerName: 'Cliente Teste Antecipado',
      customerPhone: '(33) 98888-1111',
    });

    expect(result.booking.id).toBeDefined();
    expect(result.bookingToken).not.toBeNull();

    // Recupera pelo token
    const fetched = await getBookingByToken(result.bookingToken!);
    expect(fetched).not.toBeNull();
    expect(fetched?.customerName).toBe('Cliente Teste Antecipado');

    // Cancelamento gratuito com antecedência >= 1h (Trava #3)
    const cancelRes = await cancelBooking(result.booking.id, 'Imprevisto');
    expect(cancelRes.booking.status).toBe('CANCELLED_BY_CUSTOMER');
    expect(cancelRes.isLate).toBe(false);
    expect(cancelRes.voucherCode).toBeNull();
  });

  it('Trava Anti-Regressão #3: voucher de 50% só é gerado em cancelamento tardio COM pagamento antecipado (e respeita toggle da barbearia)', async () => {
    // 1. Caso sem pagamento antecipado (pagamento no local): NÃO gera voucher
    const soonDate1 = new Date(Date.now() + 30 * 60 * 1000);
    const unpaidBooking = await createBooking({
      businessId,
      serviceId,
      professionalId,
      startsAt: soonDate1.toISOString(),
      customerName: 'Cliente Sem Pagamento Antecipado',
      customerPhone: '(33) 98888-2221',
      isPrepaid: false,
      idempotencyKey: `unpaid_late_${Date.now()}`,
    });

    const cancelUnpaid = await cancelBooking(unpaidBooking.booking.id, 'Imprevisto');
    expect(cancelUnpaid.isLate).toBe(true);
    expect(cancelUnpaid.voucherCode).toBeNull(); // Sem pagamento antecipado = Sem voucher!

    // 2. Caso com pagamento antecipado e barbearia com voucher ativo: GERA voucher de 50%
    const soonDate2 = new Date(Date.now() + 35 * 60 * 1000);
    const prepaidBooking = await createBooking({
      businessId,
      serviceId,
      professionalId,
      startsAt: soonDate2.toISOString(),
      customerName: 'Cliente Com Pagamento Antecipado',
      customerPhone: '(33) 98888-2222',
      isPrepaid: true,
      prepaidAmountCents: 3500,
      idempotencyKey: `prepaid_late_${Date.now()}`,
    });

    const cancelPrepaid = await cancelBooking(prepaidBooking.booking.id, 'Trânsito');
    expect(cancelPrepaid.isLate).toBe(true);
    expect(cancelPrepaid.voucherCode).not.toBeNull();
    expect(cancelPrepaid.voucherCode).toContain('DESC50-');

    const voucher = await prisma.customerVoucher.findUnique({
      where: { code: cancelPrepaid.voucherCode! },
    });
    expect(voucher).not.toBeNull();
    expect(voucher?.discountPercent).toBe(50);

    // 3. Caso em que a barbearia DESATIVA a emissão de vouchers
    await prisma.business.update({
      where: { id: businessId },
      data: { lateCancellationVoucherEnabled: false },
    });

    const soonDate3 = new Date(Date.now() + 40 * 60 * 1000);
    const disabledPolicyBooking = await createBooking({
      businessId,
      serviceId,
      professionalId,
      startsAt: soonDate3.toISOString(),
      customerName: 'Cliente Política Desativada',
      customerPhone: '(33) 98888-2223',
      isPrepaid: true,
      prepaidAmountCents: 3500,
      idempotencyKey: `disabled_policy_${Date.now()}`,
    });

    const cancelDisabled = await cancelBooking(disabledPolicyBooking.booking.id, 'Desistiu');
    expect(cancelDisabled.isLate).toBe(true);
    expect(cancelDisabled.voucherCode).toBeNull(); // Política desativada pela barbearia = Sem voucher!

    // Restaura toggle para os demais testes
    await prisma.business.update({
      where: { id: businessId },
      data: { lateCancellationVoucherEnabled: true },
    });
  });

  it('Trava Anti-Regressão #6: teste de corrida com 10 requisições simultâneas para o mesmo horário resulta em exatamente 1 sucesso e 9 conflitos', async () => {
    // Horário exclusivo futuro (daqui a 72 horas)
    const targetSlot = new Date(Date.now() + 72 * 3600 * 1000);
    targetSlot.setMinutes(0, 0, 0);

    // 10 requisições simultâneas tentando reservar o mesmo profissional no mesmo segundo
    const attempts = Array.from({ length: 10 }).map((_, i) =>
      createBooking({
        businessId,
        serviceId,
        professionalId,
        startsAt: targetSlot.toISOString(),
        customerName: `Concorrente ${i + 1}`,
        customerPhone: `(33) 98888-333${i}`,
        idempotencyKey: `race_attempt_${i}_${Date.now()}`,
      })
    );

    const results = await Promise.allSettled(attempts);

    const successes = results.filter((r) => r.status === 'fulfilled');
    const failures = results.filter((r) => r.status === 'rejected');

    // Rigorosamente 1 sucesso e 9 falhas por exclusão de concorrência!
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(9);

    // Verifica que o erro retornado aos 9 que perderam a corrida foi SLOT_UNAVAILABLE
    for (const f of failures) {
      if (f.status === 'rejected') {
        expect(f.reason.code).toBe('SLOT_UNAVAILABLE');
      }
    }
  });
});
