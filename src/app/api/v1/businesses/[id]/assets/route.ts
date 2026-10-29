import {NextRequest,NextResponse} from 'next/server';
import {prisma} from '@/lib/db';
import {ownsBusiness} from '@/lib/auth';
const escape=(s:string)=>s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const b=await prisma.business.findFirst({where:{OR:[{id},{slug:id}]},include:{entitlements:true}});
 if(!b||!await ownsBusiness(request,b.id))return NextResponse.json({error:'Acesso restrito ao proprietário.'},{status:403});
 if(!b.entitlements.some(e=>e.sku==='eleva_complete'&&e.status==='ACTIVE'))return NextResponse.json({error:'Recurso do Eleva Completo.'},{status:403});
 const kind=request.nextUrl.searchParams.get('kind')||'logo';
 const titles:Record<string,string>={logo:(b.cleanName||b.name).split(' ').slice(0,2).map(s=>s[0]).join(''),cortes:'CORTES',equipe:'EQUIPE',agenda:'AGENDE',avaliacoes:'AVALIAÇÕES'};
 if(!titles[kind])return NextResponse.json({error:'Modelo inválido.'},{status:400});
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><rect width="1080" height="1080" fill="#19181d"/><circle cx="540" cy="540" r="420" fill="none" stroke="#e8c87d" stroke-width="12"/><text x="540" y="560" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="${kind==='logo'?200:85}" fill="#e8c87d">${escape(titles[kind])}</text><text x="540" y="720" text-anchor="middle" font-family="sans-serif" font-size="36" fill="#ffffff">${escape((b.cleanName||b.name).slice(0,35))}</text></svg>`;
 await prisma.growthEvent.upsert({where:{dedupeKey:`asset:${b.id}:${kind}`},update:{},create:{event:'material.downloaded',businessId:b.id,metadata:{kind},dedupeKey:`asset:${b.id}:${kind}`}});
 return new Response(svg,{headers:{'Content-Type':'image/svg+xml','Content-Disposition':`attachment; filename="${kind}-${b.slug}.svg"`,'Cache-Control':'private, no-store'}});
}
