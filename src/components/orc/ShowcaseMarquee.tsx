'use client';

import React from 'react';
import Image from 'next/image';

const DETERMINISTIC_ROTATIONS = [-2, 1, -1.5, 2, -1, 1.5, -2, 2, -1.5, 1, -1, 2, 0.5, -1.5, 1, -2];

const BARBER_SHOWCASE_IMAGES = [
  {
    id: 'fade-01',
    title: 'Mid Fade Alinhado',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'beard-02',
    title: 'Barboterapia & Toalha Quente',
    url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cut-03',
    title: 'Corte Clássico Executivo',
    url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'taper-04',
    title: 'Taper Fade Moderno',
    url: 'https://images.unsplash.com/photo-1517832606589-7629c339590a?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'studio-05',
    title: 'Bancada e Estilo Vintage',
    url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'razor-06',
    title: 'Navalha e Alinhamento',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'buzz-07',
    title: 'Buzz Cut Degradê',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'pompadour-08',
    title: 'Pompadour Texturizado',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
  },
];

interface ShowcaseMarqueeProps {
  className?: string;
  pauseOnHover?: boolean;
  vignetteColor?: string;
}

export default function ShowcaseMarquee({
  className = '',
  pauseOnHover = true,
  vignetteColor = '#19181D',
}: ShowcaseMarqueeProps) {
  // Duplicamos a lista para loop infinito e sem emendas
  const stream = [...BARBER_SHOWCASE_IMAGES, ...BARBER_SHOWCASE_IMAGES];

  const topGradient = `linear-gradient(to bottom, ${vignetteColor}, transparent)`;
  const bottomGradient = `linear-gradient(to top, ${vignetteColor}, transparent)`;

  return (
    <div
      className={`group relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}
      aria-label="Vitrine de cortes e presenças transformadas no Eleva ORC"
    >
      {/* Vinhetas superior e inferior */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16"
        style={{ background: topGradient }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8"
        style={{ background: bottomGradient }}
      />

      <div
        className={`flex w-max animate-[marquee_45s_linear_infinite] items-end gap-3 sm:gap-5 ${
          pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''
        }`}
      >
        {stream.map((item, index) => {
          const rotation = DETERMINISTIC_ROTATIONS[index % DETERMINISTIC_ROTATIONS.length];

          return (
            <div
              key={`${item.id}-${index}`}
              style={{
                transform: `rotate(${rotation}deg)`,
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, black 10%, black 92%, transparent 100%)',
                maskImage:
                  'linear-gradient(to bottom, transparent 0%, black 10%, black 92%, transparent 100%)',
              }}
              className="relative aspect-[9/16] h-[40dvh] sm:h-[48dvh] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#141318] shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-105 hover:border-white/30"
            >
              <Image
                src={item.url}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 180px, 240px"
                className="object-cover transition-transform duration-500 hover:scale-110"
                loading="lazy"
              />

              {/* Gradiente interno na base do card com título */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-3">
                <span className="text-[11px] font-semibold text-slate-200 truncate">
                  {item.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
