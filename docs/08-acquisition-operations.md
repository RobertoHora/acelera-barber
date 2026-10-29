# Funil consultivo, operação e métricas

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Uma relação e uma instância

Um motor e um WhatsApp vendem Eleva Gratuito → Google Pro/Completo → teste Agenda → Agenda R$ 37/R$ 67 → retenção/upgrade. O lead não é obrigado a comprar tudo; atendimento oferece a solução adequada às necessidades e aos direitos já adquiridos.

Reproduzir o sistema Lana como construído e configurado, conforme [contrato de reprodução](14-lana-replication-contract.md). Alterar copys, ofertas e contexto do produto; não reconstruir outro motor comercial.

## Estado de relacionamento

Registrar descoberta, uso gratuito, oferta, compra Eleva, benefício disponível, teste ativo/expirado, assinatura ativa/inadimplente/cancelada. Dimensões são independentes: CUSTOMER/CONVERTED não encerra o funil nem autoriza continuar abertura fria.

Após compra, cancelar abordagens frias já pendentes. Seguimento consultivo tem propósito, contexto e intervalo próprios. Nenhuma oferta pode ser repetida se o mesmo direito já está ativo. Opt-out/handoff prevalecem sobre metas de venda.

## Descoberta e próxima ação

NeedObservation guarda necessidade, evidência/origem e data. Ofertas guardam motivo, etapa, variante, preço/versão e resultado. Antes de responder, o bot consulta resumo persistido de uso, compras, teste, assinatura e atendimento humano.

Exemplos: dificuldade de aplicar material → ajuda; compra Eleva sem ativar agenda → orientar ativação; uso de agenda com demanda de respostas no WhatsApp → apresentar modalidade IA; falha ou reclamação → suporte antes de nova oferta.

Dados de agenda não viram consentimento comercial. Clientes finais da barbearia não são inscritos na prospecção do Eleva.

## Métricas

- Conversão entre diagnóstico, melhoria, compra Eleva, ativação, primeiro agendamento e assinatura.
- Tempo por etapa, abandono e motivo de suporte.
- Conversão por oferta, necessidade, origem e variante de abordagem.
- Teste por modalidade, uso, expiração e conversão paga.
- Entrega/latência das confirmações, falha definitiva e duplicação.
- Agendamentos pela IA, taxa de sucesso e handoff.
- Renovação, cancelamento e receita por negócio, separando Eleva, Agenda e indicação confirmada.

Eventos devem ser deduplicados; conversão usa pagamento real e período/coorte explícitos. Clique não é compra, mensagem aceita não é entregue e comparação de avaliações não prova ranking causal.

## Operação e canais

A mesma instância conduz dono, cliente final e notificações com contexto de negócio e finalidade. Um telefone pode ter vários papéis; resolver contexto por reserva/link/conversa, pedir esclarecimento se necessário. Não associar automaticamente pelo último negócio atendido.

Ativação de disparos ocorre depois dos aplicativos prontos, motor reproduzido e piloto. Preservar a operação Estúdio ORC e não importar seus contatos, filas ou sessões.
