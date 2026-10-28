import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { searchLocalLeads } from '@/lib/leads';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    // 1. Busca no PostgreSQL isolado
    const dbMatches = await prisma.business.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { cleanName: { contains: q, mode: 'insensitive' } },
          { neighborhood: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q.toLowerCase().replace(/\s+/g, '-'), mode: 'insensitive' } },
        ],
      },
      take: 6,
    });

    if (dbMatches.length > 0) {
      return NextResponse.json({
        results: dbMatches.map((b) => ({
          id: b.id,
          name: b.cleanName || b.name,
          neighborhood: b.neighborhood || '',
          address: b.address || '',
          rating: b.rating || 4.8,
          reviewsCount: b.reviewsCount || 0,
          slug: b.slug,
          photosCount: b.photosCount || 0,
          featuredImageUrl: b.featuredImageUrl || '',
          city: b.city,
          state: b.state,
          whatsapp: b.whatsapp,
          phone: b.phone,
        })),
        source: 'database',
      });
    }
  } catch (err) {
    console.warn('⚠️ [Search API] Falha na consulta PostgreSQL, usando fallback estático:', err);
  }

  // 2. Fallback estático caso o banco esteja indisponível durante migração
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
        city: l.city || 'Governador Valadares',
        state: l.state || 'MG',
        whatsapp: l.whatsapp,
        phone: l.phone,
      })),
      source: 'static_fallback',
    });
  }

  return NextResponse.json({ results: [], source: 'not_found' });
}
