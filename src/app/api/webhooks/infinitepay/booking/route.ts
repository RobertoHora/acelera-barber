import {NextRequest,NextResponse} from 'next/server';
import {verifyWebhookSecret} from '@/lib/billing/infinitepay';
import {settleBookingPayment} from '@/lib/billing/booking-payments';
export async function POST(request:NextRequest){
 if(!verifyWebhookSecret(request.nextUrl.searchParams.get('token')))return NextResponse.json({error:'Unauthorized'},{status:401});
 try{const b=await request.json();if(!b.order_nsu?.startsWith('agenda_')||!b.transaction_nsu||!(b.slug||b.invoice_slug))return NextResponse.json({error:'Invalid payload'},{status:400});
 return NextResponse.json(await settleBookingPayment({orderNsu:b.order_nsu,transactionNsu:b.transaction_nsu,slug:b.slug||b.invoice_slug}));
 }catch{return NextResponse.json({error:'Aguardando confirmação.'},{status:503});}
}
