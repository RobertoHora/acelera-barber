import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'node:crypto';

function computePhoneHmac(phone: string): string {
  const secret = process.env.AUTH_SECRET || 'orc_eleva_agenda_secure_auth_token_secret_2026';
  const clean = phone.replace(/\D/g, '');
  return crypto.createHmac('sha256', secret).update(clean).digest('hex');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  if (!id && !slug) {
    return NextResponse.json({ error: 'Parâmetro id ou slug é obrigatório' }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: id ? { id } : { slug: slug! },
    include: {
      services: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      professionals: { where: { isActive: true } },
      trialBenefit: true,
      subscription: true,
    },
  });

  if (!business) {
    return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
  }

  const {GET: publicBusiness}=await import('./[id]/route');
  return publicBusiness(request,{params:Promise.resolve({id:business.id})});
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, whatsapp, neighborhood, city, state, address, instagram } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nome da barbearia é obrigatório' }, { status: 400 });
    }

    const cleanName = name.trim();
    const rawPhone = whatsapp || phone || '';
    const phoneClean = rawPhone.replace(/\D/g, '');
    const phoneE164 = phoneClean ? (phoneClean.startsWith('55') ? `+${phoneClean}` : `+55${phoneClean}`) : null;
    const phoneHmac = phoneClean ? computePhoneHmac(phoneClean) : null;

    let baseSlug = cleanName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!baseSlug) baseSlug = 'barbearia';

    let uniqueSlug = baseSlug;
    let collisionCount = 1;
    while (await prisma.business.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${collisionCount}`;
      collisionCount++;
    }

    const business = await prisma.$transaction(async (tx) => {
      const created = await tx.business.create({
        data: {
          slug: uniqueSlug,
          name: cleanName,
          cleanName,
          phone: phoneE164,
          whatsapp: phoneE164,
          phoneHmac,
          neighborhood: neighborhood?.trim() || 'Centro',
          city: city?.trim() || 'Governador Valadares',
          state: state?.trim() || 'MG',
          address: address?.trim() || null,
          rating: 0,
          reviewsCount: 0,
          photosCount: 0,
        },
      });

      // Serviços padrão
      await tx.service.createMany({
        data: [
          {
            businessId: created.id,
            name: 'Corte Tradicional',
            description: 'Corte na tesoura ou máquina com alinhamento e finalização.',
            priceCents: 3500,
            durationMinutes: 30,
            sortOrder: 1,
          },
          {
            businessId: created.id,
            name: 'Barba Completa',
            description: 'Barboterapia com toalha quente e navalha.',
            priceCents: 2500,
            durationMinutes: 30,
            sortOrder: 2,
          },
          {
            businessId: created.id,
            name: 'Combo Cabelo + Barba',
            description: 'Corte completo e barba com alinhamento.',
            priceCents: 5500,
            durationMinutes: 60,
            sortOrder: 3,
          },
        ],
      });

      // Profissional padrão
      await tx.professional.create({
        data: {
          businessId: created.id,
          name: created.cleanName || created.name,
          nickname: 'Barbeiro Principal',
          phone: created.phone,
          workingHours: [
            { day: 1, open: '09:00', close: '19:00' },
            { day: 2, open: '09:00', close: '19:00' },
            { day: 3, open: '09:00', close: '19:00' },
            { day: 4, open: '09:00', close: '19:00' },
            { day: 5, open: '09:00', close: '19:00' },
            { day: 6, open: '08:30', close: '18:00' },
          ],
        },
      });

      // Diagnóstico inicial persistido
      await tx.diagnosticReport.create({
        data: {
          businessId: created.id,
          score: 42,
          label: 'Presença Básica',
          criteria: [
            { name: 'Catálogo de Serviços', done: false, weight: 25 },
            { name: 'Link Direto de Agendamento', done: false, weight: 30 },
            { name: 'Fotos e Portfólio Atualizado', done: false, weight: 25 },
            { name: 'Plaquinha de Avaliações', done: false, weight: 20 },
          ],
          gaps: [
            'Sem link direto de agendamento no perfil',
            'Poucas fotos de cortes recentes publicadas',
            'Perfil ainda não ativou agendamento online',
          ],
        },
      });

      return created;
    });

    return NextResponse.json({ business }, { status: 201 });
  } catch (err: any) {
    console.error('❌ [Business API] Falha ao cadastrar barbearia:', err);
    return NextResponse.json({ error: 'Falha ao cadastrar barbearia', details: err.message }, { status: 500 });
  }
}
