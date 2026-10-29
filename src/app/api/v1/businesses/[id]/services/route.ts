import {NextRequest,NextResponse} from 'next/server';
import {prisma} from '@/lib/db';
import {ownsBusiness} from '@/lib/auth';
export async function PUT(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const b=await prisma.business.findFirst({where:{OR:[{id},{slug:id}]},include:{entitlements:true}});
 if(!b||!await ownsBusiness(request,b.id))return NextResponse.json({error:'Forbidden'},{status:403});
 if(!b.entitlements.some(e=>e.status==='ACTIVE'&&['eleva_google_pro','eleva_complete'].includes(e.sku)))return NextResponse.json({error:'Ative o Pro para salvar seu catálogo.'},{status:403});
 const {services}=await request.json();
 if(!Array.isArray(services)||!services.length||services.length>30||services.some(s=>typeof s.name!=='string'||!s.name.trim()||!Number.isInteger(s.priceCents)||s.priceCents<0||!Number.isInteger(s.durationMinutes)||s.durationMinutes<5||s.durationMinutes>480))return NextResponse.json({error:'Catálogo inválido.'},{status:400});
 const saved=await prisma.$transaction(async tx=>{
  for(const s of services){
   if(s.id){const found=await tx.service.findFirst({where:{id:s.id,businessId:b.id}});if(!found)throw Error('Serviço de outra barbearia.');}
  }
  return Promise.all(services.map((s,i)=>s.id?tx.service.update({where:{id:s.id},data:{name:s.name.trim(),priceCents:s.priceCents,durationMinutes:s.durationMinutes,sortOrder:i}}):tx.service.create({data:{businessId:b.id,name:s.name.trim(),priceCents:s.priceCents,durationMinutes:s.durationMinutes,sortOrder:i}})));
 });
 return NextResponse.json({services:saved});
}
