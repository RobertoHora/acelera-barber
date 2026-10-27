'use client';

import React from 'react';
import ProfileComparison from './ProfileComparison';

interface ResultsSectionProps {
  barberName?: string;
  neighborhood?: string;
}

export default function ResultsSection({
  barberName = 'Sua Barbearia',
  neighborhood = 'Sua Região',
}: ResultsSectionProps) {
  return (
    <section id="resultados" className="scroll-mt-20 py-20 sm:py-28 bg-transparent">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        {/* Slider de Comparação */}
        <div data-reveal="scale">
          <ProfileComparison
            barberName={barberName}
            neighborhood={neighborhood}
            initialPosition={45}
          />
        </div>

        {/* Bloco de Copy */}
        <div data-reveal="up" data-reveal-delay="1" className="space-y-4 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--orc-sky-400)]">
            Decisão visual em 2 segundos
          </p>
          <h2 className="studio-display-type text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Mesmo corte de cabelo.{' '}
            <span className="text-[var(--orc-amber-500)]">Outra apresentação no Google Maps.</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--orc-text-secondary)] leading-relaxed">
            No Google Maps, o cliente decide para onde ir em poucos segundos. Um perfil sem fotos de cortes, com avaliações antigas e sem link de WhatsApp manda o cliente direto para a barbearia concorrente da sua região.
          </p>
          <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
            Com catálogo atualizado, fotos nítidas dos seus cortes e uma plaquinha física no balcão para incentivar avaliações espontâneas, sua barbearia transmite autoridade e atrai novos clientes diariamente.
          </p>
        </div>
      </div>
    </section>
  );
}
