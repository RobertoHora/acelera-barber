import {consultativeReply} from './consultative-cognition';
import {withTestAccess} from '@/lib/test-links';
import { prisma } from '@/lib/db';
import { LAURA_TOOLS, LauraToolContext } from './agenda-tools';
import { buildConsultativeSummary, ConsultativeSummary } from '@/lib/telemetry/consultative-summary';

export type UserRoleContext = 'PROSPECT_OWNER' | 'ACTIVE_OWNER' | 'END_CUSTOMER' | 'AMBIGUOUS_MULTI_BUSINESS';

export interface ResolveRoleResult {
  role: UserRoleContext;
  businessId?: string;
  businessName?: string;
  ambiguousBusinesses?: Array<{ id: string; name: string }>;
}

/**
 * Resolve o papel do remetente e barbearia ativa com desambiguação multi-negócio
 */
export async function resolveSenderContext(
  phoneE164: string,
  explicitSlugOrRef?: string
): Promise<ResolveRoleResult> {
  const clean = phoneE164.replace(/\D/g, '');

  // 1. Se veio com slug ou referência explícita na mensagem (ex: ref:alfa)
  if (explicitSlugOrRef) {
    const biz = await prisma.business.findFirst({
      where: { OR: [{ slug: explicitSlugOrRef }, { id: explicitSlugOrRef }] },
    });
    if (biz) {
      return {
        role: 'END_CUSTOMER',
        businessId: biz.id,
        businessName: biz.cleanName || biz.name,
      };
    }
  }

  // 2. Verifica se o remetente é proprietário cadastrado
  const ownerUser = await prisma.user.findFirst({
    where: { phone: phoneE164 },
    include: {
      businesses: true,
    },
  });

  if (ownerUser && ownerUser.businesses.length > 0) {
    if (ownerUser.businesses.length === 1) {
      const biz = ownerUser.businesses[0];
      return {
        role: 'ACTIVE_OWNER',
        businessId: biz.id,
        businessName: biz.cleanName || biz.name,
      };
    }

    // Mais de 1 barbearia para o mesmo dono: exige desambiguação
    return {
      role: 'AMBIGUOUS_MULTI_BUSINESS',
      ambiguousBusinesses: ownerUser.businesses.map((b) => ({
        id: b.id,
        name: b.cleanName || b.name,
      })),
    };
  }

  // 3. Verifica se tem agendamento ativo ou recente como cliente
  const recentBooking = await prisma.booking.findFirst({
    where: {
      customerPhoneE164: phoneE164,
      startsAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) },
    },
    include: { business: true },
    orderBy: { startsAt: 'desc' },
  });

  if (recentBooking) {
    return {
      role: 'END_CUSTOMER',
      businessId: recentBooking.businessId,
      businessName: recentBooking.business.cleanName || recentBooking.business.name,
    };
  }

  // 4. Default: Se não for proprietário nem tiver reserva recente, busca primeira barbearia associada ou retorna genérico
  const matchingBiz = await prisma.business.findFirst({
    where: {
      OR: [{ phone: phoneE164 }, { whatsapp: phoneE164 }],
    },
  });

  if (matchingBiz) {
    return {
      role: 'PROSPECT_OWNER',
      businessId: matchingBiz.id,
      businessName: matchingBiz.cleanName || matchingBiz.name,
    };
  }

  return { role: 'END_CUSTOMER' };
}

/**
 * Processamento cognitivo das respostas da Laura
 */
export async function processLauraMessage(
  incomingText: string,
  phoneE164: string,
  explicitSlug?: string,
  db: any = prisma,
  prepared?: Awaited<ReturnType<typeof consultativeReply>>
): Promise<{
  businessId?: string;
  replyText: string;
  toolUsed?: string;
  toolResult?: any;
  consultativeSummary?: ConsultativeSummary | null;
}> {
  let context = await resolveSenderContext(phoneE164, explicitSlug);
  if(context.role==='AMBIGUOUS_MULTI_BUSINESS'){
    const selection=Number(incomingText.trim())-1;
    const picked=context.ambiguousBusinesses?.[selection];
    const previous=await db.lauraConversation.findUnique({where:{phone_scope:{phone:phoneE164,scope:'owner-context'}}});
    const savedBusiness=(previous?.state as any)?.businessId;
    const selected=picked||context.ambiguousBusinesses?.find(b=>b.id===savedBusiness);
    if(selected){await db.lauraConversation.upsert({where:{phone_scope:{phone:phoneE164,scope:'owner-context'}},update:{state:{businessId:selected.id}},create:{phone:phoneE164,scope:'owner-context',state:{businessId:selected.id}}});context={role:'ACTIVE_OWNER',businessId:selected.id,businessName:selected.name};}
  }

  const scope = explicitSlug || context.businessId || 'sales';
  const prior = await db.lauraConversation.findUnique({where:{phone_scope:{phone:phoneE164,scope}}});
  const state: any = prior?.state || {};
  const save = async (next: any) => db.lauraConversation.upsert({where:{phone_scope:{phone:phoneE164,scope}},update:{state:next},create:{phone:phoneE164,scope,state:next}});
  const folded = incomingText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  if (/^(parar|sair|remover|cancelar mensagens|nao quero|stop)\b/.test(folded)) {
    await save({...state,optOut:true});
    return {businessId:context.businessId,replyText:'Certo, vou encerrar as mensagens comerciais. Se precisar, você pode nos chamar por aqui.'};
  }
  if(state.optOut)return {businessId:context.businessId,replyText:'As mensagens comerciais estão desativadas. Para voltar, solicite a retomada do atendimento.'};
  if(state.handoff)return {businessId:context.businessId,replyText:''};

  // 1. Caso de Desambiguação Multi-Negócio
  if (context.role === 'AMBIGUOUS_MULTI_BUSINESS' && context.ambiguousBusinesses) {
    const list = context.ambiguousBusinesses
      .map((b, i) => `*${i + 1}.* ${b.name}`)
      .join('\n');
    return {
      replyText: `Olá! Notei que você gerencia mais de uma barbearia conosco:\n\n${list}\n\nSobre qual delas você gostaria de falar agora? (Responda com o número)`,
    };
  }

  const normalized = incomingText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  // 2. Atendimento ao Cliente Final (END_CUSTOMER)
  if (context.role === 'END_CUSTOMER' && context.businessId) {
    const toolCtx: LauraToolContext = {
      businessId: context.businessId,
      customerPhoneE164: phoneE164,
    };

    if(folded==='recomecar'){await save({});state.bookingStep=null;}
    if(/^(cancelar|cancela|desmarcar)( meu horario| agendamento| reserva)?$/.test(folded)){
      const booking=await prisma.booking.findFirst({where:{businessId:context.businessId,customerPhoneE164:phoneE164,status:'CONFIRMED',startsAt:{gt:new Date()}},orderBy:{startsAt:'asc'}});
      if(!booking)return {businessId:context.businessId,replyText:'Não encontrei um agendamento futuro para este WhatsApp.'};
      if(!state.cancelPending){await save({...state,cancelPending:booking.id});return {businessId:context.businessId,replyText:'Você quer cancelar seu próximo agendamento? Envie confirmar cancelamento. Você também pode usar o link privado recebido.'};}
    }
    if(folded==='confirmar cancelamento' && state.cancelPending){const result=await LAURA_TOOLS.cancelBooking({bookingId:state.cancelPending},toolCtx);await save({});return {businessId:context.businessId,replyText:result.voucherCode?`Agendamento cancelado. Seu voucher é ${result.voucherCode}.`:'Agendamento cancelado.',toolUsed:'cancelBooking',toolResult:result};}
    if(state.bookingStep && !/(falar com|humano|atendente)/.test(folded)) {
      if(state.bookingStep === 'service') {
        const services=await LAURA_TOOLS.listServices(toolCtx);
        const selected=services[Number(folded)-1];
        if(!selected)return {businessId:context.businessId,replyText:'Escolha o número do serviço da lista anterior.'};
        await save({...state,serviceId:selected.id,bookingStep:'date'});
        return {businessId:context.businessId,replyText:'Qual dia prefere? Envie DD/MM/AAAA, hoje ou amanhã.'};
      }
      if(state.bookingStep === 'date') {
        const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());
        let date=folded==='hoje'?today:folded==='amanha'?new Date(new Date(today+'T12:00:00-03:00').getTime()+86400000).toISOString().slice(0,10):'';
        const m=folded.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if(m)date=`${m[3]}-${m[2]}-${m[1]}`;
        if(!date)return {businessId:context.businessId,replyText:'Envie a data em DD/MM/AAAA ou diga hoje ou amanhã.'};
        const slots=await LAURA_TOOLS.getAvailableSlots({dateString:date,serviceId:state.serviceId},toolCtx);
        if(!slots.length)return {businessId:context.businessId,replyText:'Não há horários nesse dia. Qual outra data prefere?'};
        await save({...state,slots:slots.slice(0,12),bookingStep:'slot'});
        return {businessId:context.businessId,replyText:'Escolha um horário pelo número:\n'+slots.slice(0,12).map((v:any,i:number)=>`${i+1}. ${v.displayTime} — ${v.professionalName}`).join('\n')};
      }
      if(state.bookingStep === 'slot') {
        const slot=state.slots?.[Number(folded)-1];
        if(!slot)return {businessId:context.businessId,replyText:'Envie o número do horário escolhido.'};
        await save({...state,slot,bookingStep:'name'});
        return {businessId:context.businessId,replyText:'Qual é o seu nome? Já usaremos este WhatsApp para a confirmação.'};
      }
      if(state.bookingStep === 'name') {
        if(incomingText.trim().length<2)return {businessId:context.businessId,replyText:'Informe seu nome para concluir.'};
        await save({...state,customerName:incomingText.trim(),bookingStep:'confirm'});
        return {businessId:context.businessId,replyText:`${incomingText.trim()}, confirmar o horário ${state.slot.displayTime} com ${state.slot.professionalName}? Responda sim. Pagamento no local.`};
      }
      if(state.bookingStep === 'confirm') {
        if(!/^(sim|confirmo|confirmar|ok)$/.test(folded))return {businessId:context.businessId,replyText:'Responda sim para confirmar ou recomeçar para escolher outro horário.'};
        const booked=await LAURA_TOOLS.createBooking({serviceId:state.serviceId,professionalId:state.slot.professionalId,startsAt:state.slot.startsAt,customerName:state.customerName,idempotencyKey:state.bookingKey},toolCtx);
        if(!booked.allowed){await save({});return {businessId:context.businessId,replyText:booked.message || 'Use o link público para agendar.'};}
        if(!booked.success){await save({...state,bookingStep:'date'});return {businessId:context.businessId,replyText:'Esse horário foi ocupado. Qual outra data prefere?'};}
        await save({lastBookingId:booked.bookingId});
        return {businessId:context.businessId,replyText:`Agendamento confirmado! Gerencie sua reserva: ${booked.managementUrl}`,toolUsed:'createBooking',toolResult:booked};
      }
    }
    // Solicitação de atendente humano
    if (/(?:falar com|humano|atendente|pessoa|barbeiro|dono)/i.test(normalized)) {
      await save({...state,handoff:true});
      const handoff = await LAURA_TOOLS.handoffToHuman({ reason: incomingText }, toolCtx);
      return {
        replyText: 'Perfeito! Já avisei a equipe da barbearia que você precisa falar com alguém. Um profissional te responderá aqui em breve.',
        toolUsed: 'handoffToHuman',
        toolResult: handoff,
      };
    }

    // Consulta de serviços / preços
    if (/(?:servi[çc]os|pre[çc]os|quanto custa|tabela|cortes)/i.test(normalized)) {
      const services = await LAURA_TOOLS.listServices(toolCtx);
      const formatted = services
        .map((s) => `💈 *${s.name}* — ${s.priceFormatted} (${s.durationMinutes} min)`)
        .join('\n');

      return {
        replyText: `Aqui estão os nossos serviços disponíveis:\n\n${formatted}\n\nPara qual dia você gostaria de agendar?`,
        toolUsed: 'listServices',
        toolResult: services,
      };
    }

    if (/(horarios|disponivel|vagas|marcar|agendar|hoje|amanha|recomecar)/.test(folded)) {
      const services=await LAURA_TOOLS.listServices(toolCtx);
      if(!services.length)return {businessId:context.businessId,replyText:'A barbearia ainda está preparando os serviços. Posso chamar a equipe.'};
      await save({bookingStep:'service',bookingKey:`laura_booking:${phoneE164}:${Date.now()}`});
      return {businessId:context.businessId,replyText:'Qual serviço deseja? Responda o número:\n'+services.map((v,i)=>`${i+1}. ${v.name} — ${v.priceFormatted}`).join('\n')};
    }

    return {
      replyText: `Olá! Sou a Laura, assistente virtual da *${context.businessName || 'barbearia'}*. Posso te passar nossa tabela de serviços ou ajudar a marcar seu corte. Como posso te ajudar hoje?`,
    };
  }

  // 3. Atendimento Consultivo ao Dono da Barbearia (ACTIVE_OWNER)
  if (context.role === 'ACTIVE_OWNER' || context.role === 'PROSPECT_OWNER') {
    let recommendation = '';
    let summary: ConsultativeSummary | null = null;
    if (context.businessId) {
      summary = await buildConsultativeSummary(context.businessId);
      if (summary) {
        recommendation = `\n\n💡 *Próximo passo recomendado:* ${summary.nextRecommendedAction}`;
      }
    }

    if(/(?:humano|pessoa da equipe|atendente)/.test(folded)){await save({...state,handoff:true});return {businessId:context.businessId,replyText:'claro, vou deixar a conversa para a equipe.'};}
    const decision=prepared===undefined?await consultativeReply(incomingText,phoneE164,context.businessId!):prepared;
    if(decision){
      if(decision.consent)await save({...state,salesStep:'FREE_INVITED',consentedAt:state.consentedAt||new Date().toISOString()});
      const deliver=decision.deliverLink && (decision.consent||!!state.consentedAt);
      const business=await prisma.business.findUniqueOrThrow({where:{id:context.businessId}});
      const slug=(business.cleanName||business.name).replace(/\s*\(TESTE\)/i,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const link=deliver&&process.env.LAURA_PUBLIC_LINK_READY==='true'?'\n\nhttps://eleva.oracio.uk/'+slug:'';
      return {businessId:context.businessId,replyText:decision.replyText+link,consultativeSummary:summary};
    }
    // Tests without a model credential do not represent the live cognition.
    return {businessId:context.businessId,replyText:'Sou a Laura. Você pode começar pela análise gratuita das informações da barbearia no Google.',consultativeSummary:summary};
  }

  return {
    replyText: 'Olá! Sou a Laura da Agenda ORC. Como posso te ajudar hoje?',
  };
}
