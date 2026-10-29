import {NextRequest,NextResponse} from 'next/server';
import {prisma} from '@/lib/db';
import {ownsBusiness} from '@/lib/auth';
import {grantOrderBenefits} from '@/lib/billing/entitlements';
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!process.env.E2E_RUN_ID||process.env.E2E_PAYMENT_MODE==='REAL'||!process.env.DATABASE_URL?.includes('/eleva_agenda_e2e?'))return NextResponse.json({error:'Not found'},{status:404});
 const {id}=await params;const order=await prisma.order.findUnique({where:{id}});
 if(!order||!await ownsBusiness(request,order.businessId))return NextResponse.json({error:'Forbidden'},{status:403});
 await prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT id FROM "Order" WHERE id=${id} FOR UPDATE`;
  const current=await tx.order.findUniqueOrThrow({where:{id}});if(current.status==='PAID')return;
  await tx.order.update({where:{id},data:{status:'PAID',paidAt:new Date()}});
  await tx.paymentTransaction.create({data:{orderId:id,transactionId:`sim:${id}`,amountCents:current.amountCents,status:'SIMULATED'}});
  await grantOrderBenefits(id,tx);
 });
 return NextResponse.json({success:true,simulated:true});
}
