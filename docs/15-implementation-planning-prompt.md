# Prompt para o plano sequencial de implementação

Copie o bloco abaixo para o agente que fará o planejamento. Este arquivo não autoriza executar o plano.

```text
Crie um plano sequencial, completo e executável para finalizar Eleva ORC e Agenda ORC, do estado atual até o piloto, a publicação e a ativação do funil comercial.

Repositório: /home/ubuntu/acelera-barber
Motor de referência: /home/ubuntu/orc-prospecting-runner
Eleva ORC: https://eleva.oracio.uk
Agenda ORC: https://agenda.oracio.uk

Nesta tarefa, faça planejamento e inspeção em leitura. Não implemente, migre banco, publique, altere serviços, ative transportes nem envie mensagens.

LEITURA OBRIGATÓRIA

Leia README.md e integralmente todos os documentos de docs/README.md até docs/14-lana-replication-contract.md, seguindo a ordem do índice. Use 06 como contrato comercial, 12 para agenda/notificações e 14 para o motor. Não use este prompt como substituto dos documentos.

Inspecione o código, dependências, rotas, testes e Git atuais. Recupere a conversa do Antigravity “App para Barbearias” (b967f95b-4876-4167-ba5a-d84805224826) e seus artefatos se precisar confirmar decisões. Preserve o layout aprovado, a landing simplificada e o que já funciona. Não reintroduza seções removidas.

REGRAS APROVADAS

- Entrada gratuita no Eleva e oferta consultiva conforme necessidade, sem obrigar todas as compras intermediárias.
- Eleva Google Pro: R$ 37 avulso e 14 dias grátis da Agenda.
- Eleva Completo: R$ 57 avulso e 30 dias grátis da Agenda.
- Upgrade Pro para Completo: R$ 20; teste ampliado para 30 dias totais desde a ativação original, sem reiniciar.
- O teste começa na primeira ativação operacional; o dono escolhe os recursos da modalidade Agenda de R$ 37 ou R$ 67/mês.
- Agenda R$ 37/mês: agenda e confirmações WhatsApp para cliente e barbearia.
- Agenda R$ 67/mês: tudo da básica mais atendimento IA e agendamento pelo WhatsApp.
- Cliente final agenda com nome e WhatsApp, sem conta, e-mail ou pagamento antecipado obrigatório.
- Um único motor e WhatsApp vendem tudo, acompanham o funil, notificam e atendem conforme direitos. Consultoria comercial ao dono não equivale à IA paga para clientes finais.
- Reproduzir fielmente a Lana e configurações, adaptando copys e acrescentando os contratos mínimos de contexto, eventos e ferramentas da Agenda. Não criar bots por plano/produto/barbearia.
- Finalizar primeiro aplicativos e contratos com transporte simulado. Depois reproduzir/integrar o motor; validar transacional e IA antes de ativar prospecção.
- InfinitePay é o provedor. Separar assinatura, recebimento da barbearia e indicação InfiniteTap; não usar Asaas.
- Confirmações transacionais não esperam cadência comercial, mas respeitam proteções globais.
- Google/Instagram têm caminho manual assistido; intermediários são opcionais e não bloqueiam o produto.
- Medir uso, necessidade, oferta, compra, teste, assinatura e resultado para orientar a próxima ação do atendimento.

O QUE O PLANO DEVE ENTREGAR

1. Inventário: existente, validado, parcial e ausente, com arquivos/evidências. Diferencie código local, deploy, banco e transporte em operação.
2. Decisões técnicas: persistência/PostgreSQL, autenticação do dono, domínios, deploy, eventos/outbox, IA, worker e observabilidade. Reutilize o existente. Feche ADRs e decisões comerciais pendentes que afetem execução; pergunte somente o que não puder descobrir ou resolver como escolha técnica, sem inventar limites ou condições de cobrança.
3. Plano por dependências, com IDs de tarefas, objetivo, alterações concretas, dependências, APIs/dados, testes, aceite, esforço estimado e resultado demonstrável. Mostre caminho crítico e trabalho paralelizável.
4. Catálogo, testes e cobrança: elegibilidade, datas, duplicações, upgrade de R$ 20, mudança de modalidade, fim de teste, renovação, inadimplência, cancelamento e reembolso. Homologue recorrência e confirmação InfinitePay antes de prometer débito automático.
5. Agenda/IA: disponibilidade e concorrência entre web/WhatsApp, painel, contexto multi-negócio, autorização, cancelamento/reagendamento e encaminhamento humano. IA usa as mesmas operações da interface.
6. Motor: identificar versão/configuração realmente executada, incluindo alterações locais, capturar referência reproduzível sem segredos, criar instância independente do Estúdio, testar paridade, integrar e ativar em etapas.
7. Métricas: contratos de eventos, deduplicação, atribuição/coortes, painéis e resumo consultivo. Compra muda a etapa, não reinicia abordagem fria.
8. Integrações opcionais: prova de conceito delimitada por capacidade, custo e autorização. Se inadequadas, manter o MVP manual sem atrasar lançamento.
9. Validação: testes unitários, integração, concorrência, browser/mobile, isolamento, cobranças repetidas, envio incerto e falhas parciais. Especifique o que é simulado e o que exige validação real.
10. Finalização: ambientes, migrações, backup/restauração, rollback, suporte, três barbearias-piloto, primeira venda verificável e critérios para liberar teste real e prospecção.

Ao final, apresente uma sequência inequívoca de execução, estimativa realista por fase e dependências externas com condição de desbloqueio. Reavalie o prazo histórico de duas semanas para o escopo ampliado. Não declare entrega concluída com base em telas, build, status de processo ou simulações. Não execute o plano nesta tarefa.
```
