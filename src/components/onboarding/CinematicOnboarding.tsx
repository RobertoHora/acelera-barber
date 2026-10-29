'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import { BarbershopLead } from '@/lib/types';
import { ORCBrand } from '@/components/orc/Brand';
import ShowcaseMarquee from '@/components/orc/ShowcaseMarquee';

interface CinematicOnboardingProps {
  lead: BarbershopLead;
  onComplete: () => void;
  durationMs?: number; // default: 10000 (10s)
}

const EDUCATIONAL_HEADLINES = [
  {
    tag: 'Comportamento do Cliente',
    text: 'Fotos claras e avaliações recentes ajudam clientes a conhecer sua barbearia antes de visitar.',
  },
  {
    tag: 'Perda de Clientes',
    text: 'Um catálogo com serviços, preços e duração facilita a escolha do cliente.',
  },
  {
    tag: 'Solução no Balcão',
    text: 'Um QR Code no balcão facilita o acesso ao formulário de avaliação do Google.',
  },
  {
    tag: 'Próximos passos',
    text: 'Organizando os próximos passos com base nos dados disponíveis da sua barbearia.',
  },
];

export default function CinematicOnboarding({
  lead,
  onComplete,
  durationMs = 1500,
}: CinematicOnboardingProps) {
  const [progress, setProgress] = useState(0);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    `Organizando os dados da ${lead.cleanName || lead.name}...`,
    `Conferindo informações cadastradas de ${lead.neighborhood || 'sua região'}...`,
    'Analisando fotos cadastradas, catálogo de serviços e horários...',
    'Calculando score de presença digital e oportunidades de balcão...',
  ];

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      // Atualiza headlines
      const hIdx = Math.min(
        EDUCATIONAL_HEADLINES.length - 1,
        Math.floor((elapsed / durationMs) * EDUCATIONAL_HEADLINES.length)
      );
      setHeadlineIndex(hIdx);

      // Atualiza passos da checagem
      const sIdx = Math.min(steps.length - 1, Math.floor((elapsed / durationMs) * steps.length));
      setCurrentStepIndex(sIdx);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [durationMs, onComplete, steps.length]);

  const activeHeadline = EDUCATIONAL_HEADLINES[headlineIndex];

  return (
    <div className="fixed inset-0 z-50 bg-[#141318] flex flex-col justify-between p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      {/* Glows de Fundo Atmosféricos */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="studio-ambient-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-amber-500/10 blur-[140px] rounded-full" />
        <div className="absolute left-1/4 top-0 w-[400px] h-[300px] bg-sky-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Top Header com Marca */}
      <header className="flex w-full shrink-0 items-center justify-between px-2 pt-2 sm:px-8 sm:pt-4">
        <ORCBrand compact />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] bg-white/[0.05] border border-white/10 px-3 py-1 rounded-full">
          Análise dos dados disponíveis
        </span>
      </header>

      {/* Centro: Experiência Cinematográfica */}
      <main className="mx-auto w-full max-w-xl py-6 space-y-6 text-center my-auto">
        {/* Radar Central */}
        <div className="relative mx-auto size-20 sm:size-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping opacity-60" />
          <div className="absolute -inset-2.5 rounded-full border border-amber-400/20 animate-pulse" />
          <div className="size-16 sm:size-20 rounded-2xl bg-[#242422] border border-[#454441] shadow-2xl flex items-center justify-center text-amber-400">
            <Loader2 className="size-8 sm:size-9 animate-spin" />
          </div>
        </div>

        {/* Informações da Barbearia Analisada */}
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            <Sparkles className="size-3" /> Analisando Presença Digital
          </span>
          <h2 className="studio-display-type text-2xl sm:text-3xl font-black text-white truncate px-2">
            {lead.cleanName || lead.name}
          </h2>
          <p className="text-xs text-[#A1A1AA] flex items-center justify-center gap-1">
            <MapPin className="size-3.5 text-amber-400" />
            <span>{lead.neighborhood ? `${lead.neighborhood} · Barbearia` : 'Perfil Comercial no Google Maps'}</span>
          </p>
        </div>

        {/* Barra de Progresso Estilo Splash ORC */}
        <div className="space-y-2 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#A1A1AA]">
            <span>Auditoria em andamento...</span>
            <span className="text-amber-400">{progress}%</span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.11]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--orc-sky-400)] to-[var(--orc-amber-500)] shadow-[0_0_16px_rgba(245,154,47,0.7)] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card Dinâmico com Textos Educativos */}
        <div className="min-h-[100px] bg-[#242422]/90 border border-[#3D3C3A] rounded-2xl p-4 sm:p-5 text-left space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              {activeHeadline.tag}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed">
            {activeHeadline.text}
          </p>
        </div>

        {/* Passos da Auditoria em Tempo Real */}
        <div className="space-y-2 text-left max-w-md mx-auto text-xs">
          {steps.map((st, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 transition-opacity duration-300 ${
                  isDone
                    ? 'text-emerald-400'
                    : isCurrent
                    ? 'text-white font-semibold'
                    : 'text-[#71717A] opacity-40'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-amber-400" />
                ) : (
                  <div className="size-4 rounded-full border border-[#454441] shrink-0" />
                )}
                <span className="truncate">{st}</span>
              </div>
            );
          })}
        </div>
      </main>

      {/* Base: Vitrine com ShowcaseMarquee */}
      <footer className="w-full pb-2 pt-2 shrink-0">
        <ShowcaseMarquee className="opacity-75" />
      </footer>
    </div>
  );
}
