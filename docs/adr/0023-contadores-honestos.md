# ADR-0023: Três contadores, e o teste que todo número novo tem de passar

**Status:** Aceito
**Data:** 2026-08-29
**Decisores:** Rafael Neves

## Contexto

O progresso existia por exercício e nunca era agregado em nada legível. A tentação óbvia é
resolver isso com os números que todo app de estudo tem: exercícios feitos, ciclos
visitados, dias seguidos, tempo total.

Todos eles sobem sozinhos, e nenhum diz nada sobre julgar código.

## Decisão

### O teste, antes do número

**Ela ainda distingue quem acertou de primeira de quem acertou na quarta?** Se não
distingue, não entra. Vale para toda mecânica nova, e é a primeira asserção de
`scripts/test-counters.ts`, escrita antes das outras de propósito.

### Três contadores, e cada um com a regra embaixo

| contador | sobe quando | não sobe |
|---|---|---|
| **de primeira** | resolvido na primeira tentativa | tentando de novo |
| **armadilhas desarmadas** | ativada e depois resolvida limpa numa revisita | lendo a explicação |
| **revisitas honradas** | volta depois do intervalo que saiu limpa | voltando no mesmo dia |

A regra vai na tela junto do número, sempre. Um número sem a regra que o move é uma
pontuação disfarçada: o aluno vê subir e desce sem saber o que mexeu, e passa a perseguir o
número em vez do comportamento.

### `revisits` no progresso, porque o modelo não conseguia dizer isso

`solvedClean` congela na primeira visita e nunca mais volta a ser verdadeiro, por desenho.
Então "acertou de novo, limpo, depois de ter errado" era inexprimível, e sem essa frase não
há revisita honrada, não há armadilha desarmada e não haveria fila de repetição espaçada.

Uma volta só conta como revisita se o exercício **já estava resolvido** e o intervalo da
unidade **já tinha passado**. Responder de novo no mesmo dia é insistência, e insistência
não honra nada.

### O índice fica atrás de um interruptor, desligado

E aparece **sempre com a fórmula inteira ao lado**. Quem não quiser um número não precisa
ver nenhum, e quem quiser vê exatamente o que o move.

## Opções consideradas

### A — Percentual de conclusão
**Descartada** no ADR-0022 e reafirmada aqui: mede visita.

### B — Sequência de dias
**Descartada.** Sobe por login. É o exemplo canônico do que o princípio 2 proíbe, e a versão
aceitável dele já existe: revisitas honradas conta voltas limpas, não dias abertos.

### C — Índice ligado por padrão
**Descartada.** Um número na cara de quem abre o perfil vira a coisa que se persegue, e a
trilha inteira foi desenhada para que a coisa perseguida seja julgar código.

### D — Desarmar armadilha ao ler a explicação
**Descartada,** e é a distinção que dá sentido ao contador. Ler o porquê é consumo; resolver
de novo, limpo, depois do intervalo, é prática deliberada. Um contador que sobe ao ler é um
contador de páginas.

## Análise de trade-off

O custo é que **armadilhas desarmadas vai andar devagar**, porque desarmar exige esperar o
intervalo e voltar. Isso é a mecânica funcionando, e não um defeito a corrigir com um
atalho.

O risco é o índice virar o placar que ele nega ser. As duas defesas são o interruptor
desligado e a fórmula ao lado; se um dia o número aparecer sozinho em algum canto, virou XP.

## Consequências

- **Fica mais fácil:** responder "onde eu estou" sem inventar métrica.
- **Fica mais difícil:** acrescentar número. Todo agregado novo tem de passar no teste.
- **Medido em 29/08/2026, e não se poda:** `revisits` cresce sem limite, e o limite não
  chega. Cada entrada tem 46 bytes; 62 exercícios revisitados a cada 30 dias produzem 744
  entradas por ano, 33 KB. São 31 anos para 1 MB e 153 para os 5 MB usuais do
  `localStorage`.

  Podar também não é barato, porque as quatro derivações que leem `revisits` contam
  entradas: revisitas honradas e armadilhas desarmadas em `counters.ts`, o estado
  `desarmada` do caderno e o degrau da fila em `traps.ts`. Cortar o array faz o contador de
  revisitas honradas DESCER, que é a desonestidade que este ADR existe para impedir.
  Podar sem mentir exigiria gravar o total ao lado do array, com migração de schema.

  E o array não pode virar só um total: medir se 3, 10 e 30 dias são os intervalos certos
  (ADR-0024) precisa dos carimbos de data, e nada mais os lê hoje.
- **A observar:** se alguém liga o índice. Não há telemetria para saber, o que é consequência
  de não ter servidor.

## Itens de ação

1. [x] `revisits` no progresso, gravado só quando o intervalo passou
2. [x] `counters` com os três, cada um com a regra na tela
3. [x] `judgment` atrás de interruptor, desligado, com a fórmula visível
4. [x] Contadores no `/perfil` e no topo de `/gaps`
5. [x] `scripts/test-counters.ts`, com o teste do princípio 2 em primeiro lugar
6. [x] Podar `revisits` se ele crescer demais — medido, ele não cresce demais
