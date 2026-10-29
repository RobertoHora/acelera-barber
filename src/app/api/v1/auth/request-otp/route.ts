import { randomInt } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { normalizePhoneE164, hashOtpCode } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Número de WhatsApp inválido' }, { status: 400 });
    }

    const phoneE164 = normalizePhoneE164(phone);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Rate limiting: máximo 3 solicitações a cada 10 minutos por telefone
    const recentRequests = await prisma.otpVerification.count({
      where: {
        phone: phoneE164,
        createdAt: { gte: tenMinutesAgo },
      },
    });

    if (recentRequests >= 3) {
      return NextResponse.json(
        { error: 'Muitas tentativas recentes. Aguarde alguns minutos antes de solicitar novo código.' },
        { status: 429 }
      );
    }

    // Gera código numérico de 6 dígitos
    const code = randomInt(100000, 1000000).toString();
    const codeHash = hashOtpCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      // Cria registro de verificação
      await tx.otpVerification.create({
        data: {
          phone: phoneE164,
          codeHash,
          expiresAt,
        },
      });

      // Enfileira mensagem na outbox transacional
      await tx.outboxMessage.create({
        data: {
          direction: 'OUTBOUND',
          destinationPhone: phoneE164,
          content: `🔐 Seu código de acesso ao Eleva e Agenda ORC é: *${code}*\n\nEle expira em 10 minutos. Nunca compartilhe este código com ninguém.`,
          purpose: 'AUTH_OTP',
          dedupeKey: `auth_otp:${phoneE164}:${Date.now()}`,
          status: 'QUEUED',
        },
      });
    });

    const isDev = process.env.NODE_ENV === 'test' && process.env.WHATSAPP_TRANSPORT_MODE === 'SIMULATED';

    return NextResponse.json({
      success: true,
      message: 'Código de verificação enviado para seu WhatsApp.',
      // Expõe devOtp apenas em modo de desenvolvimento ou transporte simulado para testes automatizados
      ...(isDev ? { devOtp: code } : {}),
    });
  } catch (err: any) {
    console.error('❌ [Request OTP] Erro:', err);
    return NextResponse.json({ error: 'Falha ao gerar código de acesso', details: err.message }, { status: 500 });
  }
}
