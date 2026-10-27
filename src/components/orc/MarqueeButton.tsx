'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface MarqueeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: ReactNode;
  marqueeText?: string;
  icon?: ReactNode;
}

const DEFAULT_MARQUEE =
  '✦ DIAGNÓSTICO GRATUITO ✦ SEM CADASTRO ✦ GOOGLE MAPS & INSTAGRAM ✦ RESULTADO EM SEGUNDOS ✦ SEM ALTERAR SEU PERFIL ✦';

export default function MarqueeButton({
  label = 'Ver diagnóstico gratuito',
  marqueeText = DEFAULT_MARQUEE,
  type = 'button',
  disabled = false,
  className = '',
  icon,
  children,
  ...props
}: MarqueeButtonProps) {
  const content = children || label;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`group relative inline-flex min-w-0 max-w-full flex-col items-center justify-start transition-all duration-300 disabled:pointer-events-none disabled:opacity-70 ${className}`}
      {...props}
    >
      {/* 1. Botão Principal Completo (Amarelo Dourado com Brilho Refletivo) */}
      <div className="studio-button-type relative z-10 flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[var(--orc-amber-500)] via-[#fbb95a] to-[var(--orc-amber-500)] px-6 py-3 text-sm font-black uppercase text-slate-950 shadow-[0_4px_22px_rgba(245,154,47,0.35)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_0_28px_rgba(245,154,47,0.55)] active:scale-[0.98] sm:min-h-14 sm:px-7 sm:text-base">
        {/* Feixe de Luz / Brilho passando e refletindo pelo botão */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full animate-shine-sweep bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.65)_50%,transparent_80%)]"
        />

        {/* Linha de reflexo no topo estilo vidro/metal polido */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
        />

        <span className="relative z-10 flex items-center gap-2 tracking-wide font-extrabold">
          {icon}
          {content}
        </span>
      </div>

      {/* 2. Língua Horizontal Inferior (Com altura confortável, sem cortar o texto) */}
      <div className="relative z-0 -mt-2 flex h-7 w-[calc(100%-18px)] items-center overflow-hidden rounded-b-xl border border-t-0 border-white/[0.12] bg-[#141318] pt-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-md sm:h-[30px] sm:w-[calc(100%-24px)] sm:pt-2">
        <div className="absolute inset-y-0 left-0 flex w-max animate-[marquee_38s_linear_infinite] items-center pt-1.5 group-hover:[animation-play-state:paused] sm:pt-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <span
              key={index}
              className="flex shrink-0 items-center whitespace-nowrap px-2.5 text-[8.5px] font-medium uppercase tracking-[0.24em] text-amber-200/85 sm:text-[9px]"
            >
              {marqueeText}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
