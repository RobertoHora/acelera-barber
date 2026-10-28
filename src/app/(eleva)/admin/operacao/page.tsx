'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface MetricsData {
  cohorts: {
    totalBusinesses: number;
    diagnosedCount: number;
    paidOrdersCount: number;
    activeTrialsCount: number;
    activeSubsCount: number;
  };
  outbox: {
    health: Record<string, number>;
    circuitBreakerStatus: string;
  };
  recentOrders: Array<{
    id: string;
    orderNsu: string;
    businessName: string;
    plan: string;
    amountCents: number;
    status: string;
    createdAt: string;
  }>;
  bookings: {
    totalBookings: number;
    recent: Array<{
      id: string;
      businessName: string;
      customerName: string;
      serviceName: string;
      professionalName: string;
      startsAt: string;
      status: string;
    }>;
  };
  growthEvents: Array<{
    id: string;
    event: string;
    businessName: string;
    occurredAt: string;
  }>;
}

export default function AdminOperacaoPage() {
  const [secret, setSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async (authSecret: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/metrics?secret=${encodeURIComponent(authSecret)}`);
      if (res.status === 403) {
        setError('Senha de acesso incorreta');
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Falha ao carregar métricas');
      const json = await res.json();
      setData(json);
      setAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;
    fetchMetrics(secret.trim());
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0c0d0e] text-[#e2e4e8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#131518] border border-[#1e2023] rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-lg font-bold">Painel de Operações ORC</h1>
              <p className="text-xs text-[#8c929d]">Eleva & Agenda ORC · Visibilidade Interna</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8c929d] mb-1">
                Chave de Acesso Administrativa
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Insira o segredo de operação..."
                className="w-full bg-[#181a1e] border border-[#26292e] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-sm transition-colors"
            >
              {loading ? 'Verificando...' : 'Acessar Operações'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#e2e4e8] p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2023] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h1 className="text-xl font-bold">Torre de Operações Eleva & Agenda</h1>
          </div>
          <p className="text-xs text-[#8c929d]">
            Funil consultivo, saúde do WhatsApp, pedidos e volume de agendamentos em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMetrics(secret)}
            className="text-xs bg-[#181a1e] hover:bg-[#202328] border border-[#26292e] px-3 py-1.5 rounded-lg transition-colors"
          >
            🔄 Atualizar
          </button>
          <Link
            href="/"
            className="text-xs text-[#8c929d] hover:text-white transition-colors"
          >
            ← Voltar para o Eleva
          </Link>
        </div>
      </div>

      {data && (
        <>
          {/* Métricas do Funil */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[#131518] border border-[#1e2023] rounded-xl p-4">
              <span className="text-xs text-[#8c929d] block">Base de Barbearias</span>
              <span className="text-2xl font-bold mt-1 block">{data.cohorts.totalBusinesses}</span>
              <span className="text-[10px] text-zinc-500 mt-1 block">Governador Valadares</span>
            </div>

            <div className="bg-[#131518] border border-[#1e2023] rounded-xl p-4">
              <span className="text-xs text-[#8c929d] block">Diagnósticos Gerados</span>
              <span className="text-2xl font-bold mt-1 block text-blue-400">{data.cohorts.diagnosedCount}</span>
              <span className="text-[10px] text-zinc-500 mt-1 block">Leads Diagnósticos</span>
            </div>

            <div className="bg-[#131518] border border-[#1e2023] rounded-xl p-4">
              <span className="text-xs text-[#8c929d] block">Pedidos Pagos (Eleva)</span>
              <span className="text-2xl font-bold mt-1 block text-emerald-400">{data.cohorts.paidOrdersCount}</span>
              <span className="text-[10px] text-zinc-500 mt-1 block">Google Pro / Completo</span>
            </div>

            <div className="bg-[#131518] border border-[#1e2023] rounded-xl p-4">
              <span className="text-xs text-[#8c929d] block">Testes Ativos (Agenda)</span>
              <span className="text-2xl font-bold mt-1 block text-amber-400">{data.cohorts.activeTrialsCount}</span>
              <span className="text-[10px] text-zinc-500 mt-1 block">14 ou 30 dias grátis</span>
            </div>

            <div className="bg-[#131518] border border-[#1e2023] rounded-xl p-4">
              <span className="text-xs text-[#8c929d] block">Assinaturas Ativas</span>
              <span className="text-2xl font-bold mt-1 block text-purple-400">{data.cohorts.activeSubsCount}</span>
              <span className="text-[10px] text-zinc-500 mt-1 block">Recorrência mensal</span>
            </div>
          </div>

          {/* Saúde do WhatsApp e Outbox */}
          <div className="bg-[#131518] border border-[#1e2023] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <h2 className="text-sm font-semibold">Saúde da Mensageria (Outbox & Motor Laura)</h2>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  data.outbox.circuitBreakerStatus === 'HEALTHY'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                Circuit Breaker: {data.outbox.circuitBreakerStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div className="bg-[#181a1e] p-3 rounded-lg border border-[#26292e]">
                <span className="text-[11px] text-[#8c929d] block">Na Fila (Queued)</span>
                <span className="text-lg font-bold text-amber-300">{data.outbox.health.QUEUED || 0}</span>
              </div>
              <div className="bg-[#181a1e] p-3 rounded-lg border border-[#26292e]">
                <span className="text-[11px] text-[#8c929d] block">Em Disparo (Claimed)</span>
                <span className="text-lg font-bold text-blue-300">{data.outbox.health.CLAIMED || 0}</span>
              </div>
              <div className="bg-[#181a1e] p-3 rounded-lg border border-[#26292e]">
                <span className="text-[11px] text-[#8c929d] block">Entregues / Aceitas</span>
                <span className="text-lg font-bold text-emerald-400">{data.outbox.health.PROVIDER_ACCEPTED || 0}</span>
              </div>
              <div className="bg-[#181a1e] p-3 rounded-lg border border-[#26292e]">
                <span className="text-[11px] text-[#8c929d] block">Incerteza (Uncertain)</span>
                <span className="text-lg font-bold text-orange-400">{data.outbox.health.UNCERTAIN || 0}</span>
              </div>
              <div className="bg-[#181a1e] p-3 rounded-lg border border-[#26292e]">
                <span className="text-[11px] text-[#8c929d] block">Falhas (Failed)</span>
                <span className="text-lg font-bold text-red-400">{data.outbox.health.FAILED || 0}</span>
              </div>
              <div className="bg-[#181a1e] p-3 rounded-lg border border-[#26292e]">
                <span className="text-[11px] text-[#8c929d] block">Canceladas (Lead Virou Cliente)</span>
                <span className="text-lg font-bold text-zinc-400">{data.outbox.health.CANCELLED || 0}</span>
              </div>
            </div>
          </div>

          {/* Grade Dupla: Pedidos Recentes e Agendamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pedidos */}
            <div className="bg-[#131518] border border-[#1e2023] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <span>💳</span> Pedidos Recentes
                </h2>
                <span className="text-xs text-[#8c929d]">{data.recentOrders.length} registros</span>
              </div>

              {data.recentOrders.length === 0 ? (
                <p className="text-xs text-[#8c929d] py-6 text-center">Nenhum pedido registrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {data.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#181a1e] p-3 rounded-xl border border-[#26292e] flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-semibold block">{order.businessName}</span>
                        <span className="text-[10px] text-[#8c929d] block">
                          {order.orderNsu} · Plano: {order.plan}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold block text-emerald-400">
                          {(order.amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wide">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agendamentos */}
            <div className="bg-[#131518] border border-[#1e2023] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <span>✂️</span> Agendamentos na Rede
                </h2>
                <span className="text-xs text-[#8c929d]">Total: {data.bookings.totalBookings}</span>
              </div>

              {data.bookings.recent.length === 0 ? (
                <p className="text-xs text-[#8c929d] py-6 text-center">Nenhum agendamento realizado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {data.bookings.recent.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-[#181a1e] p-3 rounded-xl border border-[#26292e] flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-semibold block">{booking.customerName}</span>
                        <span className="text-[10px] text-[#8c929d] block">
                          {booking.businessName} · {booking.serviceName} ({booking.professionalName})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] block font-medium">
                          {new Date(booking.startsAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-emerald-400 block uppercase">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Eventos Recentes de Telemetria (GrowthEvents) */}
          <div className="bg-[#131518] border border-[#1e2023] rounded-2xl p-6">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <span>📈</span> Log de Eventos Canônicos (Growth Events)
            </h2>

            {data.growthEvents.length === 0 ? (
              <p className="text-xs text-[#8c929d] py-4 text-center">Nenhum evento registrado no log.</p>
            ) : (
              <div className="space-y-2">
                {data.growthEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between py-2 px-3 bg-[#181a1e] rounded-lg border border-[#26292e] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-semibold">{evt.event}</span>
                      <span className="text-[#8c929d]">· {evt.businessName}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(evt.occurredAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
