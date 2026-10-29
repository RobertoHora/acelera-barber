import {NextRequest,NextResponse} from 'next/server';
import {prisma} from '@/lib/db';
import {ownsBusiness} from '@/lib/auth';
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const b=await prisma.business.findFirst({where:{OR:[{id},{slug:id}]},include:{entitlements:true,trialBenefit:true,subscription:true,checklistItems:true}});
 if(!b)return NextResponse.json({error:'Não encontrada'},{status:404});
 const owner=await ownsBusiness(request,b.id);
 const active=owner?b.entitlements.filter(e=>e.status==='ACTIVE').map(e=>e.sku):[];
 return NextResponse.json({businessId:b.id,slug:b.slug,owner,pro:active.includes('eleva_google_pro')||active.includes('eleva_complete'),complete:active.includes('eleva_complete'),trial:owner?b.trialBenefit:null,infiniteTag:owner?b.infiniteTag:null,onlinePaymentsEnabled:owner?b.onlinePaymentsEnabled:false,checklist:owner?b.checklistItems:[],agendaUrl:`${process.env.NEXT_PUBLIC_AGENDA_URL||'https://agenda.oracio.uk'}/${b.slug}`,referralUrl:'https://infinitepay.onelink.me/IGWD/estudio-orc'});
}
