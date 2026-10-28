import { NextRequest, NextResponse } from 'next/server';
import { createBooking } from '@/lib/agenda/booking-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      serviceId,
      professionalId,
      startsAt,
      customerName,
      customerPhone,
      notes,
      idempotencyKey,
      isPrepaid,
      prepaidAmountCents,
    } = body;

    const result = await createBooking(
      {
        businessId,
        serviceId,
        professionalId,
        startsAt,
        customerName,
        customerPhone,
        notes,
        idempotencyKey,
        isPrepaid: Boolean(isPrepaid),
        prepaidAmountCents: prepaidAmountCents ? Number(prepaidAmountCents) : undefined,
      },
      { role: 'PUBLIC_WEB', businessId }
    );

    return NextResponse.json({
      success: true,
      booking: result.booking,
      bookingToken: result.bookingToken,
      managementUrl: result.bookingToken ? `https://agenda.oracio.uk/b/${result.bookingToken}` : undefined,
    }, { status: 201 });
  } catch (err: any) {
    if (err.status === 409 || err.code === 'SLOT_UNAVAILABLE') {
      return NextResponse.json({
        error: err.message,
        code: 'SLOT_UNAVAILABLE',
        nextAvailableSlots: err.nextAvailableSlots || [],
      }, { status: 409 });
    }

    console.error('❌ [Public Booking API] Erro:', err);
    return NextResponse.json({ error: err.message || 'Falha ao agendar' }, { status: 400 });
  }
}
