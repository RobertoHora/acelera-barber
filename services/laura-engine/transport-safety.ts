import {CONFIG} from './lana-protections/config';
import {getAntiBanPacingSeconds} from './lana-protections/proactive-pacing-guard';
import {Pool} from 'pg';
import {getCircuitBreaker} from './lana-protections/circuit-breaker';
import {prisma} from '@/lib/db';
let shared:Pool|undefined;
export async function canUseSharedTransport(purpose:string):Promise<boolean>{
 if(!await getCircuitBreaker().canDispatchToCustomerAsync())return false;
 if(!process.env.LAURA_SHARED_SAFETY_DATABASE_URL)return false;
 // This pool can only read the existing channel restriction and last outbound timing.
 shared ||= new Pool({connectionString:process.env.LAURA_SHARED_SAFETY_DATABASE_URL,options:'-c default_transaction_read_only=on',max:1,connectionTimeoutMillis:3000});
 try{
  const result=await shared.query('SELECT value FROM "AppSetting" WHERE id=$1',['circuit_breaker:channel_whatsapp']);
  if(result.rows[0]?.value?.state!=='CLOSED')return false;
  if(['INITIAL_OUTREACH','CADENCE_FOLLOWUP'].includes(purpose)){
   const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',hour:'2-digit',hourCycle:'h23'}).format(new Date()));
   if(hour<CONFIG.OPERATING_HOUR_START||hour>=CONFIG.OPERATING_HOUR_END)return false;
   const last=await shared.query('SELECT MAX("createdAt") AS last FROM "ProspectMessage" WHERE direction=$1 AND status IN ($2,$3,$4,$5,$6,$7)',['OUTBOUND','SENT','DELIVERED','READ','DISPATCHING','PROVIDER_ACCEPTED','CLAIMED']);
   const local=await prisma.outboxMessage.findFirst({where:{sentAt:{not:null}},orderBy:{sentAt:'desc'}});
   const lastAt=Math.max(new Date(last.rows[0]?.last||0).getTime(),local?.sentAt?.getTime()||0);
   const key='proactive_pacing_next';
   const saved=await prisma.lauraSafetyState.findUnique({where:{id:key}});
   const value=saved?.value as {lastAt?:number;nextAt?:number}|null;
   const nextAt=value?.lastAt===lastAt && value?.nextAt ? value.nextAt : lastAt+getAntiBanPacingSeconds()*1000;
   if(value?.lastAt!==lastAt)await prisma.lauraSafetyState.upsert({where:{id:key},update:{value:{lastAt,nextAt}},create:{id:key,value:{lastAt,nextAt}}});
   if(Date.now()<nextAt)return false;
  }
  return true;
 }catch{return false;}
}
