'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';

import { BarbershopLead } from '@/lib/types';
import { findLeadBySlugOrId } from '@/lib/leads';

import LandingExperience from '@/components/landing/LandingExperience';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import MetricsBar from '@/components/landing/MetricsBar';
import ResultsSection from '@/components/landing/ResultsSection';
import Testimonials3D from '@/components/orc/Testimonials3D';
import WorkflowSection from '@/components/landing/WorkflowSection';
import PricingSection from '@/components/landing/PricingSection';
import FaqSection from '@/components/landing/FaqSection';
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
    <div className="orc-app min-h-screen bg-[#19181D] text-white flex flex-col justify-between selection:bg-[#3D3C3A]">
      <LandingExperience />

      {/* TOAST FLUTUANTE */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#111111] border border-[#3D3C3A] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm font-medium animate-bounce">
          <Check className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW: ONBOARDING CINEMATOGRÁFICO (8 A 10 SEGUNDOS) */}
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

          <main data-studio-page className="flex-1 overflow-x-hidden">
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

            <Testimonials3D />

            <WorkflowSection />

            <PricingSection onSelectPlan={handleOpenCheckout} />

            <FaqSection />

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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#19181D] flex items-center justify-center text-[#A1A1AA] text-xs">
          Carregando Eleva ORC...
        </div>
      }
    >
      <AceleraBarberApp />
    </Suspense>
  );
}
