import { ownsBusiness } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { activateTrial } from '@/lib/billing/entitlements';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const selectedModality = body.selectedModality === 'agenda_ai_monthly' ? 'agenda_ai_monthly' : 'agenda_basic_monthly';

    const business = await prisma.business.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!business) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
    }

    if (!await ownsBusiness(request, business.id)) return NextResponse.json({ error: 'Acesso restrito ao proprietário.' }, { status: 403 });

    const [services,professionals] = await Promise.all([prisma.service.count({where:{businessId:business.id,isActive:true}}),prisma.professional.count({where:{businessId:business.id,isActive:true}})]);
    if (!services || !professionals) return NextResponse.json({error:'Configure ao menos um serviço e profissional antes de publicar.'},{status:400});
    const activated = await activateTrial(business.id, selectedModality);

    return NextResponse.json({
      success: true,
      trialBenefit: activated,
    });
  } catch (err: any) {
    console.error('❌ [Trial Activate API] Erro:', err);
    return NextResponse.json({ error: err.message || 'Falha ao ativar teste' }, { status: 400 });
  }
}
