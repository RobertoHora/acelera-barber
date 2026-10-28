import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const business = await prisma.business.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      services: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      professionals: { where: { isActive: true } },
      trialBenefit: true,
      subscription: true,
    },
  });

  if (!business) {
    return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
  }

  return NextResponse.json({ business });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { infiniteTag, cancellationNoticeHours, lateCancellationVoucherEnabled } = body;

    const business = await prisma.business.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!business) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
    }

    const updated = await prisma.business.update({
      where: { id: business.id },
      data: {
        ...(infiniteTag !== undefined ? { infiniteTag: infiniteTag?.trim() || null } : {}),
        ...(cancellationNoticeHours !== undefined ? { cancellationNoticeHours: Number(cancellationNoticeHours) } : {}),
        ...(lateCancellationVoucherEnabled !== undefined ? { lateCancellationVoucherEnabled: Boolean(lateCancellationVoucherEnabled) } : {}),
      },
    });

    return NextResponse.json({ success: true, business: updated });
  } catch (err: any) {
    console.error('❌ [Business PATCH API] Erro:', err);
    return NextResponse.json({ error: 'Falha ao atualizar barbearia', details: err.message }, { status: 500 });
  }
}
