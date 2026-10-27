'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { BarbershopLead } from '@/lib/types';
import StoreRecognitionForm from './StoreRecognitionForm';
import ProfileComparison from './ProfileComparison';
import GlassLogosMarquee from '@/components/orc/GlassLogosMarquee';

interface HeroSectionProps {
  recognizedLead: BarbershopLead | null;
  onSelectLead: (lead: BarbershopLead) => void;
  onAnalyze: (lead: BarbershopLead) => void;
}

export default function HeroSection({
  recognizedLead,
  onSelectLead,
  onAnalyze,
}: HeroSectionProps) {
  const shopName = recognizedLead?.cleanName || recognizedLead?.name || null;
  const neighborhood = recognizedLead?.neighborhood || 'sua região';

  return (
    <section className="relative isolate overflow-hidden pt-24 sm:pt-32 pb-12 sm:pb-16" aria-labelledby="hero-title">
      {/* Background ambient grid and neon auroras */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="studio-ambient-grid absolute inset-0" />
        <div className="absolute left-[-14rem] top-16 size-[34rem] rounded-full bg-[var(--orc-sky-400)]/10 blur-[110px]" />
        <div className="absolute right-[-10rem] top-28 size-[38rem] rounded-full bg-[var(--orc-amber-500)]/10 blur-[130px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--orc-sky-400)]/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">
        {/* Coluna Esquerda: Textos e Formulário */}
        <div className="space-y-6 max-w-2xl">
          {/* Top Badge */}
          <div
            data-reveal="up"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/25 bg-amber-400/10 text-[11px] font-bold text-amber-300 uppercase tracking-wider"
          >
            <Sparkles className="size-3.5 shrink-0" />
            <span className="truncate">
              {shopName ? `Sua barbearia · ${shopName}` : 'Presença Digital • Google Maps'}
            </span>
          </div>

          {/* Headline Principal */}
          <h1
            id="hero-title"
            data-reveal="up"
            data-reveal-delay="1"
            className="studio-display-type text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05]"
          >
            {shopName ? (
              <>
                Sua barbearia com presença de{' '}
                <span className="text-[var(--orc-amber-500)]">destaque no Google.</span>
              </>
            ) : (
              <>
                Seu cliente corta o cabelo com quem tem{' '}
                <span className="text-[var(--orc-amber-500)]">presença profissional no Maps.</span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p
            data-reveal="up"
            data-reveal-delay="2"
            className="text-sm sm:text-base lg:text-lg text-[#D4D4D8] leading-relaxed"
          >
            {shopName ? (
              <>
                Veja o diagnóstico público da <strong>{shopName}</strong> e compare lado a lado com os concorrentes de <strong>{neighborhood}</strong>. Identifique falhas, ative seu catálogo de cortes e receba clientes no balcão prontos para avaliar.
              </>
            ) : (
              <>
                Mais de 70% dos clientes buscam barbearias no Google Maps antes de cortar. Quem tem catálogo de cortes com fotos e avaliações recentes fecha na hora. Quem está com perfil abandonado manda o cliente pro concorrente.
              </>
            )}
          </p>

          {/* Formulário de Reconhecimento / Busca */}
          <div data-reveal="up" data-reveal-delay="3" className="pt-2">
            <StoreRecognitionForm
              recognizedLead={recognizedLead}
              onSelectLead={onSelectLead}
              onAnalyze={onAnalyze}
            />
          </div>
        </div>

        {/* Coluna Direita: Slider Interativo Antes & Depois */}
        <div data-reveal="scale" className="w-full">
          <p className="text-xs font-semibold text-[#A1A1AA] mb-2.5 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Comparativo real de perfil no Google Maps:</span>
          </p>
          <ProfileComparison
            barberName={shopName || 'Sua Barbearia'}
            neighborhood={neighborhood}
            priority
          />
        </div>
      </div>

      {/* Faixa Marquee de Plataformas em Vidro (Glass Cards) */}
      <div data-reveal="fade" data-reveal-delay="3" className="mx-auto mt-12 sm:mt-16 max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col items-center gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#A1A1AA] opacity-70">
            Conquiste clientes em todas as plataformas de busca e geolocalização
          </p>
          <GlassLogosMarquee />
        </div>
      </div>
    </section>
  );
}
