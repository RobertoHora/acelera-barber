'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, ShieldCheck, Sparkles, Scissors, Clock } from 'lucide-react';

export default function AgendaRootPage() {
  return (
    <div className="min-h-screen bg-[#111110] text-[#EFECE5] flex flex-col justify-between p-6 sm:p-12">
      <div className="max-w-3xl mx-auto w-full my-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
          <Sparkles className="size-3.5" />
          <span>Agenda ORC • Tecnologia de Agendamento para Barbearias</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Agendamento rápido, sem senhas e com confirmação no WhatsApp.
        </h1>

        <p className="text-base sm:text-lg text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
          Página personalizada para sua barbearia colocar no Google Maps e no Instagram, com atendimento inteligente e zero conflito de horários.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/agenda/painel"
            className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl"
          >
            <span>Acessar Painel da Minha Barbearia</span>
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="https://eleva.oracio.uk"
            className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-[#1C1C1A] hover:bg-[#2B2B28] border border-[#2B2B28] text-white font-bold text-sm transition-all"
          >
            Conhecer o Eleva ORC
          </a>
        </div>
      </div>

      <footer className="text-center text-xs text-[#71717A] pt-8">
        © 2026 Agenda ORC • Uma plataforma do ecossistema Oracio
      </footer>
    </div>
  );
}
