# Contrato de agenda, IA e notificações

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Disponibilidade e gravação

Serviço tem duração positiva, preço e buffer confirmados; profissional deve estar habilitado. Horários disponíveis derivam de expediente, pausas, exceções e reservas ativas. Persistir instantes UTC, exibir timezone IANA da unidade.

Criar reserva e evento de domínio atomicamente, usando chave de idempotência e proteção de sobreposição no PostgreSQL. Dois pedidos públicos ou IA simultâneos não podem ocupar o mesmo profissional/intervalo. Reagendamento verifica novo intervalo antes de liberar o anterior, na mesma transação.

No MVP de pagamento presencial, reserva é CONFIRMED após gravação. Futuro sinal antecipado exigirá contrato próprio de hold/expiração e pagamento tardio; não simular esse comportamento agora.

## Eventos para o motor

BOOKING_CONFIRMED, BOOKING_CANCELLED e BOOKING_RESCHEDULED carregam eventId, businessId, bookingId, bookingVersion, occurredAt e referência ao conteúdo autorizado. O motor recupera dados mínimos com identidade de serviço, não por acesso irrestrito ao banco do aplicativo.

Cada evento gera destinatário CUSTOMER e BUSINESS. Chave semântica = negócio + reserva + versão + tipo + papel do destinatário. Reentrega é idempotente. Se o mesmo número acumular os papéis, combinar o aviso em uma única entrega identificada pelos dois papéis.

Antes de enviar, revalidar versão e estado; mensagem antiga pendente é cancelada. Envio externo já iniciado pode ter sido aceito: registrar o limite, não prometer recolhimento. Mensagem incerta exige reconciliação, nunca reenvio cego.

## Conteúdo

- Cliente: barbearia, serviço, profissional, data/hora, endereço e link privado.
- Barbearia: nome do cliente, serviço, profissional, data/hora e acesso administrativo.
- Confirmações não contêm upsell ou campanha.
- Cancelamento e reagendamento descrevem o novo estado confirmado.
- Falha em um destinatário não duplica entrega já aceita ao outro.
- PROVIDER_ACCEPTED não equivale a DELIVERED. Sem recibo de entrega, informar somente aceitação.

## IA da Agenda

Somente para modalidade IA ativa em teste ou assinatura. Consultoria ao dono continua no motor comum.

Ferramentas mínimas: obter negócio/contexto, listar serviços/profissionais, consultar disponibilidade, criar reserva, consultar reserva autorizada, cancelar e reagendar. Todas usam a mesma API e restrições da interface pública.

Antes de mutar: contexto inequívoco, autorização do participante e resumo aceito. Não inventar preço/horário nem usar dados de outro negócio. Em ambiguidade, pedir esclarecimento; em falha, informar que não concluiu. Pedido de humano interrompe automação segundo política aplicável.

## Temporização

A trilha transacional não espera a cadência de prospecção. Continua sujeita a conexão, restrição, kill switch, fila/posse, limites do transporte e preferência transacional. Explicar no painel quando houver atraso. Prospecção não impede a agenda de funcionar nem autoriza ignorar uma restrição global.
