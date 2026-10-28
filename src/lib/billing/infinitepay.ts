import crypto from 'node:crypto';

export interface InfinitePayCheckoutParams {
  orderId: string;
  orderNsu: string;
  amountCents: number;
  customerName?: string;
  customerPhone?: string;
  redirectUrl?: string;
}

export function generateInfinitePayCheckoutUrl(params: InfinitePayCheckoutParams): string {
  const handle = process.env.INFINITEPAY_HANDLE || 'estudio-orc';
  const baseUrl = `https://loja.infinitepay.io/${handle}`;

  const query = new URLSearchParams({
    order_nsu: params.orderNsu,
    amount: (params.amountCents / 100).toFixed(2),
  });

  if (params.redirectUrl) {
    query.set('redirect_url', params.redirectUrl);
  }

  return `${baseUrl}?${query.toString()}`;
}

export function verifyWebhookSecret(token: string | null): boolean {
  const configuredSecret = process.env.INFINITEPAY_WEBHOOK_SECRET || 'eleva_orc_secret_key_2026';
  if (!token) return false;
  return token === configuredSecret;
}
