'use client';

import React, { useState } from 'react';
import { ArrowLeftRight, Check, Star, AlertCircle, Clock, MapPin, Phone } from 'lucide-react';

interface ProfileComparisonProps {
  initialPosition?: number;
  barberName?: string;
  neighborhood?: string;
}

export default function ProfileComparison({
  initialPosition = 50,
  barberName = 'Sua Barbearia',
  neighborhood = 'Governador Valadares',
}: ProfileComparisonProps) {
  const [position, setPosition] = useState(initialPosition);

  return (
    <div className="relative select-none overflow-hidden rounded-2xl border border-[#3D3C3A] bg-[#242422] shadow-2xl">
      {/* Container 16:10 aspect */}
      <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full overflow-hidden">
        
        {/* LADO DEPOIS (Direita / Fundo total) - Perfil Otimizado Eleva ORC */}
        <div className="absolute inset-0 bg-[#FFFFFF] text-[#202124] p-4 sm:p-6 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Header Google Maps Otimizado */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm sm:text-base text-[#202124] truncate max-w-[200px] sm:max-w-[280px]">
                    {barberName}
                  </h4>
                  <span className="p-0.5 rounded-full bg-[#1A73E8] text-white">
                    <Check className="size-2.5 sm:size-3 stroke-[3]" />
                  </span>
                </div>
                <p className="text-[11px] text-[#5F6368] flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3 text-[#1A73E8]" />
                  <span>{neighborhood} • Barbearia</span>
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                Aberto agora
              </span>
            </div>

            {/* Avaliação e Reviews Positivos */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#202124]">4.9</span>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[11px] text-[#5F6368] font-medium">(48 avaliações reais)</span>
            </div>

            {/* Catálogo de Cortes Ativo com Fotos */}
            <div className="pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A73E8] mb-1.5">
                Catálogo de Serviços & Fotos
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-[#F8F9FA] border border-[#DADCE0] p-1.5 text-center">
                  <div className="h-10 sm:h-12 rounded bg-cover bg-center mb-1" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80)' }}></div>
                  <span className="block text-[10px] font-bold text-[#202124] truncate">Degradê Fade</span>
                  <span className="block text-[9px] font-semibold text-[#1A73E8]">R$ 35</span>
                </div>
                <div className="rounded-lg bg-[#F8F9FA] border border-[#DADCE0] p-1.5 text-center">
                  <div className="h-10 sm:h-12 rounded bg-cover bg-center mb-1" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=300&q=80)' }}></div>
                  <span className="block text-[10px] font-bold text-[#202124] truncate">Barba Terapia</span>
                  <span className="block text-[9px] font-semibold text-[#1A73E8]">R$ 25</span>
                </div>
                <div className="rounded-lg bg-[#F8F9FA] border border-[#DADCE0] p-1.5 text-center">
                  <div className="h-10 sm:h-12 rounded bg-cover bg-center mb-1" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=300&q=80)' }}></div>
                  <span className="block text-[10px] font-bold text-[#202124] truncate">Corte + Barba</span>
                  <span className="block text-[9px] font-semibold text-[#1A73E8]">R$ 55</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé do Perfil Otimizado */}
          <div className="flex items-center justify-between border-t border-[#DADCE0] pt-2 text-[10px] text-[#5F6368]">
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <Check className="size-3" /> Plaquinha A6 no balcão ativa
            </span>
            <span className="font-bold text-[#1A73E8]">Agendar no WhatsApp →</span>
          </div>
        </div>

        {/* LADO ANTES (Esquerda / Máscara ClipPath) - Perfil Abandonado no Maps */}
        <div
          className="absolute inset-0 bg-[#1E1E1C] text-[#D4D4D8] p-4 sm:p-6 flex flex-col justify-between border-r border-amber-500/80 transition-[clip-path] duration-75"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <div className="space-y-3">
            {/* Header Abandonado */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-[280px]">
                  {barberName}
                </h4>
                <p className="text-[11px] text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3 text-[#A1A1AA]" />
                  <span>{neighborhood} • Barbearia</span>
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <AlertCircle className="size-2.5" /> Faltam dados
              </span>
            </div>

            {/* Avaliação Fraca / Estagnada */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-white">4.2</span>
              <div className="flex text-amber-500">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <Star className="size-3 text-[#71717A]" />
                <Star className="size-3 text-[#71717A]" />
              </div>
              <span className="text-[11px] text-[#A1A1AA] font-medium">(Apenas 3 avaliações • última há 1 ano)</span>
            </div>

            {/* Aviso de Ausência de Fotos e Catálogo */}
            <div className="rounded-xl border border-dashed border-[#454441] bg-[#242422] p-3 text-center space-y-1 my-1">
              <p className="text-xs font-semibold text-amber-300">
                ❌ Nenhuma foto recente de cortes
              </p>
              <p className="text-[10px] text-[#A1A1AA]">
                Sem catálogo de serviços, sem preços e sem botão de agendamento online no perfil.
              </p>
            </div>
          </div>

          {/* Rodapé do Perfil Abandonado */}
          <div className="flex items-center justify-between border-t border-[#383735] pt-2 text-[10px] text-[#A1A1AA]">
            <span className="text-red-400 font-semibold">❌ Clientes perdidos no Maps</span>
            <span className="italic">Perfil sem display</span>
          </div>
        </div>

        {/* Tags de Identificação nos Cantos */}
        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-between px-3 text-[10px] font-bold uppercase tracking-wider">
          <span className="rounded-full bg-black/80 border border-white/20 px-2.5 py-1 text-amber-400 backdrop-blur-md shadow-md">
            Antes • Perfil Vazio
          </span>
          <span className="rounded-full bg-emerald-600/90 border border-emerald-400/40 px-2.5 py-1 text-white backdrop-blur-md shadow-md">
            Depois • Eleva ORC
          </span>
        </div>

        {/* Linha Divisória e Alça de Arrasto */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)] cursor-ew-resize flex items-center justify-center pointer-events-none"
          style={{ left: `${position}%` }}
        >
          <div className="size-7 rounded-full bg-white text-[#111111] shadow-xl flex items-center justify-center border border-gray-300">
            <ArrowLeftRight className="size-3.5 stroke-[2.5]" />
          </div>
        </div>

        {/* Input Invisível para Controle do Slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
          aria-label="Comparativo de perfil Antes e Depois"
        />
      </div>

      {/* Legenda Informativa */}
      <div className="p-3 bg-[#1E1E1C] border-t border-[#383735] text-center">
        <p className="text-[11px] text-[#A1A1AA]">
          Arraste a linha para comparar o impacto visual de um perfil otimizado no Google Maps.
        </p>
      </div>
    </div>
  );
}
