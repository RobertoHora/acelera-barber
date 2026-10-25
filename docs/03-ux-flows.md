# Jornadas e UX

## Princípios

- Celular primeiro; uma decisão por tela.
- Não pedir cadastro antes de mostrar valor.
- Salvar enquanto o cliente digita.
- Mostrar a próxima ação, não um painel cheio de possibilidades.
- Nunca confundir “preparado” com “sincronizado”.

## Jornada do lead

1. **Link pessoal:** nome da barbearia, bairro e uma oportunidade específica pré-preenchida.
2. **Diagnóstico grátis:** score explicável com no máximo três melhorias prioritárias.
3. **Confirmação de dados:** nome, telefone/WhatsApp, bairro, horário e Instagram; cada campo explica por que é usado.
4. **Vitória rápida:** bio, link de agendamento e QR de avaliação prontos para copiar/baixar.
5. **Paywall de contexto:** aparece ao abrir recursos que exigem mais valor: editor completo, serviços com fotos, kit Instagram e acompanhamento.
6. **Checkout:** uma escolha de plano, Pix/cartão hospedado e retorno à mesma tarefa.
7. **Aplicação:** checklist por plataforma, botão de copiar e instrução visual; cliente confirma a conclusão ou pede ajuda.

## Estados da ação externa

| Estado | Significado para o cliente |
| --- | --- |
| `DRAFT` | ainda editando |
| `READY_TO_APPLY` | conteúdo pronto; falta aplicar na plataforma |
| `CLIENT_CONFIRMED` | cliente confirmou que aplicou |
| `SYNC_PENDING` | reservado para integração oficial futura |
| `SYNCED` | confirmado por API oficial |
| `FAILED` | não aplicado; mostrar correção e suporte |

## Regras de interface

- O diagnóstico deve explicar como cada ponto foi calculado e permitir corrigir dados.
- Um recurso bloqueado mostra benefício, resultado e preço; não mostra uma tela vazia.
- O retorno do checkout não prova pagamento; exibir “aguardando confirmação” até o ateste da operação.
- Todas as cópias e downloads geram evento; não interpretar clique como aplicação externa.
- Acessibilidade mínima: contraste, foco visível, texto de botão concreto e alternativas aos ícones.

## Telas mínimas

`/d/[token]` diagnóstico e onboarding; `/app/[businessId]` painel; `/app/[businessId]/aplicar/google`; `/app/[businessId]/instagram`; `/checkout/retorno`; `/ops` painel interno.
