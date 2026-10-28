import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (cookie?.value) {
    await prisma.ownerSession.deleteMany({
      where: { sessionToken: cookie.value },
    }).catch(() => {});
  }

  const response = NextResponse.json({ success: true, message: 'Logout realizado com sucesso' });
  const cookieDomain = process.env.SESSION_COOKIE_DOMAIN || undefined;

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    domain: cookieDomain,
    maxAge: 0,
  });

  return response;
}
