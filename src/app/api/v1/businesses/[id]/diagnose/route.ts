import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateDiagnosis } from '@/lib/diagnosis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const business = await prisma.business.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      services: true,
      channelSyncStates: true,
      checklistItems: true,
      diagnosticReports: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!business) {
    return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
  }

  // Mapeia ações confirmadas
  const actions: Record<string, string> = {};
  for (const item of business.checklistItems) {
    if (item.status === 'DONE') {
      actions[item.itemKey] = 'CLIENT_CONFIRMED';
    }
  }

  const diagnosis = calculateDiagnosis({
    cleanName: business.cleanName || business.name,
    name: business.name,
    googleMapsUrl: business.googleMapsUrl || undefined,
    whatsapp: business.whatsapp || undefined,
    phone: business.phone || undefined,
    cuts: business.services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.priceCents / 100,
      priceFormatted: `R$ ${(s.priceCents / 100).toFixed(0)}`,
      durationMinutes: s.durationMinutes,
      imageUrl: '',
    })),
    actions,
  });

  // Salva relatório e NeedObservations no banco
  await prisma.$transaction(async (tx) => {
    await tx.diagnosticReport.create({
      data: {
        businessId: business.id,
        score: diagnosis.score,
        label: diagnosis.label,
        criteria: diagnosis.criteria as any,
        gaps: diagnosis.gaps as any,
      },
    });

    for (const gap of diagnosis.gaps) {
      await tx.needObservation.create({
        data: {
          businessId: business.id,
          category: 'PROFILE_GAP',
          evidence: gap,
          severity: diagnosis.score < 50 ? 'HIGH' : 'MEDIUM',
        },
      });
    }
  });

  return NextResponse.json({
    businessId: business.id,
    businessName: business.cleanName || business.name,
    diagnosis,
  });
}
