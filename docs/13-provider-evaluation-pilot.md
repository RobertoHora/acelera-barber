# Avaliação de provedores e piloto

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Avaliação opcional Google/Instagram

| Candidato | Evidência pesquisada | Uso de teste proposto |
| --- | --- | --- |
| [Zernio](https://docs.zernio.com/platforms/google-business/business-profile) | Gestão de dados, serviços, atributos e action links | Primeira prova de conceito Google autorizada |
| [Zernio preços](https://docs.zernio.com/pricing) | Duas contas conectadas grátis; custos adicionais possíveis | Calcular por conexão/negócio, não assumir grátis ilimitado |
| [Upload-Post](https://www.upload-post.com/) | Publicação Google/Instagram; oferta pesquisada de dois perfis/dez uploads grátis | Conteúdo, sem presumir edição integral do perfil |
| [BrightLocal](https://help.brightlocal.com/hc/en-us/articles/203649917-Does-BrightLocal-provide-APIs) | Gestão e dados; 250 requisições de teste de dados | Enriquecimento; não confundir teste de dados com escrita grátis |

Preços/cotas são fotografia da pesquisa, não contratação. Nenhum desses serviços substitui o motor Lana para WhatsApp nesta arquitetura.

## Aceite de provedor

Provar autorização do dono, operação exata necessária, isolamento de contas, recibo/leitura posterior, exportação/desconexão, política de uso em SaaS e custo por negócio. Avaliar importação, edição e publicação separadamente. Não usar credenciais emprestadas para contornar aprovação.

Timebox da prova: até um dia útil de engenharia após acesso disponível. Se não demonstrar adequação, registrar resultado e manter aplicação manual; agenda não espera.

## Custos

Modelar margem de R$ 37 e R$ 67 incluindo hospedagem/banco, transporte WhatsApp, IA, mídia, pagamento, suporte e impostos aplicáveis. Mensagens e tokens por reserva/atendimento devem ser medidos. Quotas, política de uso e proporcionalidade de upgrade mensal são decisões de pré-lançamento, sem promessa de uso ilimitado.

Bônus InfiniteTap só entra como receita extraordinária confirmada. Não compensar mensalidade nem margem com indicação estimada.

## Piloto

Três negócios e cenários diferentes; validar base e IA, gratuito/Pro/Completo, ativação de teste e continuidade paga. Começar com dados e transporte simulados, depois destinatários autorizados e piloto real após aplicativos prontos.

Registrar por negócio: setup, tempo até primeira melhoria/reserva, suporte, entrega de mensagens, sucesso da IA, oferta apresentada, compra, renovação e motivo de cancelamento. Comparar coortes pelo plano e origem, sem alegar causalidade com amostra pequena.

## Comissionamento

Checklist concreto antes da ativação externa: domínio/release, banco e restauração, configuração secreta, titularidade do número/recebedor, limites, suporte e rollback. Fechar políticas comerciais pendentes e dependências externas em tarefa própria. Não tratar assinatura de teste ou simulação como primeira venda.
