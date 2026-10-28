import { prisma } from '@/lib/db';
import { PlanCode, PLANS_CONFIG } from '@/lib/plans';

export interface GrantOrderResult {
  entitlementId: string;
  sku: string;
  trialBenefit: {
    id: string;
    grantedDays: number;
    status: string;
    activatedAt: Date | null;
    endsAt: Date | null;
  } | null;
}

/**
 * Concede os direitos e benefícios de teste associados a um pedido pago.
 * Executa dentro de uma transação Prisma para garantir atomicidade.
 */
export async function grantOrderBenefits(
  orderId: string,
  txClient?: any
): Promise<GrantOrderResult> {
  const db = txClient || prisma;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { business: true },
  });

  if (!order) {
    throw new Error(`Pedido ${orderId} não encontrado.`);
  }

  const sku = order.sku as PlanCode;
  const businessId = order.businessId;

  // 1. Cria ou reativa o Entitlement correspondente
  const targetSku = sku === 'eleva_complete_upgrade' ? 'eleva_complete' : sku;

  const entitlement = await db.entitlement.upsert({
    where: {
      businessId_sku: {
        businessId,
        sku: targetSku,
      },
    },
    update: {
      status: 'ACTIVE',
      grantedAt: new Date(),
      revokedAt: null,
    },
    create: {
      businessId,
      sku: targetSku,
      status: 'ACTIVE',
      grantedAt: new Date(),
    },
  });

  // 2. Processa os benefícios de teste da Agenda ORC (Docs 06 e Trava Anti-Regressão)
  let trialBenefit = await db.trialBenefit.findUnique({
    where: { businessId },
  });

  if (sku === 'eleva_google_pro') {
    if (!trialBenefit) {
      trialBenefit = await db.trialBenefit.create({
        data: {
          businessId,
          sourcePlan: 'eleva_google_pro',
          grantedDays: 14,
          status: 'GRANTED',
          selectedModality: 'agenda_basic_monthly',
          activatedAt: null,
          endsAt: null,
        },
      });
    }
  } else if (sku === 'eleva_complete') {
    if (!trialBenefit) {
      trialBenefit = await db.trialBenefit.create({
        data: {
          businessId,
          sourcePlan: 'eleva_complete',
          grantedDays: 30,
          status: 'GRANTED',
          selectedModality: 'agenda_basic_monthly',
          activatedAt: null,
          endsAt: null,
        },
      });
    } else if (trialBenefit.status === 'GRANTED') {
      trialBenefit = await db.trialBenefit.update({
        where: { businessId },
        data: {
          sourcePlan: 'eleva_complete',
          grantedDays: 30,
        },
      });
    } else if (trialBenefit.status === 'ACTIVE' && trialBenefit.activatedAt) {
      // Já ativado: estende para 30 dias a partir do activatedAt original
      const newEndsAt = new Date(trialBenefit.activatedAt.getTime() + 30 * 86400 * 1000);
      trialBenefit = await db.trialBenefit.update({
        where: { businessId },
        data: {
          sourcePlan: 'eleva_complete',
          grantedDays: 30,
          endsAt: newEndsAt,
        },
      });
    }
  } else if (sku === 'eleva_complete_upgrade') {
    // Upgrade de R$ 20: amplia teste para 30 dias totais a partir do activatedAt original
    if (!trialBenefit) {
      trialBenefit = await db.trialBenefit.create({
        data: {
          businessId,
          sourcePlan: 'eleva_complete_upgrade',
          grantedDays: 30,
          status: 'GRANTED',
          selectedModality: 'agenda_basic_monthly',
          activatedAt: null,
          endsAt: null,
        },
      });
    } else if (trialBenefit.status === 'GRANTED') {
      trialBenefit = await db.trialBenefit.update({
        where: { businessId },
        data: {
          sourcePlan: 'eleva_complete_upgrade',
          grantedDays: 30,
        },
      });
    } else if (trialBenefit.status === 'ACTIVE' && trialBenefit.activatedAt) {
      // Teste em andamento: estende a data final sem resetar o início
      const newEndsAt = new Date(trialBenefit.activatedAt.getTime() + 30 * 86400 * 1000);
      trialBenefit = await db.trialBenefit.update({
        where: { businessId },
        data: {
          sourcePlan: 'eleva_complete_upgrade',
          grantedDays: 30,
          endsAt: newEndsAt,
        },
      });
    } else if (trialBenefit.status === 'EXPIRED' && trialBenefit.activatedAt) {
      // Se havia expirado os 14 dias mas ainda está dentro da janela de 30 dias do activatedAt
      const potentialEndsAt = new Date(trialBenefit.activatedAt.getTime() + 30 * 86400 * 1000);
      if (potentialEndsAt > new Date()) {
        trialBenefit = await db.trialBenefit.update({
          where: { businessId },
          data: {
            sourcePlan: 'eleva_complete_upgrade',
            grantedDays: 30,
            status: 'ACTIVE',
            endsAt: potentialEndsAt,
          },
        });
      }
    }
  }

  // 3. Emite GrowthEvent deduplicado
  await db.growthEvent.create({
    data: {
      event: 'order.paid',
      businessId,
      orderId: order.id,
      metadata: { sku, amountCents: order.amountCents },
      dedupeKey: `order_paid:${order.id}`,
    },
  });

  return {
    entitlementId: entitlement.id,
    sku: entitlement.sku,
    trialBenefit: trialBenefit
      ? {
          id: trialBenefit.id,
          grantedDays: trialBenefit.grantedDays,
          status: trialBenefit.status,
          activatedAt: trialBenefit.activatedAt,
          endsAt: trialBenefit.endsAt,
        }
      : null,
  };
}

/**
 * Ativa o benefício de teste da Agenda ORC na primeira ativação operacional
 */
export async function activateTrial(
  businessId: string,
  selectedModality: 'agenda_basic_monthly' | 'agenda_ai_monthly' = 'agenda_basic_monthly'
) {
  const trial = await prisma.trialBenefit.findUnique({
    where: { businessId },
  });

  if (!trial) {
    throw new Error('Nenhum benefício de teste encontrado para esta barbearia.');
  }

  if (trial.status === 'ACTIVE') {
    return trial; // Já ativo
  }

  if (trial.status === 'EXPIRED') {
    throw new Error('O período de teste desta barbearia já expirou.');
  }

  const activatedAt = new Date();
  const endsAt = new Date(activatedAt.getTime() + trial.grantedDays * 86400 * 1000);

  const updated = await prisma.$transaction(async (tx) => {
    const act = await tx.trialBenefit.update({
      where: { businessId },
      data: {
        status: 'ACTIVE',
        selectedModality,
        activatedAt,
        endsAt,
      },
    });

    // Cria ou atualiza a Subscription correspondente em status TRIALING
    await tx.subscription.upsert({
      where: { businessId },
      update: {
        planCode: selectedModality,
        status: 'TRIALING',
        currentPeriodStart: activatedAt,
        currentPeriodEnd: endsAt,
      },
      create: {
        businessId,
        planCode: selectedModality,
        status: 'TRIALING',
        currentPeriodStart: activatedAt,
        currentPeriodEnd: endsAt,
      },
    });

    await tx.growthEvent.create({
      data: {
        event: 'trial.activated',
        businessId,
        metadata: { modality: selectedModality, grantedDays: trial.grantedDays, endsAt },
        dedupeKey: `trial_act:${businessId}:${act.id}`,
      },
    });

    return act;
  });

  return updated;
}
