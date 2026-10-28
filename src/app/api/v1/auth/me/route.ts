import { NextRequest, NextResponse } from 'next/server';
import { getCurrentOwner } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const owner = await getCurrentOwner(request);
  if (!owner) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, ...owner });
}
