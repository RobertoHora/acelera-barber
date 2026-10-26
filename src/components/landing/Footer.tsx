'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FooterProps {
  onOpenLegal: () => void;
}

export default function Footer({ onOpenLegal }: FooterProps) {
  return (
    <footer className="border-t border-[#3D3C3A] bg-[#141317] py-10 text-xs text-[#A1A1AA]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-[#242422] border border-[#3D3C3A] flex items-center justify-center text-amber-400 font-black text-xs">
            AB
          </div>
          <div>
            <p className="font-bold text-white text-xs sm:text-sm">Acelera Barber</p>
            <p className="text-[10px] text-[#71717A]">
              Guia de Presença Digital para Barbearias de Governador Valadares • MG
            </p>
          </div>
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
            href="https://wa.me/5533999482287"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="size-3.5 text-emerald-400" />
            <span>Falar com Suporte no WhatsApp</span>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-[#71717A]">
          © {new Date().getFullYear()} Acelera Barber. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
