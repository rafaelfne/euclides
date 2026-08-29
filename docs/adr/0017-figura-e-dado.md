# ADR-0017: A figura é dado declarado; o SVG é o renderizador

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

A leitura de aluno apontou que o app não tem nenhum recurso visual, e listou cinco lugares
em que uma imagem faz o trabalho de três parágrafos. O primeiro deles é literalmente o
exercício de `asymptotics.c1`: as curvas de 1000·n e n² se cruzando.

A saída é inline SVG, não há outra num export estático sem dependência. A pergunta que
este ADR responde é outra: **quem escreve o SVG?**

## Decisão

O conteúdo declara a **afirmação**; o componente desenha.

```ts
figure: {
  kind: 'growth',
  xMax: 1400,
  curves: [
    { label: '1000·n', shape: 'linear', factor: 1000 },
    { label: 'n²', shape: 'quadratic', factor: 1 },
  ],
  highlight: { from: 20, to: 200, label: 'as coleções reais' },
}
```

`shape` é enum, e `EVAL` em `src/components/GrowthFigure.tsx` é exaustivo por forma: uma
forma nova não compila até ser definida. O autor nunca escreve um caminho, uma coordenada
ou uma cor.

## Opções consideradas

### A, SVG autorado no conteúdo
Um campo `svg: string` no ciclo, ou um arquivo importado.
**Descartada**, por três razões que valem mais que a liberdade que ela dá.

**Uma figura afirma alguma coisa, e nenhuma checagem consegue conferir um caminho.** Se o
cruzamento das duas curvas for desenhado no lugar errado, o gráfico mente e passa. Aqui o
cruzamento é achado por varredura sobre as próprias funções declaradas: trocar o fator de
1000 para 500 move a marca sozinha, e não há como o desenho discordar do dado.

**É a mesma regra do `CostClaim`, um andar acima.** O ADR-0004 recusou complexidade como
string porque uma string aceita "é rápido". Uma figura como caminho SVG aceita qualquer
coisa, incluindo uma curva que não é a função que o rótulo diz que é.

**Cor autorada não sobrevive a redesenho.** O ADR-0015 trocou a paleta inteira. Um SVG no
conteúdo teria hex dentro, e a troca teria deixado seis figuras com a paleta antiga sem que
nada avisasse, que é exatamente a deriva 4 do `CLAUDE.md` numa camada nova. O renderizador
usa as variáveis de tema, então a figura acompanha.

### B, Biblioteca de gráficos
**Descartada.** Peso para um caso, e o ADR-0015 acabou de aceitar peso uma vez; aceitar de
novo sem necessidade é como o argumento de kB morre. Duas polilinhas não justificam uma
dependência.

### C, Figura como dado declarado
Adotada.

## Análise de trade-off

O custo é real e vale ser dito sem enfeite: **cada tipo de figura novo é código novo.** As
outras quatro visualizações que a leitura pediu, colisão e chaining, o deslocamento no
array, a árvore degenerando, largura contra profundidade, não cabem em `growth`. Cada uma
precisa do seu `kind`, do seu renderizador e da sua checagem.

Isso é mais trabalho do que desenhar cada uma em SVG à mão. A troca é: desenhar é mais
rápido uma vez, e declarar é o que impede a figura de mentir na décima. Num projeto cujo
nome é "nada é assumido que não esteja declarado", a figura não podia ser a única peça
autorada que ninguém confere.

## O que o segundo `kind` mostrou

`shift` nasceu logo depois de `growth`, e trouxe uma propriedade que a opção A não teria
como dar: **a figura e o gabarito derivam do mesmo fato, e agora um confere o outro.**

O bloco e a posição removida são declarados no ciclo; os estados são derivados com a mesma
regra do gerador de `linear.e3`. `scripts/test-traces.ts` afirma que as duas contas batem, 
mesmo número de escritas, mesmo bloco no fim. Um SVG desenhado à mão poderia mostrar três
escritas ao lado de um exercício que cobra quatro, e nada perceberia.

Isso é diferente do argumento original, que era sobre a figura não mentir sozinha. Este é
sobre ela não discordar do exercício ao lado dela.

## Consequências

- **Fica mais fácil:** trocar a paleta, corrigir um fator, confiar que o desenho concorda
  com o rótulo, e, com `shift`, que ele concorda com o gabarito do exercício.
- **Fica mais difícil:** a próxima figura, se ela não couber num `kind` existente.
- **A observar, e o limiar chegou:** eu tinha escrito que se três `kind` nascessem sem
  nenhum ser reaproveitado, a abstração não teria pago. **Três nasceram, `growth`, `shift`,
  `tree`, e nenhum foi reaproveitado.**

  Reabro a opção A e a descarto de novo, agora com evidência em vez de argumento. Dois dos
  três `kind` conferem contra o gerador de referência do exercício do próprio ciclo:
  `shift` bate o número de escritas e o bloco final com `linear.e3`, e `tree` bate a altura
  com `trees.e1`. Essa conferência é o que impede a figura de ensinar uma coisa enquanto o
  exercício ao lado cobra outra, e ela **só existe porque a figura é derivada**. Um SVG
  autorado não teria como ser conferido contra nada.

  O critério estava errado, não a decisão: reaproveitamento nunca foi o benefício. O
  benefício é a figura não poder discordar do gabarito. O quarto `kind`, `buckets`, nasceu
  depois desta revisão e confirmou o critério corrigido: a tabela que ele desenha tem de ser
  um estado que `hash.e1` de fato atinge, e a asserção reprova uma figura que mostre uma
  distribuição que a inserção nunca produz.

  Se um `kind` nascer sem poder ser conferido contra nada, aí sim a opção A merece ser reaberta
  para aquele caso.

## O caso que quase não deu para conferir

O quinto `kind`, `traversal`, foi o teste do critério corrigido. Quando ele entrou na fila,
o registro dizia que era o que provavelmente não daria para conferir contra nada: `graphs.e4` gerava a
ordem em largura, e a ordem em profundidade não existia como referência. Escrever um gerador
só para servir a figura teria produzido exatamente o que o critério condena, um desenho
conferido contra código que ninguém mais usa.

A saída não foi relaxar a regra, foi escrever o exercício que faltava. `graphs.e8` cobra o
traço em profundidade sobre o mesmo grafo de `graphs.e4`, e a única diferença entre os dois
pseudocódigos é a ponta de onde se retira. O gerador nasceu como gabarito, e a figura passou
a ter dois traços para conferir em vez de nenhum.

Isso mudou o conteúdo, não só a figura: `graphs.c5` empacotava três afirmações, a troca de
estrutura, a garantia de menos arestas, e a ressalva do peso, e virou dois ciclos, um para
a troca e outro para o que ela garante e o que não garante. A pergunta "esta figura consegue
ser conferida?" achou um ciclo sobrecarregado que nenhuma checagem tinha achado.

**É o argumento mais forte a favor da decisão até agora**, e ele não estava previsto: a
exigência de conferir é um teste de coerência do conteúdo, não só do desenho.

## Itens de ação

1. [x] `figure` no schema, com `curveShape` como enum
2. [x] `GrowthFigure` com `EVAL` exaustivo e cruzamento calculado
3. [x] Checagem `figura`, por kind: curvas distintas e faixa no eixo; posição removida que
   de fato desloca
4. [x] `shift`, com asserção de que a figura e o gerador de referência concordam
5. [x] `tree`, com a checagem de que as duas sequências comparam o mesmo conjunto de chaves
6. [x] `buckets`, com a checagem de que a figura de colisão de fato tem uma colisão, e a
   asserção de que a tabela desenhada é um estado que o gabarito atinge
7. [x] `traversal`, com a checagem de que os dois percursos dão ordens diferentes e a de que
   todo vértice desenhado é alcançável
