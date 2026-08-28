# Spec — Unidade 2: Análise assintótica

**Status:** spec — não implementada
**Kind:** `method` (ADR-0012).

> Existe um esboço desta unidade em `scripts/test-schema.ts`, escrito para provar que a
> espinha de método passa no gate. **Ele não é este spec e não é conteúdo** — é uma fixture
> com o mínimo de campos para o `checkAll` rodar. Use-o como referência de forma, nunca de
> escopo.

## Problema motivador

Uma consulta que respondia em 40 ms com dez mil registros passou a responder em 4 s com um
milhão. Ninguém mudou o código. A pergunta na retrospectiva é "por que ninguém viu isso
vindo?" — e a resposta é que o custo estava escrito no código o tempo todo, em forma que
ninguém leu.

O que o aluno já tem: sabe dizer "isso é O(n²)" quando vê dois laços aninhados. O que ele
não tem: dizer *sob quais hipóteses*, *em que regime*, e *o que n conta*. E é a ausência
dos três que faz "hash é O(1)" passar numa revisão.

A pergunta que abre a unidade: **o que uma afirmação de custo precisa declarar para ser
verificável?**

## Critério — o julgamento que a unidade ensina a produzir

`Afirmação de custo` — a mesma estrutura que `CostClaim` já obriga em
`src/content/schema.ts`. A unidade ensina a produzir o que o schema do projeto já exige.

| parte | o que ela afirma |
|---|---|
| limite | a classe assintótica |
| regime | pior caso, caso médio ou melhor caso |
| amortização | custo por operação, ou espalhado ao longo da sequência |
| hipóteses | o que precisa ser verdade para o limite valer |
| unidade de medida | o que n conta — e o que ele ignora |

**Quando cada parte é omitida:**

- sem **regime**: "hash é O(1)"
- sem **hipóteses**: "hash é O(1)" de novo, agora por outro motivo — some a distribuição uniforme
- sem **amortização**: "inserir num array dinâmico é O(1)", que é falso para a inserção que redimensiona
- sem **unidade de medida**: "comparar duas strings é O(1)"

Esta lista é o catálogo de armadilhas da unidade. É o argumento inteiro do ADR-0012 sobre
`whenOmitted` ser gerador, e esta é a unidade onde ele nasce.

## Técnicas comparadas

**Contagem de operações** — somar o que cada laço executa em função do tamanho da entrada.
Produz: limite, regime, unidade de medida.
Invariante: a soma só vale se toda operação somada custar o mesmo.
Errada quando: o procedimento chama a si mesmo e o número de níveis depende da entrada.
Âncora: é o que se faz de cabeça ao ler dois laços aninhados numa revisão.

**Recorrência** — escrever o custo em função do custo do subproblema e resolver a relação.
Produz: as cinco partes.
Invariante: a relação precisa de caso base, ou não descreve procedimento que pare.
Errada quando: o procedimento é um laço simples. Contar responde em uma linha.
Âncora: é o raciocínio por trás de "dividir ao meio dá log n", que todo mundo repete e
quase ninguém deriva.

**A DEFINIR** — entra uma terceira, análise amortizada por método de agregação? Ela é a
única que produz a parte `amortização` de forma direta, e sem ela a parte fica derivada de
recorrência, que é indireto. Mas é a técnica mais abstrata das três, na unidade 2.

## Ciclos (proposta)

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | critério | A afirmação que passa na revisão e não vale | notação O, afirmação de custo |
| c1 | técnica | Contar o que o laço executa | *(a definir)* |
| c2 | critério | O que n conta, e o que ele ignora | unidade de medida |
| c3 | técnica | Quando a conta não fecha: recorrência | recorrência, caso base |
| c4 | falha | Regime: o pior caso não é o caso ruim | pior caso, caso médio |
| c5 | falha | Amortizado não é caso médio | amortizado |

**Nota sobre c5:** confundir amortizado com caso médio é a armadilha mais valiosa da
unidade e provavelmente merece o ciclo inteiro. São qualificadores independentes — um fala
de distribuição de entradas, o outro de distribuição de custo ao longo de uma sequência —
e a confusão sobrevive a uma graduação.

**Conflito a resolver:** os termos `pior caso`, `caso médio` e `amortizado` já estão no
glossário com `introducedIn: 'hash.c5'` e `'hash.c6'`. Se esta unidade é a 2 e hash é a 4,
os pontos de introdução mudam de dono — e a checagem `glossário` vai reprovar até que
mudem nos dois lados. É trabalho mecânico, mas precisa ser decidido: hash passa a *usar*
termos introduzidos aqui.

## Armadilhas conhecidas

Derivadas de `whenOmitted`, uma por parte, mais as clássicas:

- `sem-regime` · `sem-hipoteses` · `sem-amortizacao` · `sem-unidade`
- `amortizado-e-caso-medio` — os dois qualificadores confundidos
- `constante-nao-importa` — "O ignora constante" aplicado a n = 40
- `pior-caso-e-o-caso-ruim` — supor que o pior caso é raro por definição

**A DEFINIR** — sua leitura de quais o aluno erra. Ver a mesma nota no spec de `tracing`.

## Critério de domínio (proposta)

Diante de um trecho de até trinta linhas: escrever a afirmação de custo com as cinco partes
declaradas, e construir a entrada concreta que faz o regime declarado importar.

## Perguntas em aberto

1. **Ordem contra hash.** Esta unidade é pré-requisito declarado da unidade de hash — os
   `prerequisites` dela citam "notação O, e a distinção entre caso médio, pior caso e custo
   amortizado". Hash foi escrita primeiro, de propósito. Reordenar os `introducedIn` é
   mecânico; decidir se hash passa a *depender* de conteúdo escrito depois dela é editorial.
2. **A unidade ensina a produzir o que o schema exige.** Isso é elegante e pode ser
   circular: o aluno vê `CostClaim` nas outras unidades antes de aprender a produzi-la.
   Vantagem pedagógica ou dívida?
3. **Quantas classes de complexidade entram?** O enum `complexity` em
   `src/content/schema.ts` tem dez. Todas, ou um subconjunto?
