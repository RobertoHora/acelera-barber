> Estado operacional em 29/10/2026: o teste assistido usa homologação isolada na VPS.
> A publicação de produção na Vercel ainda precisa receber as novas APIs e validar banco/domínio.
> Retome pelo [guia de QA](docs/qa/README.md); implementação e limites em [execução](docs/qa/implementation.md).

# Eleva ORC e Agenda ORC

Plataforma integrada de presença digital, diagnóstico consultivo, agendamento online e atendimento inteligente via WhatsApp para barbearias.

- **Eleva ORC:** `https://eleva.oracio.uk` (Diagnóstico, checklist de otimização Google/Instagram, vendas avulsas e funil consultivo)
- **Agenda ORC:** `https://agenda.oracio.uk` (Página pública de agendamento mobile-first `/{slug}`, link privado de gestão `/b/{token}`, painel operacional do dono `/painel` e módulo InfinitePay/InfiniteTap)
- **Painel Administrativo:** `https://eleva.oracio.uk/admin/operacao` (Métricas de coortes, saúde do WhatsApp, Circuit Breaker e telemetria)

---

## 🏛️ Arquitetura e Decisões Técnicas

1. **Stack Tecnológica:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma 7 com Driver Adapter `@prisma/adapter-pg`.
2. **Persistência e Concorrência Física:** PostgreSQL 17 (`eleva_agenda_production` e `eleva_agenda_test`) na porta 5433 (`/home/ubuntu/orc-db`), isolado do banco do Estúdio ORC (`pulsor_production`). Unicidade de slots protegida a nível de engine com `EXCLUDE USING gist` (`btree_gist` + `tstzrange`).
3. **Autenticação Passwordless:** Baseada em OTP de 6 dígitos via WhatsApp e sessões com HMAC SHA-256 e cookie assinado (`orc_owner_session` com escopo `.oracio.uk`).
4. **Motor de IA Laura (`services/laura-engine`):** Atendente conversacional oficial "Laura" com roteamento multi-contexto (`PROSPECT_OWNER`, `ACTIVE_OWNER`, `END_CUSTOMER`, `AMBIGUOUS_MULTI_BUSINESS`), debounce de 20s, via rápida transacional para notificações e tools da agenda (`listServices`, `getAvailableSlots`, `createBooking`, `cancelBooking`, `handoffToHuman`).
5. **Gateway de Pagamento:** InfinitePay (tag da plataforma configurada no servidor) com prefixo determinístico de pedido `eleva_{orderId}`, webhook idempotente em `/api/webhooks/infinitepay` e reconciliação automática de direitos (`Entitlements`) e testes (`TrialBenefit`).
6. **Módulo de Fidelização:** Cancelamento com $< 1\text{h}$ emite voucher de 50% de desconto (`DESC50-...`) para o próximo corte do cliente.

---

## 💳 Catálogo de Planos e Funil Aprovado

| SKU / Plano | Tipo | Valor | Benefício da Agenda ORC |
| :--- | :--- | :--- | :--- |
| `eleva_free` | Diagnóstico | Grátis | Acesso ao diagnóstico e checklist básico |
| `eleva_google_pro` | Pagamento Único | R$ 37 | **14 dias grátis** de teste da Agenda ORC |
| `eleva_complete` | Pagamento Único | R$ 57 | **30 dias grátis** de teste da Agenda ORC |
| `eleva_complete_upgrade` | Upgrade | R$ 20 | Amplia teste de 14 para **30 dias totais** (sem reiniciar relógio) |
| `agenda_basic_monthly` | Assinatura Mensal | R$ 37/mês | Agenda online + Notificações WhatsApp (24h/2h) para cliente e barbearia |
| `agenda_ai_monthly` | Assinatura Mensal | R$ 67/mês | Tudo da Básica + Atendimento e Agendamento Automático via IA Laura |

---

## 🧪 Suíte de Testes Automatizados (Vitest)

O projeto conta com **50 testes unitários e de integração**. A suíte usa banco isolado e provedores simulados; não comprova entrega física de WhatsApp ou pagamento real. Casos cobertos:

```bash
TEST_DATABASE_URL='postgresql://ubuntu@localhost:5433/eleva_agenda_test?host=/home/ubuntu/orc-db' npm test
```

Validação completa da homologação configurada: `node scripts/e2e/validate.mjs`.

- `tests/unit/plans-and-copy.test.ts`: Validação do catálogo e saneamento de termos proibidos de ranking.
- `tests/integration/fase1-auth-db.test.ts`: Banco PostgreSQL, seed das 123 barbearias de GV, OTP passwordless e isolamento.
- `tests/integration/fase2-billing-infinitepay.test.ts`: Ordens InfinitePay, webhook idempotente, upgrade de R$ 20 e cancelamento de cadência fria.
- `tests/integration/fase3-agenda-concurrency.test.ts`: Concorrência estrita (10 requisições simultâneas para o mesmo slot → 1 reserva, 9 conflitos), links privados e voucher de 50%.
- `tests/integration/fase4-notifications-scheduler.test.ts`: Emissão de notificações transacionais, scheduler de 24h e 2h, e tolerância de 72h em `PAST_DUE`.
- `tests/integration/fase5-laura-engine.test.ts`: Laura IA, desambiguação multi-negócio, tools da agenda e outbox worker fast-track.
- `tests/integration/fase6-telemetry-funnel.test.ts`: Telemetria com `GrowthEvent`, resumo consultivo para a Laura e API admin.
- `tests/integration/fase7-pilot-journey-and-isolation.test.ts`: Validação E2E das 3 barbearias-piloto (solo, multi e crua) e isolamento multi-tenant.

---

## 🛡️ Scripts de Operação e Recuperação de Desastre

- **Backup do Banco de Produção:**
  ```bash
  ./scripts/backup-db.sh
  ```
  Gera dump binário comprimido com catálogo completo em `backups/eleva_agenda_prod_{TIMESTAMP}.dump`.

- **Exercício de Restauração (Restore Drill):**
  ```bash
  ./scripts/restore-drill.sh
  ```
  Restaura o dump mais recente em um banco temporário isolado (`eleva_agenda_restore_verify`), valida a contagem de registros e checa a existência física da constraint `Booking_no_overlapping_active_slots`.

---

## 🚀 Build e Deploy

Compilação otimizada para produção:
```bash
npm run build
```

Iniciar servidor de produção:
```bash
npm start
```
