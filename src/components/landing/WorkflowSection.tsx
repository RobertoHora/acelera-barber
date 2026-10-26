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
      title: 'Benchmark do Bairro',
      text: 'Comparamos seu perfil com os 2 concorrentes que mais recebem visitas no seu bairro.',
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
    <section id="como-funciona" className="scroll-mt-20 border-y border-[#3D3C3A] bg-[#242422]/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-12">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Processo 100% online e assistido
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            4 passos simples para transformar a presença da sua barbearia
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-[#2B2B29] border border-[#3D3C3A] rounded-2xl p-6 sm:p-7 space-y-5 hover:border-amber-400/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-[#1E1E1C] border border-[#454441] flex items-center justify-center text-amber-400">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#71717A]">{s.number}</span>
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white mb-2">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">{s.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
