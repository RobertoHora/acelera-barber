import {prisma} from '@/lib/db';
import {runReminderCycle,runTrialAndSubscriptionCycle} from '@/lib/notifications/scheduler';
import { NextResponse } from 'next/server';
import { validInternalToken } from '@/lib/internal-auth';
import { processNextLauraInbound } from '../../../../../../services/laura-engine/durable-inbox';
import { claimNextOutboxMessage,processOutboxMessage } from '../../../../../../services/laura-engine/outbox-worker';
export async function POST(request:Request){
 if(!validInternalToken(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const shouldSchedule=await prisma.$transaction(async tx=>{
  const lock=await tx.$queryRaw<Array<{locked:boolean}>>`SELECT pg_try_advisory_xact_lock(hashtext('laura_scheduler')) AS locked`;
  if(!lock[0].locked)return false;
  const prior=await tx.lauraSafetyState.findUnique({where:{id:'scheduler_last_run'}});
  const last=(prior?.value as {at?:number}|null)?.at||0;if(Date.now()-last<60000)return false;
  await tx.lauraSafetyState.upsert({where:{id:'scheduler_last_run'},update:{value:{at:Date.now()}},create:{id:'scheduler_last_run',value:{at:Date.now()}}});return true;
 });
 if(shouldSchedule){await runReminderCycle();await runTrialAndSubscriptionCycle();}
 const inbound=await processNextLauraInbound();
 const item=await claimNextOutboxMessage();
 const outbound=item?await processOutboxMessage(item):null;
 return NextResponse.json({inbound,outbound});
}
