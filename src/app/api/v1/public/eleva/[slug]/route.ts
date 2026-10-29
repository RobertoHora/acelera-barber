import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db';
import {ALL_LEADS} from '@/lib/leads';
export async function GET(_:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const source=ALL_LEADS.find(l=>l.slug===slug||l.aliases?.includes(slug));
 if(!source)return NextResponse.json({error:'Not found'},{status:404});
 const b=await prisma.business.findUnique({where:{slug:process.env.E2E_RUN_ID&&slug==='barao'?'barao-e2e':slug},include:{services:true}});
 if(!b)return NextResponse.json({lead:source});
 return NextResponse.json({lead:{...source,id:b.id,phone:undefined,whatsapp:undefined,cuts:b.services.map(s=>({id:s.id,name:s.name,price:s.priceCents/100,priceFormatted:`R$ ${(s.priceCents/100).toFixed(2)}`,durationMinutes:s.durationMinutes,imageUrl:''}))}});
}
