'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, X } from 'lucide-react';

import { BarbershopLead } from '@/lib/types';
import { ALL_LEADS, findLeadBySlugOrId } from '@/lib/leads';

import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import MetricsBar from '@/components/landing/MetricsBar';
import ResultsSection from '@/components/landing/ResultsSection';
import WorkflowSection from '@/components/landing/WorkflowSection';
import PricingSection from '@/components/landing/PricingSection';
import FinalCtaBanner from '@/components/landing/FinalCtaBanner';
import Footer from '@/components/landing/Footer';

import CinematicOnboarding from '@/components/onboarding/CinematicOnboarding';
import ReportBenchmarkView from '@/components/report/ReportBenchmarkView';
import ImprovementWizard from '@/components/wizard/ImprovementWizard';

import PaymentIntentModal from '@/components/modals/PaymentIntentModal';
import LegalModal from '@/components/modals/LegalModal';

type AppView = 'landing' | 'onboarding' | 'report' | 'wizard';

function AceleraBarberApp() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<AppView>('landing');
  const [activeLead, setActiveLead] = useState<BarbershopLead | null>(null);

  // Modais
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState('google_pro');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inicialização e detecção de slug via URL
  useEffect(() => {
    const slugParam =
      searchParams.get('barber') ||
      searchParams.get('b') ||
      searchParams.get('slug') ||
      searchParams.get('loja');

    if (slugParam) {
      const found = findLeadBySlugOrId(slugParam);
      if (found) {
        setActiveLead(found);
      }
    } else {
      // Se não houver slug, não força seleção para exibir a busca limpa no Hero
      setActiveLead(null);
    }
  }, [searchParams]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleStartAnalysis = (leadToAnalyze?: BarbershopLead) => {
    const target = leadToAnalyze || activeLead;
    if (!target) {
      // Se clicou sem barbearia selecionada, rola até o input do Hero
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveLead(target);
    setView('onboarding');
  };

  const handleOpenCheckout = (planId: string) => {
    setCheckoutPlanId(planId);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#19181D] text-white flex flex-col justify-between">
      {/* TOAST FLUTUANTE */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#111111] border border-[#3D3C3A] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm font-medium animate-bounce">
          <Check className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW: ONBOARDING CINEMATOGRÁFICO (8 A 12 SEGUNDOS) */}
      {view === 'onboarding' && activeLead && (
        <CinematicOnboarding
          lead={activeLead}
          durationMs={10000}
          onComplete={() => setView('report')}
        />
      )}

      {/* VIEW: RELATÓRIO DE AUDITORIA & BENCHMARK COM OS 2 CONCORRENTES */}
      {view === 'report' && activeLead && (
        <ReportBenchmarkView
          lead={activeLead}
          onStartImprovements={() => setView('wizard')}
          onBackToLanding={() => setView('landing')}
        />
      )}

      {/* VIEW: WIZARD DE MELHORIAS (GRATUITAS E PAGAS) */}
      {view === 'wizard' && activeLead && (
        <ImprovementWizard
          lead={activeLead}
          onBackToReport={() => setView('report')}
          onOpenCheckout={handleOpenCheckout}
          onToast={showToast}
        />
      )}

      {/* VIEW: LANDING PAGE COMPLETA (ESTÚDIO ORC 1:1) */}
      {view === 'landing' && (
        <>
          <Header
            onAnalyzeClick={() => handleStartAnalysis()}
            shopName={activeLead?.cleanName || activeLead?.name}
          />

          <main className="flex-1">
            <HeroSection
              recognizedLead={activeLead}
              onSelectLead={(lead) => setActiveLead(lead)}
              onAnalyze={(lead) => handleStartAnalysis(lead)}
            />

            <MetricsBar />

            <ResultsSection
              barberName={activeLead?.cleanName || activeLead?.name}
              neighborhood={activeLead?.neighborhood}
            />

            <WorkflowSection />

            <PricingSection onSelectPlan={handleOpenCheckout} />

            <FinalCtaBanner
              onAnalyzeClick={() => handleStartAnalysis()}
              shopName={activeLead?.cleanName || activeLead?.name}
            />
          </main>

          <Footer onOpenLegal={() => setIsLegalModalOpen(true)} />
        </>
      )}

      {/* MODAL DE INTENÇÃO DE PAGAMENTO INFINITEPAY */}
      {activeLead && (
        <PaymentIntentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          planId={checkoutPlanId}
          lead={activeLead}
          onSuccessToast={showToast}
        />
      )}

      {/* MODAL DE TERMOS DE USO & PRIVACIDADE LGPD */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#19181D] flex items-center justify-center text-[#A1A1AA] text-xs">Carregando Acelera Barber...</div>}>
      <AceleraBarberApp />
    </Suspense>
  );
}
