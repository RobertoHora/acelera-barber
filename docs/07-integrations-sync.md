# Integrações e capacidades

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Matriz

| Integração | Caminho principal | Evolução |
| --- | --- | --- |
| Google Business Profile | preparar/copiar e orientar aplicação pelo dono | intermediário validado ou API própria aprovada |
| Instagram | bio, material e link para aplicação manual | publicação/leitura por intermediário com autorização |
| WhatsApp | uma instância reproduzida da Lana para todo o funil | adaptar eventos e ferramentas da Agenda no mesmo motor |
| InfinitePay | intenção/manual existente; checkout integrado a implementar | confirmação server-side e renovação homologada |
| InfiniteTap | indicação opcional pelo link fornecido | confirmação externa de recompensa, sem inferir por clique |
| Enriquecimento | base local/cache, upload e entrada manual | provedor autorizado com cache, limites e custo |

## Google e Instagram

websiteUri é o campo de site da Business Information API. Agendamento pertence a placeActionLinks, com uri e tipo APPOINTMENT quando elegível; não tratar appointmentLink como propriedade universal de Location.

Adicionar link não garante botão azul, posição nem ranking. Preparar links para Eleva/Agenda e roteiro do painel oficial. OAuth do proprietário e seleção da unidade continuam necessários mesmo com intermediário.

Leitura de dados públicos, publicação e edição de serviços/horários são capacidades diferentes. Não usar API de gestão para prospectar negócios sem autorização. Não confundir serviços com produtos de varejo. Não inventar campo de duração Google equivalente à agenda interna.

Aplicação automática exige preview/diff, autorização por campo, resultado e verificação posterior. Troca de lista de serviços deve preservar dados existentes. Bio/nome Instagram continuam manuais até capacidade explícita comprovada.

## Provedores candidatos

Avaliar Zernio para gestão Google e Upload-Post para publicação. Trial/free tier não comprova adequação comercial nem ausência de OAuth. Teste deve provar operação, autorização, segregação, custo, exportação e desconexão. Agenda e primeira venda não dependem desse resultado.

## WhatsApp

Não contratar um segundo serviço/bot de confirmações como arquitetura padrão. Motor comum usa transporte conforme referência operacional da Lana. Copys comerciais mudam para Eleva/Agenda; confirmações e IA da Agenda usam finalidades próprias. Preservar controles globais; não prometer imunidade a bloqueios.

## InfinitePay e InfiniteTap

Checkout integrado tem API de links, consulta de pagamento e notificações. A InfiniteTag identifica conta; não comprova titularidade/autorização. Opções avançadas podem exigir API Key. Validar versão exata do contrato e autenticidade de eventos no piloto.

Link de indicação: https://infinitepay.onelink.me/IGWD/estudio-orc
Campanha exibida no print: R$ 25 para indicador, R$ 15 para indicado após R$ 50 em vendas pelo InfiniteTap. Não contabilizar Pix/checkout como meta cumprida sem evidência do regulamento. Não confundir indicação com split.
