import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const ADMIN_SECRET = process.env.ADMIN_METRICS_SECRET;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const secretParam = url.searchParams.get('secret');

  const token = authHeader?.replace(/^Bearer\s+/i, '') || secretParam;

  if (!ADMIN_SECRET || token !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  try {
    // 1. Métricas do Funil e Coortes
    const totalBusinesses = await prisma.business.count();
    const diagnosedCount = await prisma.diagnosticReport.count();
    const paidOrdersCount = await prisma.order.count({ where: { status: 'PAID' } });
    const activeTrialsCount = await prisma.trialBenefit.count({ where: { status: 'ACTIVE' } });
    const activeSubsCount = await prisma.subscription.count({
      where: { status: { in: ['ACTIVE', 'PAST_DUE'] } },
    });

    // 2. Saúde da Outbox
    const outboxCounts = await prisma.outboxMessage.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const outboxHealth: Record<string, number> = {
      QUEUED: 0,
      CLAIMED: 0,
      PROVIDER_ACCEPTED: 0,
      UNCERTAIN: 0,
      FAILED: 0,
      CANCELLED: 0,
    };
    for (const group of outboxCounts) {
      outboxHealth[group.status] = group._count.id;
    }

    // Circuit Breaker Status
    const circuitBreakerStatus =
      outboxHealth.UNCERTAIN > 5 || outboxHealth.FAILED > 10 ? 'ALERT' : 'HEALTHY';

    // 3. Pedidos Recentes
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: { name: true, cleanName: true, slug: true },
        },
      },
    });

    // 4. Agendamentos Recentes
    const totalBookings = await prisma.booking.count();
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        business: { select: { name: true, cleanName: true } },
        service: { select: { name: true, priceCents: true } },
        professional: { select: { name: true } },
      },
    });

    // 5. Últimos Eventos de Telemetria
    const recentGrowthEvents = await prisma.growthEvent.findMany({
      take: 15,
      orderBy: { occurredAt: 'desc' },
      include: {
        business: { select: { cleanName: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cohorts: {
        totalBusinesses,
        diagnosedCount,
        paidOrdersCount,
        activeTrialsCount,
        activeSubsCount,
      },
      outbox: {
        health: outboxHealth,
        circuitBreakerStatus,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNsu: o.orderNsu,
        businessName: o.business.cleanName || o.business.name,
        plan: o.sku,
        amountCents: o.amountCents,
        status: o.status,
        createdAt: o.createdAt,
      })),
      bookings: {
        totalBookings,
        recent: recentBookings.map((b) => ({
          id: b.id,
          businessName: b.business.cleanName || b.business.name,
          customerName: b.customerName,
          serviceName: b.service.name,
          professionalName: b.professional.name,
          startsAt: b.startsAt,
          status: b.status,
        })),
      },
      growthEvents: recentGrowthEvents.map((g) => ({
        id: g.id,
        event: g.event,
        businessName: g.business?.cleanName || g.business?.name || 'Sistema',
        occurredAt: g.occurredAt,
      })),
    });
  } catch (err: any) {
    console.error('❌ [Admin Metrics API] Erro ao consolidar métricas:', err);
    return NextResponse.json({ error: 'Erro ao gerar métricas operacionais' }, { status: 500 });
  }
}
