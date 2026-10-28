import { prisma } from '@/lib/db';

export interface TimeSlot {
  startsAt: string; // ISO UTC
  endsAt: string;   // ISO UTC
  displayTime: string; // "14:00" no fuso da barbearia
  professionalId: string;
  professionalName: string;
}

export interface DayAvailabilityQuery {
  businessId: string;
  dateString: string; // YYYY-MM-DD
  serviceId: string;
  professionalId?: string; // Se omitido ou 'any', calcula para qualquer disponível
}

/**
 * Converte data e hora local no fuso da barbearia para UTC Date
 */
export function localToUtc(dateString: string, timeString: string, timezone = 'America/Sao_Paulo'): Date {
  // Cria data formatada em ISO com offset ou fuso
  // Para America/Sao_Paulo (UTC-3 fixo sem horário de verão)
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Utiliza Intl ou cálculo de offset seguro
  const localDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  // Offset de São Paulo é UTC-3 (180 minutos a mais em UTC)
  return new Date(localDate.getTime() + 3 * 3600 * 1000);
}

/**
 * Converte UTC Date para string "HH:mm" no fuso da barbearia
 */
export function utcToLocalTime(utcDate: Date, timezone = 'America/Sao_Paulo'): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  }).format(utcDate);
}

/**
 * Calcula todos os slots livres para o dia especificado
 */
export async function getDayAvailability(query: DayAvailabilityQuery): Promise<TimeSlot[]> {
  const { businessId, dateString, serviceId, professionalId } = query;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      services: { where: { id: serviceId, isActive: true } },
      professionals: {
        where: {
          isActive: true,
          ...(professionalId && professionalId !== 'any' ? { id: professionalId } : {}),
        },
      },
    },
  });

  if (!business || business.services.length === 0 || business.professionals.length === 0) {
    return [];
  }

  const service = business.services[0];
  const durationMs = (service.durationMinutes + service.bufferMinutes) * 60 * 1000;
  const timezone = business.timezone || 'America/Sao_Paulo';

  // Dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
  const [y, m, d] = dateString.split('-').map(Number);
  const tempDate = new Date(y, m - 1, d);
  const dayOfWeek = tempDate.getDay();

  // Início e fim do dia em UTC
  const dayStartUtc = localToUtc(dateString, '00:00', timezone);
  const dayEndUtc = localToUtc(dateString, '23:59', timezone);

  // Busca agendamentos ativos no dia
  const activeBookings = await prisma.booking.findMany({
    where: {
      businessId,
      status: { in: ['PENDING_CONFIRMATION', 'CONFIRMED'] },
      startsAt: { gte: dayStartUtc, lte: dayEndUtc },
    },
    select: {
      professionalId: true,
      startsAt: true,
      endsAt: true,
    },
  });

  // Busca bloqueios de horário (TimeOff)
  const timeOffs = await prisma.timeOff.findMany({
    where: {
      businessId,
      startsAt: { lte: dayEndUtc },
      endsAt: { gte: dayStartUtc },
    },
  });

  const availableSlots: TimeSlot[] = [];

  for (const pro of business.professionals) {
    // Horário de trabalho para o dia da semana
    const schedule = (pro.workingHours as any[]) || [
      { day: 1, open: '09:00', close: '19:00' },
      { day: 2, open: '09:00', close: '19:00' },
      { day: 3, open: '09:00', close: '19:00' },
      { day: 4, open: '09:00', close: '19:00' },
      { day: 5, open: '09:00', close: '19:00' },
      { day: 6, open: '08:30', close: '18:00' },
    ];

    const dayConfig = schedule.find((s) => s.day === dayOfWeek);
    if (!dayConfig || !dayConfig.open || !dayConfig.close) {
      continue; // Não trabalha neste dia
    }

    const openTimeUtc = localToUtc(dateString, dayConfig.open, timezone);
    const closeTimeUtc = localToUtc(dateString, dayConfig.close, timezone);

    let currentCursor = openTimeUtc.getTime();
    const closeMs = closeTimeUtc.getTime();

    while (currentCursor + durationMs <= closeMs) {
      const slotStart = new Date(currentCursor);
      const slotEnd = new Date(currentCursor + durationMs);

      // Verifica se o slot já passou do horário atual (não permite agendar no passado)
      if (slotStart.getTime() > Date.now()) {
        // Verifica se colide com algum agendamento do barbeiro
        const hasCollisionWithBooking = activeBookings.some((b) => {
          if (b.professionalId !== pro.id) return false;
          return slotStart < b.endsAt && slotEnd > b.startsAt;
        });

        // Verifica se colide com folga/bloqueio
        const hasCollisionWithTimeOff = timeOffs.some((t) => {
          if (t.professionalId && t.professionalId !== pro.id) return false;
          return slotStart < t.endsAt && slotEnd > t.startsAt;
        });

        if (!hasCollisionWithBooking && !hasCollisionWithTimeOff) {
          availableSlots.push({
            startsAt: slotStart.toISOString(),
            endsAt: slotEnd.toISOString(),
            displayTime: utcToLocalTime(slotStart, timezone),
            professionalId: pro.id,
            professionalName: pro.nickname || pro.name,
          });
        }
      }

      // Incrementa para o próximo intervalo de agendamento (a cada 30 minutos)
      currentCursor += 30 * 60 * 1000;
    }
  }

  // Ordena por horário crescente
  availableSlots.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  // Se a busca era por "Qualquer profissional disponível", remove horários duplicados
  // mantendo o primeiro (ou com menor carga)
  if (!professionalId || professionalId === 'any') {
    const uniqueMap = new Map<string, TimeSlot>();
    for (const slot of availableSlots) {
      if (!uniqueMap.has(slot.displayTime)) {
        uniqueMap.set(slot.displayTime, slot);
      }
    }
    return Array.from(uniqueMap.values());
  }

  return availableSlots;
}
