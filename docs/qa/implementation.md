# Execução do teste assistido — 29/10/2026

## Entregas de implementação

- Banco `eleva_agenda_e2e`, cópia da Barão com destino do operador e profissional/serviço de teste. Origem consultada somente em leitura.
- Banco `eleva_agenda_test` separado para suítes automáticas; não usar a execução assistida para cleanup da suíte.
- Migrações para inbox/conversas persistentes, circuito próprio e campos de voucher/pré-pagamento anteriormente aplicados fora das migrações.
- Runtime Next e pump da Laura supervisionados por systemd do usuário, porta 3010 em loopback; tunnel próprio de homologação. Acesso HTTPS privado por cookie, sem expor PostgreSQL.
- Patch reproduzível e reversível do gateway em `scripts/e2e/stage-gateway.py`; instalação verifica hash, testes e reconexão. Não cria socket Baileys adicional.
- Roteamento exclusivo de inbound, varredura, presença e recibos; fila privada em disco. Evento retido sem fallback em indisponibilidade ou pausa.
- Token de motor e trava no envio: Lana não envia ao contato reservado; Laura não envia a outro destinatário. Revalidação antes do envio efetivo.
- Circuit breaker original da Lana copiado sem alteração; adaptador persiste estado próprio. Trava compartilhada consultada somente em leitura. Guard de pacing original copiado; configuração numérica 8h–20h, 12 novos leads/dia, 900 ±300s. Sem copiar credenciais, sessões, filas ou leads Lana.
- Outbox com posse por tentativa, serialização de contato e retenção de envios incertos. ID real do gateway reconhecido, sem fabricar ID de sucesso.
- Inbox persistente e deduplicada, descarte em arquivo de mensagens históricas anteriores ao início do teste, janela de 20s, contexto consultivo e fluxo guiado de escolha de serviço/data/horário/nome/confirmação. Atendimento humano pausa a resposta automática.
- Primeiro contato no formato da variante C usada pela Lana: confirmação da loja, sem link/oferta; identificação da Laura e consentimento na resposta.
- Checkout persistido, autenticação OTP, verificação server-side da InfinitePay, simulação explícita em ambiente isolado e liberação idempotente. Nenhum clique ou comprovante libera acesso.
- Pro/Completo e upgrade atualizam benefício e fim da assinatura em teste sem reiniciar a ativação original.
- Workspace no layout existente: modalidade da Agenda, ativação operacional, link para copiar, indicação InfiniteTap e tag, materiais de Instagram em PNG.
- Pagamento opcional do serviço com recebedor e valor congelados por reserva; callback e retorno consultam `/payment_check`; pagamento recebido após cancelamento exige revisão, sem reativar a reserva. Simulação de serviço separada da compra Eleva.
- QR Wi-Fi com escape de caracteres; QR Google sem destino inventado; plaquinha dupla exige Pro.
- Eventos do funil (LP, análise, uso gratuito, oferta, material, indicação, cópia do link) e recibos WhatsApp persistidos, com identificação da execução de teste.
- Correções de propriedade nas APIs, OTP criptográfico/consumo único, ausência de segredo padrão e recusa de pré-pagamento declarado pelo cliente.

## Procedimento operacional

1. `npm run e2e:status` e leitura do segundo cérebro.
2. Carregar `.runtime/e2e/app.env` apenas no processo que precisa dela. Nunca colar seu conteúdo em logs ou Git.
3. Validar suíte em `eleva_agenda_test`, build, smoke HTTP e navegador móvel.
4. Instalar patch com `node scripts/e2e/install-gateway.mjs`; reconexão usa a sessão existente. Se falhar, script restaura fonte anterior.
5. Certificar gates. A primeira mensagem é enfileirada uma única vez por runId com `scripts/e2e/queue-opening.mjs`, respeitando circuito, destino e pacing.
6. Receber resposta pessoal, confirmar análise grátis, abrir LP, obter benefícios, simular Pro e upgrade, ativar Agenda, preparar materiais e reservar horário.
7. Para testar cliente final no mesmo telefone: pausar o avanço comercial e `node scripts/e2e/control.mjs role customer`. Retomar proprietário com `role owner`. Isso altera o contexto do teste, sem criar outra instância.
8. A cada ajuste: registrar evidência/necessidade → reproduzir → corrigir → testar → atualizar segundo cérebro → checkpoint.
9. Pagamentos reais R$37 + R$20 somente após simulação concluída. Devem usar cenário financeiro separado, preservando a evidência simulada; não reconfirmar pedido simulado como pagamento real, nem reiniciar prazo de um cliente real.
10. Ao encerrar: conferir recibos, pendências, pagamentos e mensagens incertas; reconciliar; marcar FINISHED e liberar reserva. Nunca soltar contato pausado por timeout.

## Limites que continuam explícitos

- Teste pessoal não ativa campanhas gerais, reengajamento ou a migração completa de todos os módulos comerciais da Lana.
- O atendimento de reserva implementado é guiado e persistente. Uma IA generativa aberta precisa de provedor e credencial próprios, avaliação e handoff; não foi copiada a credencial do Estúdio ORC.
- A tag é declarada pelo proprietário autenticado e exige confirmação explícita para habilitar pagamento online opcional. Checkout do serviço usa a tag da barbearia e não a chave da plataforma. A reserva continua válida para pagamento no local; o servidor só marca pré-pagamento após consultar o provedor e conferir o valor. Na execução pessoal, pagamentos de serviços permanecem simulados, separados do teste real das compras Eleva. A confirmação física do recebedor ainda faz parte do teste humano.
- A cobrança mensal automática da Agenda não é fornecida apenas por criar um checkout. Renovação/assinatura exige contrato de cobrança e reconciliação próprios antes da oferta em produção.
- Simulação é interna: a documentação InfinitePay informa que a criação de link de checkout real não é um sandbox. Nenhuma cobrança real é disparada automaticamente.
- Google/Instagram são assistidos. “Copiado/preparado” não significa publicado; “cliente confirmou” não é confirmação da API.
- A publicação Vercel/Agenda de produção é uma etapa distinta da homologação, com conectividade segura ao banco, domínio/TLS e configurações de produção a validar.

## Fontes e evidências

- Resultado privado: `.runtime/e2e/tests.log`, `build.log`, `http-smoke-result.json`, `browser-smoke-result.json` e capturas móveis.
- Validação automática concluída: 50 testes, build, 23 verificações HTTP e percurso móvel (LP → diagnóstico → melhorias → bloqueio do recurso pago → download do QR gratuito).
- Gateway recarregado com a sessão existente; bloqueios reais de saída confirmados por HTTP 403, sem enviar mensagem nos testes negativos.
- Estado e decisões: `.runtime/e2e/active.json`, `journal.jsonl`, `gateway-backup/manifest.json`.
- [Checkout oficial InfinitePay](https://www.infinitepay.io/checkout-documentacao): `/links`, `/payment_check`, centavos, webhook e ausência de sandbox.
- [Guia oficial da integração](https://ajuda.infinitepay.io/pt-BR/articles/10766888-como-usar-o-checkout-integrado-da-infinitepay).

## Execução humana iniciada

Primeira abordagem aceita em 29/10/2026 às 19:33 UTC. Estado privado marca a etapa
aguardando resposta do operador. O runtime da Laura está supervisionado e o
roteamento exclusivo está instalado; a Lana mantém seus processos e demais leads.
Ainda falta percorrer e validar as etapas humanas, compras reais autorizadas e
encerramento/reconciliação. Não confundir esse checkpoint com liberação de produção.
