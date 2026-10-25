# Integrações e Sincronização

## Estado no MVP

| Plataforma | Modo | O que fazemos |
| --- | --- | --- |
| Google Business Profile | `MANUAL_ASSISTED` | preparar dados, copiar textos, abrir fluxo oficial, confirmar aplicação |
| Instagram | `MANUAL_ASSISTED` | analisar dados permitidos, gerar bio/conteúdo/asset, orientar aplicação |
| Apify | servidor apenas | enriquecer/auditar quando houver base legal, custo e política aprovados |
| InfinitePay | checkout hospedado e manual | link oficial por pedido, comprovante e confirmação atestada |

## Google: trilha de homologação paralela

1. Ter site, política de privacidade e operação identificável.
2. Criar projeto Cloud, organização e credenciais OAuth.
3. Solicitar acesso à Business Profile API quando pré-requisitos forem atendidos.
4. Implementar leitura, seleção explícita da unidade e `validateOnly` antes de toda escrita.
5. Exigir preview/diff, `updateMask`, registro da intenção, resposta e verificação posterior.

O modo automático só é ativado por campo após teste em negócio autorizado. Serviços usam atualização do conjunto completo; a interface deve alertar antes de substituir a lista.

## Instagram/Meta

Separar três capacidades: leitura/auditoria, publicação de conteúdo e alterações de perfil. Cada uma depende de conta profissional, permissões e revisão aplicáveis. Não assumir que a API permite editar bio, nome ou qualquer configuração desejada. Até a confirmação oficial, estes itens permanecem como copiar e aplicar.

## Contrato de sincronização futura

- OAuth por cliente, consentimento de escopo e desconexão revogável.
- Só sincronizar campos explicitamente selecionados pelo dono.
- Mostrar preview e diferença antes de escrever.
- Job idempotente, tentativas limitadas e estado `FAILED` acionável.
- Recibo externo e leitura posterior antes de marcar `SYNCED`.
