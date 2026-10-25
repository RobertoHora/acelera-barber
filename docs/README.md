# Documentação do Produto

Este diretório é a fonte de verdade para construir o Acelera Barber como um produto vendável. O MVP não promete escrita automática em Google ou Instagram enquanto as integrações oficiais não estiverem aprovadas.

## Ordem de leitura

1. [PRD](01-prd.md): problema, público, resultado e escopo.
2. [Escopo e roadmap](02-mvp-roadmap.md): o que entra em duas semanas e o que fica fora.
3. [Jornadas UX](03-ux-flows.md): telas, estados e menor atrito.
4. [Arquitetura](04-architecture.md): componentes e limites técnicos.
5. [Dados e API](05-data-api.md): entidades, estados e contratos.
6. [Planos e cobrança](06-plans-billing.md): entitlement e confirmação de pagamento.
7. [Integrações](07-integrations-sync.md): modo manual atual e caminho Google/Meta.
8. [Aquisição e operação](08-acquisition-operations.md): ligação segura com a prospecção do Estúdio ORC.
9. [Segurança e privacidade](09-security-privacy.md): controles obrigatórios.
10. [Qualidade e lançamento](10-quality-release.md): critérios de aceite e piloto.

## Convenções

- `MANUAL_ASSISTED` significa que a ferramenta prepara a alteração e orienta o cliente; não escreve na plataforma externa.
- Apenas uma confirmação manual atestada por operador altera um plano para pago. O checkout hospedado da InfinitePay não é prova de pagamento.
- Cliente e operador veem o estado real de cada ação: rascunho, pronto para aplicar, confirmado pelo cliente, pendente ou falhou.
- Integrações, mensagens e pagamento são fronteiras externas: toda mudança nelas requer logs, idempotência e teste isolado.
