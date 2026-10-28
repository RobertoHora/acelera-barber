import rawLeads from '@/data/leads.json';
import { BarbershopLead, CompetitorInfo } from './types';

export const ALL_LEADS: BarbershopLead[] = rawLeads as BarbershopLead[];

export function getAllLeads(): BarbershopLead[] {
  return ALL_LEADS;
}

export function findLeadBySlugOrId(slugOrId: string): BarbershopLead | null {
  if (!slugOrId) return null;
  const clean = slugOrId.toLowerCase().trim();

  // 1. Match exato por slug
  const bySlug = ALL_LEADS.find((l) => l.slug?.toLowerCase() === clean);
  if (bySlug) return bySlug;

  // 2. Match por aliases
  const byAlias = ALL_LEADS.find(
    (l) => Array.isArray(l.aliases) && l.aliases.some((a) => a.toLowerCase() === clean)
  );
  if (byAlias) return byAlias;

  // 3. Match por ID / placeId
  const byId = ALL_LEADS.find((l) => l.id === slugOrId || l.placeId === slugOrId);
  if (byId) return byId;

  // 4. Match por nome limpo
  const byName = ALL_LEADS.find((l) =>
    (l.cleanName || l.name).toLowerCase().replace(/[^a-z0-9]/g, '').includes(clean.replace(/[^a-z0-9]/g, ''))
  );
  if (byName) return byName;

  return null;
}

export function searchLocalLeads(query: string, limit = 5): BarbershopLead[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const normalizedQ = q.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  return ALL_LEADS.filter((l) => {
    const name = (l.name || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    const cleanName = (l.cleanName || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    const neighborhood = (l.neighborhood || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    const slug = (l.slug || '').toLowerCase();

    return (
      name.includes(normalizedQ) ||
      cleanName.includes(normalizedQ) ||
      neighborhood.includes(normalizedQ) ||
      slug.includes(q)
    );
  }).slice(0, limit);
}

/**
 * Encontra os 2 principais concorrentes no mesmo bairro ou em GV e explica por que estão na frente.
 */
export function findTopCompetitors(
  leadName: string,
  neighborhood = '',
  leadReviews = 0,
  leadPhotos = 0,
  city = 'Governador Valadares'
): CompetitorInfo[] {
  const cleanLead = leadName.toLowerCase().trim();
  const cleanNb = (neighborhood || '').toLowerCase().trim();

  // 1. Barbearias no mesmo bairro
  let candidates = ALL_LEADS.filter((l) => {
    const name = (l.cleanName || l.name || '').toLowerCase().trim();
    const lNb = (l.neighborhood || '').toLowerCase().trim();
    const isSame = name.includes(cleanLead) || cleanLead.includes(name);
    return !isSame && cleanNb && lNb === cleanNb;
  });

  // Se não encontrar pelo menos 2 no mesmo bairro, busca na cidade inteira
  if (candidates.length < 2) {
    const cityCandidates = ALL_LEADS.filter((l) => {
      const name = (l.cleanName || l.name || '').toLowerCase().trim();
      return !name.includes(cleanLead) && !cleanLead.includes(name);
    });
    candidates = Array.from(new Set([...candidates, ...cityCandidates]));
  }

  // Ordena por relevância: mais avaliações, nota e fotos
  candidates.sort((a, b) => {
    const revA = a.reviewsCount || 0;
    const revB = b.reviewsCount || 0;
    if (revB !== revA) return revB - revA;
    const ratA = a.rating || 0;
    const ratB = b.rating || 0;
    return ratB - ratA;
  });

  const selected = candidates.slice(0, 2);

  // Fallback garantido se por algum motivo for vazio
  if (selected.length === 0) {
    return [
      {
        id: 'comp_1',
        name: 'Alcatéia Barber',
        neighborhood: neighborhood || 'Centro',
        rating: 4.9,
        reviewsCount: 84,
        photosCount: 35,
        whyBetter:
          'Possui 84 avaliações no Google com respostas frequentes, catálogo com fotos nítidas de cortes e agendamento direto ativo no WhatsApp.',
        highlights: ['84 avaliações', '35 fotos de cortes', 'Agendamento rápido'],
      },
      {
        id: 'comp_2',
        name: 'Gorillaz Barbearia',
        neighborhood: neighborhood || 'Centro',
        rating: 4.8,
        reviewsCount: 52,
        photosCount: 20,
        whyBetter:
          'Mantém avaliações semanais no balcão e lista completa de serviços e comodidades cadastradas no Google Maps.',
        highlights: ['52 avaliações', '20 fotos tratadas', 'Comodidades ativas'],
      },
    ];
  }

  return selected.map((comp) => {
    const compReviews = comp.reviewsCount || 0;
    const compPhotos = comp.photosCount || 15;
    const compRating = comp.rating || 4.8;

    let reason = '';
    const highlights: string[] = [];

    if (compReviews > leadReviews) {
      reason += `Possui ${compReviews} avaliações no Google (enquanto você tem ${leadReviews}). `;
      highlights.push(`${compReviews} avaliações reais`);
    } else {
      highlights.push('Avaliações ativas no balcão');
    }

    if (compPhotos > leadPhotos) {
      reason += `Exibe catálogo com ${compPhotos} fotos de cortes reais e iluminação nítida. `;
      highlights.push(`${compPhotos} fotos de cortes`);
    } else {
      highlights.push('Catálogo de serviços');
    }

    reason += 'Tem comodidades cadastradas e botão de contato direto para agendamento no perfil do Maps.';
    highlights.push('Agendamento facilitado');

    return {
      id: comp.id || comp.slug || comp.name,
      name: comp.cleanName || comp.name,
      neighborhood: comp.neighborhood || neighborhood,
      rating: compRating,
      reviewsCount: compReviews,
      photosCount: compPhotos,
      whyBetter: reason.trim(),
      highlights,
    };
  });
}
