# Jornadas e UX

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Princípios

Mobile-first, uma decisão por tela, dados reaproveitados e salvamento real. Não pedir cadastro antes do valor gratuito; autenticar o dono antes de administrar/publicar. Preservar dark matte, identidade e seções atuais. Não restaurar seções removidas, tempos artificiais, badges redundantes ou esperas de dez segundos quando não houver trabalho real.

## Jornada do dono

1. Acessa Eleva pelo link atribuído ou busca; reconhece/corrige a barbearia.
2. Vê diagnóstico com evidências, origem e dados desconhecidos; conclui uma melhoria gratuita.
3. Recebe oferta contextual de R$ 37 ou R$ 57, ou segue no gratuito.
4. Compra via InfinitePay; retorna ao trabalho; acesso depende de confirmação real.
5. Recebe 14 ou 30 dias de benefício, ainda não consumidos.
6. Ativa Agenda ORC: confirma serviços, profissionais, expediente e escolhe modalidade de R$ 37 ou R$ 67/mês.
7. Publica a primeira agenda operacional; vê data/hora de início e fim do teste.
8. Acompanha reservas e resultado; escolhe assinatura ao continuar após o teste.

Upgrade Eleva de R$ 37 para R$ 57 custa R$ 20 e amplia para 30 dias totais desde o início original. Não apresentar como novos 30 dias.

## Jornada do cliente final

Página pública → serviço → profissional ou primeiro disponível → horário → nome e WhatsApp → confirmar → reserva na tela e confirmação WhatsApp. Se houver um profissional, omitir seleção. Pagamento no atendimento, sem e-mail, senha, instalação ou checkout obrigatório.

A ação de confirmar deve explicar o recebimento das atualizações transacionais pelo WhatsApp do Eleva/Agenda. Marketing não é embutido nessa autorização.

Cancelamento/reagendamento por link privado. Falha de mensagem não desfaz a reserva; mostrar estado correto e forma de ajuda. Atendimento humano permanece disponível.

## Plano com IA

No mesmo WhatsApp, identificar a barbearia/contexto, descobrir serviço e horário, consultar disponibilidade e confirmar o resumo antes de gravar. Perguntar apenas o que falta. Necessidade de desambiguação não autoriza escolher barbearia ou profissional arbitrários.

## Rotas e estados

- Eleva: landing, diagnóstico, wizard, ofertas e área autenticada do dono.
- Agenda: https://agenda.oracio.uk/b/[slug] e /b/[slug]/admin.
- Link privado de reserva para consulta/cancelamento/reagendamento; slug público não autentica o dono.
- Ação externa: DRAFT → READY_TO_APPLY → CLIENT_CONFIRMED; SYNC_PENDING/SYNCED só para integração validada.
- Reserva, assinatura, pagamento e mensagem possuem estados independentes.

Estados de carregamento, vazio, conflito, indisponibilidade e reconexão devem ter ação concreta. Navegação entre subdomínios preserva contexto de forma autenticada, sem transportar credenciais pela URL.
