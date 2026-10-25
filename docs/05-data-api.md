# Dados e Contratos de API

## Entidades mínimas

| Entidade | Responsabilidade |
| --- | --- |
| `Lead` | origem, evidência pública, consentimento e estágio comercial |
| `Business` | dados confirmados da barbearia e proprietário |
| `AccessLink` | token pessoal, expiração, revogação e último uso |
| `ProfileDraft` | dados editáveis e versão do rascunho |
| `Action` | tarefa Google/Instagram e estado real de aplicação |
| `Plan` / `Entitlement` | recursos liberados e período de acesso |
| `Order` | plano, preço congelado, link InfinitePay, estados de checkout e pagamento |
| `PaymentConfirmation` | ateste do operador, referência minimizada e fingerprint de comprovante |
| `SupportRequest` | contexto da tela, mensagem e proprietário operacional |
| `AuditEvent` | evento de segurança ou alteração relevante |

## Regras de integridade

- `Business` pertence a um proprietário; nenhuma consulta aceita apenas um ID sem checar escopo.
- Um `AccessLink` abre apenas seu `Business` e pode ser revogado.
- Um comprovante/referência não pode confirmar dois pedidos; o fingerprint é único.
- Um `Order` mantém valor, moeda e pacote congelados após o link de pagamento ser preparado.
- Apenas operador autorizado pode registrar `PaymentConfirmation`; retorno do checkout nunca libera plano.
- Uma `Action` não muda para `SYNCED` sem recibo da plataforma oficial.
- Telefones são normalizados em E.164; consentimento tem data, origem e texto/versão da política.

## Contratos iniciais

| Operação | Método | Resultado |
| --- | --- | --- |
| abrir link pessoal | `POST /api/access/resolve` | sessão limitada ao negócio |
| salvar onboarding | `PATCH /api/businesses/:id/profile` | rascunho validado e nova versão |
| gerar material | `POST /api/businesses/:id/assets` | URL temporária do asset |
| preparar pagamento | `POST /api/ops/orders/:id/infinitepay/prepare` | link oficial para preço congelado |
| confirmar pagamento | `POST /api/ops/orders/:id/infinitepay/confirm` | ateste, evidência minimizada e entitlement |
| concluir tarefa | `POST /api/actions/:id/confirm` | `CLIENT_CONFIRMED`, nunca `SYNCED` |

## Validações

- Limites de tamanho, allowlist de URLs, saneamento de HTML e rate limiting.
- `id` de negócio vem da sessão, não de campos confiados ao navegador.
- Todos os payloads possuem schema e erros legíveis para o cliente.
- Imagem de comprovante é privada, tem tamanho/tipo limitado, fingerprint e retenção curta definida; nunca é servida publicamente.
