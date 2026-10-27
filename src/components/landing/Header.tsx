'use client';

import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { ORCBrand } from '@/components/orc/Brand';

interface HeaderProps {
  onAnalyzeClick?: () => void;
  shopName?: string | null;
}

export default function Header({ onAnalyzeClick, shopName }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 orc-glass border-b border-[#3D3C3A]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <a href="/" className="inline-flex items-center gap-2 group">
          <ORCBrand compact className="min-[400px]:hidden" />
          <ORCBrand className="hidden min-[400px]:inline-flex" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#A1A1AA]">
          <a href="#resultados" className="transition hover:text-white">
            Resultados
          </a>
          <a href="#depoimentos" className="transition hover:text-white">
            Depoimentos
          </a>
          <a href="#como-funciona" className="transition hover:text-white">
            Como Funciona
          </a>
          <a href="#precos" className="transition hover:text-white">
            Preços
          </a>
          <a href="#faq" className="transition hover:text-white">
            Dúvidas
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/5511920970370"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors"
          >
            <MessageCircle className="size-3.5" />
            <span>Suporte</span>
          </a>

          <button
            type="button"
            onClick={onAnalyzeClick}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-[#EFECE5] hover:bg-[#E2DED6] text-[#111111] font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>{shopName ? 'Analisar Barbearia' : 'Analisar Grátis'}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
