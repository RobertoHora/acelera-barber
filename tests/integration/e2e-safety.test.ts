import {it,expect,afterAll} from 'vitest';
import {prisma} from '@/lib/db';
import {claimNextOutboxMessage,processOutboxMessage} from '../../services/laura-engine/outbox-worker';
import {receiveLauraInbound} from '../../services/laura-engine/durable-inbox';
import {NextRequest} from 'next/server';
import {PATCH} from '@/app/api/v1/businesses/[id]/route';
import {POST as activate} from '@/app/api/v1/businesses/[id]/trial/activate/route';
const ids:string[]=[];
afterAll(async()=>{if(ids.length)await prisma.outboxMessage.deleteMany({where:{id:{in:ids}}});await prisma.lauraInbound.deleteMany({where:{providerId:{startsWith:'e2e_safety:'}}});});
it('rejects business changes and trial activation without owner session',async()=>{
 const business=await prisma.business.findFirstOrThrow();const params=Promise.resolve({id:business.id});
 const patch=await PATCH(new NextRequest('http://localhost/api',{method:'PATCH',body:JSON.stringify({infiniteTag:'$changed'})}),{params});
 expect(patch.status).toBe(403);
 const trial=await activate(new NextRequest('http://localhost/api',{method:'POST',body:'{}'}),{params});expect(trial.status).toBe(403);
});
it('never retries uncertain sends and never accepts a fabricated provider ID',async()=>{
 const item=await prisma.outboxMessage.create({data:{destinationPhone:'+5511988880001',content:'safety fixture',purpose:'INBOUND_REPLY',dedupeKey:`safety:${Date.now()}`,status:'CLAIMED',attempts:1,leaseExpiresAt:new Date(Date.now()+120000)}});ids.push(item.id);
 const result=await processOutboxMessage(item,{sendText:async()=>({success:true})});expect(result.status).toBe('UNCERTAIN');
 const stored=await prisma.outboxMessage.findUniqueOrThrow({where:{id:item.id}});expect(stored.waMessageId).toBeNull();
 const next=await prisma.outboxMessage.create({data:{destinationPhone:item.destinationPhone,content:'must hold',purpose:'INBOUND_REPLY',dedupeKey:`safety_next:${Date.now()}`}});ids.push(next.id);
 const claim=await claimNextOutboxMessage();expect(claim?.id).not.toBe(next.id);
});
it('recognizes the actual gateway messageId and fences stale workers',async()=>{
 const item=await prisma.outboxMessage.create({data:{destinationPhone:'+5511988880002',content:'safety fixture',purpose:'INBOUND_REPLY',dedupeKey:`safety_realid:${Date.now()}`,status:'CLAIMED',attempts:2,leaseExpiresAt:new Date(Date.now()+120000)}});ids.push(item.id);
 let calls=0;const provider={sendText:async()=>{calls++;return {success:true,messageId:'fixture-real-wa-id-'+item.id};}};
 const stale=await processOutboxMessage({...item,attempts:1},provider);expect(stale.reason).toBe('STALE_LEASE');expect(calls).toBe(0);
 await processOutboxMessage(item,provider);expect(calls).toBe(1);
 expect((await prisma.outboxMessage.findUniqueOrThrow({where:{id:item.id}})).waMessageId).toBe('fixture-real-wa-id-'+item.id);
});
it('deduplicates durable inbound replay',async()=>{
 const old=process.env.E2E_RUN_ID;delete process.env.E2E_RUN_ID;
 try{const providerId='e2e_safety:replay';const input={providerId,phone:'+5511988880003',text:'oi'};
 const a=await receiveLauraInbound(input);const b=await receiveLauraInbound(input);expect(a.id).toBe(b.id);
 }finally{if(old)process.env.E2E_RUN_ID=old;}
});
