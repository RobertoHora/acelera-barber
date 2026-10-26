'use client';

import React from 'react';
import ProfileComparison from './ProfileComparison';

interface ResultsSectionProps {
  barberName?: string;
  neighborhood?: string;
}

export default function ResultsSection({
  barberName = 'Sua Barbearia',
  neighborhood = 'Governador Valadares',
}: ResultsSectionProps) {
  return (
    <section id="resultados" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        {/* Slider de Comparação */}
        <div>
          <ProfileComparison
            barberName={barberName}
            neighborhood={neighborhood}
            initialPosition={45}
          />
        </div>

        {/* Bloco de Copy */}
        <div className="space-y-4 max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Decisão visual em 2 segundos
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Mesmo corte de cabelo.{' '}
            <span className="text-amber-400">Outra apresentação no Google Maps.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
            No Google Maps, o cliente decide para onde ir em poucos segundos. Um perfil sem fotos de cortes, com avaliações antigas e sem link de WhatsApp manda o cliente direto para a barbearia concorrente do seu bairro.
          </p>
          <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
            Com catálogo atualizado, fotos nítidas dos seus cortes e uma plaquinha física no balcão para incentivar avaliações espontâneas, sua barbearia transmite autoridade e atrai novos clientes diariamente.
          </p>
        </div>
      </div>
    </section>
  );
}
