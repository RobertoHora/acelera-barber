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
      checklistItems: true,
      channelSyncStates: true,
    },
  });

  if (!business) {
    return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
  }

    if (!await ownsBusiness(request, business.id)) return NextResponse.json({ error: 'Acesso restrito ao proprietário.' }, { status: 403 });

  return NextResponse.json({
    businessId: business.id,
    checklistItems: business.checklistItems,
    channelSyncStates: business.channelSyncStates,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { itemKey, status, action } = body;

    if (!itemKey || !status) {
      return NextResponse.json({ error: 'itemKey e status são obrigatórios' }, { status: 400 });
    }

    const business = await prisma.business.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!business) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
    }

    if (!await ownsBusiness(request, business.id)) return NextResponse.json({ error: 'Acesso restrito ao proprietário.' }, { status: 403 });

    if(action==='COPIED') {
      await prisma.growthEvent.upsert({where:{dedupeKey:`copied:${business.id}:${itemKey}`},update:{},create:{event:itemKey==='google_appointment_link'?'agenda.link_copied':'material.copied',businessId:business.id,metadata:{itemKey},dedupeKey:`copied:${business.id}:${itemKey}`}});
      return NextResponse.json({success:true,prepared:true});
    }
    if (!['TODO','DONE','DISMISSED'].includes(status)) return NextResponse.json({error:'Status inválido.'},{status:400});
    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert no item de checklist
      const item = await tx.checklistItemProgress.upsert({
        where: {
          businessId_itemKey: {
            businessId: business.id,
            itemKey,
          },
        },
        update: { status },
        create: {
          businessId: business.id,
          itemKey,
          status,
        },
      });

      // 2. Mapeamento para ChannelSyncState
      if (status === 'DONE') {
        let channelType: 'GOOGLE_BUSINESS_PROFILE' | 'INSTAGRAM' | null = null;
        if (itemKey.includes('google') || itemKey.includes('attributes') || itemKey.includes('plaque')) {
          channelType = 'GOOGLE_BUSINESS_PROFILE';
        } else if (itemKey.includes('instagram') || itemKey.includes('bio')) {
          channelType = 'INSTAGRAM';
        }

        if (channelType) {
          await tx.channelSyncState.upsert({
            where: {
              businessId_channel: {
                businessId: business.id,
                channel: channelType,
              },
            },
            update: {
              syncStatus: 'CLIENT_CONFIRMED',
              lastVerifiedAt: new Date(),
            },
            create: {
              businessId: business.id,
              channel: channelType,
              syncStatus: 'CLIENT_CONFIRMED',
              lastVerifiedAt: new Date(),
            },
          });
        }

        // 3. Emite GrowthEvent deduplicado
        await tx.growthEvent.upsert({
          where:{dedupeKey:`chk_done:${business.id}:${itemKey}`},
          update:{},
          create: {
            event: 'checklist.item_completed',
            businessId: business.id,
            metadata: { itemKey, status },
            dedupeKey: `chk_done:${business.id}:${itemKey}`,
          },
        });
      }

      return item;
    });

    return NextResponse.json({ success: true, item: result });
  } catch (err: any) {
    console.error('❌ [Checklist API] Erro:', err);
    return NextResponse.json({ error: 'Falha ao atualizar checklist', details: err.message }, { status: 500 });
  }
}
