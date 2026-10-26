'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, Search, MapPin, Loader2, Store, Sparkles } from 'lucide-react';
import { BarbershopLead } from '@/lib/types';
import { searchLocalLeads } from '@/lib/leads';

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
      // 1. Busca local nas 123 barbearias de GV
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
      <form onSubmit={handleSubmit} className="orc-glass rounded-2xl p-2.5 sm:p-3 space-y-2.5">
        {recognizedLead ? (
          // CARD DE BARBEARIA RECONHECIDA
          <div className="flex items-center justify-between gap-3 p-3 bg-[#1E1E1C] border border-[#3D3C3A] rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              {recognizedLead.featuredImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={recognizedLead.featuredImageUrl}
                  alt={recognizedLead.name}
                  className="size-11 sm:size-12 rounded-xl object-cover border border-[#454441] shrink-0"
                />
              ) : (
                <div className="size-11 sm:size-12 rounded-xl bg-[#2B2B29] border border-[#454441] flex items-center justify-center text-amber-400 shrink-0">
                  <Store className="size-5" />
                </div>
              )}
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  <Check className="size-3 stroke-[3]" /> Barbearia reconhecida
                </span>
                <strong className="block text-sm sm:text-base font-extrabold text-white truncate">
                  {recognizedLead.cleanName || recognizedLead.name}
                </strong>
                <p className="text-[11px] text-[#A1A1AA] truncate">
                  {recognizedLead.neighborhood || 'Governador Valadares'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="py-3 px-5 sm:px-7 rounded-xl bg-[#EFECE5] hover:bg-[#E2DED6] text-[#111111] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <span>Analisar</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        ) : (
          // INPUT DE DIGITAÇÃO / LINK DO GOOGLE MAPS
          <div className="space-y-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 size-4 text-[#A1A1AA]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cole o link do Google Maps ou digite o nome da barbearia..."
                className="w-full bg-[#1E1E1C] border border-[#454441] rounded-xl pl-10 pr-24 py-3.5 text-xs sm:text-sm text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={loading && !searchTerm}
                className="absolute right-1.5 py-2 px-4 rounded-lg bg-[#EFECE5] hover:bg-[#E2DED6] text-[#111111] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <span>Analisar</span>}
              </button>
            </div>
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
                className="w-full text-left p-3 hover:bg-[#2B2B29] transition-colors flex items-center justify-between gap-2"
              >
                <div className="truncate">
                  <p className="font-bold text-xs sm:text-sm text-white truncate">
                    {lead.cleanName || lead.name}
                  </p>
                  <p className="text-[11px] text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3 text-amber-400" />
                    <span>{lead.neighborhood || 'Governador Valadares'}</span>
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
          <span className="hidden sm:inline">Governador Valadares • MG</span>
        </div>
      </form>
    </div>
  );
}
