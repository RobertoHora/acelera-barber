# PRD — Eleva ORC e Agenda ORC

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Objetivo e público

Ajudar o dono de uma barbearia a melhorar sua presença digital e transformar interesse em agendamentos. O cliente final escolhe serviço, profissional e horário e informa somente nome e WhatsApp. O dono utiliza administração autenticada; o cliente final não cria conta.

A primeira experiência é gratuita. Um único atendimento consultivo identifica necessidades e acompanha uso para oferecer os próximos produtos, sem exigir passagem por todas as compras intermediárias.

## Produtos e valor

| Produto | Preço | Valor principal |
| --- | --- | --- |
| Eleva Gratuito | R$ 0 | Diagnóstico explicável, bio inicial, link WhatsApp e QR neutro |
| Eleva Google Pro | R$ 37 avulso | Materiais e melhorias Google + 14 dias de Agenda |
| Eleva Completo | R$ 57 avulso | Google Pro + kit Instagram + 30 dias de Agenda |
| Agenda ORC | R$ 37/mês | Agenda e confirmações WhatsApp para cliente e barbearia |
| Agenda ORC com IA | R$ 67/mês | Agenda, confirmações e atendimento conversacional com agendamento no WhatsApp |

[Regras comerciais completas](06-plans-billing.md): upgrade Eleva por R$ 20, teste iniciado na primeira ativação real, modalidade escolhida pelo dono e ausência de reinício de prazo.

## Requisitos de produto

- Preservar identidade dark matte, componentes existentes e landing simplificada.
- Pré-preencher com dados existentes/autorizados e deixar o dono confirmar horários, serviços e preços; desconhecido não equivale a ausente.
- Preparar textos e materiais para aplicação manual no Google/Instagram; integrações opcionais não bloqueiam a agenda.
- Publicar página da barbearia e administração em Agenda ORC, com disponibilidade real e proteção contra sobreposição.
- Confirmar na tela e notificar cliente e barbearia pelo mesmo motor/WhatsApp.
- IA do plano de R$ 67 usa as mesmas operações de agenda que a interface pública.
- Medir uso, necessidades, ofertas, compras, ativação, renovação e cancelamento para orientar atendimento.
- Atendimento consultivo ao dono é distinto do serviço de IA contratado para clientes finais.

## Não incluído na primeira entrega

ERP, estoque, folha/comissões complexas, fidelidade e geração de cortes com IA. Pagamento antecipado do atendimento é evolução; no início o cliente paga na barbearia. Não prometer ranking, botão azul Google garantido ou sincronização sem integração validada.

## Critérios de sucesso

- Lead conclui uma melhoria gratuita e consegue retornar sem perder dados confirmados.
- Compra concede recursos e benefício de teste corretos uma única vez.
- Dono publica a agenda, escolhe modalidade e enxerga início/fim do teste.
- Cliente agenda com nome e WhatsApp e dono encontra a reserva no painel.
- Quando o motor estiver ativo, os dois destinatários recebem confirmação rastreável.
- IA nunca inventa disponibilidade ou anuncia reserva que não foi gravada.
- Métricas de conversão são reconstruíveis por eventos persistidos; compra não encerra o relacionamento.

A meta inicial é um piloto com três barbearias. Prazos são estimativas por fase, não promessa de toda a ampliação concluída em dez dias.
