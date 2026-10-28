import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDayAvailability } from '@/lib/agenda/availability';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const dateString = searchParams.get('date'); // YYYY-MM-DD
  const serviceId = searchParams.get('serviceId');
  const professionalId = searchParams.get('professionalId') || undefined;

  if (!dateString || !serviceId) {
    return NextResponse.json({ error: 'date e serviceId são obrigatórios' }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { slug },
  });

  if (!business) {
    return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
  }

  const slots = await getDayAvailability({
    businessId: business.id,
    dateString,
    serviceId,
    professionalId,
  });

  return NextResponse.json({
    businessId: business.id,
    businessSlug: business.slug,
    date: dateString,
    slots,
  });
}
