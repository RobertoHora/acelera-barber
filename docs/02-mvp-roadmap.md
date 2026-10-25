# Escopo e Roadmap do MVP

## Regra de decisão

Uma função entra no ciclo de duas semanas somente se reduz atrito, prova valor, recebe pagamento ou permite operação segura. Tudo que dependa de homologação de terceiros entra como preparação, não como promessa comercial.

## Entrega de duas semanas

| Área | Entrega |
| --- | --- |
| Identidade | URL pessoal com token, acesso sem senha inicial e retomada segura |
| Gratuito | diagnóstico, dados essenciais, checklist e QR básico |
| Conteúdo | editor de serviços, preços, horário, bio, CTA, WhatsApp e materiais exportáveis |
| Pago | bloqueios claros, checkout hospedado InfinitePay e liberação manual atestada |
| Operação | funil de lead, status de pagamento, suporte e auditoria de ação |
| Segurança | segredo no servidor, validação de webhook, proteção contra acesso cruzado |

## Não entra neste ciclo

- OAuth Google/Meta em produção.
- Sincronização automática ou publicação de conteúdo.
- Cobrança recorrente como requisito de lançamento; pode ser habilitada depois do primeiro fluxo avulso validado.
- IA aberta para produzir conteúdo sem validação de dados ou custo controlado.

## Sequência de 10 dias úteis

| Dia | Resultado verificável |
| --- | --- |
| 1 | inventário de riscos, rotação da credencial exposta, modelo de dados e migração de leads |
| 2 | login por link pessoal, isolamento de negócios e progresso persistente |
| 3 | diagnóstico gratuito e onboarding móvel de três etapas |
| 4 | editor único de presença e geradores de texto/QR |
| 5 | materiais Google manuais e confirmação honesta de aplicação |
| 6 | paywall, catálogo de planos e preparação segura do checkout InfinitePay |
| 7 | confirmação manual idempotente, entitlement e tela de aguardo/sucesso |
| 8 | painel operacional e suporte contextual |
| 9 | importação controlada de lead/proveniência e testes de fluxo completo |
| 10 | piloto de três clientes, correções, evidência e lançamento controlado |

## Portões

1. **Demo interna:** fluxo gratuito concluído em celular sem ajuda.
2. **Pronto para cobrar:** pagamento só libera após comprovante e ateste explícito de operador; retorno do checkout não libera acesso.
3. **Piloto:** três negócios distintos concluem o material e relatam bloqueios.
4. **Venda pública:** não há segredo no navegador, termos/política publicados e suporte definido.
