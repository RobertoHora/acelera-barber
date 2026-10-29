import {NextRequest,NextResponse} from 'next/server';
import {verifyWebhookSecret} from '@/lib/billing/infinitepay';
import {reconcilePayment} from '@/lib/billing/reconcile';
export async function POST(request:NextRequest){
 if(!verifyWebhookSecret(request.headers.get('x-infinitepay-secret')||request.nextUrl.searchParams.get('token')))return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const body=await request.json();
  const orderNsu=body.order_nsu||body.data?.order_nsu;
  if(typeof orderNsu!=='string')return NextResponse.json({error:'order_nsu obrigatório.'},{status:400});
  if(!orderNsu.startsWith('eleva_'))return NextResponse.json({ignored:true});
  const status=String(body.status||body.event||'paid').toLowerCase();
  if(!['paid','approved','confirmed','payment.confirmed','received'].includes(status))return NextResponse.json({received:true});
  const transactionNsu=body.transaction_nsu||body.data?.transaction_nsu;
  const slug=body.invoice_slug||body.slug||body.data?.invoice_slug;
  if(!transactionNsu||!slug)return NextResponse.json({error:'Identificadores obrigatórios.'},{status:400});
  const result=await reconcilePayment({orderNsu,transactionNsu:String(transactionNsu),slug:String(slug)});
  return NextResponse.json(result);
 }catch(error){console.error('InfinitePay reconciliation failed; pending events remain retryable.');return NextResponse.json({error:'Pagamento não confirmado. Tente novamente.'},{status:503});}
}
