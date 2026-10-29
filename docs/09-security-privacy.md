# Segurança e privacidade

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Limites de dados e acesso

Cliente final informa apenas nome e WhatsApp; não exigir cadastro/e-mail. Dono e operadores têm autenticação real e autorização por negócio. Slug/link público não dá direito de administrar, ativar teste, liberar compra ou ler clientes.

Autorização transacional deve ser clara no momento da reserva; marketing é finalidade distinta. Preferências por finalidade e canal ficam registradas. Não interpretar agendamento como adesão ao funil comercial do Eleva.

## Controles

- Banco e servidor validam preço, plano, benefício, teste, assinatura e disponibilidade.
- Isolar negócio, papel e finalidade em cada operação; telefone compartilhado não funde contas.
- Links privados de reserva aleatórios, revogáveis e armazenados com proteção; sem dados pessoais na URL.
- Segredos, sessões WhatsApp e tokens fora do frontend/Git/logs. Não copiar sessões ou credenciais do Estúdio ORC.
- Webhooks/eventos com autenticação conforme contrato real do provedor, deduplicação e reconciliação server-side. Não inventar assinatura HMAC não documentada.
- IA recebe contexto mínimo; texto do cliente, mídia e dados importados não são instruções de administração.
- Ferramentas da IA verificam direitos, escopo e resultado. Não conceder plano nem confirmar pagamento por decisão do modelo.
- Limites contra reserva abusiva e rate limiting sem impor OTP obrigatório a todo cliente.
- Wi-Fi e senha ficam só em memória local para gerar QR, sem analytics/persistência.
- Comprovantes e transcrições: acesso restrito, minimização, retenção e purga definidas antes de produção.
- Backup e restauração testados; ambiente de teste separado de dados e transporte reais.

## Política operacional

Publicar termos, privacidade, responsável, canal de suporte e regras de cancelamento/reembolso antes de cobrança real. Inventário de dados define finalidade, base aplicável, destinatários, prazo e procedimento de acesso/correção/exclusão; revisão jurídica continua uma pendência de lançamento, não uma conformidade certificada.

Eventos analíticos usam identificadores internos, não telefone/texto integral. Logs redigem links privados e conteúdo desnecessário. Reprodução do motor mantém proteções de restrição/kill switch; nenhuma configuração representa garantia contra bloqueio externo.

## Incidente

Conter envio/acesso, revogar credencial comprometida, preservar evidência mínima e rastrear impacto. Corrigir causa, testar e comunicar conforme obrigações aplicáveis. Não destruir evidências nem reativar automaticamente conta sob restrição.
