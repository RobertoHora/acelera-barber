# Qualidade, aceite e lançamento

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Matriz de teste

| Área | Cenários obrigatórios |
| --- | --- |
| Comercial | Gratuito acessível; Pro R$ 37/14 dias; Completo R$ 57/30 dias; upgrade R$ 20 somente com compra elegível |
| Teste | Não inicia na compra/preview; modalidade escolhida; ativação repetida não reinicia; upgrade recalcula desde origem |
| Assinatura | Básica R$ 37 e IA R$ 67; acesso server-side; fim de teste não gera débito implícito |
| Cobrança | Redirect falso, evento repetido/fora de ordem, valor/recebedor divergente, reembolso e confirmação manual auditada |
| Reserva | Nome/WhatsApp; concorrência real com dois clientes/canais; duração, buffer, timezone, bloqueio e reagendamento |
| Notificação | Dois destinatários corretos, dedupe, evento antigo após cancelamento, falha parcial, aceite versus entrega |
| IA | Direito ativo, serviço/horário inexistente, falta de contexto, chamada repetida, falha de gravação e handoff |
| Motor | Paridade com referência, horários comerciais, trilha transacional sem atraso comercial, kill switch e restrição |
| Integridade | Posse expirada, concorrência no opt-out, envio aceito seguido de falha de banco e timeout ambíguo |
| Métricas | Reconstrução de funil, duplicação, atribuição/coorte e ausência de PII no analytics |
| Segurança | Outro tenant, token público inválido, segredo exposto e autorização de serviço |

Upgrade após término deve respeitar limite original de 30 dias; modalidade e preço iguais de produtos diferentes não podem confundir direitos. IA consultiva não habilita atendimento de cliente final sem direito.

## Piloto

Três negócios: dono único; equipe com vários profissionais; negócio com dados/importação incompletos. Incluir testes das duas modalidades, dois canais de reserva e entrega aos dois destinatários. Evidência real separada de fixtures, simulações e teste de transporte.

## Portões

1. Aplicativos completos em ambiente isolado, direitos e eventos com transporte simulado.
2. Referência da Lana identificada e reprodução testada sem produção.
3. Transacional e IA validados em contatos de teste, depois negócios-piloto.
4. Testes reais liberados somente com modalidade operacional.
5. Prospecção ativada depois da capacidade de cumprir toda oferta.

Falha no WhatsApp preserva reserva e vira pendência operacional. UNKNOWN/UNCERTAIN não voltam automaticamente à fila. Não anunciar entrega automática antes de comprovar funcionamento.

## Evidência de release

Registrar commit, estado da árvore, hashes relevantes, ambiente, testes e limites; URL/release real, banco/migração e transporte comissionado são verificações separadas. Preparar rollback de aplicação, worker e migrações compatíveis. Não usar build local ou status ONLINE como prova de venda/entrega.
