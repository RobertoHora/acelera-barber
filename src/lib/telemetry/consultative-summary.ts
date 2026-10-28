import { prisma } from '@/lib/db';

export type FunnelStage =
  | 'PROSPECT'
  | 'LEAD_DIAGNOSED'
  | 'CUSTOMER_PRO'
  | 'CUSTOMER_COMPLETE'
  | 'TRIAL_AGENDA_ACTIVE'
  | 'TRIAL_AGENDA_EXPIRED'
  | 'ACTIVE_SUBSCRIBER';

export interface ConsultativeSummary {
  businessId: string;
  businessName: string;
  cleanName: string;
  slug: string;
  city: string;
  currentStage: FunnelStage;
  score: number;
  diagnosticGaps: string[];
  checklistProgress: {
    doneCount: number;
    totalCount: number;
    completedItems: string[];
  };
  entitlements: string[];
  trial: {
    hasTrial: boolean;
    status: string | null;
    sourcePlan: string | null;
    daysRemaining: number;
    endsAt: Date | null;
  };
  subscription: {
    hasActiveSubscription: boolean;
    plan: string | null;
    status: string | null;
  };
  bookingsSummary: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
  };
  nextRecommendedAction: string;
  conversationalSummaryText: string;
}

/**
 * Constrói o resumo consultivo holístico da barbearia para consumo do motor da Laura e do painel admin
 */
export async function buildConsultativeSummary(
  businessId: string
): Promise<ConsultativeSummary | null> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      diagnosticReports: { orderBy: { createdAt: 'desc' }, take: 1 },
      checklistItems: true,
      entitlements: true,
      trialBenefit: true,
      subscription: true,
      bookings: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!business) return null;

  const latestDiag = business.diagnosticReports[0];
  const score = latestDiag?.score ?? 0;
  const diagnosticGaps: string[] = Array.isArray(latestDiag?.gaps)
    ? (latestDiag.gaps as string[])
    : [];

  const completedChecklist = business.checklistItems
    .filter((c) => c.status === 'DONE')
    .map((c) => c.itemKey);

  const activeEntitlements = business.entitlements.map((e) => e.sku);

  const latestTrial = business.trialBenefit;
  let trialDaysRemaining = 0;
  if (latestTrial && latestTrial.status === 'ACTIVE' && latestTrial.endsAt) {
    const diff = latestTrial.endsAt.getTime() - Date.now();
    trialDaysRemaining = Math.max(0, Math.ceil(diff / (86400 * 1000)));
  }

  const hasActiveSub =
    business.subscription?.status === 'ACTIVE' || business.subscription?.status === 'PAST_DUE';

  // Determina o estágio no funil consultivo
  let currentStage: FunnelStage = 'PROSPECT';
  if (hasActiveSub) {
    currentStage = 'ACTIVE_SUBSCRIBER';
  } else if (latestTrial?.status === 'ACTIVE') {
    currentStage = 'TRIAL_AGENDA_ACTIVE';
  } else if (latestTrial?.status === 'EXPIRED') {
    currentStage = 'TRIAL_AGENDA_EXPIRED';
  } else if (activeEntitlements.includes('eleva_complete')) {
    currentStage = 'CUSTOMER_COMPLETE';
  } else if (activeEntitlements.includes('eleva_google_pro')) {
    currentStage = 'CUSTOMER_PRO';
  } else if (latestDiag) {
    currentStage = 'LEAD_DIAGNOSED';
  }

  // Estatísticas de Agendamento
  const totalBookings = business.bookings.length;
  const confirmedBookings = business.bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED'
  ).length;
  const cancelledBookings = business.bookings.filter((b) =>
    b.status.startsWith('CANCELLED')
  ).length;

  // Próxima Ação Consultiva Recomendada
  let nextRecommendedAction = 'Realizar o diagnóstico gratuito da barbearia no Eleva ORC.';
  if (currentStage === 'LEAD_DIAGNOSED') {
    if (score < 65) {
      nextRecommendedAction =
        'Apresentar o Eleva Google Pro (R$ 37) para regularizar dados críticos e destravar 14 dias grátis de Agenda.';
    } else {
      nextRecommendedAction =
        'Apresentar o Eleva Completo (R$ 57) para sincronização e 30 dias grátis de Agenda.';
    }
  } else if (currentStage === 'CUSTOMER_PRO') {
    if (!latestTrial || latestTrial.status === 'GRANTED') {
      nextRecommendedAction =
        'Orientar o dono a ativar seus 14 dias grátis da Agenda ORC no painel operacional.';
    } else {
      nextRecommendedAction =
        'Oferecer upgrade para o Eleva Completo por apenas R$ 20 para ampliar o teste para 30 dias totais.';
    }
  } else if (currentStage === 'CUSTOMER_COMPLETE') {
    nextRecommendedAction =
      'Acompanhar os agendamentos online e incentivar o cadastro da tag InfinitePay para recebimento automático.';
  } else if (currentStage === 'TRIAL_AGENDA_ACTIVE') {
    if (trialDaysRemaining <= 3) {
      nextRecommendedAction = `Teste gratuito vencendo em ${trialDaysRemaining} dias. Apresentar planos de continuidade (R$ 37 básica ou R$ 67 com Laura IA).`;
    } else {
      nextRecommendedAction = `Teste ativo (${trialDaysRemaining} dias restantes). Acompanhar uso e novos clientes na agenda online.`;
    }
  } else if (currentStage === 'TRIAL_AGENDA_EXPIRED') {
    nextRecommendedAction =
      'Período de teste encerrado. Apresentar oferta consultiva de assinatura para manter os agendamentos online ativos.';
  } else if (currentStage === 'ACTIVE_SUBSCRIBER') {
    if (business.subscription?.planCode === 'agenda_basic_monthly') {
      nextRecommendedAction =
        'Oferecer upgrade para o plano com Atendimento Automático Laura IA (R$ 67/mês).';
    } else {
      nextRecommendedAction = 'Operação em velocidade máxima com Laura IA e Agenda online.';
    }
  }

  // Texto amigável de contexto para o prompt da Laura
  const conversationalSummaryText = [
    `Barbearia: ${business.cleanName || business.name} (${business.city || 'GV'})`,
    `Estágio Atual: ${currentStage}`,
    `Score do Diagnóstico: ${score}/100`,
    `Itens do Checklist: ${completedChecklist.length} concluídos`,
    `Direitos Ativos: ${activeEntitlements.join(', ') || 'Nenhum'}`,
    latestTrial ? `Teste da Agenda: ${latestTrial.status} (${trialDaysRemaining} dias restantes)` : 'Sem teste',
    `Agendamentos Totais: ${totalBookings} (${confirmedBookings} confirmados)`,
    `Próxima Recomendação: ${nextRecommendedAction}`,
  ].join(' | ');

  return {
    businessId: business.id,
    businessName: business.name,
    cleanName: business.cleanName || business.name,
    slug: business.slug,
    city: business.city || 'Governador Valadares',
    currentStage,
    score,
    diagnosticGaps,
    checklistProgress: {
      doneCount: completedChecklist.length,
      totalCount: business.checklistItems.length,
      completedItems: completedChecklist,
    },
    entitlements: activeEntitlements,
    trial: {
      hasTrial: !!latestTrial,
      status: latestTrial?.status ?? null,
      sourcePlan: latestTrial?.sourcePlan ?? null,
      daysRemaining: trialDaysRemaining,
      endsAt: latestTrial?.endsAt ?? null,
    },
    subscription: {
      hasActiveSubscription: hasActiveSub,
      plan: business.subscription?.planCode ?? null,
      status: business.subscription?.status ?? null,
    },
    bookingsSummary: {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
    },
    nextRecommendedAction,
    conversationalSummaryText,
  };
}
