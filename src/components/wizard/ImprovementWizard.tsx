'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  Camera,
  Lock,
  MessageCircle,
  Plus,
  Printer,
  RotateCcw,
  Shield,
  Sparkles,
  Trash2,
  Wifi,
  Key,
} from 'lucide-react';
import QRCode from 'qrcode';
import { BarbershopLead, BarberCut } from '@/lib/types';
import { PLANS_CONFIG } from '@/lib/plans';

interface ImprovementWizardProps {
  lead: BarbershopLead;
  onBackToReport: () => void;
  onOpenCheckout: (planId: string) => void;
  onToast: (msg: string) => void;
}

export default function ImprovementWizard({
  lead,
  onBackToReport,
  onOpenCheckout,
  onToast,
}: ImprovementWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wifiSsid, setWifiSsid] = useState(`${lead.cleanName || lead.name} Wi-Fi`);
  const [wifiPassword, setWifiPassword] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Cortes editáveis
  const [cuts, setCuts] = useState<BarberCut[]>(
    lead.cuts || [
      { id: 'cut_1', name: 'Degradê / Fade Navalhado', price: 35, priceFormatted: 'R$ 35', durationMinutes: 40, imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80' },
      { id: 'cut_2', name: 'Barboterapia Completa', price: 25, priceFormatted: 'R$ 25', durationMinutes: 30, imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=400&q=80' },
      { id: 'cut_3', name: 'Corte + Barba + Sobrancelha', price: 55, priceFormatted: 'R$ 55', durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80' },
    ]
  );

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const downloadDualCanvasRef = useRef<HTMLCanvasElement>(null);
  const downloadSingleCanvasRef = useRef<HTMLCanvasElement>(null);

  // Link formatado para agendamento
  const waPhone = (lead.whatsapp || lead.phone || '33999482287').replace(/\D/g, '');
  const waMessage = encodeURIComponent(`Olá! Vim pelo Google Maps da ${lead.cleanName || lead.name} e gostaria de agendar um horário.`);
  const directWaBookingUrl = `https://wa.me/${waPhone}?text=${waMessage}`;

  // Bio estruturada
  const locationText = [lead.neighborhood, lead.city].filter(Boolean).join(', ') || 'sua região';
  const suggestedBio = `✂️ ${lead.cleanName || lead.name}\n💈 Cortes profissionais em ${locationText}\n📍 Agende seu horário no link abaixo 👇`;

  const copyToClipboard = (text: string, key: string, successMsg: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onToast(successMsg);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Renderiza Preview da Plaquinha no Canvas da Etapa 5
  useEffect(() => {
    if (currentStep !== 5) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 280;
    const height = 395;

    // Fundo
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Borda
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    // Título
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    let nameText = (lead.cleanName || lead.name).toUpperCase();
    if (nameText.length > 20) nameText = nameText.slice(0, 19) + '...';
    ctx.fillText(nameText, width / 2, 32);

    ctx.fillStyle = '#64748B';
    ctx.font = '600 7px sans-serif';
    const locHeader = [(lead.neighborhood || '').toUpperCase(), (lead.city || 'SUA REGIÃO').toUpperCase()].filter(Boolean).join(' • ');
    ctx.fillText(locHeader, width / 2, 45);

    // Linha divisória
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15, 54);
    ctx.lineTo(width - 15, 54);
    ctx.stroke();

    // Colunas
    const colW = 115;
    const colLeftX = 18;
    const colRightX = 147;
    const colY = 62;

    // Coluna Wi-Fi
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(colLeftX, colY, colW, 255);
    ctx.strokeStyle = '#CBD5E1';
    ctx.strokeRect(colLeftX, colY, colW, 255);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('📶 WI-FI GRÁTIS', colLeftX + colW / 2, colY + 18);

    // Coluna Google
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(colRightX, colY, colW, 255);
    ctx.strokeStyle = '#CBD5E1';
    ctx.strokeRect(colRightX, colY, colW, 255);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('AVALIAÇÃO NO GOOGLE', colRightX + colW / 2, colY + 18);

    // QR Codes
    const qrReviewUrl = lead.reviewUrl || `https://search.google.com/local/writereview?placeid=${lead.placeId || 'acelera'}`;
    const wifiString = wifiPassword ? `WIFI:S:${wifiSsid};T:WPA;P:${wifiPassword};;` : `WIFI:S:${wifiSsid};;`;

    const tempWifi = document.createElement('canvas');
    QRCode.toCanvas(tempWifi, wifiString, { width: 85, margin: 1 })
      .then(() => {
        ctx.drawImage(tempWifi, colLeftX + (colW - 85) / 2, colY + 30);
      })
      .catch(() => {});

    const tempGoogle = document.createElement('canvas');
    QRCode.toCanvas(tempGoogle, qrReviewUrl, { width: 85, margin: 1 })
      .then(() => {
        ctx.drawImage(tempGoogle, colRightX + (colW - 85) / 2, colY + 30);
      })
      .catch(() => {});

    // Caixa de texto neutro no Google (Conforme diretrizes éticas)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(colRightX + 6, colY + 130, colW - 12, 85);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(colRightX + 6, colY + 130, colW - 12, 85);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('SUA OPINIÃO CONTA', colRightX + colW / 2, colY + 148);

    ctx.fillStyle = '#475569';
    ctx.font = '500 7px sans-serif';
    ctx.fillText('Conte como foi sua', colRightX + colW / 2, colY + 165);
    ctx.fillText('experiência no Google', colRightX + colW / 2, colY + 177);

    // Rodapé
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('APONTE A CÂMERA DO CELULAR', width / 2, 345);

    ctx.fillStyle = '#64748B';
    ctx.font = '600 7px sans-serif';
    ctx.fillText('DISPLAY DE BALCÃO • ELEVA ORC', width / 2, 360);
  }, [currentStep, lead, wifiSsid, wifiPassword]);

  // Função para baixar a plaquinha em alta resolução (1240 x 1748 @ 300 DPI)
  const downloadHighResPlaque = async (onlyGoogle = false) => {
    const width = 1240;
    const height = 1748;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fundo
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Nome
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((lead.cleanName || lead.name).toUpperCase(), width / 2, 160);

    ctx.fillStyle = '#64748B';
    ctx.font = '600 24px sans-serif';
    const locDualHeader = [(lead.neighborhood || '').toUpperCase(), (lead.city || 'SUA REGIÃO').toUpperCase(), (lead.state || 'BRASIL').toUpperCase()].filter(Boolean).join(' • ');
    ctx.fillText(locDualHeader, width / 2, 215);

    const qrReviewUrl = lead.reviewUrl || `https://search.google.com/local/writereview?placeid=${lead.placeId || 'acelera'}`;

    if (!onlyGoogle) {
      // DUAL: WI-FI + GOOGLE
      const colW = 520;
      const colGap = 40;
      const leftColX = 80;
      const rightColX = leftColX + colW + colGap;
      const colY = 280;
      const colH = 1150;

      // Coluna Wi-Fi
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(leftColX, colY, colW, colH);
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 3;
      ctx.strokeRect(leftColX, colY, colW, colH);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('📶 WI-FI GRÁTIS', leftColX + colW / 2, colY + 70);

      const wifiString = wifiPassword ? `WIFI:S:${wifiSsid};T:WPA;P:${wifiPassword};;` : `WIFI:S:${wifiSsid};;`;
      const tempWifiCanvas = document.createElement('canvas');
      await QRCode.toCanvas(tempWifiCanvas, wifiString, { width: 380, margin: 1 });
      ctx.drawImage(tempWifiCanvas, leftColX + (colW - 380) / 2, colY + 140);

      // Coluna Google
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(rightColX, colY, colW, colH);
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 3;
      ctx.strokeRect(rightColX, colY, colW, colH);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('AVALIAÇÃO NO GOOGLE', rightColX + colW / 2, colY + 70);

      const tempGoogleCanvas = document.createElement('canvas');
      await QRCode.toCanvas(tempGoogleCanvas, qrReviewUrl, { width: 380, margin: 1 });
      ctx.drawImage(tempGoogleCanvas, rightColX + (colW - 380) / 2, colY + 140);

      // Caixa Neutra Google
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(rightColX + 30, colY + 580, colW - 60, 400);
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.strokeRect(rightColX + 30, colY + 580, colW - 60, 400);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('SUA OPINIÃO CONTA', rightColX + colW / 2, colY + 680);

      ctx.fillStyle = '#475569';
      ctx.font = '600 26px sans-serif';
      ctx.fillText('Conte como foi sua', rightColX + colW / 2, colY + 760);
      ctx.fillText('experiência no Google', rightColX + colW / 2, colY + 805);
    }

    // Rodapé
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('APONTE A CÂMERA DO CELULAR', width / 2, 1550);

    ctx.fillStyle = '#64748B';
    ctx.font = '500 24px sans-serif';
    ctx.fillText('DISPLAY DE BALCÃO A6 • ELEVA ORC • GOV. VALADARES', width / 2, 1610);

    // Download
    const safeSlug = (lead.slug || lead.name).toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
    const link = document.createElement('a');
    link.download = `plaquinha_${onlyGoogle ? 'google' : '2em1'}_${safeSlug}_a6_300dpi.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onToast('Plaquinha em alta resolução (300 DPI) baixada com sucesso!');
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4 space-y-6">
      {/* Barra de Navegação Superior */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToReport}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="size-4" />
          <span>Voltar para o Relatório</span>
        </button>

        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/30 uppercase tracking-wider">
          Passo {currentStep} de 5
        </span>
      </div>

      {/* CARD PRINCIPAL DO WIZARD (DARK MATTE) */}
      <div className="bg-[#2B2B29] border border-[#3D3C3A] rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl text-white">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-[#383735] pb-4">
          {[1, 2, 3, 4, 5].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setCurrentStep(st)}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                currentStep === st
                  ? 'text-amber-400 scale-105'
                  : currentStep > st
                  ? 'text-emerald-400'
                  : 'text-[#71717A]'
              }`}
            >
              <div
                className={`size-7 sm:size-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                  currentStep === st
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                    : currentStep > st
                    ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                    : 'border-[#454441] bg-[#1E1E1C] text-[#71717A]'
                }`}
              >
                {currentStep > st ? <Check className="size-3.5 stroke-[3]" /> : st}
              </div>
              <span className="text-[9px] font-bold hidden sm:block">
                {st === 1 ? 'Instagram' : st === 2 ? 'Google' : st === 3 ? 'Serviços' : st === 4 ? 'Comodidades' : 'Plaquinha'}
              </span>
            </button>
          ))}
        </div>

        {/* ETAPA 1: INSTAGRAM & LINK WHATSAPP (GRATUITO) */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Etapa 1 • 100% Gratuito
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Link de Agendamento Direto no WhatsApp
              </h2>
              <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                Facilite a vida do seu cliente: quando ele clicar no seu perfil do Google ou Instagram, o WhatsApp já abre com mensagem pronta para corte.
              </p>
            </div>

            {/* Link Direto */}
            <div className="space-y-2 bg-[#1E1E1C] border border-[#383735] rounded-2xl p-4">
              <label className="text-xs font-semibold text-[#D4D4D8] block">
                Seu link de agendamento pronto:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={directWaBookingUrl}
                  className="w-full bg-[#242422] border border-[#454441] rounded-xl px-3 py-2 text-xs text-white truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(directWaBookingUrl, 'wa_link', 'Link de agendamento copiado!')}
                  className="py-2 px-3.5 rounded-xl bg-[#EFECE5] hover:bg-[#E2DED6] text-[#111111] font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedKey === 'wa_link' ? <Check className="size-3.5 text-emerald-700" /> : <Copy className="size-3.5" />}
                  <span>{copiedKey === 'wa_link' ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Bio Estruturada */}
            <div className="space-y-2 bg-[#1E1E1C] border border-[#383735] rounded-2xl p-4">
              <label className="text-xs font-semibold text-[#D4D4D8] block">
                Bio sugerida para o Instagram:
              </label>
              <textarea
                readOnly
                rows={3}
                value={suggestedBio}
                className="w-full bg-[#242422] border border-[#454441] rounded-xl p-3 text-xs text-white resize-none focus:outline-none"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(suggestedBio, 'bio', 'Texto da bio copiado!')}
                className="py-2 px-4 rounded-xl bg-[#2B2B29] hover:bg-[#32322F] text-[#D4D4D8] border border-[#454441] font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'bio' ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                <span>{copiedKey === 'bio' ? 'Bio copiada!' : 'Copiar Texto da Bio'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 2: APLICAÇÃO NO GOOGLE MAPS (GRATUITO) */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Etapa 2 • 100% Gratuito
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Como Aplicar no Google Meu Negócio
              </h2>
              <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                Aplicação manual assistida: siga o checklist abaixo no painel do Google para ativar seu link de agendamento no Maps.
              </p>
            </div>

            <div className="space-y-3 bg-[#1E1E1C] border border-[#383735] rounded-2xl p-4 text-xs text-[#D4D4D8]">
              <div className="flex items-start gap-3">
                <span className="size-5 rounded-full bg-amber-400 text-[#111111] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p>Abra o Google no seu celular e pesquise por <em>&quot;Meu Negócio&quot;</em> ou o nome da sua barbearia.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="size-5 rounded-full bg-amber-400 text-[#111111] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p>Toque em <strong>Editar Perfil</strong> e vá na seção <strong>Contato</strong>.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="size-5 rounded-full bg-amber-400 text-[#111111] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p>No campo <strong>Link de Agendamento</strong>, cole o link direto gerado no Passo 1.</p>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: CATÁLOGO DE CORTES & PREÇOS (GOOGLE PRO) */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#383735] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Etapa 3 • Google Pro
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Catálogo de Cortes & Serviços
                </h2>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                R$ 37
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              Barbearias que exibem fotos e preços dos serviços no Google convertem 4x mais clientes. Edite e adicione seus cortes:
            </p>

            <div className="space-y-2.5">
              {cuts.map((c, idx) => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-[#1E1E1C] border border-[#383735] rounded-xl text-xs">
                  <div className="size-11 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${c.imageUrl})` }}></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{c.name}</p>
                    <p className="text-[11px] text-amber-400 font-semibold">{c.priceFormatted} • {c.durationMinutes} min</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-amber-300">Quer ativar o catálogo completo no seu Google?</p>
                <p className="text-[#A1A1AA]">Nossa equipe assiste todo o preenchimento no seu perfil.</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenCheckout('google_pro')}
                className="py-2 px-3.5 rounded-xl bg-[#EFECE5] hover:bg-[#E2DED6] text-[#111111] font-bold text-xs shrink-0 cursor-pointer"
              >
                Ativar Google Pro
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 4: COMODIDADES & FILTROS (GOOGLE PRO) */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#383735] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Etapa 4 • Google Pro
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Comodidades & Atributos Essenciais
                </h2>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                R$ 37
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              Atributos que qualificam sua barbearia quando o cliente busca e filtra no Google Maps:
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-xs text-[#D4D4D8]">
              {['Ar-condicionado', 'Wi-Fi gratuito', 'Aceita Pix e Cartão', 'Cerveja / Café cortesia', 'Estacionamento fácil', 'Atendimento com horário'].map((attr, idx) => (
                <div key={idx} className="p-3 bg-[#1E1E1C] border border-[#383735] rounded-xl flex items-center gap-2">
                  <Check className="size-4 text-emerald-400 shrink-0" />
                  <span>{attr}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ETAPA 5: PLAQUINHA 2 EM 1 DE BALCÃO (A6 300 DPI) */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#383735] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Etapa 5 • Display de Balcão
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Plaquinha de Balcão 2 em 1
                </h2>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md border border-emerald-400/20">
                100% Digital A6
              </span>
            </div>

            {/* Inputs de Wi-Fi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 text-xs">
                <label className="text-[#D4D4D8] font-semibold flex items-center gap-1.5">
                  <Wifi className="size-3.5 text-amber-400" /> Nome da Rede Wi-Fi:
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full bg-[#1E1E1C] border border-[#454441] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[#D4D4D8] font-semibold flex items-center gap-1.5">
                  <Key className="size-3.5 text-amber-400" /> Senha (opcional):
                </label>
                <input
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="Deixe vazio se for aberta"
                  className="w-full bg-[#1E1E1C] border border-[#454441] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Canvas Preview da Plaquinha */}
            <div className="text-center pt-2">
              <div className="inline-block bg-white p-2.5 rounded-2xl border border-gray-300 shadow-md">
                <canvas ref={previewCanvasRef} width={280} height={395} className="rounded-xl" />
              </div>
              <p className="text-[10px] text-[#A1A1AA] mt-2">
                Preview ao vivo do display A6 para balcão
              </p>
            </div>

            {/* Dicas Práticas de Impressão */}
            <div className="bg-[#1E1E1C] border border-[#383735] rounded-2xl p-4 text-xs space-y-2 text-left">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <Printer className="size-4" />
                <span>Como imprimir sua plaquinha profissionalmente:</span>
              </div>
              <ul className="text-[11px] text-[#A1A1AA] space-y-1 list-disc list-inside">
                <li><strong className="text-white">Papel:</strong> Fotográfico A6 (10x15cm), gramatura de 180g a 230g.</li>
                <li><strong className="text-white">Custo médio:</strong> R$ 2 a R$ 4 em qualquer gráfica rápida de GV.</li>
                <li><strong className="text-white">Exposição:</strong> Display acrílico de mesa (tipo T invertido) no caixa ou balcão.</li>
              </ul>
            </div>

            {/* Botões de Download */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => downloadHighResPlaque(false)}
                className="w-full py-3.5 px-5 bg-[#EFECE5] hover:bg-[#E2DED6] text-[#111111] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Download className="size-4" />
                <span>Baixar Plaquinha 2 em 1 em Alta Definição (300 DPI)</span>
              </button>

              <button
                type="button"
                onClick={() => downloadHighResPlaque(true)}
                className="w-full py-2.5 px-4 bg-[#242422] hover:bg-[#2F2F2D] text-[#D4D4D8] border border-[#454441] font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Baixar Versão Apenas Google (Sem Wi-Fi)</span>
              </button>
            </div>
          </div>
        )}

        {/* NAVEGAÇÃO DE PASSOS (VOLTAR / AVANÇAR) */}
        <div className="flex items-center justify-between border-t border-[#383735] pt-4">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="py-2 px-3.5 rounded-xl bg-[#242422] hover:bg-[#2F2F2D] text-[#D4D4D8] border border-[#454441] font-medium text-xs flex items-center gap-1 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="size-3.5" /> Voltar
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
              className="py-2 px-5 rounded-xl bg-[#EFECE5] hover:bg-[#E2DED6] text-[#111111] font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              Próximo <ChevronRight className="size-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenCheckout('google_pro')}
              className="py-2 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#111111] font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              Ativar Pacote Completo <Sparkles className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
