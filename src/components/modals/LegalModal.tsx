'use client';

import React from 'react';
import { X, FileText, Shield } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LegalModal({ isOpen, onClose }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#2B2B29] border border-[#3D3C3A] rounded-2xl p-5 sm:p-6 max-w-lg w-full max-h-[85vh] flex flex-col space-y-4 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#383735] pb-2.5 shrink-0">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <FileText className="size-4 text-amber-400" />
            <span>Termos de Uso & Política de Privacidade</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-3.5 text-xs text-[#D4D4D8] pr-1 leading-relaxed">
          <section className="space-y-1">
            <h4 className="font-semibold text-white text-xs">1. Natureza do Serviço</h4>
            <p className="text-[#A1A1AA]">
              O Eleva ORC é um guia operacional independente de presença digital e fornecimento de materiais gráficos digitais para barbearias. A ferramenta funciona no modelo assistido (<code className="text-amber-300">MANUAL_ASSISTED</code>), fornecendo orientações e arquivos prontos para aplicação manual pelo próprio estabelecimento ou com auxílio do nosso suporte.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-semibold text-white text-xs">2. Isenção de Vínculo com Terceiros</h4>
            <p className="text-[#A1A1AA]">
              O Eleva ORC é um serviço autônomo e <strong>não possui nenhum vínculo, afiliação, representação oficial, parceria ou endosso</strong> com o Google LLC (Google Meu Negócio/Maps) ou com a Meta Platforms, Inc. (Instagram/WhatsApp). Todos os nomes de marcas e logotipos mencionados pertencem a seus respectivos titulares.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-semibold text-white text-xs">3. Diretrizes de Avaliações Éticas (Sem Review Gating)</h4>
            <p className="text-[#A1A1AA]">
              Em total conformidade com as políticas do Google contra indução de notas, a plaquinha gerada contém mensagem rigorosamente neutra: <em>&quot;Conte como foi sua experiência no Google&quot;</em>. Não praticamos nem incentivamos filtragem de avaliações (&quot;review gating&quot;), nem promessas de notas artificiais ou induzidas.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-semibold text-white text-xs">4. Privacidade e Segurança de Dados (LGPD)</h4>
            <p className="text-[#A1A1AA]">
              Respeitamos a Lei Geral de Proteção de Dados (LGPD). Todos os dados preenchidos no diagnóstico e no formulário são mantidos localmente no navegador (LocalStorage) e não são comercializados ou compartilhados com terceiros. Nenhuma senha de rede Wi-Fi é registrada ou persistida externamente.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-semibold text-white text-xs">5. Garantia e Política de Reembolso</h4>
            <p className="text-[#A1A1AA]">
              Conforme o Artigo 49 do Código de Defesa do Consumidor, garantimos o direito de arrependimento em até 7 dias corridos após a contratação de qualquer plano assistido. Para solicitar reembolso integral, basta enviar uma mensagem ao nosso suporte no WhatsApp. O estorno será emitido via InfinitePay ou Pix.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-semibold text-white text-xs">6. Suporte e Contato</h4>
            <p className="text-[#A1A1AA]">
              Para dúvidas operacionais, solicitações de suporte ou reembolso, entre em contato pelo WhatsApp: <strong className="text-white">(33) 99948-2287</strong>.
            </p>
          </section>
        </div>

        <div className="pt-2 border-t border-[#383735] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#242422] hover:bg-[#2F2F2D] text-white border border-[#454441] rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Entendido e Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
