'use client';

import React from 'react';
import { MapPin, MessageCircle, Camera, ShieldCheck, Star } from 'lucide-react';

export default function MarqueeTrust() {
  const items = [
    { label: 'Google Maps Local', icon: MapPin },
    { label: 'Instagram Barbearias', icon: Camera },
    { label: 'WhatsApp Agendamento', icon: MessageCircle },
    { label: 'Governador Valadares • MG', icon: MapPin },
    { label: 'Display de Balcão A6', icon: ShieldCheck },
    { label: 'Avaliações Espontâneas', icon: Star },
  ];

  return (
    <div className="w-full py-6 overflow-hidden border-y border-[#3D3C3A]/50 bg-[#19181D]/80">
      <div className="mx-auto max-w-7xl px-4 text-center mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#71717A]">
          Metodologia de Presença Digital Aplicada em Barbearias
        </p>
      </div>

      <div className="flex items-center gap-8 justify-center flex-wrap px-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242422] border border-[#3D3C3A] text-xs font-semibold text-[#D4D4D8] shadow-xs"
            >
              <Icon className="size-3.5 text-amber-400" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
