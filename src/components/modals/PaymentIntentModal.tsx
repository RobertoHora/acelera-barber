'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, MessageCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { BarbershopLead } from '@/lib/types';
import { PLANS_CONFIG, INFINITEPAY_CONFIG, resolvePlanConfig } from '@/lib/plans';

interface PaymentIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  lead: BarbershopLead;
  onSuccessToast?: (msg: string) => void;
}

export default function PaymentIntentModal({
  isOpen,
  onClose,
  planId,
  lead,
  onSuccessToast,
}: PaymentIntentModalProps) {
  const [clientWhatsapp, setClientWhatsapp] = useState(lead.whatsapp || lead.phone || '');

  if (!isOpen) return null;

  const config = resolvePlanConfig(planId) || PLANS_CONFIG.eleva_google_pro;
  const targetLink = INFINITEPAY_CONFIG.links[config.id as keyof typeof INFINITEPAY_CONFIG.links] || '';

  const handlePayClick = () => {
    // Registra intenção local não sensível (Doc 06 - INFINITEPAY_MANUAL)
    const intentRecord = {
      planId: config.id,
      planName: config.name,
      price: config.price,
      businessName: lead.cleanName || lead.name,
      clientPhone: clientWhatsapp.trim(),
      status: targetLink ? 'PAYMENT_LINK_OPENED' : 'AWAITING_PAYMENT_LINK',
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('acelera_barber_purchase_intent', JSON.stringify(intentRecord));
    } catch (e) {
      console.warn('LocalStorage inacessível:', e);
    }

    if (targetLink && targetLink.startsWith('https://')) {
      window.open(targetLink, '_blank', 'noopener,noreferrer');
      if (onSuccessToast) onSuccessToast('Abrindo checkout seguro InfinitePay...');
    } else {
      const msg = encodeURIComponent(
        `Olá! Quero ativar o plano ${config.name} (${config.priceFormatted}) para a barbearia ${lead.cleanName || lead.name}. Podem me enviar o link oficial da InfinitePay?`
      );
      const url = `https://wa.me/${INFINITEPAY_CONFIG.supportPhone}?text=${msg}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      if (onSuccessToast) onSuccessToast('Abrindo suporte no WhatsApp para envio do link...');
    }
  };

  const handleSendProof = () => {
    const intentRecord = {
      planId: config.id,
      planName: config.name,
      price: config.price,
      businessName: lead.cleanName || lead.name,
      clientPhone: clientWhatsapp.trim(),
      status: 'PROOF_SUBMISSION_REQUESTED',
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('acelera_barber_purchase_intent', JSON.stringify(intentRecord));
    } catch (e) {
      console.warn('LocalStorage inacessível:', e);
    }

    onClose();

    const msg = encodeURIComponent(
      `Olá! Realizei o pagamento de ${config.priceFormatted} referente ao plano ${config.name} da barbearia ${lead.cleanName || lead.name}. Segue o comprovante para conferência humana e liberação.`
    );
    const url = `https://wa.me/${INFINITEPAY_CONFIG.supportPhone}?text=${msg}`;
    if (onSuccessToast) onSuccessToast('Abrindo WhatsApp para envio do comprovante...');
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#2B2B29] border border-[#3D3C3A] rounded-2xl p-5 max-w-md w-full space-y-4 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#383735] pb-2.5">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Ativação Segura • InfinitePay</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Detalhes do Plano */}
        <div className="space-y-3 text-xs leading-relaxed text-[#D4D4D8]">
          <div className="p-3 bg-[#242422] border border-[#454441] rounded-xl space-y-1">
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-semibold">
              Plano Selecionado
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{config.name}</span>
              <span className="text-sm font-black text-amber-400">{config.priceFormatted}</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">{config.description}</p>
          </div>

          {/* Como funciona o pagamento */}
          <div className="space-y-2 text-[11px] bg-[#1E1E1C] border border-[#383735] rounded-xl p-3">
            <p className="font-semibold text-white">Como funciona o pagamento seguro (Estilo Estúdio ORC):</p>
            <ol className="list-decimal list-inside space-y-1.5 text-[#A1A1AA]">
              <li>
                <strong className="text-[#D4D4D8]">Pagamento oficial:</strong> Pague via Pix ou Cartão no checkout seguro InfinitePay.
              </li>
              <li>
                <strong className="text-[#D4D4D8]">Envio do comprovante:</strong> Envie o comprovante diretamente no WhatsApp do suporte.
              </li>
              <li>
                <strong className="text-[#D4D4D8]">Liberação imediata:</strong> O operador confere os dados manualmente e envia seu material pronto.
              </li>
            </ol>
            <p className="text-[10px] text-[#71717A] pt-1">
              *Garantia incondicional de 7 dias com estorno imediato se não ficar satisfeito.
            </p>
          </div>

          {/* Input de WhatsApp */}
          <div className="space-y-1">
            <label className="block font-semibold text-[#D4D4D8]">
              WhatsApp da sua barbearia para contato:
            </label>
            <input
              type="text"
              value={clientWhatsapp}
              onChange={(e) => setClientWhatsapp(e.target.value)}
              placeholder="DDD + Número do WhatsApp"
              className="w-full bg-[#242422] border border-[#4A4A48] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePayClick}
            className="w-full py-3 px-4 bg-[#EFECE5] hover:bg-[#E2DED6] text-[#111111] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <ExternalLink className="size-4 text-emerald-600" />
            <span>
              {targetLink
                ? `Pagar ${config.priceFormatted} na InfinitePay`
                : `Solicitar Link de ${config.priceFormatted} no WhatsApp`}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSendProof}
            className="w-full py-2.5 px-4 bg-[#242422] hover:bg-[#2F2F2D] text-[#D4D4D8] border border-[#454441] font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <MessageCircle className="size-4 text-emerald-400" />
            <span>Já paguei: Enviar Comprovante no WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#A1A1AA] hover:text-white py-1 text-center cursor-pointer transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
