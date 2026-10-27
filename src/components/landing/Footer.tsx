'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { ORCBrand } from '@/components/orc/Brand';

interface FooterProps {
  onOpenLegal: () => void;
}

export default function Footer({ onOpenLegal }: FooterProps) {
  return (
    <footer className="border-t border-white/[0.08] bg-[#141318] py-10 text-xs text-[#A1A1AA]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <ORCBrand compact />
          <p className="text-[10px] text-[#71717A] hidden md:block">
            Ecossistema de Presença Digital e Google Maps para Barbearias
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
          <button
            type="button"
            onClick={onOpenLegal}
            className="hover:text-white transition-colors underline cursor-pointer"
          >
            Termos de Uso
          </button>
          <button
            type="button"
            onClick={onOpenLegal}
            className="hover:text-white transition-colors underline cursor-pointer"
          >
            Política de Privacidade
          </button>
          <a
            href="https://wa.me/5511920970370"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-white transition hover:bg-emerald-500"
          >
            <MessageCircle className="size-3.5" />
            <span>Suporte WhatsApp</span>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-[#71717A]">
          © {new Date().getFullYear()} Eleva ORC. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
