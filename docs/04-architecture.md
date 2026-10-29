# Arquitetura — aplicativos e motor único

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Existente e destino

Eleva usa Next.js 15 App Router, React 19, TypeScript e Tailwind na Vercel. Evoluir o código existente; index.html é legado, não ponto inicial para uma reescrita.

Agenda ORC usará o domínio agenda.oracio.uk e compartilhará a autoridade de negócio, compras e benefícios do Eleva. A organização de deploy/domínios e o fornecedor PostgreSQL serão registrados em ADR antes de implementar persistência. São escolhas de engenharia pendentes, não infraestrutura já provisionada.

## Fluxo lógico

Aplicativos → API autenticada → PostgreSQL → eventos/outbox persistidos → uma instância Eleva/Agenda baseada na Lana na VPS → um transporte/WhatsApp.

Retornos do motor atualizam tentativas, aceitação e entrega. Sessões longas do motor não serão executadas dentro de requisições serverless. Prospecção e confirmações usam a mesma instância com finalidades distintas.

## Autoridade e isolamento

- Banco determina direitos, teste, assinatura e disponibilidade; navegador não libera planos.
- Dono autenticado e membership por negócio; cliente final agenda sem conta.
- Segredos apenas no servidor; tokens e arquivos privados têm escopo e expiração.
- Integrar eventos entre banco/aplicação e motor com autenticação de serviço, idempotência e outbox, não por gravação dupla não atômica.
- Cada reserva confirmada grava evento na mesma transação; falha de consumo pode ser retomada.
- Uma cópia nova do motor serve todo o funil Eleva/Agenda. Banco, sessões, filas e credenciais do Estúdio ORC não são compartilhados.

## Cobrança e integrações

InfinitePay é o provedor escolhido. Modo manual atual não implica ausência de API. O futuro modo integrado exige confirmação verificável no servidor; fallback manual requer operador e auditoria. Nenhuma compra é validada por redirect.

Google/Instagram usam adaptadores de capacidade: leitura, preparação e escrita são permissões distintas. Aplicação manual é o padrão até validação por operação.

## Conversação e métricas

Contexto inclui negócio, participante, papel, finalidade e etapa. Comercial, transacional e IA da Agenda usam o mesmo motor, mas regras e direitos diferentes. Um telefone pode ter vários contextos. Eventos de produto alimentam um resumo persistido para a próxima ação consultiva.

Referências: [dados](05-data-api.md), [agenda](12-booking-notifications-contract.md), [motor](14-lana-replication-contract.md).

## Homologação assistida na VPS — 29/10/2026

O runtime isolado usa `eleva_agenda_e2e`; suítes usam `eleva_agenda_test`. Serviços `eleva-e2e-app` e `eleva-e2e-laura` não iniciam outra sessão WhatsApp. O gateway compartilhado aplica reserva exclusiva e persiste eventos privados. A infraestrutura de produção da Vercel deve ser validada separadamente; veja `qa/implementation.md`.
