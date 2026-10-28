'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Scissors,
  User,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Sparkles,
  CreditCard,
  AlertTriangle,
  LogOut,
  RefreshCw,
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bookings, setBookings] = useState<any[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'agenda' | 'pagamentos'>('agenda');

  // Tag própria da barbearia
  const [customTag, setCustomTag] = useState('');
  const [savingTag, setSavingTag] = useState(false);
  const [lateVoucherEnabled, setLateVoucherEnabled] = useState(true);
  const [savingVoucherSetting, setSavingVoucherSetting] = useState(false);

  // Carrega autenticação e barbearia ativa
  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Não autenticado');
        return res.json();
      })
      .then((data) => {
        setOwner(data);
        if (data.businesses && data.businesses.length > 0) {
          return fetch(`/api/v1/businesses?id=${data.businesses[0].id}`).then((r) => r.json());
        }
        return null;
      })
      .then((bizData) => {
        if (bizData?.business) {
          setBusiness(bizData.business);
          setCustomTag(bizData.business.infiniteTag || '');
          setLateVoucherEnabled(bizData.business.lateCancellationVoucherEnabled !== false);
        }
        setLoading(false);
      })
      .catch(() => {
        // Se não autenticado, permite navegar para login ou mock
        setLoading(false);
      });
  }, []);

  // Carrega agendamentos do dia selecionado
  useEffect(() => {
    if (!business?.id) return;
    // Carrega agendamentos
    fetch(`/api/v1/businesses/${business.id}/bookings?date=${selectedDate}`)
      .then((res) => (res.ok ? res.json() : { bookings: [] }))
      .then((data) => {
        setBookings(data.bookings || []);
      })
      .catch(() => setBookings([]));
  }, [business?.id, selectedDate]);

  const copyPublicLink = () => {
    if (!business?.slug) return;
    const url = `https://agenda.oracio.uk/${business.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveInfiniteTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id) return;
    setSavingTag(true);
    try {
      const res = await fetch(`/api/v1/businesses/${business.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ infiniteTag: customTag.trim() }),
      });
      if (!res.ok) throw new Error('Falha ao salvar tag');
      alert('Sua InfiniteTag foi salva com sucesso!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingTag(false);
    }
  };

  const handleToggleLateVoucher = async (enabled: boolean) => {
    if (!business?.id) return;
    setLateVoucherEnabled(enabled);
    setSavingVoucherSetting(true);
    try {
      const res = await fetch(`/api/v1/businesses/${business.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lateCancellationVoucherEnabled: enabled }),
      });
      if (!res.ok) throw new Error('Falha ao salvar configuração');
      const json = await res.json();
      setBusiness(json.business);
    } catch (err: any) {
      alert(err.message);
      setLateVoucherEnabled(!enabled);
    } finally {
      setSavingVoucherSetting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111110] flex items-center justify-center text-white p-4">
        <div className="size-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Se não estiver logado, exibe tela simplificada de login OTP
  if (!owner) {
    return <OwnerLoginFallback onLoginSuccess={() => window.location.reload()} />;
  }

  const publicUrl = `https://agenda.oracio.uk/${business?.slug || 'sua-barbearia'}`;

  return (
    <div className="min-h-screen bg-[#111110] text-[#EFECE5] py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER DO PAINEL */}
        <div className="bg-[#1C1C1A] border border-[#2B2B28] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              Painel Operacional Agenda ORC
            </span>
            <h1 className="text-2xl font-black text-white">{business?.cleanName || business?.name || 'Sua Barbearia'}</h1>
            <p className="text-xs text-[#A1A1AA]">Proprietário conectado: {owner.phone}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyPublicLink}
              className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="size-3.5" />
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link da Agenda'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-[#2B2B28] hover:bg-[#383735] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title="Sair do painel"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {/* BANNER DO LINK PÚBLICO */}
        <div className="bg-[#181816] border border-[#2B2B28] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-white">Seu link público para colocar no Google Meu Negócio e Instagram:</span>
            <span className="text-amber-400 font-mono block">{publicUrl}</span>
          </div>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#A1A1AA] hover:text-white flex items-center gap-1 font-semibold"
          >
            Visualizar Página <ExternalLink className="size-3.5" />
          </a>
        </div>

        {/* NAVEGAÇÃO POR ABAS */}
        <div className="flex gap-2 border-b border-[#2B2B28] pb-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('agenda')}
            className={`py-2 px-4 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'agenda' ? 'bg-[#2B2B28] text-white' : 'text-[#71717A] hover:text-white'
            }`}
          >
            Agenda do Dia
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pagamentos')}
            className={`py-2 px-4 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'pagamentos' ? 'bg-[#2B2B28] text-white' : 'text-[#71717A] hover:text-white'
            }`}
          >
            Pagamentos & InfinitePay
          </button>
        </div>

        {/* ABA: AGENDA DO DIA */}
        {activeTab === 'agenda' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Data:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#1C1C1A] border border-[#2B2B28] text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-[#1C1C1A] border border-[#2B2B28] rounded-3xl p-10 text-center space-y-3">
                <Clock className="size-10 text-[#71717A] mx-auto" />
                <h3 className="font-bold text-white text-sm">Nenhum corte agendado para esta data</h3>
                <p className="text-xs text-[#A1A1AA]">
                  Divulgue o seu link no botão de agendar do Google Meu Negócio e na bio do Instagram para receber agendamentos.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-[#1C1C1A] border border-[#2B2B28] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2B2B28] pb-2 text-xs">
                      <span className="font-bold text-white">{b.customerName}</span>
                      <span className="text-amber-400 font-mono font-bold">
                        {new Date(b.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs text-[#A1A1AA] space-y-1">
                      <p>Serviço: <strong className="text-white">{b.service?.name}</strong></p>
                      <p>Barbeiro: <strong className="text-white">{b.professional?.nickname || b.professional?.name}</strong></p>
                      <p>WhatsApp: <strong className="text-white">{b.customerPhoneE164}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: PAGAMENTOS & INFINITEPAY */}
        {activeTab === 'pagamentos' && (
          <div className="space-y-6">
            {/* CARD 1: CONFIGURAÇÃO DE RECEBIMENTO DIRETO DA BARBEARIA */}
            <div className="bg-[#1C1C1A] border border-[#2B2B28] rounded-3xl p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Opcional</span>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="size-5 text-emerald-400" />
                  <span>Receber Pagamentos Online dos Cortes via InfinitePay</span>
                </h2>
                <p className="text-xs text-[#A1A1AA]">
                  Se você tiver uma conta InfinitePay, digite sua InfiniteTag abaixo. Seus clientes poderão pagar o corte diretamente para você após agendar.
                </p>
              </div>

              <form onSubmit={handleSaveInfiniteTag} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Ex: $barbeariajoao"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  className="bg-[#111110] border border-[#3D3C3A] text-white rounded-xl px-4 py-2.5 text-xs flex-1 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={savingTag}
                  className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingTag ? 'Salvando...' : 'Salvar Tag'}
                </button>
              </form>
            </div>

            {/* CARD 2: INDICAÇÃO INFINITETAP (DOC 06) */}
            <div className="bg-[#181816] border border-[#2B2B28] rounded-3xl p-6 space-y-3">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Parceria Oficial</span>
              <h3 className="text-base font-bold text-white">Ainda não tem maquininha ou conta InfinitePay?</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Transforme o celular dos seus barbeiros em maquininha de cartão com o <strong>InfiniteTap</strong> e receba na hora com as menores taxas do mercado.
              </p>
              <a
                href="https://infinitepay.onelink.me/IGWD/estudio-orc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-[#2B2B28] hover:bg-[#383735] text-amber-400 font-bold text-xs transition-colors"
              >
                <span>Criar Conta InfinitePay com Benefício de Boas-Vindas</span>
                <ExternalLink className="size-3.5" />
              </a>
            </div>

            {/* CARD 3: POLÍTICA DE CANCELAMENTO TARDIO & VOUCHER 50% */}
            <div className="bg-[#1C1C1A] border border-[#2B2B28] rounded-3xl p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Política de Cancelamento</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🎟️</span>
                  <span>Voucher de 50% em Cancelamentos com Menos de 1h</span>
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Quando um cliente cancela com menos de 1h de antecedência um agendamento que foi <strong>pago antecipadamente</strong>, sua barbearia retém o valor recebido e emite automaticamente um cupom de 50% de desconto para o próximo agendamento dele. Caso o corte não tenha sido pago antecipadamente, nenhum cupom é gerado.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2B2B28]">
                <span className="text-xs font-semibold text-white">
                  Emitir cupom de desconto em cancelamento tardio pago
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lateVoucherEnabled}
                    disabled={savingVoucherSetting}
                    onChange={(e) => handleToggleLateVoucher(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2B2B28] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OwnerLoginFallback({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar código');
      if (data.devOtp) setDevCode(data.devOtp);
      setStep('VERIFY');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código incorreto');
      onLoginSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111110] flex items-center justify-center p-4 text-[#EFECE5]">
      <div className="w-full max-w-md bg-[#1C1C1A] border border-[#2B2B28] rounded-3xl p-7 space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Acesso do Proprietário</span>
          <h1 className="text-2xl font-black text-white">Entrar no Painel da Agenda</h1>
          <p className="text-xs text-[#A1A1AA]">Acesso passwordless seguro via WhatsApp</p>
        </div>

        {step === 'REQUEST' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white">Seu WhatsApp cadastrado:</label>
              <input
                type="tel"
                required
                placeholder="(33) 99999-8888"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#111110] border border-[#3D3C3A] text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Enviando código...' : 'Receber Código no WhatsApp'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white">Digite o código de 6 dígitos recebido:</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Ex: 482910"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#111110] border border-[#3D3C3A] text-white font-mono text-center tracking-widest rounded-xl p-3 text-lg focus:outline-none focus:border-amber-400"
              />
            </div>

            {devCode && (
              <p className="text-[11px] text-emerald-400 text-center font-mono">
                Código de simulação: <strong>{devCode}</strong>
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Acessar Meu Painel'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
