'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  durationMinutes: number;
}

interface ProfessionalItem {
  id: string;
  name: string;
  nickname: string | null;
}

interface SlotItem {
  startsAt: string;
  displayTime: string;
  professionalId: string;
  professionalName: string;
}

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Etapa atual: 1 = Serviço, 2 = Horário, 3 = Dados e Confirmação, 4 = Concluído
  const [step, setStep] = useState(1);

  // Seleções
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedProId, setSelectedProId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  // Dados do Cliente
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);
  const [bookingToken, setBookingToken] = useState<string | null>(null);

  // Carrega dados da barbearia
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/v1/businesses?slug=${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Barbearia não encontrada');
        return res.json();
      })
      .then((data) => {
        setBusiness(data.business);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  // Carrega slots quando serviço ou data mudam
  useEffect(() => {
    if (!slug || !selectedService || !selectedDate) return;
    setLoadingSlots(true);
    fetch(
      `/api/v1/public/agenda/${slug}/slots?date=${selectedDate}&serviceId=${selectedService.id}&professionalId=${selectedProId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots || []);
        setSelectedSlot(null);
        setLoadingSlots(false);
      })
      .catch(() => {
        setSlots([]);
        setLoadingSlots(false);
      });
  }, [slug, selectedService, selectedDate, selectedProId]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot || !customerName.trim() || !customerPhone.trim()) {
      alert('Por favor, preencha seu nome e WhatsApp.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: selectedService.id,
          professionalId: selectedSlot.professionalId,
          startsAt: selectedSlot.startsAt,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'SLOT_UNAVAILABLE') {
          alert('Este horário acabou de ser reservado! Por favor, escolha outro horário.');
          setStep(2);
          return;
        }
        throw new Error(data.error || 'Erro ao realizar agendamento');
      }

      setCompletedBooking(data.booking);
      setBookingToken(data.bookingToken);
      setStep(4);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111110] flex items-center justify-center text-white p-4">
        <div className="animate-pulse space-y-3 text-center">
          <div className="size-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-[#A1A1AA]">Carregando barbearia...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-[#111110] flex items-center justify-center text-white p-4">
        <div className="bg-[#242422] border border-[#3D3C3A] rounded-2xl p-6 max-w-md text-center space-y-4">
          <AlertCircle className="size-10 text-amber-400 mx-auto" />
          <h1 className="text-xl font-bold">Barbearia não encontrada</h1>
          <p className="text-xs text-[#A1A1AA]">O link que você acessou pode estar incorreto ou a barbearia alterou o endereço.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111110] text-[#EFECE5] flex flex-col items-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-lg space-y-6">
        {/* CABEÇALHO DA BARBEARIA */}
        <div className="bg-[#1C1C1A] border border-[#2B2B28] rounded-3xl p-5 shadow-xl text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -z-10" />
          <h1 className="text-2xl font-black text-white tracking-tight">{business.cleanName || business.name}</h1>
          <p className="text-xs text-[#A1A1AA] flex items-center justify-center gap-1">
            <MapPin className="size-3 text-amber-400 shrink-0" />
            <span>{[business.neighborhood, business.city].filter(Boolean).join(', ') || 'Centro'}</span>
          </p>
        </div>

        {/* PROGRESSO EM ETAPAS */}
        {step < 4 && (
          <div className="flex items-center justify-between text-[11px] font-bold px-2 text-[#71717A]">
            <span className={step >= 1 ? 'text-amber-400' : ''}>1. Serviço</span>
            <span>•</span>
            <span className={step >= 2 ? 'text-amber-400' : ''}>2. Horário</span>
            <span>•</span>
            <span className={step >= 3 ? 'text-amber-400' : ''}>3. Confirmação</span>
          </div>
        )}

        {/* ETAPA 1: ESCOLHA DO SERVIÇO */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Scissors className="size-4 text-amber-400" />
              <span>Selecione o serviço</span>
            </h2>

            <div className="space-y-2.5">
              {business.services.map((svc: ServiceItem) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => {
                    setSelectedService(svc);
                    setStep(2);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedService?.id === svc.id
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-[#1C1C1A] border-[#2B2B28] hover:border-[#454441] text-[#D4D4D8]'
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-white">{svc.name}</h3>
                    <p className="text-xs text-[#A1A1AA]">{svc.description || 'Atendimento profissional de alto padrão.'}</p>
                    <span className="text-[11px] text-[#71717A] flex items-center gap-1 pt-0.5">
                      <Clock className="size-3" /> {svc.durationMinutes} minutos
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-amber-400">
                      R$ {(svc.priceCents / 100).toFixed(0)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ETAPA 2: ESCOLHA DA DATA E HORÁRIO */}
        {step === 2 && selectedService && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-[#A1A1AA] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> Voltar aos serviços
            </button>

            <div className="bg-[#1C1C1A] border border-[#2B2B28] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Serviço escolhido</span>
                <h3 className="text-sm font-bold text-white">{selectedService.name}</h3>
              </div>
              <span className="text-sm font-black text-amber-400">R$ {(selectedService.priceCents / 100).toFixed(0)}</span>
            </div>

            {/* Seleção de Barbeiro */}
            {business.professionals.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#A1A1AA]">Barbeiro de preferência:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProId('any')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border cursor-pointer ${
                      selectedProId === 'any'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-[#1C1C1A] border-[#2B2B28] text-[#A1A1AA]'
                    }`}
                  >
                    Qualquer disponível
                  </button>
                  {business.professionals.map((pro: ProfessionalItem) => (
                    <button
                      key={pro.id}
                      type="button"
                      onClick={() => setSelectedProId(pro.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border truncate cursor-pointer ${
                        selectedProId === pro.id
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                          : 'bg-[#1C1C1A] border-[#2B2B28] text-[#A1A1AA]'
                      }`}
                    >
                      {pro.nickname || pro.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seleção de Data */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#A1A1AA] flex items-center gap-1">
                <Calendar className="size-3.5 text-amber-400" /> Data do corte:
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#1C1C1A] border border-[#2B2B28] text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Grade de Horários */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#A1A1AA] flex items-center gap-1">
                <Clock className="size-3.5 text-amber-400" /> Horários disponíveis:
              </label>

              {loadingSlots ? (
                <div className="p-8 text-center text-xs text-[#A1A1AA]">Carregando horários livres...</div>
              ) : slots.length === 0 ? (
                <div className="p-6 bg-[#1C1C1A] border border-[#2B2B28] rounded-xl text-center text-xs text-[#A1A1AA]">
                  Nenhum horário livre nesta data. Tente escolher outro dia acima.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(s);
                        setStep(3);
                      }}
                      className={`py-3 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                        selectedSlot?.startsAt === s.startsAt
                          ? 'bg-amber-400 border-amber-400 text-black'
                          : 'bg-[#1C1C1A] border-[#2B2B28] hover:border-amber-400/50 text-white'
                      }`}
                    >
                      {s.displayTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ETAPA 3: DADOS DO CLIENTE (SEM LOGIN / SEM SENHA) */}
        {step === 3 && selectedService && selectedSlot && (
          <form onSubmit={handleBookingSubmit} className="space-y-5">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-[#A1A1AA] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> Voltar aos horários
            </button>

            {/* Resumo do Corte */}
            <div className="bg-[#1C1C1A] border border-[#2B2B28] rounded-2xl p-4 space-y-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Resumo do Agendamento</span>
              <div className="flex justify-between text-sm">
                <span className="text-[#A1A1AA]">{selectedService.name}</span>
                <span className="font-bold text-white">R$ {(selectedService.priceCents / 100).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#A1A1AA]">
                <span>Horário:</span>
                <span className="font-semibold text-white">{selectedSlot.displayTime} ({selectedDate.split('-').reverse().join('/')})</span>
              </div>
              <div className="flex justify-between text-xs text-[#A1A1AA]">
                <span>Profissional:</span>
                <span className="font-semibold text-white">{selectedSlot.professionalName}</span>
              </div>
            </div>

            {/* Inputs de Identificação Simples */}
            <div className="space-y-4 bg-[#1C1C1A] border border-[#2B2B28] rounded-2xl p-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white">Seu Nome Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#111110] border border-[#3D3C3A] text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white">Seu WhatsApp com DDD:</label>
                <input
                  type="tel"
                  required
                  placeholder="(33) 99999-8888"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#111110] border border-[#3D3C3A] text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-[#A1A1AA]">
                  Enviaremos a confirmação e o lembrete diretamente para o seu WhatsApp.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white">Observação (opcional):</label>
                <input
                  type="text"
                  placeholder="Ex: cortar degradê com disfarce navalhado"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#111110] border border-[#3D3C3A] text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Confirmando reserva...' : 'Confirmar Agendamento'}
            </button>
          </form>
        )}

        {/* ETAPA 4: SUCESSO E LINK DE AUTOATENDIMENTO */}
        {step === 4 && (
          <div className="bg-[#1C1C1A] border border-emerald-500/30 rounded-3xl p-6 text-center space-y-5 shadow-2xl">
            <CheckCircle2 className="size-16 text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Agendamento Confirmado!</h2>
              <p className="text-xs text-[#A1A1AA]">
                Seu horário está reservado com sucesso na {business.cleanName || business.name}.
              </p>
            </div>

            <div className="bg-[#111110] border border-[#2B2B28] rounded-2xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Serviço:</span>
                <span className="font-bold text-white">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Horário:</span>
                <span className="font-bold text-white">{selectedSlot?.displayTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Barbeiro:</span>
                <span className="font-bold text-white">{selectedSlot?.professionalName}</span>
              </div>
            </div>

            {bookingToken && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-[#A1A1AA]">
                  Guarde seu link exclusivo para reagendar ou cancelar quando quiser:
                </p>
                <a
                  href={`/agenda/b/${bookingToken}`}
                  className="block w-full py-3 rounded-xl bg-[#2B2B28] hover:bg-[#383735] text-amber-400 font-bold text-xs transition-colors"
                >
                  Gerenciar Meu Agendamento
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
