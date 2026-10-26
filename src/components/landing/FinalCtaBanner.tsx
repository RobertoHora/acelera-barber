'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FinalCtaBannerProps {
  onAnalyzeClick: () => void;
  shopName?: string | null;
}

export default function FinalCtaBanner({ onAnalyzeClick, shopName }: FinalCtaBannerProps) {
  return (
    <section className="border-t border-[#3D3C3A] bg-amber-400 py-14 sm:py-16 text-[#111111]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#111111]/75 flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            <span>Presença Digital e Balcão • Governador Valadares</span>
          </p>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {shopName ? `Analise a presença da ${shopName} agora.` : 'Veja como sua barbearia aparece para quem busca corte no Maps.'}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#111111]/85">
            100% gratuito. Sem cartão de crédito. Diagnóstico imediato com comparativo de concorrentes.
          </p>
        </div>

        <button
          type="button"
          onClick={onAnalyzeClick}
          className="py-3.5 px-6 rounded-xl bg-[#111111] hover:bg-[#222222] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl active:scale-95 cursor-pointer shrink-0"
        >
          <span>Analisar Gratuitamente</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
