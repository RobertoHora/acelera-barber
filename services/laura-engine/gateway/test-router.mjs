import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
export function canonicalPhone(value) {
  const input=String(value||'');
  if(input.includes('@') && !input.endsWith('@s.whatsapp.net'))return null;
  let digits=input.replace(/@.*$/,'').replace(/\D/g,'');
  if(/^\d{10,11}$/.test(digits))digits='55'+digits;
  return /^55\d{10,11}$/.test(digits)?digits:null;
}
export function matchesReservation(state, envelope) {
  if(!state || state.status==='FINISHED')return false;
  const phone=canonicalPhone(envelope.phone||envelope.to);
  const jid=String(envelope.remoteJid||envelope.to||'');
  return (!!phone && phone===state.phone) || state.lids?.includes(jid) || jid===state.phone+'@s.whatsapp.net';
}
export function createTestRouter({stateFile,spoolDir,token,fetchImpl=fetch}) {
 const context=new AsyncLocalStorage();
 // Keep last valid reservation on invalid/missing state: never silently release to Lana.
 let last=null;
 function state(){try{const s=JSON.parse(fs.readFileSync(stateFile,'utf8'));if(!s.runId||!canonicalPhone(s.phone))throw Error('Invalid reservation');last=s;return s;}catch(e){if(last)return {...last,status:'PAUSED'};if(fs.existsSync(stateFile))throw e;return null;}}
 function reserved(envelope){return matchesReservation(state(),envelope);}
 function persist(kind,envelope){
   const s=state();fs.mkdirSync(spoolDir,{recursive:true,mode:0o700});
   const id=crypto.createHash('sha256').update(JSON.stringify([s.runId,kind,envelope.messageId||envelope.messageKey?.id||envelope.timestamp,envelope.remoteJid])).digest('hex');
   const file=path.join(spoolDir,id+'.json');
   try{fs.writeFileSync(file,JSON.stringify({id,runId:s.runId,kind,envelope}),{flag:'wx',mode:0o600});}catch(e){if(e.code!=='EEXIST')throw e;}
 }
 async function route(kind,envelope){
   if(!reserved(envelope))return false;
   persist(kind,envelope);
   // Delivery is replayed by the supervised private spool pump, never via Lana fallback.
   return true;
 }
 function assertOutbound(target){
   const s=state(),ctx=context.getStore();
   if(ctx?.engine==='laura'){
     if(!s||s.status!=='RUNNING'||s.transport!=='REAL'||ctx.runId!==s.runId||!matchesReservation(s,{to:target}))throw Error('LAURA_E2E_EGRESS_BLOCKED');
   }else if(matchesReservation(s,{to:target}))throw Error('CONTACT_RESERVED_FOR_LAURA');
 }
 function middleware(req,res,next){
   if(req.headers['x-orc-engine']!=='laura')return next();
   const supplied=String(req.headers['x-laura-token']||'');
   if(!token||supplied.length!==token.length||!crypto.timingSafeEqual(Buffer.from(token),Buffer.from(supplied)))return res.status(403).json({error:'INVALID_LAURA_TOKEN'});
   context.run({engine:'laura',runId:req.headers['x-test-run-id']},()=>{try{assertOutbound(req.body?.to||req.body?.phone||req.body?.jid);next();}catch(e){res.status(403).json({error:e.message});}});
 }
 return {route,reserved,assertOutbound,middleware};
}
