import { ownsBusiness } from '@/lib/auth';
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

  const ownerAccess = await ownsBusiness(request, business.id);
  if (ownerAccess) return NextResponse.json({ business });
  return NextResponse.json({ business: { id: business.id, slug: business.slug, name: business.name, cleanName: business.cleanName, address: business.address, neighborhood:business.neighborhood,city:business.city,phone:process.env.E2E_RUN_ID?null:business.phone,whatsapp:process.env.E2E_RUN_ID?null:business.whatsapp,reviewUrl:business.reviewUrl,placeId:business.placeId,googleMapsUrl:business.googleMapsUrl,onlinePaymentsEnabled:business.onlinePaymentsEnabled, services: business.services, professionals: business.professionals.map(p => ({id:p.id,name:p.name,nickname:p.nickname,avatarUrl:p.avatarUrl})) } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { infiniteTag, cancellationNoticeHours, lateCancellationVoucherEnabled, onlinePaymentsEnabled, confirmedTagOwnership } = body;

    const business = await prisma.business.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!business) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
    }

    if (!await ownsBusiness(request, business.id)) return NextResponse.json({ error: 'Acesso restrito ao proprietário.' }, { status: 403 });

    if (infiniteTag !== undefined && infiniteTag !== null && !/^\$?[a-zA-Z0-9_-]{3,60}$/.test(infiniteTag.trim())) return NextResponse.json({error:'InfiniteTag inválida.'},{status:400});
    if (cancellationNoticeHours !== undefined && (!Number.isFinite(Number(cancellationNoticeHours)) || Number(cancellationNoticeHours)<0 || Number(cancellationNoticeHours)>168)) return NextResponse.json({error:'Janela de cancelamento inválida.'},{status:400});
    if(onlinePaymentsEnabled===true && (!(infiniteTag||business.infiniteTag)||confirmedTagOwnership!==true)) return NextResponse.json({error:'Confirme que esta InfiniteTag pertence à sua conta antes de ativar.'},{status:400});
    const updated = await prisma.business.update({
      where: { id: business.id },
      data: {
        ...(onlinePaymentsEnabled !== undefined ? {onlinePaymentsEnabled:onlinePaymentsEnabled===true} : infiniteTag!==undefined && infiniteTag!==business.infiniteTag ? {onlinePaymentsEnabled:false}:{}),
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
