# Reprodução do motor Lana — Eleva ORC e Agenda ORC

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Decisão e momento

Uma única nova instância e um único WhatsApp atendem todo o funil Eleva/Agenda, notificam cliente/barbearia e executam atendimento da Agenda com IA. Não criar um bot por produto, plano ou estabelecimento.

Primeiro concluir aplicativos e contratos com simuladores; depois copiar, integrar e ativar o motor. A operação Estúdio ORC permanece independente.

## Referência reproduzível

Origem: /home/ubuntu/orc-prospecting-runner. Há alterações locais e arquivos fora do Git. Na etapa de reprodução, identificar processos, cwd, código/configuração efetivamente carregados e versão dos transportes. Capturar commit, diff, manifestos, dependências e hashes sem segredos.

Inventariar parâmetros de cadência, limites, horários/timezone, flags, persistência, filas, aprovações e transporte. Reproduzir valores não secretos e semântica validados. Revalidar na data da cópia; checkout atual não comprova versão em execução.

Não copiar .env, credenciais, sessões/chaves WhatsApp, contatos, filas pendentes, aprovações ou memória aprendida com dados reais do Estúdio. Identidades e recursos novos devem ser configurados para a instância nova.

## Paridade

Preservar circuit breaker/kill switch, estados de restrição, outbox, posse/lease, fencing, deduplicação, pausas, handoff, opt-out, aprovações, cadência, reengajamento e acompanhamento. Testes devem comparar referência e reprodução em ambiente isolado.

Não reescrever mecanismos existentes. Falha encontrada na referência deve ser registrada, reproduzida e delimitada antes da ativação; não copiar risco conhecido sem tratamento nem alterar silenciosamente a operação Estúdio.

## Diferenças permitidas e necessárias

- Copys de módulos existentes para Eleva ORC e Agenda ORC, ofertas e links correspondentes.
- Contexto comercial continua após compra, sem reiniciar abordagem fria.
- Adaptador transacional mínimo e finalidades BOOKING_CUSTOMER_NOTICE / BOOKING_BUSINESS_NOTICE.
- Ferramentas de agenda para clientes de modalidade IA.
- Roteamento por negócio, papel e finalidade, sem múltiplos motores.

Essas diferenças são aditivas e devem ser listadas no diff de paridade. A exigência de cópia fiel não significa que simples substituição de marca implementa contratos novos de agendamento.

## Finalidades e prioridade

Prospecção mantém parâmetros da referência. Acompanhamento consultivo usa fatos do funil e elegibilidade de oferta. Transacional entra sem espera comercial, preservando proteção global e preferência por finalidade. IA de cliente final só com direito válido.

Mensagens transacionais não são registradas como INBOUND_REPLY falso para burlar guardas. Definir finalidade explícita. Preferência comercial não é confundida com transacional; suspensão global do canal continua respeitada.

Uma conversa recebida deve identificar se trata de dono, cliente, reserva ou suporte. Uma pessoa pode ter vários papéis/negócios; pedir esclarecimento quando não houver vínculo seguro. Dados de clientes não entram em cadência comercial.

## Ativação e operação

Iniciar tudo desativado/com transporte simulado. Testar paridade, concorrência, restrição, duas notificações e IA. Comissionar transacional em contatos de teste, depois piloto; só então prospecção. Falha do motor não cancela reserva.

Registrar tentativas, recibos, restrições, próxima ação e intervenção humana. UNKNOWN/UNCERTAIN não geram reenvio automático. Não alegar garantia contra bloqueios externos. Definir rollback, parada e responsável antes de ligar tráfego real.
