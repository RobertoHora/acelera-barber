import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNsu: id }] },
    include: {
      business: {
        include: {
          entitlements: true,
          trialBenefit: true,
          subscription: true,
        },
      },
      transactions: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Ordem não encontrada' }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.id,
    orderNsu: order.orderNsu,
    status: order.status,
    amountCents: order.amountCents,
    paidAt: order.paidAt,
    sku: order.sku,
    business: {
      id: order.business.id,
      name: order.business.cleanName || order.business.name,
      slug: order.business.slug,
      entitlements: order.business.entitlements,
      trialBenefit: order.business.trialBenefit,
    },
  });
}
