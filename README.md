# Acelera Barber • Guia de Presença Digital

Aplicação web mobile-first para estruturação de presença digital, catálogo de serviços e display para avaliações no Google para barbearias locais.

> **Fase Atual (MVP Pré-Venda):** A aplicação opera em modo assistido (`MANUAL_ASSISTED`), preparando conteúdos e orientando a aplicação manual pelo barbeiro. A documentação completa de produto e engenharia está em [`docs/`](docs/README.md). Não há alegação de parceria, selo oficial do Google, sincronização automática ou promessas de posicionamento garantido.

## 🚀 Recursos do MVP

- **Diagnóstico Explicável de Presença Digital:** Pontuação transparente baseada no preenchimento de 5 critérios essenciais (Instagram, contato no Google, catálogo de fotos/preços, comodidades e display de balcão).
- **Recursos Gratuitos Inclusos:**
  - Bio inicial estruturada pronta para o Instagram.
  - Link direto de agendamento no WhatsApp com mensagem pré-configurada.
  - QR Code neutro de avaliação no Google ("Conte como foi sua experiência no Google").
  - Checklist essencial de aplicação manual.
- **Catálogo de Serviços e Fotos:** Fotos de cortes curadas ou em cache local para cadastro no painel de Produtos do Google Meu Negócio, com download de imagem e cópia de título/preço/descrição.
- **Plaquinha de Balcão para Impressão (A6, 300 DPI):**
  - Display gráfico em alta resolução (1240 x 1748 px) unindo QR Code neutro de avaliação no Google e Wi-Fi opcional para clientes.
  - Política estrita de privacidade: sem senha padrão ou persistida (a senha existe apenas na sessão do navegador).
- **Edição Dinâmica do Negócio:** Permite ao barbeiro personalizar nome, bairro, WhatsApp, horário de funcionamento e usuário do Instagram com persistência local não sensível.
- **Preparação Freemium & Cobrança InfinitePay:**
  - Visualização de planos: Gratuito (ativo), Google Pro (R$ 37) e Completo (R$ 67).
  - Previews interativos de capas de destaques do Instagram, bio de alta conversão e calendário semanal de postagens.
  - Modelo `INFINITEPAY_MANUAL`: registro local de intenção e solicitação de link oficial da InfinitePay com conferência humana de operador.
- **Roteamento Híbrido:**
  - Por ID ou Place ID da base: `https://robertohora.github.io/acelera-barber/?id=PLACE_ID`
  - Por slug do bairro/barbearia: `https://robertohora.github.io/acelera-barber/?b=SLUG`
  - Por parâmetros diretos: `https://robertohora.github.io/acelera-barber/?nome=Barbearia+Exemplo&insta=barber_exemplo&bairro=Centro`
