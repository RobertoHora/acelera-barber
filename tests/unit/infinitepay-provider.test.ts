import {it,expect,vi,afterEach} from 'vitest';
import {generateInfinitePayCheckoutUrl,checkInfinitePayPayment,verifyWebhookSecret} from '@/lib/billing/infinitepay';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
it('creates a checkout with cents and verifies payment server-side',async()=>{
 vi.stubEnv('INFINITEPAY_HANDLE','test-store');
 const mocked=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>({url:'https://checkout.infinitepay.io/test'})}).mockResolvedValueOnce({ok:true,json:async()=>({success:true,paid:true,amount:3700})});
 vi.stubGlobal('fetch',mocked);
 expect(await generateInfinitePayCheckoutUrl({orderId:'o',orderNsu:'eleva_test',amountCents:3700})).toContain('https://checkout.infinitepay.io/');
 const payload=JSON.parse(mocked.mock.calls[0][1].body);expect(payload.items[0].price).toBe(3700);expect(payload.order_nsu).toBe('eleva_test');
 expect(await checkInfinitePayPayment({orderNsu:'eleva_test',transactionNsu:'tx',slug:'slug'})).toEqual({paid:true,amountCents:3700});
});
it('rejects missing secrets and foreign checkout hosts',async()=>{
 vi.stubEnv('INFINITEPAY_WEBHOOK_SECRET','');expect(verifyWebhookSecret('anything')).toBe(false);
 vi.stubEnv('INFINITEPAY_HANDLE','test-store');vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({url:'https://evil.test'})}));
 await expect(generateInfinitePayCheckoutUrl({orderId:'o',orderNsu:'eleva_test',amountCents:3700})).rejects.toThrow('Domínio');
});
