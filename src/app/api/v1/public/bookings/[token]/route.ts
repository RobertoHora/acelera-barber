import { NextRequest, NextResponse } from 'next/server';
import { getBookingByToken, cancelBooking, hashBookingToken } from '@/lib/agenda/booking-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const booking = await getBookingByToken(token);

  if (!booking) {
    return NextResponse.json({ error: 'Agendamento não encontrado ou link inválido' }, { status: 404 });
  }

  const now = Date.now();
  const startsAtMs = booking.startsAt.getTime();
  const canCancelFree = (startsAtMs - now) >= (booking.business.cancellationNoticeHours * 3600 * 1000);

  return NextResponse.json({
    booking,
    canCancelFree,
    cancellationNoticeHours: booking.business.cancellationNoticeHours,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const booking = await getBookingByToken(token);

    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado ou link inválido' }, { status: 404 });
    }

    const tokenHash = hashBookingToken(token);
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'Cancelado pelo cliente no link exclusivo';

    const result = await cancelBooking(booking.id, reason, {
      role: 'CUSTOMER_TOKEN',
      businessId: booking.businessId,
      tokenHash,
    });

    return NextResponse.json({
      success: true,
      booking: result.booking,
      isLate: 'isLate' in result ? result.isLate : false,
      voucherCode: 'voucherCode' in result ? result.voucherCode : null,
    });
  } catch (err: any) {
    console.error('❌ [Booking Cancel API] Erro:', err);
    return NextResponse.json({ error: err.message || 'Falha ao cancelar agendamento' }, { status: 400 });
  }
}
