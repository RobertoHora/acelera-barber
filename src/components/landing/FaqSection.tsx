'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'O que é o Eleva ORC e como ele ajuda minha barbearia?',
    answer:
      'O Eleva ORC é um ecossistema completo para barbearias dominarem as buscas locais no Google Maps e aumentarem sua autoridade digital. Ele identifica gargalos no seu perfil comercial, organiza seu catálogo de serviços com fotos e preços padronizados, e fornece displays inteligentes com QR Code para coletar avaliações reais diretamente dos clientes que sentam na sua cadeira.',
  },
  {
    question: 'Vocês pedem acesso ou senha da minha conta do Google?',
    answer:
      'Nunca. Não solicitamos nenhuma senha, acesso administrativo ou dado confidencial da sua conta Google ou Instagram. Você recebe o guia passo a passo pronto, o catálogo estruturado e o display QR que você mesmo posiciona no seu balcão.',
  },
  {
    question: 'A plaquinha QR Code realmente funciona para aumentar avaliações?',
    answer:
      'Sim. O maior obstáculo para receber avaliações é o atrito do cliente ter que pesquisar sua barbearia pelo nome. Com o QR Code direcionado exatamente para a tela de avaliação do seu perfil comercial, o cliente aponta o celular no momento do pagamento e conclui a avaliação em menos de 10 segundos.',
  },
  {
    question: 'O método de avaliações respeita as diretrizes oficiais do Google?',
    answer:
      '100% de conformidade. Não fazemos "review gating" (filtragem forçada de notas) nem compramos avaliações falsas — práticas que o Google penaliza com suspensão de perfil. As avaliações são genuínas, escritas por pessoas reais que frequentaram fisicamente a sua barbearia.',
  },
  {
    question: 'Tem alguma mensalidade oculta ou contrato de fidelidade?',
    answer:
      'Nenhuma mensalidade. Nossos pacotes (Google Pro por R$ 37 e Completo + Plaquinha por R$ 57) são de pagamento único. Você paga uma única vez e utiliza o material e o catálogo para sempre, sem nenhuma cobrança recorrente.',
  },
  {
    question: 'Como recebo os materiais e os arquivos de impressão?',
    answer:
      'Assim que a confirmação do pagamento é processada, você recebe imediatamente o link direto para download do pacote completo em alta resolução (PDF vetorizado pronto para gráfica nos padrões A6 e adesivo quadrado 10x10cm), além do acesso ao painel do catálogo e ao guia de otimização de perfil.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28 border-t border-white/[0.08] bg-transparent">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div data-reveal="up" className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-200">
            <HelpCircle className="size-3.5" /> Dúvidas Frequentes
          </div>
          <h2 className="studio-display-type mt-4 text-balance text-4xl leading-[1.04] sm:text-5xl text-white">
            Perguntas mais comuns sobre o{' '}
            <span className="text-[var(--orc-amber-500)]">Eleva ORC</span>
          </h2>
          <p className="mt-4 text-base text-[var(--orc-text-secondary)] sm:text-lg">
            Tudo o que você precisa saber antes de transformar a presença da sua barbearia.
          </p>
        </div>

        <div className="space-y-4" data-reveal="up" data-reveal-delay="1">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-[var(--orc-amber-500)]/40 bg-white/[0.04] shadow-[0_4px_24px_rgba(245,154,47,0.08)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-semibold text-white pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-xl transition-transform duration-300 ${
                      isOpen
                        ? 'rotate-180 bg-[var(--orc-amber-500)] text-slate-950'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    <ChevronDown className="size-4" />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base leading-relaxed text-slate-300 border-t border-white/[0.06] pt-4 animate-fadeIn">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
