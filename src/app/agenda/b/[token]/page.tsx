'use client';
import BookingPaymentPanel from '@/components/BookingPaymentPanel';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  Scissors,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Ticket,
} from 'lucide-react';

export default function BookingManagementPage() {
  const params = useParams();
  const token = params?.token as string;

  const [booking, setBooking] = useState<any>(null);
  const [canCancelFree, setCanCancelFree] = useState(true);
  const [noticeHours, setNoticeHours] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cancelling, setCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/v1/public/bookings/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error('Agendamento não encontrado');
        return res.json();
      })
      .then((data) => {
        setBooking(data.booking);
        setCanCancelFree(data.canCancelFree);
        setNoticeHours(data.cancellationNoticeHours || 1);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/v1/public/bookings/${token}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelado pelo cliente na página web' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cancelar');

      setBooking(data.booking);
      setCancelResult(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111110] flex items-center justify-center text-white p-4">
        <div className="animate-pulse space-y-2 text-center">
          <div className="size-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#A1A1AA]">Carregando agendamento...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#111110] flex items-center justify-center text-white p-4">
        <div className="bg-[#1C1C1A] border border-[#2B2B28] rounded-2xl p-6 max-w-sm text-center space-y-3">
          <AlertCircle className="size-10 text-amber-400 mx-auto" />
          <h1 className="text-lg font-bold text-white">Link Inválido ou Expirado</h1>
          <p className="text-xs text-[#A1A1AA]">Não encontramos nenhum agendamento correspondente a este link.</p>
        </div>
      </div>
    );
  }

  const isCancelled = booking.status.startsWith('CANCELLED');
  const formattedTime = new Date(booking.startsAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: booking.business?.timezone || 'America/Sao_Paulo',
  });
  const formattedDate = new Date(booking.startsAt).toLocaleDateString('pt-BR', {
    dateStyle: 'full',
    timeZone: booking.business?.timezone || 'America/Sao_Paulo',
  });

  const waPhone = (booking.business?.whatsapp || booking.business?.phone || '').replace(/\D/g, '');
  const waMsg = encodeURIComponent(`Olá! Tenho uma dúvida sobre meu agendamento na ${booking.business?.cleanName || booking.business?.name}.`);
  const waUrl = `https://wa.me/${waPhone}?text=${waMsg}`;

  return (
    <div className="min-h-screen bg-[#111110] text-[#EFECE5] flex flex-col items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {!isCancelled && booking.business.onlinePaymentsEnabled && <BookingPaymentPanel token={token} alreadyPaid={booking.isPrepaid}/>}
        {/* CABEÇALHO */}
        <div className="bg-[#1C1C1A] border border-[#2B2B28] rounded-3xl p-6 text-center space-y-3 shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20">
            {booking.business?.cleanName || booking.business?.name}
          </div>
          <h1 className="text-xl font-black text-white">Gerenciar Agendamento</h1>
          <p className="text-xs text-[#A1A1AA]">Cliente: {booking.customerName}</p>
        </div>

        {/* STATUS CARD */}
        <div className="bg-[#1C1C1A] border border-[#2B2B28] rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#2B2B28] pb-4">
            <span className="text-xs text-[#A1A1AA] font-bold">Status do Corte:</span>
            {isCancelled ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-400/10 px-2.5 py-0.5 rounded-full border border-red-400/20">
                <XCircle className="size-3.5" /> Cancelado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                <CheckCircle2 className="size-3.5" /> Confirmado
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <Scissors className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[#A1A1AA] block text-[10px] font-bold uppercase tracking-wider">Serviço</span>
                <span className="font-bold text-white text-sm">{booking.service?.name}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[#A1A1AA] block text-[10px] font-bold uppercase tracking-wider">Profissional</span>
                <span className="font-bold text-white">{booking.professional?.nickname || booking.professional?.name}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[#A1A1AA] block text-[10px] font-bold uppercase tracking-wider">Data e Horário</span>
                <span className="font-bold text-white text-sm">{formattedTime} — {formattedDate}</span>
              </div>
            </div>
          </div>

          {/* VOUCHER DE CANCELAMENTO TARDIO (TRAVA ANTI-REGRESSÃO #3) */}
          {cancelResult?.voucherCode && (
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-4 text-center space-y-2">
              <Ticket className="size-6 text-amber-400 mx-auto" />
              <h3 className="font-bold text-xs text-amber-300">Cupom de 50% de Desconto Liberado!</h3>
              <p className="text-[11px] text-[#D4D4D8]">
                Como seu agendamento foi cancelado com menos de 1h de antecedência, liberamos este cupom para seu próximo corte:
              </p>
              <div className="font-mono font-black text-base text-amber-400 tracking-wider bg-[#111110] py-2 rounded-lg border border-amber-400/40">
                {cancelResult.voucherCode}
              </div>
              <span className="text-[10px] text-[#71717A] block">Válido por 30 dias na {booking.business?.cleanName || booking.business?.name}.</span>
            </div>
          )}

          {/* AÇÕES */}
          {!isCancelled && (
            <div className="pt-3 space-y-3">
              {!canCancelFree && (
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-300/90 leading-relaxed">
                  ⚠️ Faltam menos de {noticeHours} hora(s) para o seu horário. Cancelamentos tardios liberam um cupom de 50% de desconto para o seu próximo agendamento.
                </div>
              )}

              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="w-full py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelling ? 'Cancelando...' : 'Cancelar este Agendamento'}
              </button>
            </div>
          )}
        </div>

        {/* CONTATO COM A BARBEARIA */}
        {waPhone && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl bg-[#1C1C1A] hover:bg-[#2B2B28] border border-[#2B2B28] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="size-4 text-emerald-400" />
            <span>Falar com a Barbearia no WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
}
