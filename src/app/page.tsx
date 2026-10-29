'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';

import {trackUiEvent} from '@/lib/ui-events';
import { BarbershopLead } from '@/lib/types';
import { findLeadBySlugOrId } from '@/lib/leads';

import LandingExperience from '@/components/landing/LandingExperience';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import Testimonials3D from '@/components/orc/Testimonials3D';
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

  const reconciledReturn=useRef('');
  useEffect(()=>{
    const orderNsu=searchParams.get('order_nsu')||searchParams.get('nsu');
    const transaction=searchParams.get('transaction_nsu');
    const invoice=searchParams.get('slug');
    if(!orderNsu||!transaction||!invoice||reconciledReturn.current===transaction)return;
    reconciledReturn.current=transaction;
    fetch(`/api/v1/orders/${encodeURIComponent(orderNsu)}/check`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transaction_nsu:transaction,slug:invoice})}).then(async r=>{
      if(!r.ok)throw Error('Pagamento em conferência. Você pode continuar quando a confirmação chegar.');
      setToastMessage('Pagamento confirmado. Seus benefícios estão liberados.');window.dispatchEvent(new Event('orc:benefits-updated'));
    }).catch(e=>setToastMessage(e.message));
  },[searchParams]);

  // Inicialização e detecção de slug via URL
  useEffect(() => {
    const slugParam =
      searchParams.get('barber') ||
      searchParams.get('b') ||
      searchParams.get('slug') ||
      searchParams.get('loja');

    if (slugParam) {
      const controller = new AbortController();
      fetch(`/api/v1/businesses/${encodeURIComponent(slugParam)}`,{signal:controller.signal}).then(r=>r.ok?r.json():null).then(data=>{
        if(data?.business){const b=data.business;setActiveLead({...b,reviewUrl:b.reviewUrl||'',neighborhood:b.neighborhood||'',cuts:b.services?.map((s:any)=>({id:s.id,name:s.name,price:s.priceCents/100,priceFormatted:`R$ ${(s.priceCents/100).toFixed(2)}`,durationMinutes:s.durationMinutes,imageUrl:''}))});}
      }).catch(()=>{});
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

  useEffect(()=>{if(activeLead)trackUiEvent(activeLead.id,'lp.viewed');},[activeLead?.id]);

  const handleStartAnalysis = async (leadToAnalyze?: BarbershopLead) => {
    const target = leadToAnalyze || activeLead;
    if (!target) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    trackUiEvent(target.id,'analysis.started');
    try {
      const r=await fetch(`/api/v1/businesses/${target.id}/diagnose`);
      const b=await r.json();
      if(!r.ok) throw new Error(b.error||'Não foi possível analisar agora.');
      setActiveLead({...target,opportunityScore:b.diagnosis.score,gaps:b.diagnosis.gaps});
      trackUiEvent(target.id,'analysis.completed');
      setView('onboarding');
    } catch(e) { showToast(e instanceof Error?e.message:'Tente novamente em instantes.'); }
  };

  const handleOpenCheckout = (planId: string) => {
    if(activeLead)trackUiEvent(activeLead.id,'offer.presented',planId);
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
          durationMs={1500}
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

            <Testimonials3D />

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
