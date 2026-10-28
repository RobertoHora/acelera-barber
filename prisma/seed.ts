import { prisma } from '../src/lib/db';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function computePhoneHmac(phone: string): string {
  const secret = process.env.AUTH_SECRET || 'orc_eleva_agenda_secure_auth_token_secret_2026';
  const clean = phone.replace(/\D/g, '');
  return crypto.createHmac('sha256', secret).update(clean).digest('hex');
}

async function main() {
  console.log('🌱 [Seed] Iniciando importação das barbearias para o PostgreSQL...');

  const leadsPath = path.resolve(import.meta.dirname, '../src/data/leads.json');
  const instaPath = path.resolve(import.meta.dirname, '../src/data/instagram_cache.json');

  if (!fs.existsSync(leadsPath)) {
    console.error('❌ Arquivo leads.json não encontrado em', leadsPath);
    return;
  }

  const rawLeads = JSON.parse(fs.readFileSync(leadsPath, 'utf-8'));
  let instaMap: Record<string, any> = {};
  if (fs.existsSync(instaPath)) {
    instaMap = JSON.parse(fs.readFileSync(instaPath, 'utf-8'));
  }

  let count = 0;
  for (const item of rawLeads) {
    const slug = item.slug || `barbearia-${item.id}`;
    const rawPhone = item.whatsapp || item.phone || '';
    const phoneClean = rawPhone.replace(/\D/g, '');
    const phoneE164 = phoneClean ? (phoneClean.startsWith('55') ? `+${phoneClean}` : `+55${phoneClean}`) : null;
    const phoneHmac = phoneClean ? computePhoneHmac(phoneClean) : null;
    const instagram = item.instagram || instaMap[item.id]?.username || null;

    const biz = await prisma.business.upsert({
      where: { slug },
      update: {
        name: item.name,
        cleanName: item.cleanName || item.name,
        phone: phoneE164,
        whatsapp: phoneE164,
        phoneHmac,
        address: item.address || null,
        neighborhood: item.neighborhood || null,
        city: 'Governador Valadares',
        state: 'MG',
        placeId: item.placeId || null,
        reviewUrl: item.reviewUrl || null,
        googleMapsUrl: item.googleMapsUrl || null,
        rating: item.rating ? Number(item.rating) : 4.8,
        reviewsCount: item.reviewsCount ? Number(item.reviewsCount) : 15,
        photosCount: item.photosCount ? Number(item.photosCount) : 8,
      },
      create: {
        slug,
        name: item.name,
        cleanName: item.cleanName || item.name,
        phone: phoneE164,
        whatsapp: phoneE164,
        phoneHmac,
        address: item.address || null,
        neighborhood: item.neighborhood || null,
        city: 'Governador Valadares',
        state: 'MG',
        placeId: item.placeId || null,
        reviewUrl: item.reviewUrl || null,
        googleMapsUrl: item.googleMapsUrl || null,
        rating: item.rating ? Number(item.rating) : 4.8,
        reviewsCount: item.reviewsCount ? Number(item.reviewsCount) : 15,
        photosCount: item.photosCount ? Number(item.photosCount) : 8,
      },
    });

    // Seed de serviços padrão da barbearia (se ainda não existirem)
    const existingServices = await prisma.service.count({ where: { businessId: biz.id } });
    if (existingServices === 0) {
      await prisma.service.createMany({
        data: [
          {
            businessId: biz.id,
            name: 'Corte Tradicional',
            description: 'Corte na tesoura ou máquina com alinhamento e finalização.',
            priceCents: 3500, // R$ 35,00
            durationMinutes: 30,
            sortOrder: 1,
          },
          {
            businessId: biz.id,
            name: 'Barba Completa',
            description: 'Barboterapia com toalha quente, navalha e óleo hidratante.',
            priceCents: 2500, // R$ 25,00
            durationMinutes: 30,
            sortOrder: 2,
          },
          {
            businessId: biz.id,
            name: 'Combo Cabelo + Barba',
            description: 'Experiência completa de corte e barba com alinhamento premium.',
            priceCents: 5500, // R$ 55,00
            durationMinutes: 60,
            sortOrder: 3,
          },
          {
            businessId: biz.id,
            name: 'Acabamento / Pezinho',
            description: 'Apenas alinhamento dos contornos e nuca.',
            priceCents: 1500, // R$ 15,00
            durationMinutes: 15,
            sortOrder: 4,
          },
        ],
      });
    }

    // Seed de profissional padrão (o próprio dono / barbeiro principal)
    const existingPros = await prisma.professional.count({ where: { businessId: biz.id } });
    if (existingPros === 0) {
      await prisma.professional.create({
        data: {
          businessId: biz.id,
          name: biz.cleanName || biz.name,
          nickname: 'Barbeiro Principal',
          phone: biz.phone,
          workingHours: [
            { day: 1, open: '09:00', close: '19:00' }, // Seg
            { day: 2, open: '09:00', close: '19:00' }, // Ter
            { day: 3, open: '09:00', close: '19:00' }, // Qua
            { day: 4, open: '09:00', close: '19:00' }, // Qui
            { day: 5, open: '09:00', close: '19:00' }, // Sex
            { day: 6, open: '08:30', close: '18:00' }, // Sáb
          ],
        },
      });
    }

    count++;
  }

  console.log(`✅ [Seed] Sucesso: ${count} barbearias importadas e sincronizadas com serviços e profissionais.`);
}

main()
  .catch((e) => {
    console.error('❌ [Seed] Erro durante importação:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
