import { canUseSharedTransport } from './transport-safety';
import { getCircuitBreaker } from './lana-protections/circuit-breaker';
import { prisma } from '@/lib/db';
import { normalizePhoneE164 } from '@/lib/auth';

export interface WhatsAppTransportProvider {
  sendText: (toPhone: string, text: string) => Promise<{ success: boolean; externalId?: string; messageId?: string; error?: string; ambiguousTimeout?: boolean }>;
}
export interface ClaimedOutboxItem {
  id: string; businessId: string | null; direction: string; destinationPhone: string;
  content: string; purpose: string; template: string | null; attempts: number;
}
export async function claimNextOutboxMessage(leaseSeconds = 120): Promise<ClaimedOutboxItem | null> {
  return prisma.$transaction(async tx => {
    // A process crash after dispatch began is ambiguous, never an automatic retry.
    await tx.outboxMessage.updateMany({where:{status:'DISPATCHING',leaseExpiresAt:{lt:new Date()}},data:{status:'UNCERTAIN',error:'DISPATCH_LEASE_EXPIRED',leaseExpiresAt:null}});
    const raw = await tx.$queryRaw<Array<{id:string}>>`
      SELECT m.id FROM "OutboxMessage" m
      WHERE m.direction = 'OUTBOUND'
      AND (m.status = 'QUEUED' OR (m.status = 'CLAIMED' AND m."leaseExpiresAt" < NOW()))
      AND m."availableAt" <= NOW()
      AND NOT EXISTS (SELECT 1 FROM "OutboxMessage" u WHERE u."destinationPhone"=m."destinationPhone" AND (u.status IN ('UNCERTAIN','UNKNOWN','DISPATCHING') OR (u.status='CLAIMED' AND u."leaseExpiresAt">=NOW() AND u.id<>m.id)))
      ORDER BY m."createdAt" ASC LIMIT 1 FOR UPDATE SKIP LOCKED`;
    if(!raw.length)return null;
    return tx.outboxMessage.update({where:{id:raw[0].id},data:{status:'CLAIMED',attempts:{increment:1},leaseExpiresAt:new Date(Date.now()+leaseSeconds*1000)}});
  });
}
export async function processOutboxMessage(item: ClaimedOutboxItem, providerOverride?: WhatsAppTransportProvider) {
  const fence={id:item.id,status:'CLAIMED' as const,attempts:item.attempts};
  const cold=['INITIAL_OUTREACH','CADENCE_FOLLOWUP'].includes(item.purpose);
  if(cold && item.businessId){
    const paid=await prisma.entitlement.findFirst({where:{businessId:item.businessId,status:'ACTIVE'}});
    if(paid){await prisma.outboxMessage.updateMany({where:fence,data:{status:'CANCELLED',error:'CANCELLED_ALREADY_CUSTOMER',leaseExpiresAt:null}});return {dispatched:false,reason:'CANCELLED_ALREADY_CUSTOMER'};}
  }
  const real=process.env.WHATSAPP_TRANSPORT_MODE==='REAL';
  if(real && !providerOverride){
    // Fail closed until the runtime has validated gateway reservation AND inherited circuit state.
    const expected=process.env.E2E_OPERATOR_PHONE;
    if(!await canUseSharedTransport(item.purpose)||process.env.LAURA_REAL_GATES_PASSED!=='true'||!process.env.E2E_RUN_ID||!expected||normalizePhoneE164(item.destinationPhone)!==normalizePhoneE164(expected)){
      await prisma.outboxMessage.updateMany({where:fence,data:{status:'QUEUED',error:'REAL_TRANSPORT_GATES_NOT_PASSED',availableAt:new Date(Date.now()+60000),leaseExpiresAt:null}});
      return {dispatched:false,reason:'REAL_TRANSPORT_GATES_NOT_PASSED'};
    }
  }
  const acquired=await prisma.outboxMessage.updateMany({where:{...fence,leaseExpiresAt:{gt:new Date()}},data:{status:'DISPATCHING'}});
  if(!acquired.count)return {dispatched:false,reason:'STALE_LEASE'};
  if(!real && !providerOverride){
    const id=`sim_laura_${item.id}`;
    await prisma.outboxMessage.updateMany({where:{...fence,status:'DISPATCHING'},data:{status:'PROVIDER_ACCEPTED',waMessageId:id,sentAt:new Date(),leaseExpiresAt:null,error:null}});
    return {dispatched:true,externalId:id,mode:'SIMULATED'};
  }
  const provider=providerOverride||{sendText:async(toPhone:string,text:string)=>{
    const gateway=process.env.LAURA_WHATSAPP_GATEWAY_URL;
    if(!gateway)throw Error('Gateway explicitly required');
    const res=await fetch(`${gateway}/api/send-message`,{method:'POST',signal:AbortSignal.timeout(90000),headers:{'Content-Type':'application/json','x-orc-engine':'laura','x-laura-token':process.env.LAURA_INTERNAL_TOKEN||'','x-test-run-id':process.env.E2E_RUN_ID||''},body:JSON.stringify({to:toPhone,text})});
    if(!res.ok)throw Error(`Gateway HTTP ${res.status}`);
    return await res.json();
  }};
  try{
    const result=await provider.sendText(item.destinationPhone,item.content);
    const externalId=result.externalId||result.messageId;
    if(!result.success||!externalId||result.ambiguousTimeout)throw Error(result.error||'GATEWAY_AMBIGUOUS_RESULT');
    await prisma.outboxMessage.updateMany({where:{...fence,status:'DISPATCHING'},data:{status:'PROVIDER_ACCEPTED',waMessageId:externalId,sentAt:new Date(),leaseExpiresAt:null,error:null}});
    return {dispatched:true,externalId};
  }catch(error){
    if (real && !providerOverride) getCircuitBreaker().recordFailure(error instanceof Error ? error.message : 'UNKNOWN');
    // Network error and post-send persistence error both require reconciliation.
    await prisma.outboxMessage.updateMany({where:{...fence,status:'DISPATCHING'},data:{status:'UNCERTAIN',error:error instanceof Error?error.message:'UNKNOWN_SEND_ERROR',leaseExpiresAt:null}});
    return {dispatched:false,status:'UNCERTAIN'};
  }
}
