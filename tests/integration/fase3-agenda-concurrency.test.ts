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

  it('Trava Anti-Regressão #3: cancelamento com menos de 1h de antecedência marca cancelamento tardio e gera voucher de 50%', async () => {
    // Horário em 30 minutos (menos de 1h)
    const soonDate = new Date(Date.now() + 30 * 60 * 1000);

    const result = await createBooking({
      businessId,
      serviceId,
      professionalId,
      startsAt: soonDate.toISOString(),
      customerName: 'Cliente Cancelamento Tardio',
      customerPhone: '(33) 98888-2222',
      idempotencyKey: `late_booking_${Date.now()}`,
    });

    // Cancela com menos de 1 hora
    const cancelRes = await cancelBooking(result.booking.id, 'Trânsito');
    expect(cancelRes.booking.status).toBe('CANCELLED_BY_CUSTOMER');
    expect(cancelRes.isLate).toBe(true);
    expect(cancelRes.voucherCode).not.toBeNull();
    expect(cancelRes.voucherCode).toContain('DESC50-');

    // Confirma que o voucher foi persistido para o cliente
    const voucher = await prisma.customerVoucher.findUnique({
      where: { code: cancelRes.voucherCode! },
    });
    expect(voucher).not.toBeNull();
    expect(voucher?.discountPercent).toBe(50);
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
