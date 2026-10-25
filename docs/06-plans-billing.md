# Planos, Paywall e Cobrança

## Catálogo inicial

| Plano | Objetivo | Recursos |
| --- | --- | --- |
| Gratuito | provar valor | diagnóstico, dados essenciais, uma bio, link WhatsApp e QR básico |
| Google Pro | ativar presença local | editor completo, serviços/preços, materiais Google, plaquinha e suporte de aplicação |
| Completo | manter presença e Instagram | tudo do Pro, kit Instagram, calendário, legendas/capas e acompanhamento |

O preço é configuração operacional; não deve ficar codificado na interface.

## Regras de upgrade

- Mostrar o paywall quando o cliente tentar salvar/exportar recurso pago, não no meio do diagnóstico.
- Preservar tudo que já preencheu antes de abrir o checkout.
- O cliente volta à tarefa exata após checkout.
- “Pago” só ocorre após comprovante, conferência e ateste explícito da operação.
- Cancelamento, expiração e reembolso revogam apenas os entitlements apropriados, preservando dados do negócio.

## Fluxo InfinitePay com confirmação manual

O Acelera Barber segue o modelo `INFINITEPAY_MANUAL` do Estúdio ORC: checkout hospedado, confirmação humana e liberação auditável. Não reutilizar links, credenciais, banco, operador ou qualquer dado do Estúdio ORC.

1. Criar `Order` local com pacote, valor em centavos, moeda e idempotency key.
2. Operador confirma que o cliente pediu o link e prepara o checkout InfinitePay oficial para aquele preço congelado.
3. Salvar URL, estado `AWAITING_PAYMENT` e o operador responsável; o cliente abre o checkout hospedado.
4. Retorno/redirecionamento do checkout apenas mostra “aguardando confirmação”; ele não altera acesso.
5. Operador confere comprovante, referência, valor e negócio, então registra ateste explícito.
6. Deduplicar referência/fingerprint do comprovante, marcar pagamento recebido, liberar entitlement e gravar auditoria.

Estados mínimos: `NOT_CREATED`, `ACTIVE`, `AWAITING_PAYMENT`, `PAID`, `UNKNOWN`, `FAILED`, `REFUND_REQUESTED`, `REFUNDED`. `UNKNOWN` bloqueia nova cobrança/liberação até reconciliação humana.
