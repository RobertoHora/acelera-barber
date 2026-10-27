'use client';

import React from 'react';
import { BadgeCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { PLANS_CONFIG } from '@/lib/plans';
import ShowcaseMarquee from '@/components/orc/ShowcaseMarquee';

interface PricingSectionProps {
  onSelectPlan: (planId: string) => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const pro = PLANS_CONFIG.google_pro;
  const complete = PLANS_CONFIG.complete;

  return (
    <section id="precos" className="scroll-mt-20 py-20 sm:py-28 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-12">
        {/* Header */}
        <div data-reveal="up" className="max-w-3xl mx-auto text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--orc-sky-400)]">
            Economia de mais de 90%
          </p>
          <h2 className="studio-display-type text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Consultoria tradicional: R$&nbsp;800+.{' '}
            <span className="text-[var(--orc-amber-500)]">Eleva ORC: a partir de R$&nbsp;37 taxa única.</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--orc-text-secondary)]">
            Sem mensalidade. Sem fidelidade. Pagamento único via InfinitePay com liberação imediata.
          </p>
        </div>

        {/* Grid de Preços */}
        <div className="grid max-w-4xl mx-auto gap-6 md:grid-cols-2 items-stretch">
          {/* Card Google Pro */}
          <article
            data-reveal="up"
            data-reveal-delay="1"
            className="studio-surface-lift orc-glass rounded-3xl p-7 sm:p-8 flex flex-col justify-between space-y-6"
          >
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
                <span className="text-xs text-[#A1A1AA] ml-1.5">pagamento único · sem mensalidade</span>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-[#383735] text-xs sm:text-sm text-[#D4D4D8]">
                {pro.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <BadgeCheck className="size-4 text-[var(--orc-sky-400)] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('google_pro')}
              className="studio-button-type w-full py-3.5 px-4 rounded-xl bg-[#242422] hover:bg-[#32322F] text-white border border-[#454441] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <span>Escolher Google Pro</span>
              <ArrowRight className="size-4" />
            </button>
          </article>

          {/* Card Completo (Destaque) */}
          <article
            data-reveal="up"
            data-reveal-delay="2"
            className="studio-surface-lift relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between space-y-6 border border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-[#19181D] shadow-[0_16px_50px_rgba(245,154,47,0.15)]"
          >
            <span className="absolute -top-3.5 right-6 rounded-full bg-[var(--orc-amber-500)] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#111111] shadow-md">
              Mais Escolhido
            </span>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/30">
                  {complete.badge || 'Completo + Plaquinha'}
                </span>
                <h3 className="text-2xl font-black text-white mt-3">{complete.name}</h3>
                <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1.5 leading-relaxed">
                  {complete.description}
                </p>
              </div>

              <div className="pt-2">
                <span className="text-4xl font-black text-white tracking-tight">{complete.priceFormatted}</span>
                <span className="text-xs text-[#A1A1AA] ml-1.5">pagamento único · sem mensalidade</span>
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
              className="studio-button-type w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[var(--orc-amber-500)] via-[#fbb95a] to-[var(--orc-amber-500)] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(245,154,47,0.3)] hover:brightness-110 cursor-pointer active:scale-95"
            >
              <span>Escolher Plano Completo</span>
              <ArrowRight className="size-4" />
            </button>
          </article>
        </div>

        {/* Card de Garantia de 7 Dias */}
        <div
          data-reveal="up"
          data-reveal-delay="2"
          className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 sm:p-6"
        >
          <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm sm:text-base text-emerald-300">
              Garantia Incondicional de 7 Dias (Art. 49 do CDC)
            </h4>
            <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
              O risco é 100% nosso. Se você aplicar as orientações e não sentir diferença na apresentação e avaliações em até 7 dias, devolvemos seu valor integralmente.
            </p>
          </div>
        </div>
      </div>

      {/* Vitrine de fotos de cortes e barbearias (Edge-to-Edge Marquee) */}
      <div className="mt-14 w-full overflow-hidden sm:mt-20">
        <ShowcaseMarquee pauseOnHover={false} vignetteColor="#19181D" />
      </div>
    </section>
  );
}
