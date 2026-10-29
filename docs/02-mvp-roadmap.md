# Roadmap — dependências e portões

Versão: 0.2 | Revisão: 2026-10-28 | Estado: especificação aprovada; implementação parcial.

## Referência atual

Eleva ORC já possui aplicação Next.js na Vercel, landing, busca local, diagnóstico, wizard e intenção local de compra. Banco operacional, reserva persistente, assinatura e integração do motor não foram demonstrados. O antigo cronograma de SPA/GitHub Pages foi substituído.

## Sequência obrigatória

| Fase | Entrega | Aceite para avançar |
| --- | --- | --- |
| 0 | Documentação, inventário e backlog | Preços, testes, contratos e fontes sem contradição |
| 1 | Persistência, autenticação do dono e isolamento | Dados entre negócios protegidos; migração testada |
| 2 | Eleva gratuito/pago e benefícios | Compra verificada concede recursos e benefício uma vez |
| 3 | Agenda pública e administração | Reserva, bloqueio, cancelamento e reagendamento corretos |
| 4 | Assinatura, teste e ferramentas conversacionais | Regras comerciais e operações da IA testadas; transporte simulado |
| 5 | Reprodução do motor Lana | Referência capturada, paridade e copys verificadas em isolamento |
| 6 | Integração e piloto transacional/IA | Confirmações duplas e agendamento conversacional reais validados |
| 7 | Ativação comercial e acompanhamento | Funil único, suporte, rollback e métricas disponíveis |
| Evolução | APIs externas e pagamento antecipado | Capacidade, autorização e custo homologados |

Antes da fase 5, preparar contratos, eventos e simuladores; não conectar transportes reais ou copiar sessões. O teste gratuito não começa em preview: ativação depende dos recursos escolhidos estarem operacionais, inclusive motor.

## Prioridades

Primeiro uma jornada vertical completa: gratuito → compra Eleva → benefício → agenda → confirmação → assinatura. Depois ampliar copys e recomendações. Prospecção real só começa após o produto conseguir entregar o prometido.

Pesquisa de intermediários Google/Instagram segue em paralelo, sem bloquear qualquer fase principal. Vercel já é o ambiente atual; banco gerenciado e hospedagem do novo worker são dependências a fechar no plano de engenharia.

## Planejamento de esforço

O plano sequencial deverá decompor cada fase em tarefas, arquivos, dependências, testes, esforço e portões externos. Reestimar a meta histórica de duas semanas para o novo escopo. Não comprimir autenticação, concorrência, cobrança ou integração de IA para cumprir uma data artificial.
