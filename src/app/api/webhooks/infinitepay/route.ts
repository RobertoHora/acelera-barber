import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { grantOrderBenefits } from '@/lib/billing/entitlements';
import { verifyWebhookSecret } from '@/lib/billing/infinitepay';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let body: any;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    // Validação de segurança de secret / token (quando configurado no header ou query)
    const secretHeader = request.headers.get('x-infinitepay-secret') || request.nextUrl.searchParams.get('token');
    if (process.env.NODE_ENV === 'production' && !verifyWebhookSecret(secretHeader)) {
      console.warn('⚠️ [InfinitePay Webhook] Rejeitado: segredo de webhook inválido.');
      return NextResponse.json({ error: 'Segredo de autenticação inválido' }, { status: 401 });
    }

    // Normaliza campos comuns de payload da InfinitePay
    const eventId = body.id || body.event_id || body.transaction_id || `evt_${Date.now()}`;
    const orderNsu = body.order_nsu || body.data?.order_nsu || body.reference_id;
    const status = (body.status || body.data?.status || body.event || '').toLowerCase();
    const transactionId = body.transaction_id || body.data?.transaction_id || body.nsu || eventId;
    const amountCents = body.amount_cents || (body.amount ? Math.round(Number(body.amount) * 100) : 0);

    if (!orderNsu) {
      return NextResponse.json({ error: 'order_nsu não informado no payload' }, { status: 400 });
    }

    // Trava Anti-Regressão #2: Rejeita ordens que não pertençam ao Eleva ORC
    if (!orderNsu.startsWith('eleva_')) {
      console.log(`ℹ️ [InfinitePay Webhook] Ignorando ordem não-Eleva (${orderNsu}).`);
      return NextResponse.json({ ignored: true, reason: 'NON_ELEVA_ORDER' }, { status: 200 });
    }

    // Idempotência estrita de recebimento de webhook
    const existingReceipt = await prisma.paymentWebhookReceipt.findUnique({
      where: { providerEventId: String(eventId) },
    });

    if (existingReceipt) {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    // Registra recebimento
    await prisma.paymentWebhookReceipt.create({
      data: {
        providerEventId: String(eventId),
        payload: body,
      },
    });

    // Localiza a ordem correspondente
    const order = await prisma.order.findUnique({
      where: { orderNsu },
      include: { business: true },
    });

    if (!order) {
      console.warn(`⚠️ [InfinitePay Webhook] Ordem ${orderNsu} não encontrada no banco.`);
      return NextResponse.json({ error: 'Ordem não encontrada' }, { status: 404 });
    }

    if (order.status === 'PAID') {
      return NextResponse.json({ success: true, alreadyPaid: true }, { status: 200 });
    }

    // Checa se o status indica pagamento aprovado
    const isApproved =
      status === 'paid' ||
      status === 'received' ||
      status === 'confirmed' ||
      status === 'payment.confirmed' ||
      status === 'approved';

    if (isApproved) {
      await prisma.$transaction(async (tx) => {
        // 1. Atualiza Ordem para PAID
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });

        // 2. Registra transação financeira
        await tx.paymentTransaction.upsert({
          where: { transactionId: String(transactionId) },
          update: { status: 'PAID', rawPayload: body },
          create: {
            orderId: order.id,
            transactionId: String(transactionId),
            amountCents: amountCents || order.amountCents,
            status: 'PAID',
            rawPayload: body,
          },
        });

        // 3. Concede os direitos (Entitlements) e benefícios de teste (TrialBenefit)
        await grantOrderBenefits(order.id, tx);

        // 4. Cancela cadência fria de abordagem imediatamente (Regra de Ouro do Funil Consultivo)
        await tx.outboxMessage.updateMany({
          where: {
            businessId: order.businessId,
            purpose: { in: ['INITIAL_OUTREACH', 'CADENCE_FOLLOWUP'] },
            status: { in: ['QUEUED', 'CLAIMED'] },
          },
          data: {
            status: 'CANCELLED',
            error: 'CANCELLED_ALREADY_CUSTOMER',
            leaseExpiresAt: null,
          },
        });

        // 5. Enfileira mensagem de boas-vindas / recibo no WhatsApp
        const destPhone = order.business.whatsapp || order.business.phone;
        if (destPhone) {
          await tx.outboxMessage.create({
            data: {
              businessId: order.businessId,
              direction: 'OUTBOUND',
              destinationPhone: destPhone,
              content: `🎉 Pagamento confirmado com sucesso para a *${order.business.cleanName || order.business.name}*!\n\nSeu acesso ao Eleva e seu benefício gratuito de teste da Agenda ORC estão liberados. Acesse seu painel: https://agenda.oracio.uk/painel`,
              purpose: 'PAYMENT_NOTICE',
              dedupeKey: `payment_notice:${order.id}`,
              status: 'QUEUED',
            },
          });
        }
      });

      console.log(`✅ [InfinitePay Webhook] Ordem ${order.orderNsu} reconciliada e benefícios liberados.`);
      return NextResponse.json({ success: true, orderNsu: order.orderNsu, status: 'PAID' });
    }

    return NextResponse.json({ received: true, status });
  } catch (err: any) {
    console.error('❌ [InfinitePay Webhook] Erro ao processar webhook:', err);
    return NextResponse.json({ error: 'Falha interna ao processar webhook', details: err.message }, { status: 500 });
  }
}
