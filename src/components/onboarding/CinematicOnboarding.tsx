'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, MapPin, Sparkles, AlertTriangle } from 'lucide-react';
import { BarbershopLead } from '@/lib/types';

interface CinematicOnboardingProps {
  lead: BarbershopLead;
  onComplete: () => void;
  durationMs?: number; // default: 10000 (10s)
}

const EDUCATIONAL_HEADLINES = [
  {
    tag: 'Comportamento do Cliente',
    text: 'Mais de 70% das pessoas escolhem barbearias no Google Maps pela aparência das fotos e avaliações recentes.',
  },
  {
    tag: 'Perda de Clientes',
    text: 'Perfis sem catálogo de cortes e preços perdem clientes diariamente para barbearias do mesmo bairro.',
  },
  {
    tag: 'Solução no Balcão',
    text: 'Uma plaquinha de balcão 2 em 1 transforma clientes que cortam com você todo dia em avaliações reais sem esforço.',
  },
  {
    tag: 'Análise Concorrencial',
    text: 'Mapeando os principais concorrentes próximos para identificar exatamente por que eles estão na sua frente no Google...',
  },
];

export default function CinematicOnboarding({
  lead,
  onComplete,
  durationMs = 10000,
}: CinematicOnboardingProps) {
  const [progress, setProgress] = useState(0);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    `Localizando perfil da ${lead.cleanName || lead.name} no Google Maps...`,
    `Mapeando barbearias concorrentes em ${lead.neighborhood || 'Governador Valadares'}...`,
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
    <div className="fixed inset-0 z-50 bg-[#141317] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Glows de Fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-xl w-full space-y-8 text-center">
        {/* Radar / Ícone de Análise Central */}
        <div className="relative mx-auto size-24 sm:size-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping opacity-60" />
          <div className="absolute -inset-3 rounded-full border border-amber-400/20 animate-pulse" />
          <div className="size-20 sm:size-24 rounded-2xl bg-[#242422] border border-[#454441] shadow-2xl flex items-center justify-center text-amber-400">
            <Loader2 className="size-9 sm:size-10 animate-spin" />
          </div>
        </div>

        {/* Informações da Barbearia Analisada */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            <Sparkles className="size-3" /> Analisando Presença Digital
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white truncate px-2">
            {lead.cleanName || lead.name}
          </h2>
          <p className="text-xs text-[#A1A1AA] flex items-center justify-center gap-1">
            <MapPin className="size-3.5 text-amber-400" />
            <span>{lead.neighborhood || 'Governador Valadares'} • MG</span>
          </p>
        </div>

        {/* Barra de Progresso com Porcentagem */}
        <div className="space-y-2 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#A1A1AA]">
            <span>Auditoria em andamento...</span>
            <span className="text-amber-400">{progress}%</span>
          </div>
          <div className="h-2.5 w-full bg-[#242422] border border-[#3D3C3A] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_rgba(245,158,11,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card Dinâmico com Textos Educativos */}
        <div className="min-h-[110px] bg-[#242422] border border-[#3D3C3A] rounded-2xl p-5 text-left space-y-2 shadow-xl transition-all">
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
      </div>
    </div>
  );
}
