# Dados, estados e contratos

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Modelo lógico mínimo

| Entidades | Campos/regras essenciais |
| --- | --- |
| Lead, Identity, ConversationContext | origem, contato normalizado, negócio, papel, finalidade; telefone não é dono global |
| Business, User, Membership | slug único, timezone IANA, proprietário e permissões |
| ProfileDraft, Action, Asset | versão, evidência, estado manual/externo e acesso ao material |
| Professional, Service, ProfessionalService | habilitação, duração, buffer, preço em centavos |
| WorkingHours, ScheduleException | expediente semanal, intervalos, bloqueios e exceções por data |
| Customer, Booking | negócio, contato, profissional, intervalo UTC, estado, versão e snapshots do serviço/preço |
| PurchaseOrder, PaymentEvent, PaymentConfirmation | oferta, preço congelado, transação externa e origem da confirmação |
| Entitlement, TrialBenefit, Subscription | origem da compra, modalidade, activatedAt, endsAt, paidThrough e estado |
| NeedObservation, OfferPresentation | necessidade e evidência, oferta, motivo, resultado e próxima ação |
| NotificationJob, NotificationAttempt | evento, destinatário/papel, versão, finalidade, posse e recibo |
| ProviderConnection, ReferralEvent | capacidade, autorização, campanha e recompensa confirmada |
| ConsentRecord, SupportRequest, AuditEvent, GrowthEvent | finalidade, versão, origem, acesso e rastreabilidade |

TrialBenefit é único por negócio para a campanha inicial. Upgrade altera sua duração, não cria outro teste. Valores e datas são calculados no servidor.

## Estados independentes

- Reserva: CONFIRMED, CANCELLED, COMPLETED, NO_SHOW; pagamento presencial não exige pagamento eletrônico para CONFIRMED.
- Benefício/teste: AVAILABLE, ACTIVE, EXPIRED, REVOKED.
- Assinatura: INACTIVE, ACTIVE, PAST_DUE, CANCELLED; manter paidThrough separado.
- Pagamento: PENDING, VERIFIED, UNKNOWN, FAILED, REFUNDED, CHARGEBACK.
- Mensagem: QUEUED, CLAIMED, DISPATCHING, PROVIDER_ACCEPTED, DELIVERED, READ, FAILED, CANCELLED, UNKNOWN, UNCERTAIN.
- Stage comercial é derivado de fatos e não substitui o registro de compras ou assinatura.

## Contratos a implementar

| Operação | Interface proposta |
| --- | --- |
| Dados/horários públicos | GET /api/public/businesses/:slug/services, /professionals, /availability |
| Criar reserva | POST /api/public/businesses/:slug/bookings, com Idempotency-Key |
| Gerenciar reserva | GET/PATCH /api/public/bookings/:token; token privado e operações permitidas |
| Gestão do dono | /api/businesses/:id/profile, /services, /professionals, /schedule, /bookings |
| Ativar teste | POST /api/businesses/:id/agenda/activate, modalidade e versão do aceite |
| Iniciar cobrança | POST /api/checkout, offerId e contexto; servidor determina preço/recebedor |
| Reconciliar cobrança | POST /api/webhooks/infinitepay; confirmação manual em rota exclusiva de operador |
| Entrada/retorno do motor | eventos autenticados de serviço com eventId e versão |
| Resumo consultivo | leitura autenticada de etapa, direitos, necessidades e fatos de uso |

A IA chama as mesmas operações de reserva por uma identidade de serviço com escopo de negócio. Nunca escolhe um businessId recebido sem autorização.

## Eventos

DIAGNOSIS_COMPLETED, IMPROVEMENT_APPLIED, OFFER_PRESENTED, CHECKOUT_STARTED, PAYMENT_CONFIRMED, AGENDA_TRIAL_STARTED, BOOKING_CONFIRMED, BOOKING_CANCELLED, BOOKING_RESCHEDULED, NOTIFICATION_DELIVERED, AI_BOOKING_COMPLETED, TRIAL_ENDED, SUBSCRIPTION_ACTIVATED, PLAN_UPGRADED, SUBSCRIPTION_CANCELLED.

Envelope: eventId, eventType, schemaVersion, businessId, aggregateId, aggregateVersion, occurredAt, source, correlationId e payload mínimo. ActorId quando houver autenticação. Não incluir telefone em analytics geral.

## Integridade

Transação e restrição de não sobreposição por profissional para intervalos ativos, incluindo concorrência entre canais. Índices únicos para eventos, transações externas e idempotência. Eventos antigos não sobrescrevem estados terminais. Alterações usam versão para detectar conflito.

Dados importados têm source, observedAt e verificationStatus. Evidência desconhecida não vira false ou ranking medido. Definir schemas físicos, limites de payload e envelopes de erro no plano de engenharia.
