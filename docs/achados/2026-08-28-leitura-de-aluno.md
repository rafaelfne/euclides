# Achados de leitura — 28/08/2026

Primeira passagem pela unidade de hash **como aluno**, não como autor: abrir o mapa, seguir
para um ciclo, ler, tentar o exercício, e tentar chegar ao ciclo seguinte. Os achados estão
em ordem de gravidade. Cada um traz a evidência e a correção proposta; os três primeiros são
defeito, o quarto é escopo de unidade e depende de decisão pedagógica.

Escrito em 28/08/2026 e versionado em 29/08. O que está aqui é o estado daquele dia: parte
das correções propostas já entrou na `main` depois, e o estado de cada item precisa ser
conferido contra o código antes de virar trabalho.

---

## A1 — O exercício de traço não pode ser acertado: o formato da resposta não está declarado

**Gravidade: alta. É o único exercício de traço da trilha e ele reprova por tipografia.**

O gabarito é computado por `chainingInsertTrace()` e comparado com igualdade exata de string
(`normalize` em `src/lib/socratic.ts:39` só remove espaço e baixa a caixa). O que o gerador
emite, e que o aluno teria que adivinhar:

| coluna | o que o gerador emite | o que o aluno provavelmente escreve |
|---|---|---|
| `α` | `0,750` — três casas, vírgula | `0,75` → diverge |
| `rehash?` | `sim` ou `—` (travessão) | em branco, `não`, `-` → diverge |
| `conteúdo dos buckets` | `3:[3,11] 4:[4] 7:[7]` | `{3,11}`, `[(3,v3)]`, com buckets vazios → diverge |

O formato de `conteúdo` — só buckets não vazios, índice, dois-pontos, colchetes, apenas as
chaves (não os pares), ordem crescente, separados por espaço — não aparece no enunciado, no
corpo do ciclo, no `workedExample`, em `src/content/conventions.ts` nem como `placeholder`
(zero ocorrências em `src/components/`).

**O desfecho é o pior possível.** Divergência no passo 1 não tem armadilha mapeada
(`misconceptionByStep` de `hash.e1` só tem a chave `'4'`), então na terceira tentativa
`buildFeedback` cai no ramo sem misconception e devolve *"Vamos parar aqui. Releia a
invariante e volte a este exercício amanhã."* O aluno é mandado embora por ter escrito `0,75`
em vez de `0,750`.

É literalmente o cenário que o comentário de `src/content/conventions.ts` descreve: *"um aluno
carregando um modelo mental base 1 para uma referência base 0 diverge em todo passo e conclui
que não entende tabelas hash, quando o que ele encontrou foi uma convenção não declarada."*
A convenção de notação foi declarada; a de **preenchimento do traço** não.

**Correção**

1. `conventions.ts` ganha as convenções de preenchimento do traço, exibidas na barra lateral
   junto das de pseudocódigo.
2. Cada coluna do exercício ganha `placeholder` com o **formato**, nunca com o valor —
   `0,000`, `sim ou não`, `i:[chave,chave] j:[chave]`.
3. O gerador passa a emitir `sim`/`não` em vez de `sim`/`—`: travessão não se digita.
4. `normalize` compara número por valor quando os dois lados são número, e não por
   tipografia. `0,75` e `0,750` são a mesma resposta; tratá-los como divergência é erro do
   motor, não do aluno.

O item 4 é o que impede a classe inteira de falso negativo voltar em outra unidade.

---

## A2 — A tela do ciclo não tem saída: não existe anterior nem próximo

`CycleScreen` termina no botão VERIFICAR (`src/components/CycleScreen.tsx`, fim do bloco
principal). Depois do exercício não há nada. O aluno só sai pelo cabeçalho, voltando ao mapa
para escolher o próximo nó à mão — e os tracinhos de progresso do topo, que são a única pista
visual de sequência, não são links.

**Correção.** Par anterior/próximo no fim do ciclo, derivado da ordem de `unit.cycles`, com o
título do destino (não só a seta). Os tracinhos viram links para os ciclos que representam.

---

## A3 — O mapa ensina uma ordem de leitura quebrada

`UnitMap` agrupa por banda taxonômica. Lido na tela, o percurso é:

    c0 │ c1 c2 c3 c5 │ c7 │ c4 c6 c8

O aluno que segue o mapa chega ao **c5 antes do c4**. A primeira frase do c5 é *"Quando α
passa do limite, a tabela dobra e reinsere"* — e α é apresentado no c4, que na tela está dois
blocos abaixo. O ciclo de aprofundamento (`c7`) também aparece na trilha principal sem marca
de que é opcional.

O agrupamento por banda é bom: ele ensina contrato → implementação → custo, que é a espinha
da trilha. O problema é ele ser **também** o caminho. São duas informações diferentes ocupando
um widget só.

**Correção.** Manter as bandas como estão e acrescentar uma trilha de leitura numerada,
na ordem de `unit.cycles`, com o aprofundamento marcado como opcional. A banda continua
respondendo "onde isto vive na taxonomia"; a trilha responde "por onde eu vou agora".

---

## A4 — A didática do c5 pede o processo depois de entregar a conclusão

**Escopo de unidade. Não corrigido aqui — depende de decisão pedagógica.**

O `workedExample` do c5 usa 3, 7, 11, 4 e afirma em prosa: *"O rehash separa o 7 de 3 e 11,
mas mantém 3 e 11 juntos."* Não mostra a tabela, nem o estado intermediário. O exercício
seguinte pede 3, 7, 11, 4, **8** — a mesma sequência com um passo a mais — com 30 células em
branco e nenhuma linha resolvida.

O aluno é informado do resultado e depois cobrado do processo, sem nunca ter visto o processo.
Ou ele já sabia fazer o traço (e o exemplo foi ruído), ou não sabia (e o exemplo virou
resposta decorada).

Some-se a densidade: dois parágrafos por ciclo em que toda frase é uma afirmação carregada,
sem segunda passagem, sem contraexemplo, sem ponte com o ciclo anterior. É anotação de aula
para quem já sabe — funciona como referência e não como material de reconstrução, que é o
público declarado no `00-problema.md`.

**Proposta** — em `docs/specs/hash.md` antes de virar conteúdo:

- o exemplo trabalhado do c5 mostra **a tabela** dos quatro primeiros passos, no formato exato
  que o exercício pede, e o texto aponta o que observar em vez de entregar a conclusão;
- o exercício deixa de repetir a mesma sequência: outra `m`, outras chaves, mesmo mecanismo;
- cada ciclo abre retomando em uma frase o que o anterior deixou pendente. O c5 já tem essa
  ponte escrita no c3 ("ela é o motivo de o rehash precisar reinserir em vez de copiar") e não
  a cobra na abertura.

---

## Não corrigidos, registrados

- `hash.e1` declara um pseudocódigo **sem** a checagem de chave duplicada, enquanto o c5 e o
  gerador de referência a têm. Não diverge com a entrada atual (não há duplicata), mas são
  três versões do mesmo algoritmo no mesmo ciclo.
- A referência usa `h(k) = k`. É defensável, e não está registrado em lugar nenhum — o ciclo
  que apresenta a aposta de transformar chave em endereço nunca a executa com uma h real.

---

## A5 — Jargão e letras chegam antes do fenômeno que elas nomeiam

**Escopo de unidade e de método. Proposta em `2026-08-28-proposta-densidade.md`.**

O aluno do `00-problema.md` é um dev de dois anos reconstruindo base. O conteúdo atual
apresenta o nome antes da coisa: o c3 abre com *"Cada bucket guarda a lista dos pares que
colidiram ali"* — `bucket`, `par` e `colisão` na primeira frase, e o c4 abre definindo
`α = n/m` como razão entre duas letras que nada na tela explica.

Duas coisas distintas se somam aqui, e só a primeira está decidida no repo:

1. **Qual forma do termo vence** — decidido no ADR-0005: a canônica, a que o aluno encontra
   no mundo. Isso não está em questão e não deveria mudar.
2. **Quando o termo entra, e quanta notação cabe numa tela** — não está decidido em lugar
   nenhum. O teto de quatro termos por ciclo conta declaração, não introdução: um ciclo pode
   declarar dois termos e usar sete palavras técnicas no corpo sem violar nada.

E há um buraco objetivo por baixo dos dois: **as letras do pseudocódigo não tinham legenda**.
`(T.n + 1) / T.m > LIMITE` aparece na tela sem que nada diga o que são `T`, `n`, `m` ou `h`.
O glossário define `load factor` como "a razão n/m entre pares armazenados e número de
posições", mas o aluno lendo o código não tem esse texto à mão. Corrigido nesta passagem:
`Unit` ganhou `symbols`, a barra lateral do ciclo mostra "o que cada letra é", e as colunas
do traço passaram de `n`, `m`, `α` para "pares guardados (n)", "posições (m)", "carga (α)" —
o símbolo canônico continua lá, ancorado na palavra.
