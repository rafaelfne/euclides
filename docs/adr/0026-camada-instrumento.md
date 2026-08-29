# ADR-0026: A camada instrumento, e o formato como parte do treino

**Status:** Aceito
**Data:** 2026-08-29
**Decisores:** Rafael Neves

## Contexto

A trilha existe para julgar código gerado por IA. O aluno vai encontrar esse código num
lugar específico e num formato específico: **um diff, numa revisão de pull request**. O app
mostrava blocos de arquivo.

E o app tinha crescido para 62 ciclos, 95 termos e 52 armadilhas, com três cliques e uma
rolagem entre o leitor e qualquer um deles.

## Decisão

### O diff é o formato, e o formato é conteúdo

Com `addedLines` declarado, o exercício de caça ao defeito é renderizado como diff de
revisão: medianiz de `+`, cabeçalho de pull request, contagem de linhas acrescentadas, e o
enunciado passa a dizer "a linha que você recusaria nesta revisão".

Não é decoração. **Julgar um diff é diferente de julgar um arquivo**: o diff diz o que
mudou, e a pergunta "o que isso quebra" só existe quando há um antes. `synthesis.e5` é o
caso exemplar, porque o enunciado já dizia que aquele código foi gerado por IA e aprovado
numa revisão.

`addedLines` é opcional. Um exercício sem ele continua sendo bloco de código, porque nem
todo defeito chega por PR.

### O painel de execução acende a linha certa, ou não existe

`lineByColumn` declara qual linha do pseudocódigo escreve cada coluna do traço. A linha
acesa é a da **última coluna que mudou** naquela rodada: acender sempre a primeira mostraria
o topo do laço a cada passo, o que é verdade e não é informação.

Sem `lineByColumn` o painel não aparece, e o traço rodando entra no lugar. **Um depurador
que acende a linha errada ensina o oposto do que a unidade inteira treina**, e a unidade 01
é precisamente sobre saber qual linha escreveu qual valor.

Ele continua atrás do mesmo portão do ADR-0019: só depois de o exercício fechar.

### Atalhos são atalho, nunca interface

⌘K salta para ciclo, termo, armadilha ou tela, sobre o índice que já existe: nenhum dado
novo, nada para manter em paralelo ao conteúdo. `j`/`k` andam pelos ciclos, `1`–`9` escolhem
alternativa, `Enter` verifica.

Nenhum dispara com campo em foco, e **todo atalho tem um botão equivalente na tela**. Um
atalho que é a única forma de fazer alguma coisa deixou de ser atalho.

Estão documentados no `/como-funciona`, porque atalho que ninguém descobre não existe.

## Opções consideradas

### A — Diff em todos os exercícios de defeito
**Descartada.** Exigiria inventar um "antes" para sete exercícios que não têm um. Um diff
falso é pior que um bloco honesto.

### B — Painel de execução sem `lineByColumn`, inferindo a linha
Casar coluna com linha por heurística sobre o pseudocódigo.
**Descartada.** A heurística acertaria na maioria e erraria em silêncio, e o erro seria
justamente ensinar a associação errada entre linha e valor.

### C — Biblioteca de command palette
**Descartada.** São 120 linhas com `useMemo` e um `keydown`, sobre um índice que já existe.
O ADR-0025 acabou de aceitar 78 KB; aceitar mais por isto seria peso sem argumento.

## Análise de trade-off

O custo é autoria: `lineByColumn` e `addedLines` são campos que alguém preenche, e ambos
ficaram preenchidos em um exercício cada. Os outros continuam com o comportamento anterior,
que é o desenho pretendido — os dois campos são opcionais porque descrevem algo que nem todo
exercício tem.

O risco é o atalho virar requisito. A defesa é a regra: todo atalho tem botão.

## Consequências

- **Fica mais fácil:** percorrer o app sem mouse, e ler um defeito no formato em que ele
  aparece no trabalho.
- **Fica mais difícil:** escrever um exercício de traço da unidade 01 sem dizer qual linha
  escreve o quê.
- **Estava exposto, e fechou em 29/08/2026:** `lineByColumn` não era conferido contra o
  pseudocódigo, e uma linha renumerada deixava o painel acendendo a errada sem que nenhuma
  checagem percebesse. A checagem `acesa` reprova linha além do fim, linha em branco e
  coluna que o traço não tem.
- **A observar:** se o diff muda o desempenho no exercício. Se a mesma pessoa erra mais no
  formato de PR, o formato estava escondendo alguma coisa que o bloco mostrava.

## Itens de ação

1. [x] `addedLines` e o diff de revisão; `synthesis.e5` migrado
2. [x] `lineByColumn`, `ExecutionPanel` com linha acesa e variáveis observadas; `tracing.e2`
3. [x] ⌘K sobre o índice existente; `j`/`k`, `1`–`9`, `Enter`
4. [x] Atalhos documentados no `/como-funciona`
5. [x] Checar `lineByColumn` contra o número de linhas do pseudocódigo do ciclo
