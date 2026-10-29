'use client';
import {trackUiEvent} from '@/lib/ui-events';
import {useEffect,useState,useCallback} from 'react';
import {BarbershopLead} from '@/lib/types';
export default function WorkspacePanel({lead,onOpenCheckout,onToast}:{lead:BarbershopLead;onOpenCheckout:(p:string)=>void;onToast:(m:string)=>void}){
 const [data,setData]=useState<any>(null);const [tag,setTag]=useState('');const [modality,setModality]=useState('agenda_basic_monthly');const [busy,setBusy]=useState(false);const [confirmedTag,setConfirmedTag]=useState(false);
 const refresh=useCallback(async()=>{const r=await fetch(`/api/v1/businesses/${lead.id}/workspace`);if(r.ok){const b=await r.json();setData(b);setTag(b.infiniteTag||'');}},[lead.id]);
 useEffect(()=>{refresh();window.addEventListener('orc:benefits-updated',refresh);return()=>window.removeEventListener('orc:benefits-updated',refresh);},[refresh]);
 async function action(url:string,method:string,body:unknown){setBusy(true);try{const r=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const b=await r.json();if(!r.ok)throw Error(b.error||'Não foi possível salvar.');await refresh();onToast('Configuração salva.');}catch(e){onToast(e instanceof Error?e.message:'Erro ao salvar.');}finally{setBusy(false);}}
 async function copy(text:string,key?:string){if(!data?.owner||!key)trackUiEvent(lead.id,key==='google_appointment_link'?'agenda.link_copied':'material.copied',key);try{await navigator.clipboard.writeText(text);onToast('Copiado. Cole no campo indicado do seu perfil.');if(data?.owner&&key)await action(`/api/v1/businesses/${lead.id}/checklist`,'POST',{itemKey:key,status:'TODO',action:'COPIED'});}catch{onToast('Não foi possível copiar. Selecione e copie o texto.');}}
 if(!data)return null;
 async function downloadAsset(kind:string){try{
   const r=await fetch(`/api/v1/businesses/${lead.id}/assets?kind=${kind}`);if(!r.ok)throw Error('Não foi possível baixar o material.');
   const url=URL.createObjectURL(await r.blob());
   try{const img=new Image();await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(Error('Falha ao preparar PNG.'));img.src=url;});const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;canvas.getContext('2d')!.drawImage(img,0,0);const a=document.createElement('a');a.download=`${kind}-${lead.slug}.png`;a.href=canvas.toDataURL('image/png');a.click();}finally{URL.revokeObjectURL(url);}
 }catch(e){onToast(e instanceof Error?e.message:'Erro ao baixar.');}}
 const name=lead.cleanName||lead.name;
 return <section id="workspace-settings" className="bg-[#242327] border border-[#3D3C3A] rounded-3xl p-5 space-y-4 text-white">
 <h2 className="text-lg font-bold">Seu espaço Eleva + Agenda ORC</h2>
 <p className="text-sm text-zinc-300">Comece grátis e libere as próximas ferramentas quando fizer sentido para sua barbearia.</p>
 <div className="flex flex-wrap gap-2 text-xs">
 <span className="rounded-full bg-emerald-900 px-3 py-2">Gratuito ativo</span>
 {data.complete?<span className="rounded-full bg-emerald-900 px-3 py-2">Completo ativo</span>:<button onClick={()=>onOpenCheckout(data.pro?'eleva_complete_upgrade':'eleva_google_pro')} className="rounded-full bg-amber-200 text-black px-3 py-2">{data.pro?'Completar por R$20':'Google Pro — R$37'}</button>}
 {!data.complete&&<button onClick={()=>onOpenCheckout(data.pro?'eleva_complete_upgrade':'eleva_complete')} className="rounded-full border border-amber-200 px-3 py-2">{data.pro?'Liberar Instagram por R$20':'Completo — R$57'}</button>}
 </div>
 {data.complete&&<details className="border-t border-white/10 pt-3"><summary className="cursor-pointer font-semibold">Instagram: nome, bio, logo e destaques</summary>
 <div className="space-y-3 pt-3 text-sm">
 <p>Nome: {name} | Barbearia em {lead.city||'sua cidade'}</p>
 <button className="underline" onClick={()=>copy(`${name} | Barbearia em ${lead.city||'sua cidade'}`,'instagram_name')}>Copiar nome</button>
 <p className="whitespace-pre-line">{`✂️ ${name}\n📍 ${lead.neighborhood}, ${lead.city||''}\n💈 Escolha seu serviço e horário 👇`}</p>
 <button className="underline" onClick={()=>copy(`✂️ ${name}\n📍 ${lead.neighborhood}, ${lead.city||''}\n💈 Escolha seu serviço e horário 👇`,'instagram_bio')}>Copiar bio</button>
 <div className="flex flex-wrap gap-3">{['logo','cortes','equipe','agenda','avaliacoes'].map(kind=><button className="underline" key={kind} onClick={()=>downloadAsset(kind)}>Baixar {kind} (PNG)</button>)}</div>
 <p className="text-xs text-zinc-400">Modelos prontos para baixar em PNG. Você pode personalizá-los antes de aplicar ao perfil.</p>
 </div></details>}
 {data.trial&&<details open className="border-t border-white/10 pt-3"><summary className="font-semibold cursor-pointer">Configurar Agenda — {data.trial.grantedDays} dias de teste</summary>
 <div className="pt-3 space-y-3 text-sm">
 {data.trial.status==='GRANTED'?<><label className="block">Modalidade durante o teste<select value={modality} onChange={e=>setModality(e.target.value)} className="block mt-2 bg-[#19181D] p-2 rounded-lg"><option value="agenda_basic_monthly">Confirmações WhatsApp — depois R$37/mês</option><option value="agenda_ai_monthly">Atendimento e agendamento WhatsApp — depois R$67/mês</option></select></label><p>O prazo começa ao publicar a agenda. Não haverá cobrança automática ao terminar o teste.</p><button disabled={busy} onClick={()=>action(`/api/v1/businesses/${lead.id}/trial/activate`,'POST',{selectedModality:modality})} className="bg-emerald-300 text-black rounded-xl px-4 py-3">Publicar minha agenda e iniciar teste</button></>:<p>Teste {data.trial.status==='ACTIVE'?'ativo':'encerrado'}. {data.trial.endsAt&&`Até ${new Date(data.trial.endsAt).toLocaleDateString('pt-BR')}.`}</p>}
 <p className="break-all">{data.agendaUrl}</p><button className="underline" onClick={()=>copy(data.agendaUrl,'google_appointment_link')}>Copiar link de agendamento</button>
 <p className="text-zinc-400 text-xs">No Perfil da Empresa: Editar perfil → Agendamento, se disponível, e Site. No Instagram: Editar perfil → Links. O Google decide a exibição do botão.</p>
 <button className="underline" onClick={()=>action(`/api/v1/businesses/${lead.id}/checklist`,'POST',{itemKey:'google_appointment_link',status:'DONE'})}>Já colei o link no Google</button>
 </div></details>}
 <details className="border-t border-white/10 pt-3"><summary className="cursor-pointer font-semibold">Receber pagamentos com InfinitePay</summary><div className="pt-3 space-y-3 text-sm">
 <a href={data.referralUrl} onClick={()=>trackUiEvent(lead.id,'referral.clicked')} target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-black px-4 py-3 rounded-xl">Baixar InfinitePay pelo convite do Estúdio ORC</a>
 <p className="text-xs text-zinc-400">A promoção do print prevê R$25 para quem indica e R$15 para o indicado após R$50 vendidos via InfiniteTap, conforme elegibilidade e regras vigentes. Checkout online não comprova esse requisito.</p>
 <label className="block">Sua InfiniteTag<input placeholder="$suabarbearia" value={tag} onChange={e=>setTag(e.target.value)} className="block mt-2 p-3 bg-[#19181D] rounded-xl"/></label>
 <button disabled={busy||!data.owner} onClick={()=>action(`/api/v1/businesses/${lead.id}`,'PATCH',{infiniteTag:tag})} className="underline">Salvar minha tag</button>
 <label className="flex gap-2 items-start"><input type="checkbox" checked={confirmedTag} onChange={e=>setConfirmedTag(e.target.checked)}/>Confirmo que esta tag é da minha conta InfinitePay e que habilitei o Checkout Integrado.</label>
 <button disabled={busy||!data.owner||!confirmedTag} onClick={()=>action(`/api/v1/businesses/${lead.id}`,'PATCH',{infiniteTag:tag,onlinePaymentsEnabled:true,confirmedTagOwnership:true})} className="underline disabled:opacity-40">{data.onlinePaymentsEnabled?'Pagamento online habilitado':'Habilitar pagamento online opcional'}</button>
 <p className="text-xs text-zinc-400">O cliente pode pagar no local ou antecipar pelo checkout. O dinheiro vai para a tag configurada. Só registramos pagamento após confirmação no servidor. Confirme o nome do recebedor no checkout.</p>
 </div></details>
 </section>;
}
