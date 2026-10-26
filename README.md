# Acelera Barber • Guia de Presença Digital

Aplicação web mobile-first de alta conversão para estruturação de presença digital, catálogo de serviços e display para avaliações no Google para barbearias locais.

> **Arquitetura & Stack:** Desenvolvido em **Next.js 15 (App Router)** com React 19, TypeScript e Tailwind CSS, pronto para deploy na Vercel (plano Hobby gratuito).
> **Fase Atual (MVP Pré-Venda):** A aplicação opera em modo assistido (`MANUAL_ASSISTED`), preparando conteúdos e orientando a aplicação manual pelo barbeiro. A documentação completa de produto e engenharia está em [`docs/`](docs/README.md). Não há alegação de parceria, selo oficial do Google, sincronização automática ou promessas de posicionamento garantido.

## 🚀 Arquitetura e Fluxo do Usuário

1. **Landing Page de Alta Conversão (Padrão Estúdio ORC 1:1):**
   - Paleta Dark Matte (`#19181D`, `#2B2B29`, `#3D3C3A`, `#EFECE5`, `#E5C378` e cards Google oficiais em fundo branco).
   - **Reconhecimento de Loja por Slug / ID:** Se acessado via `?barber=slug` ou `?b=slug`, exibe automaticamente a logo e o nome da barbearia do banco de dados de 123 leads de Governador Valadares.
   - **Busca com Autocomplete Local + Serverless (`/api/search-barber`):** Encontra rapidamente qualquer barbearia cadastrada.
   - **Comparativo Interativo Antes/Depois (Slider):** Perfil abandonado vs. perfil profissional estruturado.
   - **Barra de Métricas:** R$ 37 (acessível), 100% Online, Display A6 300 DPI, Garantia legal de 7 dias (CDC).
   - **Tabela de Preços Congelada:** Google Pro (R$ 37) e Completo (R$ 57).

2. **Onboarding Cinematográfico Educacional (10 segundos):**
   - Radar de varredura visual com checklist auditando Google Maps, Catálogo, Contato e Display.
   - Barra de progresso animada (0 a 100%).
   - Títulos dinâmicos rotativos ensinando como a plataforma ajuda a atrair clientes locais.

3. **Tela de Diagnóstico e Benchmark de Concorrentes:**
   - **Diagnóstico da Sua Barbearia:** Pontuação visual explicável (0 a 100%) com gaps identificados.
   - **Benchmark Local (2 Concorrentes Reais):** Identifica as barbearias melhores posicionadas no mesmo bairro (ou região de GV) e explica exatamente os motivos pelos quais elas rankeiam à frente (volume de avaliações, fotos recentes, link de agendamento).
   - **Alerta de Perda de Clientes:** Consciência imediata de mercado e botão para iniciar melhorias gratuitas.

4. **Wizard de Melhorias em 5 Etapas (`ImprovementWizard`):**
   - **Etapa 1 (Instagram):** Bio estruturada e link de agendamento no WhatsApp.
   - **Etapa 2 (Google Perfil):** Horários, telefone, endereço e instrução de aplicação manual.
   - **Etapa 3 (Catálogo e Fotos):** Cortes com título, preço e descrição com download direto.
   - **Etapa 4 (Comodidades):** Ar-condicionado, Wi-Fi, cerveja/café, pagamento via Pix/cartão.
   - **Etapa 5 (Plaquinha A6 300 DPI):** Gerador visual de display em alta resolução (1240 x 1748 px) unindo QR Code neutro de avaliação no Google ("Conte como foi sua experiência no Google") e Wi-Fi de clientes sem persistência de senha. Guia de impressão em papel fotográfico 10x15cm.

5. **Cobrança `INFINITEPAY_MANUAL`:**
   - Registro local de intenção de compra para Google Pro (R$ 37) ou Completo (R$ 57).
   - Solicitação de link oficial InfinitePay via WhatsApp do suporte com conferência e ateste humano.
   - Zero dependência de checkout automatizado ou liberação precoce por webhook.

## 💻 Como Rodar Localmente

```bash
# Instalar dependências
bun install # ou npm install

# Rodar servidor de desenvolvimento
bun dev # ou npm run dev

# Build de produção
bun run build # ou npm run build
```

## 🛡️ Guardrails e Travas de Integridade

Execute a suíte de testes de integridade para validar conformidade:

```bash
python3 test_guardrails.py
```
