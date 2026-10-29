# Planos, benefícios, teste e cobrança

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

Este é o contrato comercial canônico. Cobrança configurável no servidor, valores em centavos e snapshot no pedido. Interface nunca é autoridade de preço.

## Catálogo aprovado

| offerId | Oferta | Preço | Direito/benefício |
| --- | --- | --- | --- |
| eleva_free | Eleva Gratuito | R$ 0 | Diagnóstico, bio inicial, link WhatsApp, QR neutro e checklist |
| eleva_google_pro | Eleva Google Pro | R$ 37 avulso | Catálogo/materiais Google, comodidades, plaquinha e suporte + 14 dias de Agenda |
| eleva_complete | Eleva Completo | R$ 57 avulso | Google Pro + capas/kit Instagram e conteúdo assistido + 30 dias de Agenda |
| eleva_complete_upgrade | Upgrade Google Pro → Completo | R$ 20 avulso | Diferença para quem já possui compra válida de R$ 37 |
| agenda_basic_monthly | Agenda ORC | R$ 37/mês | Página e gestão de agenda + confirmações WhatsApp para cliente e barbearia |
| agenda_ai_monthly | Agenda ORC com IA | R$ 67/mês | Tudo da Agenda básica + atendimento conversacional e agendamento no WhatsApp |

IA consultiva que vende aos donos pertence ao motor comercial comum. Atendimento automatizado aos clientes finais pertence ao direito agenda_ai, válido por teste escolhido ou assinatura.

## Teste gratuito

1. Compra Eleva verificada cria benefício AVAILABLE de 14 ou 30 dias; não inicia contagem.
2. Dono escolhe na ativação Agenda de R$ 37 ou de R$ 67. O teste disponibiliza os recursos da modalidade escolhida.
3. Primeira publicação operacional grava activatedAt uma única vez, modalidade e endsAt.
4. Período é de 14 ou 30 dias consecutivos a partir de activatedAt; exibir no timezone da barbearia.
5. Pro → Completo custa R$ 20 e define endsAt = activatedAt + 30 dias. Não adiciona 30 dias ao restante.
6. Se ainda não ativou, o benefício passa a 30 dias disponíveis. Se o teste já terminou, só existe saldo até o limite original de 30 dias; depois dele não nasce um novo teste.
7. Trocar modalidade não reinicia ou prolonga prazo; a nova escolha e alteração de direitos ficam auditadas.
8. Preview, simulador e configuração incompleta não consomem teste. Ativação requer recursos prometidos operacionais.
9. Não converter automaticamente em cobrança sem aceite e modalidade de pagamento validada.

Repetir compra, webhook ou publicação não concede benefício duplicado. Compras válidas e política de reembolso precisam ser reconciliadas antes de restaurar direitos. Benefício não vira desconto monetário retroativo de assinatura paga.

## Oferta e continuidade

Gratuito entrega valor antes do paywall. Dono pode ir direto à oferta adequada sem comprar degraus desnecessários. No fim do teste, contratar a modalidade desejada ou permanecer sem novas reservas/IA; preservar dados e acesso do dono às reservas já assumidas para atendê-las/cancelá-las.

Assinatura já paga conserva acesso até paidThrough, salvo revogação justificada e auditada. Upgrade mensal e política de proporcionalidade, tolerância de atraso, quotas e limites operacionais devem ser fechados no plano de implementação antes de vender recorrência; não inventar esses valores na interface.

## InfinitePay

Separar: compras Eleva/assinaturas recebidas pelo operador do produto; pagamentos de atendimentos recebidos pela barbearia; recompensas InfiniteTap.

O código atual só registra intenção e encaminha ao suporte. O destino é checkout integrado por pedido, com evento do provedor e consulta/reconciliação server-side. Nunca validar por redirect, localStorage, texto da conversa ou comprovante interpretado pela IA.

Modo manual pode ser mantido explicitamente: operador confere recebimento, negócio e valor e registra ateste. Deduplicar comprovante/referência e pagamento entre pedidos. UNKNOWN exige reconciliação, não nova cobrança cega.

R$ 37/mês e R$ 67/mês são preços recorrentes; débito automático no cartão depende de modalidade contratada/homologada. Renovação por checkout é uma alternativa operacional a especificar; não anunciar débito automático antes da validação.

## Separação de pagamentos no teste assistido — 29/10/2026

Compras dos planos Eleva e pagamentos de serviços da barbearia usam pedidos e recebedores independentes. No teste, serviços ficam simulados mesmo quando a compra Eleva avançar para R$37 + R$20 reais. A tag do barbeiro é declarada pelo proprietário autenticado; confirmação de pré-pagamento exige consulta server-side de valor e recebedor. Criar checkout não implementa débito mensal automático.
