import { PlanCode, PlanConfig } from './types';
export type { PlanCode, PlanConfig };

export const PLANS_CONFIG: Record<PlanCode, PlanConfig> = {
  eleva_free: {
    id: 'eleva_free',
    legacyAlias: 'free',
    category: 'ONETIME_MODULE',
    name: 'Gratuito',
    price: 0,
    priceCents: 0,
    priceFormatted: 'R$ 0',
    description: 'Diagnóstico e primeiros passos de presença digital.',
    features: [
      'Diagnóstico explicável de presença no Google Maps',
      'Bio de alta conversão para o Instagram',
      'Link direto de WhatsApp para agendamentos',
      'QR Code neutro de avaliação para o Google',
      'Checklist essencial de aplicação manual',
    ],
    billingInterval: 'ONETIME',
  },
  eleva_google_pro: {
    id: 'eleva_google_pro',
    legacyAlias: 'google_pro',
    category: 'ONETIME_MODULE',
    name: 'Eleva Google Pro',
    price: 37,
    priceCents: 3700,
    priceFormatted: 'R$ 37',
    badge: 'Essencial Balcão',
    description: 'Tudo para transformar clientes de balcão em avaliações e catálogo profissional.',
    features: [
      'Tudo do Plano Gratuito',
      'Catálogo completo de cortes e serviços com fotos',
      'Ativação assistida de comodidades e filtros de busca',
      'Plaquinha 2 em 1 de balcão A6 (300 DPI) para impressão',
      'Guia prático de impressão e display acrílico',
      '14 dias grátis de teste da Agenda ORC (R$ 37 ou R$ 67/mês)',
      'Suporte operacional assistido via WhatsApp',
    ],
    grantedTrialDays: 14,
    billingInterval: 'ONETIME',
  },
  eleva_complete: {
    id: 'eleva_complete',
    legacyAlias: 'complete',
    category: 'ONETIME_MODULE',
    name: 'Eleva Completo',
    price: 57,
    priceCents: 5700,
    priceFormatted: 'R$ 57',
    badge: 'Mais Escolhido',
    description: 'Presença total: Google Pro ampliado + Kit de Destaques e Calendário Instagram.',
    features: [
      'Tudo do Plano Google Pro',
      '4 Capas profissionais de Destaques para Instagram',
      'Bio de conversão estruturada com gatilhos de agendamento',
      'Calendário semanal de postagens + legendas prontas',
      'QR Code de Instagram para o display de balcão',
      '30 dias grátis de teste da Agenda ORC (R$ 37 ou R$ 67/mês)',
      'Acompanhamento e suporte prioritário',
    ],
    grantedTrialDays: 30,
    billingInterval: 'ONETIME',
  },
  eleva_complete_upgrade: {
    id: 'eleva_complete_upgrade',
    category: 'UPGRADE',
    name: 'Upgrade para Completo',
    price: 20,
    priceCents: 2000,
    priceFormatted: 'R$ 20',
    badge: 'Upgrade Exclusivo',
    description: 'Adicione o módulo Instagram ao seu Google Pro e amplie seu teste da Agenda para 30 dias totais.',
    features: [
      'Desbloqueio imediato do módulo Instagram',
      '4 Capas profissionais de Destaques',
      'Calendário semanal de postagens com legendas',
      'Extensão do teste da Agenda ORC para 30 dias totais (sem reiniciar relógio)',
    ],
    grantedTrialDaysDelta: 16,
    billingInterval: 'ONETIME',
  },
  agenda_basic_monthly: {
    id: 'agenda_basic_monthly',
    category: 'RECURRING_SUBSCRIPTION',
    name: 'Agenda ORC Básica',
    price: 37,
    priceCents: 3700,
    priceFormatted: 'R$ 37/mês',
    description: 'Página própria de agendamentos, equipe multi-barbeiro e lembretes WhatsApp para cliente e barbearia.',
    features: [
      'Página pública personalizada agenda.oracio.uk/{slug}',
      'Agendamento rápido para clientes com Nome + WhatsApp (sem login)',
      'Gestão multi-profissional e bloqueio de horários',
      'Confirmações e lembretes transacionais no WhatsApp (24h e 2h)',
      'Link exclusivo para cliente cancelar ou reagendar sozinho',
      'Módulo opcional para receber cortes via InfiniteTag da barbearia',
    ],
    billingInterval: 'MONTHLY',
  },
  agenda_ai_monthly: {
    id: 'agenda_ai_monthly',
    category: 'RECURRING_SUBSCRIPTION',
    name: 'Agenda ORC com Laura IA',
    price: 67,
    priceCents: 6700,
    priceFormatted: 'R$ 67/mês',
    badge: 'Atendimento Autônomo',
    description: 'Tudo da Básica + Laura IA atendendo e agendando clientes diretamente no WhatsApp da barbearia.',
    features: [
      'Tudo da Agenda Básica',
      'Laura IA atendendo 24/7 no WhatsApp da barbearia',
      'Consulta de serviços, preços e horários livres em tempo real',
      'Agendamento, reagendamento e cancelamento pelo chat com IA',
      'Encaminhamento automático para humano quando necessário',
      'Zero double-booking com proteção matemática de concorrência',
    ],
    billingInterval: 'MONTHLY',
  },
  // Retrocompatibilidade para componentes legados
  free: null as any,
  google_pro: null as any,
  complete: null as any,
};

// Vincula aliases
PLANS_CONFIG.free = PLANS_CONFIG.eleva_free;
PLANS_CONFIG.google_pro = PLANS_CONFIG.eleva_google_pro;
PLANS_CONFIG.complete = PLANS_CONFIG.eleva_complete;

export const INFINITEPAY_CONFIG = {
  handle: 'estudio-orc',
  referralUrl: 'https://infinitepay.onelink.me/IGWD/estudio-orc',
  supportPhone: '5533999482287',
  supportName: 'Suporte Eleva ORC',
  /**
   * URLs de checkout (opcionalmente configuráveis por variáveis de ambiente)
   */
  links: {
    google_pro: '',
    complete: '',
    upgrade: '',
  },
};

/**
 * Normaliza referências legadas de planos para a tipagem canônica PlanCode
 */
export function resolvePlanConfig(key: string): PlanConfig | null {
  if (key in PLANS_CONFIG) {
    return PLANS_CONFIG[key as PlanCode];
  }
  // Suporte a apelidos legados
  if (key === 'free') return PLANS_CONFIG.eleva_free;
  if (key === 'google_pro') return PLANS_CONFIG.eleva_google_pro;
  if (key === 'complete') return PLANS_CONFIG.eleva_complete;
  return null;
}

/**
 * Calcula a data de término do teste a partir de ativação e compra de upgrade
 */
export function calculateTrialEndsAt(
  currentStatus: 'GRANTED' | 'ACTIVE' | 'EXPIRED',
  activatedAt: Date | null,
  grantedDays: number,
  isUpgradeTo30Days = false
): { activatedAt: Date | null; endsAt: Date | null } {
  if (!activatedAt) {
    return { activatedAt: null, endsAt: null };
  }

  const baseDays = isUpgradeTo30Days ? 30 : grantedDays;
  const endsAt = new Date(activatedAt.getTime() + baseDays * 86400 * 1000);

  return { activatedAt, endsAt };
}

/**
 * Calcula valor do upgrade proporcional (pro-rata) de Agenda Básica (R$ 37) para Laura IA (R$ 67)
 */
export function calculateUpgradeProRataCents(
  periodStart: Date,
  periodEnd: Date,
  now: Date = new Date()
): number {
  const totalMs = periodEnd.getTime() - periodStart.getTime();
  if (totalMs <= 0) return 3000;

  const remainingMs = Math.max(0, periodEnd.getTime() - now.getTime());
  const ratio = remainingMs / totalMs;
  const rawDiffCents = 6700 - 3700; // 3000 centavos = R$ 30,00

  const calculated = Math.round(rawDiffCents * ratio);
  // Limites de segurança: mínimo R$ 1,00 (100 centavos) e máximo R$ 30,00 (3000 centavos)
  return Math.min(3000, Math.max(100, calculated));
}
