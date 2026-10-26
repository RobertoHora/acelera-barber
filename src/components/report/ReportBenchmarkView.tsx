'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Star,
  TrendingDown,
  TrendingUp,
  XCircle,
  Sparkles,
  Store,
  ChevronLeft,
} from 'lucide-react';
import { BarbershopLead, CompetitorInfo, DiagnosisResult } from '@/lib/types';
import { calculateDiagnosis } from '@/lib/diagnosis';
import { findTopCompetitors } from '@/lib/leads';

interface ReportBenchmarkViewProps {
  lead: BarbershopLead;
  onStartImprovements: () => void;
  onBackToLanding: () => void;
}

export default function ReportBenchmarkView({
  lead,
  onStartImprovements,
  onBackToLanding,
}: ReportBenchmarkViewProps) {
  const diagnosis: DiagnosisResult = calculateDiagnosis(lead);
  const competitors: CompetitorInfo[] = findTopCompetitors(
    lead.name,
    lead.neighborhood,
    lead.reviewsCount || 0,
    lead.photosCount || 0
  );

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      {/* Botão Superior Voltar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="size-4" />
          <span>Voltar para a página inicial</span>
        </button>

        <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30 uppercase tracking-wider">
          Relatório de Presença Digital
        </span>
      </div>

      {/* HEADER: DADOS DA BARBEARIA DO CLIENTE */}
      <div className="bg-[#2B2B29] border border-[#3D3C3A] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#383735] pb-6">
          <div className="flex items-center gap-4 min-w-0">
            {lead.featuredImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lead.featuredImageUrl}
                alt={lead.name}
                className="size-16 sm:size-20 rounded-2xl object-cover border border-[#454441] shrink-0"
              />
            ) : (
              <div className="size-16 sm:size-20 rounded-2xl bg-[#242422] border border-[#454441] flex items-center justify-center text-amber-400 shrink-0">
                <Store className="size-8" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Sua Barbearia no Google Maps
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white truncate">
                {lead.cleanName || lead.name}
              </h1>
              <p className="text-xs text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                <MapPin className="size-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{lead.neighborhood || 'Governador Valadares'} • MG</span>
              </p>
            </div>
          </div>

          {/* Score Badge */}
          <div className="bg-[#1E1E1C] border border-[#3D3C3A] rounded-2xl p-4 text-center sm:text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] block">
              Força do Perfil
            </span>
            <div className="flex items-center justify-center sm:justify-end gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">
                {diagnosis.score}%
              </span>
              <span className="text-xs font-semibold text-[#D4D4D8] px-2 py-0.5 rounded-md bg-[#2B2B29] border border-[#454441]">
                {diagnosis.label}
              </span>
            </div>
          </div>
        </div>

        {/* STATUS DOS PONTOS CRÍTICOS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
            Pontos de Auditoria Encontrados:
          </h3>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {diagnosis.criteria.map((c) => (
              <div
                key={c.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                  c.done
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-red-950/20 border-red-500/30 text-red-200'
                }`}
              >
                {c.done ? (
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <p className="font-bold text-white">{c.name}</p>
                  <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                    {c.done ? 'Configurado corretamente.' : c.gapText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BENCHMARK COM OS 2 CONCORRENTES DO BAIRRO */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingDown className="size-5 text-red-400" />
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Concorrentes no seu bairro que estão na sua frente no Google Maps
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA]">
            Estes 2 estabelecimentos recebem mais visualizações e cliques em{' '}
            <strong>{lead.neighborhood || 'Governador Valadares'}</strong> devido à estrutura do perfil:
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {competitors.map((comp, idx) => (
            <div
              key={idx}
              className="bg-[#242422] border border-[#3D3C3A] rounded-2xl p-5 sm:p-6 space-y-4 relative shadow-lg"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#383735] pb-3">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Concorrente #{idx + 1}
                  </span>
                  <h3 className="font-black text-base text-white mt-1 truncate">
                    {comp.name}
                  </h3>
                  <p className="text-[11px] text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3 text-amber-400" />
                    <span>{comp.neighborhood}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs font-bold text-white">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span>{comp.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] text-[#A1A1AA] block">
                    ({comp.reviewsCount} reviews)
                  </span>
                </div>
              </div>

              {/* Destaques do Concorrente */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Por que este concorrente está melhor rankeado:
                </p>
                <p className="text-xs text-[#D4D4D8] leading-relaxed bg-[#1E1E1C] p-3 rounded-xl border border-[#383735]">
                  {comp.whyBetter}
                </p>
              </div>

              {/* Badges de Vantagem */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {comp.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold text-[#A1A1AA] bg-[#2B2B29] border border-[#454441] px-2 py-0.5 rounded-md"
                  >
                    ✓ {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHOQUE DE REALIDADE (CONSCIENTIZAÇÃO) */}
      <div className="bg-amber-950/30 border border-amber-500/40 rounded-3xl p-6 sm:p-7 space-y-3 shadow-xl">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm sm:text-base">
          <AlertTriangle className="size-5 shrink-0" />
          <span>O que isso significa para o faturamento da sua barbearia:</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
          Toda semana, dezenas de clientes pesquisam por <em>"barbearia perto de mim"</em> em{' '}
          <strong>{lead.neighborhood || 'Governador Valadares'}</strong>. Como seu perfil está com poucas fotos e avaliações paradas, o Google Maps recomenda seus concorrentes primeiro.
        </p>
        <p className="text-xs text-[#D4D4D8] leading-relaxed">
          Para reverter isso, você não precisa pagar anúncios caros: basta organizar seu catálogo de serviços, ativar seu link direto de WhatsApp e colocar uma plaquinha no balcão para colher avaliações espontâneas.
        </p>
      </div>

      {/* CTA PRINCIPAL: INICIAR MELHORIAS GRATUITAS */}
      <div className="pt-2 text-center space-y-3">
        <button
          type="button"
          onClick={onStartImprovements}
          className="w-full py-4 px-6 rounded-2xl bg-[#EFECE5] hover:bg-[#E2DED6] text-[#111111] font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-xl active:scale-98 cursor-pointer"
        >
          <span>Iniciar Melhorias Gratuitas da Minha Barbearia</span>
          <ArrowRight className="size-5" />
        </button>
        <p className="text-xs text-[#A1A1AA]">
          Passo 1 e 2 são 100% gratuitos. Você já sai com seu link direto e QR Code de avaliação gerados.
        </p>
      </div>
    </div>
  );
}
