'use client';

import React from 'react';
import { Search, TrendingUp, Sparkles, Printer } from 'lucide-react';

export default function WorkflowSection() {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Diagnóstico do Perfil',
      text: 'Identificamos falhas de fotos, ausência de catálogo e notas estagnadas no Google Maps.',
    },
    {
      number: '02',
      icon: TrendingUp,
      title: 'Benchmark da Região',
      text: 'Comparamos seu perfil com os concorrentes que mais recebem visitas na sua área local.',
    },
    {
      number: '03',
      icon: Sparkles,
      title: 'Melhorias Gratuitas',
      text: 'Ativação imediata de link direto de agendamento no WhatsApp e QR Code de avaliação.',
    },
    {
      number: '04',
      icon: Printer,
      title: 'Plaquinha & Catálogo',
      text: 'Download da arte 2 em 1 A6 (300 DPI) para balcão e catálogo com fotos dos seus cortes.',
    },
  ];

  return (
    <section id="como-funciona" className="scroll-mt-20 border-y border-white/[0.08] bg-[#242422]/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-12">
        <div data-reveal="up" className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--orc-sky-400)]">
            Processo 100% online e assistido
          </p>
          <h2 className="studio-display-type text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            4 passos simples para transformar a presença da sua barbearia
          </h2>
        </div>

        <ol className="grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <li
                key={idx}
                data-reveal="up"
                data-reveal-delay={String(idx)}
                className="studio-workflow-step min-h-64 bg-[var(--orc-surface-solid)] p-6 sm:p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-sky-300/10 text-[var(--orc-sky-400)]">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-mono font-medium tabular-nums text-[var(--orc-text-disabled)]">
                      {s.number}
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-bold text-white">{s.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--orc-text-secondary)]">{s.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
