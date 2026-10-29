import { ownsBusiness } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNsu: id }] },
    include: {
      business: {
        include: {
          entitlements: true,
          trialBenefit: true,
          subscription: true,
        },
      },
      transactions: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Ordem não encontrada' }, { status: 404 });
  }

  if (!await ownsBusiness(request,order.businessId)) return NextResponse.json({error:'Acesso restrito ao proprietário.'},{status:403});

  return NextResponse.json({
    orderId: order.id,
    orderNsu: order.orderNsu,
    status: order.status,
    amountCents: order.amountCents,
    paidAt: order.paidAt,
    sku: order.sku,
    business: {
      id: order.business.id,
      name: order.business.cleanName || order.business.name,
      slug: order.business.slug,
      entitlements: order.business.entitlements,
      trialBenefit: order.business.trialBenefit,
    },
  });
}

export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const order=await prisma.order.findFirst({where:{OR:[{id},{orderNsu:id}]}});
 if(!order||!await ownsBusiness(request,order.businessId))return NextResponse.json({error:'Forbidden'},{status:403});
 try{
  const body=await request.json();
  if(!body.transaction_nsu||!body.slug)return NextResponse.json({error:'Identificadores ausentes.'},{status:400});
  const {reconcilePayment}=await import('@/lib/billing/reconcile');
  return NextResponse.json(await reconcilePayment({orderNsu:order.orderNsu,transactionNsu:String(body.transaction_nsu),slug:String(body.slug)}));
 }catch{return NextResponse.json({error:'Aguardando confirmação do pagamento.'},{status:409});}
}
