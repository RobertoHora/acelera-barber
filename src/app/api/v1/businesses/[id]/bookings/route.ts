import { ownsBusiness } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { localToUtc } from '@/lib/agenda/availability';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const dateString = searchParams.get('date') || new Date().toISOString().slice(0, 10);

  const business = await prisma.business.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!business) {
    return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
  }

  if (!await ownsBusiness(request,business.id)) return NextResponse.json({error:'Acesso restrito ao proprietário.'},{status:403});
  const timezone = business.timezone || 'America/Sao_Paulo';
  const dayStartUtc = localToUtc(dateString, '00:00', timezone);
  const dayEndUtc = localToUtc(dateString, '23:59', timezone);

  const bookings = await prisma.booking.findMany({
    where: {
      businessId: business.id,
      startsAt: { gte: dayStartUtc, lte: dayEndUtc },
    },
    include: {
      service: true,
      professional: true,
    },
    orderBy: { startsAt: 'asc' },
  });

  return NextResponse.json({
    businessId: business.id,
    date: dateString,
    bookings,
  });
}
