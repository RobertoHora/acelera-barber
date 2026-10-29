import {prisma} from '@/lib/db';
import {grantOrderBenefits} from './entitlements';
import {checkInfinitePayPayment} from './infinitepay';
export async function reconcilePayment(input:{orderNsu:string;transactionNsu:string;slug:string}){
 const order=await prisma.order.findUnique({where:{orderNsu:input.orderNsu},include:{business:true}});
 if(!order||!order.orderNsu.startsWith('eleva_'))throw Error('Pedido não encontrado.');
 if(order.status==='PAID')return {paid:true,alreadyPaid:true};
 if(order.status!=='PENDING')throw Error('Pedido não elegível para confirmação.');
 const result=await checkInfinitePayPayment(input);
 if(!result.paid||result.amountCents!==order.amountCents)throw Error('Pagamento ou valor não confirmado pelo provedor.');
 await prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT id FROM "Order" WHERE id=${order.id} FOR UPDATE`;
  const current=await tx.order.findUniqueOrThrow({where:{id:order.id}});
  if(current.status==='PAID')return;
  const existing=await tx.paymentTransaction.findUnique({where:{transactionId:input.transactionNsu}});
  if(existing&&existing.orderId!==order.id)throw Error('Transação já vinculada a outro pedido.');
  await tx.order.update({where:{id:order.id},data:{status:'PAID',paidAt:new Date()}});
  await tx.paymentTransaction.upsert({where:{transactionId:input.transactionNsu},update:{status:'PAID'},create:{orderId:order.id,transactionId:input.transactionNsu,amountCents:order.amountCents,status:'PAID'}});
  await grantOrderBenefits(order.id,tx);
  await tx.paymentWebhookReceipt.upsert({where:{providerEventId:input.transactionNsu},update:{},create:{providerEventId:input.transactionNsu,payload:{orderNsu:input.orderNsu,slug:input.slug,verifiedServerSide:true}}});
  await tx.outboxMessage.updateMany({where:{businessId:order.businessId,purpose:{in:['INITIAL_OUTREACH','CADENCE_FOLLOWUP']},status:{in:['QUEUED','CLAIMED']}},data:{status:'CANCELLED',error:'CANCELLED_ALREADY_CUSTOMER',leaseExpiresAt:null}});
  const phone=order.business.whatsapp||order.business.phone;
  if(phone)await tx.outboxMessage.upsert({where:{dedupeKey:`payment_notice:${order.id}`},update:{},create:{businessId:order.businessId,destinationPhone:phone,content:`Pagamento confirmado para ${order.business.cleanName||order.business.name}. Seus benefícios estão liberados no Eleva ORC.`,purpose:'PAYMENT_NOTICE',dedupeKey:`payment_notice:${order.id}`}});
 });
 return {paid:true};
}
