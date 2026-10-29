import {NextResponse} from 'next/server';
import {validInternalToken} from '@/lib/internal-auth';
import {normalizePhoneE164} from '@/lib/auth';
import {prisma} from '@/lib/db';
export async function POST(request:Request){
 if(!validInternalToken(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const body=await request.json();
 if(body.runId!==process.env.E2E_RUN_ID||normalizePhoneE164(body.phone||'')!==normalizePhoneE164(process.env.E2E_OPERATOR_PHONE||''))return NextResponse.json({error:'Invalid scope'},{status:403});
 if(body.kind==='presence'){
  if(['composing','recording'].includes(body.presence)){
   const availableAt=new Date(Date.now()+20000);
   await prisma.lauraInbound.updateMany({where:{phone:normalizePhoneE164(body.phone),status:'PENDING'},data:{availableAt}});
   await prisma.outboxMessage.updateMany({where:{destinationPhone:normalizePhoneE164(body.phone),purpose:'INBOUND_REPLY',status:'QUEUED'},data:{availableAt}});
  }
 }else if(body.kind==='receipt'&&body.messageId){
  const message=await prisma.outboxMessage.findUnique({where:{waMessageId:body.messageId}});
  if(message)await prisma.growthEvent.upsert({where:{dedupeKey:`wa_receipt:${body.messageId}:${body.status}`},update:{},create:{event:'whatsapp.receipt',businessId:message.businessId,metadata:{messageId:body.messageId,status:body.status,runId:body.runId},dedupeKey:`wa_receipt:${body.messageId}:${body.status}`}});
 }
 return NextResponse.json({accepted:true});
}
