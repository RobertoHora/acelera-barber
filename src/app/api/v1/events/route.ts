import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db';
const allowed=new Set(['lp.viewed','analysis.started','analysis.completed','free.benefit_used','offer.presented','referral.clicked','material.copied','agenda.link_copied']);
export async function POST(request:Request){
 try{
  const {businessId,event,eventId,sku}=await request.json();
  if(!allowed.has(event)||typeof eventId!=='string'||!/^[a-zA-Z0-9:_-]{1,160}$/.test(eventId))return NextResponse.json({error:'Invalid event'},{status:400});
  const business=await prisma.business.findFirst({where:{OR:[{id:businessId},{slug:businessId}]},select:{id:true}});
  if(!business)return NextResponse.json({error:'Not found'},{status:404});
  await prisma.growthEvent.upsert({where:{dedupeKey:`web:${business.id}:${event}:${eventId}`},update:{},create:{event,businessId:business.id,metadata:{...(typeof sku==='string'&&sku.length<40?{sku}:{}),...(process.env.E2E_RUN_ID?{testRunId:process.env.E2E_RUN_ID}:{})},dedupeKey:`web:${business.id}:${event}:${eventId}`}});
  return NextResponse.json({accepted:true});
 }catch{return NextResponse.json({error:'Invalid payload'},{status:400});}
}
