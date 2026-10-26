'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeaderProps {
  onAnalyzeClick?: () => void;
  shopName?: string | null;
}

export default function Header({ onAnalyzeClick, shopName }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 orc-glass border-b border-[#3D3C3A]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <a href="/" className="inline-flex items-center gap-2.5 group">
          <div className="size-9 rounded-xl bg-[#242422] border border-[#454441] flex items-center justify-center text-amber-400 group-hover:border-amber-400/60 transition-colors">
            <span className="font-black text-sm tracking-tighter">AB</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Eleva ORC
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-[#A1A1AA] hidden sm:block leading-none">
              Presença Digital • Google Maps
            </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#A1A1AA]">
          <a href="#resultados" className="transition hover:text-white">
            Resultados
          </a>
          <a href="#como-funciona" className="transition hover:text-white">
            Como Funciona
          </a>
          <a href="#precos" className="transition hover:text-white">
            Preços
          </a>
        </nav>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onAnalyzeClick}
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-[#EFECE5] hover:bg-[#E2DED6] text-[#111111] font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <span>{shopName ? 'Analisar Barbearia' : 'Analisar'}</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </header>
  );
}
