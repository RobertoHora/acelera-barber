import { timingSafeEqual } from 'node:crypto';
export function validInternalToken(request: Request): boolean {
  const expected=process.env.LAURA_INTERNAL_TOKEN;
  const received=request.headers.get('authorization')?.replace(/^Bearer /,'');
  return !!expected && !!received && expected.length===received.length && timingSafeEqual(Buffer.from(expected),Buffer.from(received));
}
