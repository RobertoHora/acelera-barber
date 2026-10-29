# Teste assistido Eleva ORC + Agenda ORC

Entrada obrigatória para retomar o teste solicitado pelo operador.

- `npm run e2e:status`: recupera etapa, bloqueios e próxima ação sem expor telefone.
- `node scripts/e2e/control.mjs init`: cria execução privada, pausada e simulada.
- `node scripts/e2e/control.mjs checkpoint <etapa> <nota>`: salva progresso e decisão.
- `node scripts/e2e/control.mjs pause`: suspende novos envios, mantendo reserva do contato.
- `node scripts/e2e/control.mjs resume`: retoma apenas a execução existente.
- `node scripts/e2e/control.mjs reconcile`: verifica pendências no banco isolado.
- `node scripts/e2e/control.mjs role owner|customer`: alterna o papel testado no mesmo telefone.
- `node scripts/e2e/control.mjs finish`: exige reconciliação antes de liberar o contato.
- `npm run e2e:preflight`: verifica infraestrutura e apresenta bloqueios.

Estado operacional e diário: `.runtime/e2e/`, fora do Git, permissões restritas.
Contrato comercial e regressões: [segundo cérebro](second-brain.md).
Roteiro e situação: [execução](implementation.md).

Nenhum comando de checkpoint deve enviar mensagem, efetuar cobrança ou publicar
alterações no Google/Instagram. Trocar de tarefa mantém o teste em sua etapa.

Validação completa: `node scripts/e2e/validate.mjs`. O certificado privado registra o hash exato das fontes verificadas. Arquivos e evidências do teste ficam fora do Git.
