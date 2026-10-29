'use client';
import {useEffect,useState} from 'react';
export default function BookingPaymentPanel({token,alreadyPaid=false}:{token:string;alreadyPaid?:boolean}){
 const [paid,setPaid]=useState(alreadyPaid),[simulated,setSimulated]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(body:unknown){const r=await fetch(`/api/v1/public/bookings/${token}/payment`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error||'Pagamento indisponível.');return data;}
 useEffect(()=>{const p=new URLSearchParams(window.location.search);if(p.get('transaction_nsu')&&p.get('slug'))submit({transaction_nsu:p.get('transaction_nsu'),slug:p.get('slug')}).then(r=>setPaid(r.paid===true)).catch(()=>setError('Pagamento em conferência. Consulte a barbearia.'));},[token]);
 async function pay(simulate=false){setBusy(true);setError('');try{const data=await submit(simulate?{simulate:true}:{});if(data.paid||data.status==='PAID')setPaid(true);else if(data.simulated)setSimulated(true);else if(data.checkoutUrl)window.location.assign(data.checkoutUrl);}catch(e){setError(e instanceof Error?e.message:'Pagamento indisponível.');}finally{setBusy(false);}}
 return <section className="bg-[#242422] rounded-2xl p-4 space-y-3 text-sm border border-white/10">
 {paid?<p className="text-emerald-300">Pagamento confirmado.</p>:<><p>Sua reserva está confirmada. Você pode pagar na barbearia ou antecipar pela InfinitePay.</p><button disabled={busy} onClick={()=>pay(simulated)} className="bg-amber-200 text-black rounded-xl px-4 py-3 font-bold disabled:opacity-50">{busy?'Conferindo…':simulated?'Simular pagamento — homologação':'Pagar online (opcional)'}</button>{simulated&&<p className="text-xs text-amber-300">Simulação interna. Nenhuma cobrança real.</p>}</>}
 {error&&<p role="alert" className="text-amber-300 text-xs">{error}</p>}
 </section>;
}
