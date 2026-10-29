import { timingSafeEqual } from 'node:crypto';
export interface InfinitePayCheckoutParams {
 orderId:string;orderNsu:string;amountCents:number;customerName?:string;customerPhone?:string;redirectUrl?:string;
}
function config(){
 const handle=process.env.INFINITEPAY_HANDLE?.replace(/^\$/,'');
 if(!handle)throw Error('INFINITEPAY_HANDLE não configurado.');
 return {handle,headers:{'Content-Type':'application/json',...(process.env.INFINITEPAY_API_KEY?{'X-Api-Key':process.env.INFINITEPAY_API_KEY}:{})}};
}
export async function generateInfinitePayCheckoutUrl(params:InfinitePayCheckoutParams):Promise<string>{
 const {handle,headers}=config();
 const webhookUrl=process.env.INFINITEPAY_WEBHOOK_URL;
 const webhook=webhookUrl && process.env.INFINITEPAY_WEBHOOK_SECRET ? `${webhookUrl}${webhookUrl.includes('?')?'&':'?'}token=${encodeURIComponent(process.env.INFINITEPAY_WEBHOOK_SECRET)}` : undefined;
 const res=await fetch('https://api.checkout.infinitepay.io/links',{method:'POST',headers,signal:AbortSignal.timeout(15000),body:JSON.stringify({handle,order_nsu:params.orderNsu,redirect_url:params.redirectUrl,webhook_url:webhook,items:[{quantity:1,price:params.amountCents,description:'Eleva ORC — '+params.orderId}],customer:{name:params.customerName,phone_number:params.customerPhone}})});
 if(!res.ok)throw Error(`InfinitePay checkout HTTP ${res.status}`);
 const body=await res.json();
 const link=body.url||body.checkout_url||body.checkouturl||body.link;
 if(typeof link!=='string')throw Error('InfinitePay não retornou URL de checkout.');
 const url=new URL(link);
 if(url.protocol!=='https:'|| !(url.hostname==='infinitepay.io'||url.hostname.endsWith('.infinitepay.io')))throw Error('Domínio de checkout inválido.');
 return url.toString();
}
export async function checkInfinitePayPayment(input:{orderNsu:string;transactionNsu:string;slug:string}){
 const {handle,headers}=config();
 const res=await fetch('https://api.checkout.infinitepay.io/payment_check',{method:'POST',headers,signal:AbortSignal.timeout(15000),body:JSON.stringify({handle,order_nsu:input.orderNsu,transaction_nsu:input.transactionNsu,slug:input.slug})});
 if(!res.ok)throw Error('Falha ao confirmar pagamento na InfinitePay.');
 const body=await res.json();
 return {paid:body.success===true&&body.paid===true,amountCents:Number(body.amount)};
}
export function verifyWebhookSecret(token:string|null):boolean{
 const secret=process.env.INFINITEPAY_WEBHOOK_SECRET;
 return !!secret && !!token && token.length===secret.length && timingSafeEqual(Buffer.from(token),Buffer.from(secret));
}
