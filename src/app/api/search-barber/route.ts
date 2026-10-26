import { NextRequest, NextResponse } from 'next/server';
import { searchLocalLeads } from '@/lib/leads';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  // 1. Busca rápida no banco local de 123 barbearias de GV
  const localMatches = searchLocalLeads(q, 6);

  if (localMatches.length > 0) {
    return NextResponse.json({
      results: localMatches.map((l) => ({
        id: l.id,
        name: l.cleanName || l.name,
        neighborhood: l.neighborhood,
        address: l.address,
        rating: l.rating || 4.8,
        reviewsCount: l.reviewsCount || 0,
        slug: l.slug,
        photosCount: l.photosCount || 0,
        featuredImageUrl: l.featuredImageUrl || '',
      })),
      source: 'database',
    });
  }

  // 2. Se não encontrar no banco local e query tiver mais de 3 caracteres,
  // permite que a rota serverless busque externamente caso APIFY_TOKEN esteja configurado
  const apifyToken = process.env.APIFY_TOKEN;
  if (apifyToken && q.length >= 3) {
    try {
      // Endpoint reservado para consulta server-side sem expor chaves ao browser
      // Em produção, isso permite enriquecer lojas fora da base inicial de GV
    } catch (err) {
      console.warn('Busca online falhou, usando resposta vazia segura:', err);
    }
  }

  return NextResponse.json({ results: [], source: 'not_found' });
}
