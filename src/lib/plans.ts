import { PlanConfig } from './types';

export const PLANS_CONFIG: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    priceFormatted: 'R$ 0',
    description: 'Diagnóstico e primeiros passos de presença digital.',
    features: [
      'Diagnóstico explicável de presença no Google Maps',
      'Bio de alta conversão para o Instagram',
      'Link direto de WhatsApp para agendamentos',
      'QR Code neutro de avaliação para o Google',
      'Checklist essencial de aplicação manual',
    ],
  },
  google_pro: {
    id: 'google_pro',
    name: 'Google Pro',
    price: 37,
    priceFormatted: 'R$ 37',
    badge: 'Essencial Balcão',
    description: 'Tudo para transformar clientes de balcão em avaliações e catálogo profissional.',
    features: [
      'Tudo do Plano Gratuito',
      'Catálogo completo de cortes e serviços com fotos',
      'Ativação assistida de comodidades e filtros de busca',
      'Plaquinha 2 em 1 de balcão A6 (300 DPI) para impressão',
      'Guia prático de impressão e display acrílico',
      'Suporte operacional assistido via WhatsApp',
    ],
  },
  complete: {
    id: 'complete',
    name: 'Completo',
    price: 57,
    priceFormatted: 'R$ 57',
    badge: 'Mais Escolhido',
    description: 'Presença total: Google Pro ampliado + Kit de Destaques e Calendário Instagram.',
    features: [
      'Tudo do Plano Google Pro',
      '4 Capas profissionais de Destaques para Instagram',
      'Bio de conversão estruturada com gatilhos de agendamento',
      'Calendário semanal de postagens + legendas prontas',
      'QR Code de Instagram para o display de balcão',
      'Acompanhamento e suporte prioritário',
    ],
  },
};

export const INFINITEPAY_CONFIG = {
  links: {
    google_pro: '', // Configurável: URL da loja InfinitePay para R$ 37 (ex: https://loja.infinitepay.io/...)
    complete: '',   // Configurável: URL da loja InfinitePay para R$ 57 (ex: https://loja.infinitepay.io/...)
  },
  supportPhone: '5533999482287',
  supportName: 'Suporte Acelera Barber',
};
