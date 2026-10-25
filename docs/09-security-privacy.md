# Segurança, Privacidade e LGPD

## Dados e finalidade

Coletar apenas o necessário para entregar o diagnóstico, materiais, suporte e cobrança. Dados pessoais e de negócio devem ter finalidade documentada, acesso mínimo e retenção definida.

## Controles mandatórios

- Segredos no gerenciador de ambiente; rotacionar qualquer segredo que tenha ido ao frontend ou Git.
- Criptografar tokens OAuth em repouso e nunca devolvê-los ao navegador.
- Autorização por negócio em toda rota, arquivo e job.
- Webhooks com assinatura, timestamp quando disponível, deduplicação e trilha de auditoria.
- Links InfinitePay validados como HTTPS em domínio oficial; valor/pacote congelados antes do envio e sem liberação por redirect.
- Comprovantes privados, com fingerprint para deduplicação, acesso de operador mínimo e retenção/purga definida.
- Rate limiting para links pessoais, login, geração e webhook.
- Logs sanitizados; nunca imprimir token, senha, QR de Wi-Fi, dados de cartão ou URL privada.
- Backups e restauração testada antes de usar dados reais em escala.

## Direitos e operação

- Política de privacidade, termos e canal de contato publicados antes do lançamento.
- Registro de origem/consentimento quando aplicável.
- Processo para acesso, correção, exclusão e revogação de conexões.
- Separar dados do produto de bases e bancos do Estúdio ORC.

## Incidentes

1. Desativar/rotacionar a credencial afetada.
2. Revogar tokens/link comprometido.
3. Preservar evidência mínima e avaliar alcance.
4. Corrigir causa, testar e comunicar quando cabível.
