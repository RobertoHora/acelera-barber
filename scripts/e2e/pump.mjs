import fs from 'node:fs';
import path from 'node:path';
const base=process.env.E2E_APP_URL||'http://127.0.0.1:3010';
const dir='.runtime/e2e',spool=path.join(dir,'gateway-spool');
const headers={'Content-Type':'application/json',authorization:'Bearer '+process.env.LAURA_INTERNAL_TOKEN};
let stopping=false;process.on('SIGTERM',()=>stopping=true);process.on('SIGINT',()=>stopping=true);
async function post(route,body){const r=await fetch(base+route,{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(35000)});if(!r.ok)throw Error(`Runtime HTTP ${r.status}`);return r.json();}
while(!stopping){
 try{
  const s=JSON.parse(fs.readFileSync(path.join(dir,'active.json'),'utf8'));
  if(s.status==='RUNNING'){
   if(fs.existsSync(spool))for(const file of fs.readdirSync(spool).filter(f=>f.endsWith('.json')).slice(0,25)){
    const input=JSON.parse(fs.readFileSync(path.join(spool,file),'utf8'));
    if(input.runId!==s.runId)continue;
    if(input.kind==='inbound'){
     const e=input.envelope;
     if(!e.messageId)continue; // No synthetic IDs for replayed user messages.
     const eventAt=typeof e.timestamp==='number'?e.timestamp:Date.parse(e.timestamp||'');
     const began=Math.floor(Date.parse(s.startedAt||'')/1000)*1000;
     if(!Number.isFinite(eventAt)||!Number.isFinite(began)||eventAt<began){
       fs.mkdirSync(path.join(dir,'pre-test-events'),{recursive:true,mode:0o700});
       fs.renameSync(path.join(spool,file),path.join(dir,'pre-test-events',file));
       continue; // Historical unanswered scans must never be answered as this new test.
     }
     await post('/api/internal/laura/inbound',{providerId:e.messageId,phone:s.phone,text:e.text||'[Mídia recebida: atendimento humano necessário]',runId:s.runId,businessSlug:s.role==='END_CUSTOMER'?s.testSlug:undefined});
    }
    else await post('/api/internal/laura/events',{...input.envelope,phone:s.phone,runId:s.runId,kind:input.kind});
    fs.mkdirSync(path.join(dir,'delivered-events'),{recursive:true,mode:0o700});
    fs.renameSync(path.join(spool,file),path.join(dir,'delivered-events',file));
   }
   await post('/api/internal/laura/tick',{});
  }
 }catch{console.error('Laura pump: runtime unavailable; retaining events, no Lana fallback.');}
 await new Promise(resolve=>setTimeout(resolve,2000));
}
