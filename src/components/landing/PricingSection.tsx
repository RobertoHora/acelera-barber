'use client';

import React from 'react';
import { BadgeCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { PLANS_CONFIG } from '@/lib/plans';

interface PricingSectionProps {
  onSelectPlan: (planId: string) => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const pro = PLANS_CONFIG.google_pro;
  const complete = PLANS_CONFIG.complete;

  return (
    <section id="precos" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Economia de mais de 90%
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Consultoria tradicional: R$ 800+.{' '}
            <span className="text-amber-400">Eleva ORC: a partir de R$ 37 taxa única.</span>
          </h2>
        </div>

        {/* Grid de Preços */}
        <div className="grid max-w-4xl mx-auto gap-6 md:grid-cols-2 items-stretch">
          {/* Card Google Pro */}
          <div className="bg-[#2B2B29] border border-[#3D3C3A] rounded-3xl p-7 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] bg-[#242422] px-2.5 py-1 rounded-md border border-[#454441]">
                  {pro.badge || 'Essencial'}
                </span>
                <h3 className="text-2xl font-black text-white mt-3">{pro.name}</h3>
                <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1.5 leading-relaxed">
                  {pro.description}
                </p>
              </div>

              <div className="pt-2">
                <span className="text-4xl font-black text-white tracking-tight">{pro.priceFormatted}</span>
                <span className="text-xs text-[#A1A1AA] ml-1.5">pagamento único • sem mensalidade</span>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-[#383735] text-xs sm:text-sm text-[#D4D4D8]">
                {pro.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <BadgeCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('google_pro')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#242422] hover:bg-[#32322F] text-white border border-[#454441] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <span>Escolher Google Pro</span>
              <ArrowRight className="size-4" />
            </button>
          </div>

          {/* Card Completo (Destaque) */}
          <div className="relative bg-[#2B2B29] border-2 border-amber-400/80 rounded-3xl p-7 sm:p-8 flex flex-col justify-between space-y-6 shadow-[0_12px_40px_rgba(245,158,11,0.12)]">
            <span className="absolute -top-3.5 right-6 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#111111] shadow-md">
              Mais Escolhido
            </span>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/30">
                  {complete.badge || 'Completo'}
                </span>
                <h3 className="text-2xl font-black text-white mt-3">{complete.name}</h3>
                <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1.5 leading-relaxed">
                  {complete.description}
                </p>
              </div>

              <div className="pt-2">
                <span className="text-4xl font-black text-white tracking-tight">{complete.priceFormatted}</span>
                <span className="text-xs text-[#A1A1AA] ml-1.5">pagamento único • sem mensalidade</span>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-[#383735] text-xs sm:text-sm text-[#D4D4D8]">
                {complete.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <BadgeCheck className="size-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('complete')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#EFECE5] hover:bg-[#E2DED6] text-[#111111] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <span>Escolher Plano Completo</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Card de Garantia de 7 Dias */}
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 sm:p-6">
          <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm sm:text-base text-emerald-300">
              Garantia Incondicional de 7 Dias (Art. 49 do CDC)
            </h4>
            <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
              Se você não ficar 100% satisfeito com os materiais, solicite reembolso em até 7 dias após a liberação. Devolvemos seu valor integralmente via InfinitePay ou Pix.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
