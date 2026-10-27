'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, Search, MapPin, Loader2, Store, Sparkles } from 'lucide-react';
import { BarbershopLead } from '@/lib/types';
import { searchLocalLeads } from '@/lib/leads';
import MarqueeButton from '@/components/orc/MarqueeButton';

interface StoreRecognitionFormProps {
  recognizedLead: BarbershopLead | null;
  onSelectLead: (lead: BarbershopLead) => void;
  onAnalyze: (lead: BarbershopLead) => void;
}

export default function StoreRecognitionForm({
  recognizedLead,
  onSelectLead,
  onAnalyze,
}: StoreRecognitionFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<BarbershopLead[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      // 1. Busca local nos leads cadastrados
      const localMatches = searchLocalLeads(searchTerm, 5);

      if (localMatches.length > 0) {
        setSuggestions(localMatches);
        setIsOpen(true);
        setLoading(false);
        return;
      }

      // 2. Fallback via API serverless
      try {
        const res = await fetch(`/api/search-barber?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setSuggestions(data.results);
            setIsOpen(true);
          } else {
            setSuggestions([]);
          }
        }
      } catch (e) {
        console.warn('Erro na busca online:', e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lead: BarbershopLead) => {
    onSelectLead(lead);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recognizedLead) {
      onAnalyze(recognizedLead);
    } else if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
      onAnalyze(suggestions[0]);
    }
  };

  return (
    <div ref={containerRef} className="w-full relative">
      <form onSubmit={handleSubmit} className="orc-glass rounded-2xl p-3 sm:p-4 space-y-3">
        {recognizedLead ? (
          // CARD DE BARBEARIA RECONHECIDA COM O BOTÃO PRINCIPAL MARQUEE
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 p-3.5 bg-[#1E1E1C] border border-[#3D3C3A] rounded-xl">
              <div className="flex items-center gap-3.5 min-w-0">
                {recognizedLead.featuredImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={recognizedLead.featuredImageUrl}
                    alt={recognizedLead.name}
                    className="size-12 sm:size-14 rounded-xl object-cover border border-[#454441] shrink-0"
                  />
                ) : (
                  <div className="size-12 sm:size-14 rounded-xl bg-[#2B2B29] border border-[#454441] flex items-center justify-center text-amber-400 shrink-0">
                    <Store className="size-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <Check className="size-3 stroke-[3]" /> Barbearia Reconhecida
                  </span>
                  <strong className="block text-sm sm:text-base font-extrabold text-white truncate">
                    {recognizedLead.cleanName || recognizedLead.name}
                  </strong>
                  <p className="text-[11px] text-[#A1A1AA] truncate">
                    {recognizedLead.neighborhood ? `Bairro ${recognizedLead.neighborhood}` : 'Perfil do Google Maps localizado'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectLead(null as unknown as BarbershopLead)}
                className="text-xs text-[#A1A1AA] hover:text-white underline cursor-pointer shrink-0 px-2 py-1"
              >
                Trocar
              </button>
            </div>

            <MarqueeButton
              type="submit"
              label="Ver Diagnóstico Gratuito"
              icon={<Sparkles className="size-4" />}
              className="w-full cursor-pointer"
            />
          </div>
        ) : (
          // INPUT DE DIGITAÇÃO / LINK DO GOOGLE MAPS + MARQUEE BUTTON
          <div className="space-y-3">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 size-4 text-[#A1A1AA]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cole o link do Google Maps ou digite o nome da barbearia..."
                className="w-full bg-[#1E1E1C] border border-[#454441] rounded-xl pl-10 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder:text-[#71717A] focus:outline-none focus:border-amber-400/70 transition-colors"
              />
            </div>

            <MarqueeButton
              type="submit"
              disabled={loading}
              label={loading ? 'Buscando barbearia...' : 'Analisar Barbearia Grátis'}
              icon={loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              className="w-full cursor-pointer"
            />
          </div>
        )}

        {/* DROPDOWN DE SUGESTÕES / MATCHES */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#242422] border border-[#3D3C3A] rounded-xl shadow-2xl overflow-hidden divide-y divide-[#383735] max-h-64 overflow-y-auto">
            <div className="px-3 py-1.5 bg-[#1E1E1C] text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
              Barbearias encontradas ({suggestions.length})
            </div>
            {suggestions.map((lead) => (
              <button
                key={lead.id || lead.slug}
                type="button"
                onClick={() => handleSelect(lead)}
                className="w-full text-left p-3 hover:bg-[#2B2B29] transition-colors flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="truncate">
                  <p className="font-bold text-xs sm:text-sm text-white truncate">
                    {lead.cleanName || lead.name}
                  </p>
                  <p className="text-[11px] text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3 text-amber-400" />
                    <span>{lead.neighborhood || 'Perfil Google Maps'}</span>
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#EFECE5] bg-[#383735] px-2 py-1 rounded-md shrink-0">
                  Selecionar →
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-1 text-[11px] text-[#A1A1AA]">
          <span>Sem cadastro. Sem cartão. 100% gratuito para analisar.</span>
          <span className="hidden sm:inline">Cobertura Nacional • Brasil</span>
        </div>
      </form>
    </div>
  );
}
