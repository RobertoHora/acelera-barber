import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { resolvePlanConfig } from '@/lib/plans';
import { PlanCode } from '@/lib/types';
import { generateInfinitePayCheckoutUrl } from '@/lib/billing/infinitepay';
import crypto from 'node:crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, planCode, idempotencyKey } = body;

    if (!businessId || !planCode) {
      return NextResponse.json({ error: 'businessId e planCode são obrigatórios' }, { status: 400 });
    }

    const plan = resolvePlanConfig(planCode);
    if (!plan || plan.priceCents <= 0) {
      return NextResponse.json({ error: 'Plano inválido para checkout' }, { status: 400 });
    }

    const business = await prisma.business.findFirst({
      where: { OR: [{ id: businessId }, { slug: businessId }] },
      include: { entitlements: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
    }

    // Validações de Elegibilidade
    const hasPro = business.entitlements.some((e) => e.sku === 'eleva_google_pro' && e.status === 'ACTIVE');
    const hasComplete = business.entitlements.some((e) => e.sku === 'eleva_complete' && e.status === 'ACTIVE');

    if (plan.id === 'eleva_complete_upgrade') {
      if (!hasPro) {
        return NextResponse.json(
          { error: 'O upgrade de R$ 20 exige que a barbearia já possua o Eleva Google Pro ativo.' },
          { status: 400 }
        );
      }
      if (hasComplete) {
        return NextResponse.json(
          { error: 'Esta barbearia já possui o Eleva Completo ativo.' },
          { status: 409 }
        );
      }
    } else if (plan.id === 'eleva_complete' && hasComplete) {
      return NextResponse.json(
        { error: 'Esta barbearia já possui o Eleva Completo ativo.' },
        { status: 409 }
      );
    } else if (plan.id === 'eleva_google_pro' && hasPro) {
      return NextResponse.json(
        { error: 'Esta barbearia já possui o Eleva Google Pro ativo.' },
        { status: 409 }
      );
    }

    // Idempotência
    const finalIdempKey = idempotencyKey || `order_idemp_${business.id}_${plan.id}_${Date.now()}`;
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey: finalIdempKey },
    });

    if (existingOrder) {
      return NextResponse.json({
        order: existingOrder,
        checkoutUrl: existingOrder.infinitepayCheckoutUrl,
      });
    }

    // Trava Anti-Regressão #2: Prefixo imutável eleva_ no order_nsu
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const orderNsu = `eleva_${business.slug}_${plan.id}_${uniqueSuffix}`;

    const checkoutUrl = generateInfinitePayCheckoutUrl({
      orderId: orderNsu,
      orderNsu,
      amountCents: plan.priceCents,
      customerName: business.cleanName || business.name,
      customerPhone: business.whatsapp || business.phone || undefined,
      redirectUrl: `${process.env.NEXT_PUBLIC_ELEVA_URL || 'https://eleva.oracio.uk'}/?payment=success&nsu=${orderNsu}`,
    });

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNsu,
          businessId: business.id,
          sku: plan.id,
          amountCents: plan.priceCents,
          infinitepayCheckoutUrl: checkoutUrl,
          idempotencyKey: finalIdempKey,
          status: 'PENDING',
        },
      });

      await tx.growthEvent.create({
        data: {
          event: 'checkout.created',
          businessId: business.id,
          orderId: created.id,
          metadata: { sku: plan.id, amountCents: plan.priceCents, orderNsu },
          dedupeKey: `chk_create:${created.id}`,
        },
      });

      return created;
    });

    return NextResponse.json({
      order,
      checkoutUrl,
    }, { status: 201 });
  } catch (err: any) {
    console.error('❌ [Orders API] Erro ao criar pedido:', err);
    return NextResponse.json({ error: 'Falha ao processar checkout', details: err.message }, { status: 500 });
  }
}
