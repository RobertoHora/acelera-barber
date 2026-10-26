import { BarbershopLead, DiagnosisCriteria, DiagnosisResult } from './types';

export function calculateDiagnosis(barber: Partial<BarbershopLead>): DiagnosisResult {
  const hasInsta = Boolean(barber.instagram && barber.instagram.trim().length > 1);
  const hasGoogle = Boolean(barber.googleMapsUrl || barber.actions?.google_profile === 'CLIENT_CONFIRMED');
  const hasServices = Boolean(
    (barber.cuts && barber.cuts.length > 2) || barber.actions?.google_services === 'CLIENT_CONFIRMED'
  );
  const hasAttrs = Boolean(
    barber.attributes && Object.values(barber.attributes).some(Boolean) ||
    barber.actions?.google_attributes === 'CLIENT_CONFIRMED'
  );
  const hasPlaque = Boolean(barber.actions?.plaque_download === 'CLIENT_CONFIRMED');

  const criteria: DiagnosisCriteria[] = [
    {
      id: 1,
      name: 'Perfil do Instagram e Link no Perfil',
      done: hasInsta,
      weight: 20,
      description: 'O perfil do Google precisa direcionar para fotos e contato rápido.',
      gapText: 'Perfil sem conexão direta com o Instagram e sem link de agendamento rápido.',
    },
    {
      id: 2,
      name: 'Link de Agendamento Direto no Google Maps',
      done: hasGoogle,
      weight: 20,
      description: 'Botão no Maps que abre o WhatsApp já com mensagem pronta para corte.',
      gapText: 'Clientes que acham sua barbearia no Maps precisam caçar seu número manualmente.',
    },
    {
      id: 3,
      name: 'Catálogo de Cortes com Preços e Fotos Nítidas',
      done: hasServices,
      weight: 20,
      description: 'Apresentação visual dos estilos de corte (degradê, navalhado, barba).',
      gapText: 'Perfil sem catálogo de serviços com fotos — 8 em cada 10 clientes preferem quem mostra fotos.',
    },
    {
      id: 4,
      name: 'Comodidades e Atributos de Busca (Ar, Wi-Fi, Estacionamento)',
      done: hasAttrs,
      weight: 20,
      description: 'Filtros essenciais que clientes usam para decidir onde cortar.',
      gapText: 'Sem atributos cadastrados no Maps — sua barbearia é ignorada quando o cliente filtra por comodidades.',
    },
    {
      id: 5,
      name: 'Plaquinha de Balcão para Avaliações Espontâneas',
      done: hasPlaque,
      weight: 20,
      description: 'Display físico A6 300 DPI com QR Code neutro de avaliação no Google.',
      gapText: 'Sem display no balcão — clientes satisfeitos saem sem avaliar e seu perfil fica estagnado.',
    },
  ];

  let score = 0;
  const gaps: string[] = [];

  criteria.forEach((c) => {
    if (c.done) {
      score += c.weight;
    } else {
      gaps.push(c.gapText);
    }
  });

  let label = 'Presença Inicial';
  if (score >= 100) label = 'Presença Completa';
  else if (score >= 80) label = 'Presença Avançada';
  else if (score >= 60) label = 'Presença Intermediária';
  else if (score >= 40) label = 'Presença em Construção';

  return {
    score,
    label,
    criteria,
    gaps,
  };
}
