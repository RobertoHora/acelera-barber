# Arquitetura Técnica

## Decisão

Migrar a SPA estática para uma aplicação web com backend. O HTML atual é referência visual e de conteúdo, não deve continuar sendo a autoridade de dados, pagamento ou integrações.

## Componentes

```text
Cliente web
  -> API autenticada
     -> banco relacional
     -> storage privado de assets
     -> checkout hospedado InfinitePay e confirmação manual atestada
     -> provedor de coleta/IA somente no servidor
     -> futuras APIs Google e Meta
Painel de operações
  -> mesma API, com RBAC de operador
```

## Decisões obrigatórias

- Backend e banco são a fonte de verdade; navegador armazena apenas estado temporário não sensível.
- Tokens de URL são aleatórios, com expiração/revogação e escopo de um negócio.
- Chaves de Apify, Google e Meta nunca entram no bundle ou `localStorage`.
- Ações externas usam uma tabela de jobs/outbox, chave de idempotência, tentativas limitadas e log de resultado.
- Todos os endpoints verificam autorização por negócio, inclusive downloads e imagens.

## Cobrança InfinitePay

Adotar o mesmo modelo operacional do Estúdio ORC, sem compartilhar código, credenciais, links ou dados: um operador prepara um link oficial da InfinitePay para um pedido com preço congelado; o cliente paga no checkout hospedado; o operador confere comprovante, valor e negócio antes de liberar o entitlement. Não presumir webhook ou confirmação automática da InfinitePay.

## Preparação para Google/Meta

Implementar adaptadores com interfaces como `readProfile`, `validateDraft` e `applyDraft`. No MVP, o adaptador retorna `MANUAL_ASSISTED`; após homologação, ele pode realizar OAuth e escrita sem mudar a UX ou os dados.

## Observabilidade

Registrar eventos de produto, erros sanitizados, origem de lead, pagamento, mudanças de plano e resultado das ações. Não registrar tokens, senhas de Wi-Fi, dados de cartão ou conteúdo desnecessário de conversas.
