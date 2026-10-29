import {prisma} from '@/lib/db';
import {getDayAvailability} from '@/lib/agenda/availability';
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

    const business=await prisma.business.findUnique({where:{id:businessId},include:{trialBenefit:true,subscription:true}});
    const trial=business?.trialBenefit;const sub=business?.subscription;
    const activeTrial=trial?.status==='ACTIVE' && trial.endsAt && trial.endsAt>new Date();
    const activeSub=sub?.status==='ACTIVE' && sub.currentPeriodEnd>new Date();
    if(!activeTrial&&!activeSub)return NextResponse.json({error:'A agenda ainda não está publicada ou o acesso expirou.'},{status:403});
    const requested=new Date(startsAt);
    if(!Number.isFinite(requested.getTime()))return NextResponse.json({error:'Data inválida.'},{status:400});
    const dateString=new Intl.DateTimeFormat('en-CA',{timeZone:business!.timezone}).format(requested);
    const slots=await getDayAvailability({businessId,serviceId,professionalId,dateString});
    if(!slots.some(s=>s.startsAt===requested.toISOString()))return NextResponse.json({error:'Horário não disponível.',code:'SLOT_UNAVAILABLE'},{status:409});
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
        isPrepaid: false,
        prepaidAmountCents: undefined,
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
