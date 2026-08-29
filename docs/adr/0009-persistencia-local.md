# ADR-0009: Progresso em localStorage, sem backend e sem auth

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

O app precisa lembrar o que o aluno resolveu, quais armadilhas ele ativou e quando o
intervalo de revisita venceu. Isso normalmente pede banco e autenticação.

ADR-0001 fixou export estático. Backend derrubaria essa decisão.

## Decisão

`localStorage`, com schema versionado e validado com zod na leitura. Incompatibilidade de
versão reseta e avisa, nunca quebra a tela.

## Opções consideradas

### A, localStorage (adotada)
Zero backend, zero auth, zero custo por leitor, funciona offline.
**Contras:** progresso preso a um navegador; some ao limpar dados; o autor da trilha não
vê o avanço do aluno.

### B, Supabase com Auth
Progresso persistente e histórico de erros visível para quem acompanha.
**Descartada por ora:** exige backend e derruba o export estático, além de introduzir
custo por usuário no cenário publicado.

### C, Integrar a um app de acompanhamento existente
**Descartada:** acopla dois projetos com ciclos de vida diferentes.

## Análise de trade-off

Perder a visibilidade do progresso do aluno é uma perda real e foi mitigada, não
resolvida: o painel de lacunas exporta a sessão em markdown, e a conversa de correção
acontece com esse dado em mãos.

O schema de progresso já foi desenhado pensando em migrar para um backend sem retrabalho
grande, caso o cenário mude.

## Consequências

- **Fica mais fácil:** publicar e hospedar; nenhum dado pessoal sai do navegador.
- **Fica mais difícil:** continuar em outro dispositivo; acompanhar o aluno à distância.

## Itens de ação

1. [x] `src/lib/progress.ts` com zod e versão
2. [x] Exportador de sessão em markdown, `src/lib/session-export.ts`, painel em `/gaps`

## Nota de implementação

O export atravessa a fronteira do app, então o princípio 3 precisou atravessar com ele.
Ele carrega o estado do aluno, tentativas, o que saiu limpo, quais armadilhas dispararam
e a pergunta que cada uma já fez na tela, e nunca uma entrada de `escalation` que o aluno
não alcançou nem o texto de uma alternativa correta. `scripts/test-export.ts` checa as duas
ausências, porque um vazamento ali não quebraria tela nenhuma: entregaria em silêncio a
resposta que o motor inteiro existe para reter.

O markdown também pede, em voz ativa, que o modelo do outro lado corrija sem entregar o
valor, inclusive se o aluno pedir.
