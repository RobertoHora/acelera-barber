# Segundo cérebro da Laura — teste assistido

## Decisões do operador

- Uma Laura consultiva, uma instância e um WhatsApp para todo o funil.
- Teste somente no número pessoal confirmado, final 7759, usando o transporte já
  conectado da Lana. Não criar sessão Baileys adicional.
- Referência: Barão Barber Shop, Grã-Duquesa, GV, slug `barao`. Usar cópia de teste
  com telefone substituído; não contatar a loja real.
- Primeiro simular pagamentos; depois testar R$37 + R$20 reais. Não cobrar Agenda
  nem serviço do cliente automaticamente. Cliques/redirect/comprovante não liberam plano.
- Google e Instagram: preparar, copiar e baixar materiais. Sem editar perfis reais.
- Eleva grátis → Pro R$37 (14 dias Agenda) ou Completo R$57 (30 dias).
  Upgrade Pro→Completo R$20; Agenda R$37/mês ou IA R$67/mês.
- Teste Agenda começa na primeira ativação operacional. Upgrade amplia para 30 dias
  desde a ativação original; não reinicia. Modalidade escolhida na ativação.
- Reserva pública: nome e WhatsApp, sem conta do cliente. Pagamento inicial no local.
- InfiniteTap: https://infinitepay.onelink.me/IGWD/estudio-orc . Print fornecido:
  R$25 para indicador e R$15 para indicado após R$50 em vendas via InfiniteTap;
  cadastro ou checkout online não comprovam a condição da promoção.
- Voucher de 50% somente no cancelamento tardio de reserva comprovadamente pré-paga,
  respeitando a configuração do estabelecimento. Preservar implementação existente.

## Invariantes de isolamento

Reserva exclusiva por telefone normalizado/JID/LID antes de listeners, webhooks,
varreduras, presença e recibos. Laura indisponível/pausada: reter, sem fallback Lana.
Saída Laura restrita ao contato do teste. Saída Lana para esse contato bloqueada;
outros contatos Lana seguem sem alteração. Jamais copiar sessões, segredos, leads,
aprovações, filas ou memória comercial da Lana para a Laura.
Sem paridade comprovada de circuito global, posse, incerteza e cadência, manter
transporte real desabilitado. Não há garantia de imunidade a bloqueios WhatsApp.

## Procedimento a cada ajuste

Registrar pedido e evidência no diário privado; reproduzir; corrigir; executar
regressão apropriada; atualizar este documento; checkpoint com próxima ação segura.
Não repetir pagamento ou primeira mensagem para retomar. Estado de pagamento,
assinatura, reserva e entrega de mensagem são independentes.

## 2026-10-29 — auditoria e início da implementação

Código local estava 10 commits à frente do origin. APIs novas não estavam presentes
na publicação Eleva; Agenda apresentava falha TLS. Laura ainda sem runtime contínuo;
fanout do gateway não exclusivo. Aceites anteriores de outbox eram simulados.
O teste humano ainda não começou. Ver implementation.md para evidências atualizadas.

## Checkpoint real — 29/10/2026, 19:33 UTC

Teste pessoal iniciado: primeira abordagem única aceita pelo gateway no contato
final 7759, usando a sessão existente. A execução continua RUNNING, aguardando o
responsável pela Barão responder e autorizar a análise grátis. Pagamentos Eleva e
pagamentos de serviços continuam simulados; nenhuma compra real foi feita.

A instalação do roteador foi verificada com negativas reais HTTP 403: Lana não
pode enviar ao contato reservado e Laura pausada não pode enviar. A Lana seguiu
saudável. O primeiro envio foi liberado só após 50 testes, build, 23 verificações
HTTP, percurso móvel, circuito compartilhado CLOSED e ausência de envios em curso.

O telefone não pode voltar à Lana por expiração, indisponibilidade ou troca de
tarefa. Antes de retomar, consulte o arquivo ativo e o estado real de
LauraConversation/LauraInbound/OutboxMessage/Order/TrialBenefit no banco isolado.
O checkpoint textual pode estar atrás das respostas e ações realizadas no WhatsApp.
Nunca execute init/provision/reset/queue-opening novamente para continuar o teste.
Histórico anterior ao startedAt é arquivado e não é respondido como parte do teste.
