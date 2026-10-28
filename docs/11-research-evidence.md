# Pesquisa e evidências

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Inventário verificado na revisão de 28/10/2026

- Repositório /home/ubuntu/acelera-barber: Next.js 15.5.28, React 19, TypeScript e Tailwind; referência local 4322b09.
- https://eleva.oracio.uk retornou HTTP 200 com servidor Vercel na inspeção anterior desta revisão. Não prova transações ou persistência.
- Base local de leads e busca, wizard e modal de intenção existem. Modal usa localStorage e encaminhamento ao suporte; não comprova cobrança integrada.
- Conversa Antigravity b967f95b-4876-4167-ba5a-d84805224826: recuperada em modo leitura, incluindo proposta de agenda e walkthrough do deploy/remoção de seções.
- Motor /home/ubuntu/orc-prospecting-runner tem alterações locais e arquivos fora do Git. Referência executada deve ser identificada antes de reproduzir; último commit sozinho é insuficiente.
- Agenda ORC, banco, automação e assinatura seguem planejados. Não foram publicados nesta etapa documental.

## Fontes oficiais e uso

| Fonte | O que sustenta | Limitação |
| --- | --- | --- |
| [Google: links locais](https://support.google.com/business/answer/6218037) | Aplicação manual de URL de agendamento | Não garante botão azul específico |
| [Google: Place Actions](https://developers.google.com/my-business/reference/placeactions/rest) | APIs de links por unidade/tipo | Requer autorização e acesso aprovado |
| [Google: serviços](https://developers.google.com/my-business/content/services) | serviceItems e atualização da lista | Não equivale a catálogo de produtos |
| [Google: ranking](https://support.google.com/business/answer/7091) | Relevância, distância e destaque | Não promete ranking por tarefa |
| [Google: fotos](https://support.google.com/business/answer/6123536) | Imagens reais e requisitos | 9:16/4:3 são escolhas editoriais nossas |
| [Google: políticas](https://developers.google.com/my-business/content/policies) | Gestão autorizada e regras de terceiros | Não certifica fornecedor intermediário |
| [InfinitePay: checkout](https://www.infinitepay.io/checkout-documentacao) | links, handle e payment_check | Validar versão aplicável |
| [InfinitePay: ajuda checkout](https://ajuda.infinitepay.io/pt-BR/articles/10766888-como-usar-o-checkout-integrado-da-infinitepay) | InfiniteTag básica e API Key/opções avançadas | Autenticidade e recorrência devem ser homologadas |

## Benchmark correto

Referência: [BarberPro CRM](https://www.barberprocrm.com/), não outros domínios BarberPro. Página anuncia agenda pública, gestão, WhatsApp em um clique e outros módulos. São declarações do fornecedor, não auditoria do funcionamento. Inspirar capacidades e simplicidade; preservar identidade Eleva, sem copiar marca/código proprietário.

## InfiniteTap: evidência do proprietário

Print fornecido na conversa: R$ 25 ao indicador e R$ 15 ao indicado ao completar R$ 50 em vendas pelo InfiniteTap. Link https://infinitepay.onelink.me/IGWD/estudio-orc redirecionou para fluxo InfiniteTap com indicação estudio-orc.

O print não contém regulamento completo, vigência, prazos ou integração de acompanhamento. Não substituir por campanha de maquininha encontrada em artigos. Não prometer bônus por simples cadastro nem contar Pix/checkout na meta sem regra confirmada.

## Como manter

Cada pesquisa de fornecedor deve registrar data, endpoint/capacidade, limite, custo, requisitos, fonte e teste realizado. Preços, cotas e regras externas podem mudar; reconferir antes de contratar. Documentação publicada não equivale a homologação independente.
