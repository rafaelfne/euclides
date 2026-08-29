# ADR-0025: Oito diagramas, e o orçamento que o React Flow estourou

**Status:** Aceito
**Data:** 2026-08-29
**Decisores:** Rafael Neves

## Contexto

O ADR-0017 decidiu que figura é dado declarado e o componente desenha, e cinco `kind`
nasceram sob essa regra. Faltavam três, e um deles era um constrangimento: o ciclo
`asymptotics.c4` se chama **"A árvore de recursão, desenhada"** e não tinha desenho. A
tabela do exercício conferia uma derivação que o aluno nunca via.

## Decisão

### Três `kind` novos, e os oito diagramas fecham

`recursion`, `growth-doubling`, `stability`. Com os cinco do ADR-0017, são oito.

Cada um tem **equivalente tabular ao lado**, não escondido atrás de um `details`: a tabela
é o que o exercício cobra, e ela é a mesma conta que o desenho mostra.

### `recursion` entrou com React Flow, e saiu em 29/08/2026

**Revertido.** As oito figuras são SVG inline, sem dependência de desenho.

A decisão original dizia que a árvore de recursão é genuinamente um grafo com layout
hierárquico, e que escrever o layouter à mão seria reimplementar dagre pior. As duas
premissas estavam erradas, e a segunda foi a que custou.

A árvore de recursão **não precisa de layout**: ela é completa e uniforme por definição, o
nível `i` tem `branches^i` chamadas igualmente espaçadas, e a posição de cada caixa é uma
conta de uma linha. Não há nada para um motor de layout resolver.

E a aposta que sustentava o preço não se confirmou. O ADR aceitou 78 KB porque o custo seria
pago uma vez e serviria "toda figura de grafo que nascer depois". Nasceram duas —
`rotation` em `trees.c3` e `visited` em `graphs.c4` — e **nenhuma das duas usou a
dependência**. Uma são duas árvores lado a lado; a outra são dois grafos de três vértices.
Com a única consumidora reescrita em 190 linhas de SVG, os 78 KB serviam uma figura só.

Sai junto a marca d'água, que era consequência de a dependência estar lá: removê-la exigia
assinatura Pro, e a decisão de removê-la foi tomada e revertida na mesma sessão. Sem React
Flow não há marca a discutir.

### O orçamento estourou, e depois voltou

O plano fixou ~40 KB gzip por diagrama. React Flow mais dagre davam **78 KB gzip**, medidos
no export, e o ADR aceitou o estouro por causa da aposta acima. Com a reversão, as oito
figuras estão abaixo do orçamento, porque as oito são SVG inline.

### As checagens novas, e o que cada uma impede

| kind | a checagem impede |
|---|---|
| `recursion` | `branches > divisor`, que faz o custo por nível CRESCER, o contrário do que o ciclo ensina |
| `growth-doubling` | menos de duas dobras, onde a média não chega a estabilizar |
| `stability` | nenhum valor repetido, e sem empate a estabilidade não aparece |

As três são a mesma regra do ADR-0017 um caso adiante: a figura tem de poder afirmar o que o
ciclo afirma, e a checagem reprova a configuração em que ela afirmaria o contrário.

### A figura pegou a prosa errada, de novo

A legenda do `growth-doubling` dizia que a média estabiliza "perto de 3". A figura mostrou
1,94, e a tabela ao lado mostrou por quê: 16 inserções custam 31 no total. Corrigi a prosa
contra o desenho.

É a terceira vez que uma figura derivada corrige um texto autorado, e é o argumento do
ADR-0017 acontecendo em vez de sendo defendido.

## Opções consideradas

### A — React Flow em todos os diagramas
**Descartada.** Sete dos oito não são grafos, e usar um motor de layout para desenhar barras
paga 78 KB por nada.

### B — Layouter próprio, sem dagre
**Descartada.** A `TreeFigure` do ADR-0017 já tem um layout de árvore próprio, e ele serve
porque a árvore de busca tem no máximo dois filhos e ordem definida. Uma árvore de recursão
com `branches` variável exige o caso geral, que é dagre.

### C — Esconder a tabela atrás de um `details`
**Descartada.** O equivalente textual não pode ser a versão de segunda classe. E, no caso da
árvore de recursão, a tabela É o exercício.

## Análise de trade-off

O custo é a dependência: 78 KB gzip e um motor de layout de terceiros num projeto que até
aqui não tinha nenhum. O ADR-0015 já tinha aceitado peso uma vez, e este é o segundo.

O risco é o React Flow virar o martelo. A regra que fica: **ele só entra quando o conteúdo é
genuinamente um grafo com layout não trivial.** Barras, células, blocos e árvores binárias
já têm componentes próprios e continuam com eles.

## Consequências

- **Fica mais fácil:** desenhar grafo com layout hierárquico.
- **Fica mais difícil:** justificar a nona figura. Cada `kind` continua sendo código novo.
- **Fica exposto:** o orçamento por diagrama do plano não descreve mais a realidade. O número
  honesto é "78 KB uma vez, para o conjunto das figuras de grafo".
- **A observar:** se aparece uma segunda figura de grafo. Se não aparecer, os 78 KB estão
  servindo a um diagrama só, e aí a opção B merece ser reaberta.

## Itens de ação

1. [x] `recursion` com React Flow, dagre e tabela ao lado; `asymptotics.c4` ganha o desenho
   que o título prometia
2. [x] `growth-doubling` e `stability` em SVG
3. [x] Três checagens novas, uma por `kind`, cada uma impedindo a configuração que mente
4. [x] Cada figura substitui um parágrafo, e o parágrafo saiu
5. [x] `dynamic({ ssr: false })` no React Flow; medido em 78 KB gzip no export
6. [ ] Faltam da lista do plano: rotação em `trees.c3`, ciclo sem visitados em `graphs.c4`,
   a cadeia da tabela hash animada, insertion sort em `sorting.c2`, e o controle deslizante
   de n em `asymptotics.c1`
