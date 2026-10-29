import { prisma } from '@/lib/db';
import { normalizePhoneE164 } from '@/lib/auth';
import { processLauraMessage } from './laura-brain';

export async function receiveLauraInbound(input:{providerId:string;phone:string;text:string;businessSlug?:string;runId?:string}) {
  if(!input.providerId || !input.text?.trim())throw Error('Stable providerId and text required');
  const phone=normalizePhoneE164(input.phone);
  if(process.env.E2E_RUN_ID && (input.runId!==process.env.E2E_RUN_ID || phone!==normalizePhoneE164(process.env.E2E_OPERATOR_PHONE||'')))throw Error('Inbound outside active test');
  return prisma.lauraInbound.upsert({where:{providerId:input.providerId},update:{},create:{providerId:input.providerId,phone,content:input.text,businessSlug:input.businessSlug,runId:input.runId,availableAt:new Date(Date.now()+20000)}});
}
export async function processNextLauraInbound() {
  // Transaction-wide advisory lock preserves conversational order and makes replay atomic.
  return prisma.$transaction(async tx=>{
    const rows=await tx.$queryRaw<Array<{id:string}>>`SELECT id FROM "LauraInbound" WHERE status='PENDING' AND "availableAt" <= NOW() ORDER BY "createdAt" LIMIT 1 FOR UPDATE SKIP LOCKED`;
    if(!rows.length)return null;
    const item=await tx.lauraInbound.findUniqueOrThrow({where:{id:rows[0].id}});
    const lock=await tx.$queryRaw<Array<{locked:boolean}>>`SELECT pg_try_advisory_xact_lock(hashtext(${item.phone})) AS locked`;
    if(!lock[0].locked)return null;
    // All state changes and outgoing reply are committed with inbox acknowledgement.
    const batch=await tx.lauraInbound.findMany({where:{phone:item.phone,businessSlug:item.businessSlug,runId:item.runId,status:'PENDING'},orderBy:{createdAt:'asc'}});
    if(batch.some(b=>b.availableAt>new Date()))return null;
    const result=await processLauraMessage(batch.map(b=>b.content).join(' '),item.phone,item.businessSlug||undefined,tx);
    if (result.replyText) await tx.outboxMessage.upsert({where:{dedupeKey:`laura_reply:${item.providerId}`},update:{},create:{businessId:result.businessId||null,destinationPhone:item.phone,content:result.replyText,purpose:'INBOUND_REPLY',dedupeKey:`laura_reply:${item.providerId}`}});
    await tx.lauraInbound.updateMany({where:{id:{in:batch.map(b=>b.id)}},data:{status:'PROCESSED',processedAt:new Date()}});
    return {id:item.id};
  },{timeout:30000});
}
