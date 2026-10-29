'use client';
import React,{useState,useEffect} from 'react';
import {X,ShieldCheck} from 'lucide-react';
import {BarbershopLead} from '@/lib/types';
import {PLANS_CONFIG,resolvePlanConfig} from '@/lib/plans';
interface Props{isOpen:boolean;onClose:()=>void;planId:string;lead:BarbershopLead;onSuccessToast?:(msg:string)=>void}
export default function PaymentIntentModal({isOpen,onClose,planId,lead,onSuccessToast}:Props){
 const [phone,setPhone]=useState(lead.whatsapp||lead.phone||'');
 const [code,setCode]=useState('');const [otpSent,setOtpSent]=useState(false);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const [order,setOrder]=useState<{id:string;simulated:boolean}|null>(null);
 useEffect(()=>{setOrder(null);setCode('');setOtpSent(false);setError('');},[isOpen,planId,lead.id]);
 const config=resolvePlanConfig(planId)||PLANS_CONFIG.eleva_google_pro;
 async function post(url:string,body:unknown){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const b=await r.json();if(!r.ok)throw Error(b.error||'Não foi possível continuar.');return b;}
 async function proceed(){setBusy(true);setError('');try{
   const me=await fetch('/api/v1/auth/me');
   if(!me.ok){
     if(!otpSent){await post('/api/v1/auth/request-otp',{phone});setOtpSent(true);return;}
     await post('/api/v1/auth/verify-otp',{phone,code});
   }
   const key=`eleva_checkout:${lead.id}:${config.id}`;
   let idempotencyKey=sessionStorage.getItem(key);if(!idempotencyKey){idempotencyKey=crypto.randomUUID();sessionStorage.setItem(key,idempotencyKey);}
   const b=await post('/api/v1/orders',{businessId:lead.id,planCode:config.id,idempotencyKey});
   setOrder({id:b.order.id,simulated:!!b.simulated});
   if(b.checkoutUrl)window.location.assign(b.checkoutUrl);
 }catch(e){setError(e instanceof Error?e.message:'Falha ao continuar.');}finally{setBusy(false);}}
 async function simulate(){if(!order)return;setBusy(true);try{
   await post(`/api/v1/orders/${order.id}/simulate`,{});
   onSuccessToast?.('Pagamento simulado confirmado. Benefícios liberados nesta homologação.');
   window.dispatchEvent(new Event('orc:benefits-updated'));onClose();
 }catch(e){setError(e instanceof Error?e.message:'Falha na simulação.');}finally{setBusy(false);}}
 if(!isOpen)return null;
 return <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"><div role="dialog" aria-modal="true" aria-label="Ativar plano" className="bg-[#2B2B29] border border-[#3D3C3A] rounded-2xl p-5 max-w-md w-full space-y-4 text-white">
 <div className="flex justify-between"><h3 className="font-bold flex gap-2"><ShieldCheck className="size-5 text-emerald-400"/>Ativar {config.name}</h3><button onClick={onClose} aria-label="Fechar"><X/></button></div>
 <p className="text-amber-400 font-bold">{config.priceFormatted}</p><p className="text-sm text-zinc-300">{config.description}</p>
 <p className="text-xs text-zinc-400">Confirme seu WhatsApp para proteger o acesso. O plano é liberado após a confirmação do pagamento.</p>
 <label className="block text-sm">Seu WhatsApp<input type="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="block w-full mt-1 p-3 rounded-xl bg-[#19181D]"/></label>
 {otpSent&&<label className="block text-sm">Código recebido<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e=>setCode(e.target.value)} className="block w-full mt-1 p-3 rounded-xl bg-[#19181D]"/></label>}
 {error&&<p role="alert" className="text-red-300 text-sm">{error}</p>}
 {order?.simulated?<button disabled={busy} onClick={simulate} className="w-full p-3 rounded-xl bg-amber-300 text-black font-bold">Simular pagamento de {config.priceFormatted}</button>:<button disabled={busy} onClick={proceed} className="w-full p-3 rounded-xl bg-[#EFECE5] text-black font-bold disabled:opacity-50">{busy?'Aguarde…':otpSent?'Confirmar código e continuar':'Continuar com segurança'}</button>}
 {order?.simulated&&<p className="text-xs text-amber-300">Homologação: nenhuma cobrança real será feita.</p>}
 </div></div>;
}
