import { NextRequest } from 'next/server';
import { prisma } from './db';
import crypto from 'node:crypto';

function requiredAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('AUTH_SECRET must contain at least 32 characters.');
  return secret;
}

export const SESSION_COOKIE_NAME = 'orc_owner_session';

export function normalizePhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55')) {
    return `+${digits}`;
  }
  return `+55${digits}`;
}

export function computePhoneHmac(phone: string): string {
  const secret = requiredAuthSecret();
  let clean = phone.replace(/\D/g, '');
  if (clean.length >= 10 && !clean.startsWith('55')) {
    clean = `55${clean}`;
  }
  return crypto.createHmac('sha256', secret).update(clean).digest('hex');
}

export function hashOtpCode(code: string): string {
  const secret = requiredAuthSecret();
  return crypto.createHmac('sha256', secret).update(code.trim()).digest('hex');
}

export interface OwnerSessionPayload {
  userId: string;
  phone: string;
  name: string | null;
  role: string;
  businesses: Array<{
    id: string;
    slug: string;
    name: string;
    cleanName: string | null;
  }>;
}

export async function getSessionFromToken(token: string): Promise<OwnerSessionPayload | null> {
  if (!token) return null;

  const session = await prisma.ownerSession.findUnique({
    where: { sessionToken: token },
    include: {
      user: {
        include: {
          businesses: {
            select: {
              id: true,
              slug: true,
              name: true,
              cleanName: true,
            },
          },
        },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    // Sessão expirada, remove em background
    prisma.ownerSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    userId: session.user.id,
    phone: session.user.phone,
    name: session.user.name,
    role: session.user.role,
    businesses: session.user.businesses,
  };
}

export async function getCurrentOwner(request: NextRequest): Promise<OwnerSessionPayload | null> {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return getSessionFromToken(authHeader.slice(7));
    }
    return null;
  }

  return getSessionFromToken(cookie.value);
}

export async function ownsBusiness(request: NextRequest, businessId: string): Promise<boolean> {
  const owner = await getCurrentOwner(request);
  return !!owner?.businesses.some(b => b.id === businessId);
}
