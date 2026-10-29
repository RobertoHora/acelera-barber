import {NextRequest,NextResponse} from 'next/server';
import {createBookingCheckout,settleBookingPayment} from '@/lib/billing/booking-payments';
import {prisma} from '@/lib/db';
import {hashBookingToken} from '@/lib/agenda/booking-service';
export async function POST(request:NextRequest,{params}:{params:Promise<{token:string}>}){
 try{
  const {token}=await params;const body=await request.json().catch(()=>({}));
  if(body.simulate||body.transaction_nsu){
   const booking=await prisma.booking.findUnique({where:{cancelTokenHash:hashBookingToken(token)},include:{payment:true}});
   if(!booking?.payment)return NextResponse.json({error:'Pagamento não encontrado.'},{status:404});
   return NextResponse.json(await settleBookingPayment({orderNsu:booking.payment.orderNsu,transactionNsu:String(body.transaction_nsu||'simulation'),slug:String(body.slug||'simulation')},body.simulate===true));
  }
  const result=await createBookingCheckout(token);
  return NextResponse.json({paymentId:result.payment.id,status:result.payment.status,checkoutUrl:result.payment.checkoutUrl,simulated:result.simulated,amountCents:result.payment.amountCents});
 }catch{return NextResponse.json({error:'Pagamento online indisponível. Você pode pagar na barbearia.'},{status:409});}
}
