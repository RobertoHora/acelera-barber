import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { normalizePhoneE164, hashOtpCode, computePhoneHmac, SESSION_COOKIE_NAME } from '@/lib/auth';
import crypto from 'node:crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json({ error: 'Telefone e código são obrigatórios' }, { status: 400 });
    }

    const phoneE164 = normalizePhoneE164(phone);
    const cleanDigits = phone.replace(/\D/g, '');
    const phoneHmac = computePhoneHmac(phone);

    // Busca código recente pendente
    const pendingVerification = await prisma.otpVerification.findFirst({
      where: {
        phone: phoneE164,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!pendingVerification) {
      return NextResponse.json(
        { error: 'Código expirado ou não encontrado. Solicite um novo código.' },
        { status: 400 }
      );
    }

    if (pendingVerification.attempts >= 5) {
      return NextResponse.json(
        { error: 'Número excessivo de tentativas inválidas. Solicite um novo código.' },
        { status: 429 }
      );
    }

    const providedHash = hashOtpCode(code);
    if (providedHash !== pendingVerification.codeHash) {
      await prisma.otpVerification.update({
        where: { id: pendingVerification.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: 'Código de verificação incorreto' }, { status: 401 });
    }

    // Código válido! Marca como verificado e cria sessão
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    const result = await prisma.$transaction(async (tx) => {
      // 1. Marca OTP como verificado
      await tx.otpVerification.update({
        where: { id: pendingVerification.id },
        data: { verifiedAt: new Date() },
      });

      // 2. Busca ou cria o usuário proprietário
      let user = await tx.user.findUnique({
        where: { phone: phoneE164 },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            phone: phoneE164,
            role: 'OWNER',
          },
        });
      }

      // 3. Vincula barbearias existentes órfãs com mesmo telefone ao usuário
      await tx.business.updateMany({
        where: {
          OR: [
            { phoneHmac },
            { phone: phoneE164 },
            { whatsapp: phoneE164 },
            { phone: cleanDigits },
            { whatsapp: cleanDigits },
          ],
          userId: null,
        },
        data: {
          userId: user.id,
        },
      });

      // 4. Cria sessão persistida
      const session = await tx.ownerSession.create({
        data: {
          sessionToken,
          userId: user.id,
          expiresAt,
        },
      });

      // 5. Busca barbearias vinculadas
      const businesses = await tx.business.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          slug: true,
          name: true,
          cleanName: true,
        },
      });

      return { user, session, businesses };
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      sessionToken,
      user: {
        id: result.user.id,
        phone: result.user.phone,
        name: result.user.name,
        role: result.user.role,
      },
      businesses: result.businesses,
    });

    // Cookie de sessão com domínio compartilhado .oracio.uk em produção
    const cookieDomain = process.env.SESSION_COOKIE_DOMAIN || undefined;

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: cookieDomain,
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('❌ [Verify OTP] Erro:', err);
    return NextResponse.json({ error: 'Falha ao autenticar código', details: err.message }, { status: 500 });
  }
}
