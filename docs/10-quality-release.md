# Qualidade, Aceite e Lançamento

## Cenários obrigatórios

| Cenário | Critério de aceite |
| --- | --- |
| Link de lead | não vaza dados de outra barbearia; expiração e revogação funcionam |
| Diagnóstico | pode ser concluído no celular; score tem explicação |
| Progresso | dados sobrevivem à troca de tela e retorno ao link |
| Paywall | não perde o rascunho; recurso gratuito segue acessível |
| Pagamento | redirect do checkout não libera; comprovante/referência repetidos não confirmam dois pedidos |
| Material | download/cópia contém somente dados corretos do negócio |
| Ação manual | confirmar aplicação não marca sincronização automática |
| Suporte | pedido leva contexto suficiente, sem segredo exposto |
| Segurança | nenhum token de provedor aparece em HTML/JS/resposta de API |

## Piloto

Selecionar três barbearias com perfis diferentes: uma sem Instagram, uma com Instagram ativo e uma com Google incompleto. Acompanhar do link à aplicação e registrar pontos de fricção, tempo, dúvidas e disposição de pagamento.

## Go / no-go para primeira venda

**Go** quando o fluxo integral for testado, o pagamento for confirmado com ateste manual, os materiais estiverem corretos, a política estiver publicada e não houver segredo exposto.

**No-go** se o plano pago for liberado por redirect, houver vazamento entre negócios, integração for descrita como automática sem ser, ou o piloto não conseguir concluir a jornada sem intervenção técnica.

## Evidência de lançamento

- URL de produção e versão/commit.
- Resultados dos cenários obrigatórios.
- Um pagamento de teste confirmado manualmente com comprovante de teste, valor correto, fingerprint e ateste do operador.
- Relato dos pilotos separado entre validado, parcial e pendente.
