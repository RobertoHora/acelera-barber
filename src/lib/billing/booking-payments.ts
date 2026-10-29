import {prisma} from '@/lib/db';
import {hashBookingToken} from '@/lib/agenda/booking-service';
import {withTestAccess} from '@/lib/test-links';
import crypto from 'node:crypto';
export async function createBookingCheckout(token:string){
 const booking=await prisma.booking.findUnique({where:{cancelTokenHash:hashBookingToken(token)},include:{business:true,service:true,payment:true}});
 if(!booking||booking.status!=='CONFIRMED')throw Error('Reserva não disponível para pagamento.');
 if(!booking.business.onlinePaymentsEnabled||!booking.business.infiniteTag)throw Error('Pagamento online não está ativo nesta barbearia.');
 const handle=booking.business.infiniteTag.replace(/^\$/,'');
 if(!/^[a-zA-Z0-9_-]{3,60}$/.test(handle))throw Error('Tag de recebimento inválida.');
 if(booking.service.priceCents<100)throw Error('Pagamento online exige valor mínimo de R$1.');
 const payment=await prisma.bookingPayment.upsert({where:{bookingId:booking.id},update:{},create:{bookingId:booking.id,orderNsu:`agenda_${booking.id}_${crypto.randomBytes(6).toString('hex')}`,merchantHandle:handle,amountCents:booking.service.priceCents}});
 if(payment.merchantHandle!==handle)throw Error('Recebedor alterado. A barbearia precisa revisar este pagamento.');
 if(payment.status!=='PENDING'||payment.checkoutUrl)return {payment,simulated:payment.transactionNsu?.startsWith('sim:')||false};
 const simulated=!!process.env.E2E_RUN_ID&&process.env.DATABASE_URL?.includes('/eleva_agenda_e2e?')&&process.env.E2E_BOOKING_PAYMENT_MODE!=='REAL';
 if(simulated)return {payment,simulated:true};
 const callback=process.env.INFINITEPAY_BOOKING_WEBHOOK_URL;
 const secret=process.env.INFINITEPAY_WEBHOOK_SECRET;
 if(!callback||!secret)throw Error('Confirmação de pagamento da barbearia ainda não está configurada.');
 const redirect=withTestAccess(`${process.env.NEXT_PUBLIC_AGENDA_URL||'https://agenda.oracio.uk'}/b/${token}`);
 // Public tag flow: never attach the platform's API key to another merchant's checkout.
 const response=await fetch('https://api.checkout.infinitepay.io/links',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(15000),body:JSON.stringify({handle,order_nsu:payment.orderNsu,items:[{quantity:1,price:payment.amountCents,description:booking.service.name}],redirect_url:redirect,webhook_url:`${callback}?token=${encodeURIComponent(secret)}`,customer:{name:booking.customerName,phone_number:booking.customerPhoneE164}})});
 if(!response.ok)throw Error('A barbearia precisa habilitar o Checkout Integrado no app InfinitePay.');
 const body=await response.json();const link=body.url||body.checkout_url||body.checkouturl||body.link;
 const url=new URL(link);if(url.protocol!=='https:'||!(url.hostname==='infinitepay.io'||url.hostname.endsWith('.infinitepay.io')))throw Error('Checkout inválido.');
 const updated=await prisma.bookingPayment.update({where:{id:payment.id},data:{checkoutUrl:url.toString()}});
 return {payment:updated,simulated:false};
}
export async function settleBookingPayment(input:{orderNsu:string;transactionNsu:string;slug:string},simulate=false){
 const payment=await prisma.bookingPayment.findUnique({where:{orderNsu:input.orderNsu},include:{booking:{include:{business:true}}}});
 if(!payment)throw Error('Pagamento não encontrado.');
 if(payment.status==='PAID')return {paid:true};
 if(simulate){
  if(!process.env.E2E_RUN_ID||!process.env.DATABASE_URL?.includes('/eleva_agenda_e2e?')||process.env.E2E_BOOKING_PAYMENT_MODE==='REAL')throw Error('Simulação indisponível.');
 }else{
  const response=await fetch('https://api.checkout.infinitepay.io/payment_check',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(15000),body:JSON.stringify({handle:payment.merchantHandle,order_nsu:payment.orderNsu,transaction_nsu:input.transactionNsu,slug:input.slug})});
  if(!response.ok)throw Error('Confirmação do recebedor indisponível.');
  const checked=await response.json();
  if(checked.success!==true||checked.paid!==true||Number(checked.amount)!==payment.amountCents)throw Error('Pagamento ou valor não confirmado.');
 }
 return prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT id FROM "Booking" WHERE id=${payment.bookingId} FOR UPDATE`;
  const booking=await tx.booking.findUniqueOrThrow({where:{id:payment.bookingId}});
  const current=await tx.bookingPayment.findUniqueOrThrow({where:{id:payment.id}});
  if(current.status==='PAID')return {paid:true};
  const review=booking.status!=='CONFIRMED';
  await tx.bookingPayment.update({where:{id:payment.id},data:{status:review?'REQUIRES_REVIEW':'PAID',transactionNsu:simulate?`sim:${payment.id}`:input.transactionNsu,paidAt:new Date()}});
  if(!review)await tx.booking.update({where:{id:booking.id},data:{isPrepaid:true,prepaidAmountCents:payment.amountCents}});
  await tx.growthEvent.upsert({where:{dedupeKey:`booking_payment:${payment.id}`},update:{},create:{event:review?'booking.payment_requires_review':'booking.payment_confirmed',businessId:booking.businessId,bookingId:booking.id,metadata:{amountCents:payment.amountCents,simulated:simulate},dedupeKey:`booking_payment:${payment.id}`}});
  const phone=payment.booking.business.whatsapp||payment.booking.business.phone;
  if(phone)await tx.outboxMessage.upsert({where:{dedupeKey:`booking_payment_notice:${payment.id}`},update:{},create:{businessId:booking.businessId,destinationPhone:phone,purpose:'PAYMENT_NOTICE',content:review?'Pagamento recebido para reserva cancelada. Confira o recebimento e providencie atendimento/estorno.':`Pagamento online ${simulate?'simulado ':''}confirmado para a reserva de ${booking.customerName}.`,dedupeKey:`booking_payment_notice:${payment.id}`}});
  return {paid:!review,requiresReview:review};
 });
}
