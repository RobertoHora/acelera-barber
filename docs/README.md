# Eleva ORC e Agenda ORC — documentação canônica

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Estado e precedência

O repositório permanece em /home/ubuntu/acelera-barber, mas a marca é Eleva ORC. A aplicação já utiliza Next.js e está publicada em https://eleva.oracio.uk. Agenda ORC será o módulo de agenda em https://agenda.oracio.uk; sua publicação e operação não estão comprovadas nesta revisão.

Esta revisão substitui as decisões anteriores de permanecer no GitHub Pages, excluir agendamento, iniciar teste na compra, vender agenda apenas por R$ 37/mês ou operar bots separados. Não comprova implementação dos recursos descritos.

## Ordem de leitura

1. [PRD](01-prd.md)
2. [Roadmap e dependências](02-mvp-roadmap.md)
3. [Jornadas e UX](03-ux-flows.md)
4. [Arquitetura](04-architecture.md)
5. [Dados e contratos](05-data-api.md)
6. [Planos, benefícios e cobrança](06-plans-billing.md)
7. [Integrações](07-integrations-sync.md)
8. [Funil consultivo e operação](08-acquisition-operations.md)
9. [Segurança e privacidade](09-security-privacy.md)
10. [Qualidade e lançamento](10-quality-release.md)
11. [Pesquisa e evidências](11-research-evidence.md)
12. [Agenda e notificações](12-booking-notifications-contract.md)
13. [Provedores e piloto](13-provider-evaluation-pilot.md)
14. [Reprodução do motor Lana](14-lana-replication-contract.md)
15. [Prompt do plano sequencial](15-implementation-planning-prompt.md)

## Fontes de verdade

- O documento 06 determina preços, períodos de teste e direitos; 12 determina reservas e comunicação; 14 determina reprodução e ativação do motor.
- Código existente não é evidência de funcionamento em produção. Separar existente, planejado, validado e pendente.
- MANUAL_ASSISTED prepara alterações externas. CLIENT_CONFIRMED é confirmação do dono; SYNCED exige resposta/leitura da integração correspondente.
- Há um motor e um WhatsApp para todo o novo funil. O Estúdio ORC continua independente.
- Pagamento confirmado exige evidência verificada no servidor ou conferência manual auditada; clique, redirect e localStorage não liberam recursos.
- Primeiro concluir os aplicativos e os contratos com transporte simulado; depois reproduzir, integrar e ativar o motor.
