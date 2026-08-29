# ADR-0013: Nada que o aluno precise reproduzir fica sem declaração

**Status:** Proposto
**Data:** 2026-08-28
**Decisores:** Rafael Neves

> Rascunho escrito junto com a correção que ele descreve. O código foi portado para a
> linha principal; os itens de ação estão fechados. Status vira Aceito quando o Rafael
> decidir.

## Contexto

O nome do projeto é o método: nos *Elementos*, nada é assumido que não esteja declarado. A
folha de notação de pseudocódigo existe por isso, e o comentário no topo de
`src/content/conventions.ts` explica o custo de não tê-la, *"um aluno carregando um modelo
mental base 1 para uma referência base 0 diverge em todo passo e conclui que não entende
tabelas hash, quando o que ele encontrou foi uma convenção não declarada."*

Uma leitura da unidade de hash como aluno encontrou exatamente esse cenário, duas vezes, em
coisas que a folha de notação não cobria.

**Primeiro: as letras.** `(T.n + 1) / T.m > LIMITE` aparece na tela sem que nada diga o que
são `T`, `n`, `m` ou `h`. O glossário define load factor como "a razão n/m entre pares
armazenados e número de posições", texto que o aluno não tem à mão enquanto lê o código.
Para quem está reconstruindo base, cada letra não explicada é uma variável a mais para
segurar na memória de trabalho enquanto tenta seguir o raciocínio, e o raciocínio é a única
coisa que a trilha quer treinar.

**Segundo: o formato da resposta.** O gabarito do exercício de traço é computado, e era
comparado com igualdade exata de string. O gerador emitia `0,750`, `, ` e
`3:[3,11] 4:[4] 7:[7]`; nada na tela dizia isso. Quem escrevia `0,75`, ou deixava `rehash?`
em branco, divergia no passo 1. E como o passo 1 não tinha armadilha mapeada, a terceira
tentativa caía no ramo sem misconception e devolvia *"Vamos parar aqui. Releia a invariante e
volte a este exercício amanhã."*, o aluno era mandado embora por uma casa decimal, com uma
devolutiva que o mandava reconsiderar algo que ele tinha entendido.

O princípio 3 diz para apontar onde o raciocínio quebrou. O motor estava apontando onde a
digitação divergiu, e chamando isso de raciocínio.

## Decisão

Três mudanças, uma para cada camada do problema.

1. **`Unit` ganha `symbols`**, obrigatório: cada letra usada no pseudocódigo da unidade com o
   que ela significa, em palavras e sem outra letra dentro. A tela do ciclo mostra a legenda
   ao lado das convenções de notação.
2. **Cada coluna de exercício de traço ganha `placeholder`**, que declara o **formato e nunca
   o valor** (`0,000`, `sim ou não`, `0:[12,20] 5:[45]`), e `traceConventions` declara de uma
   vez como se escreve um traço, exibido acima da tabela, aberto por padrão.
3. **Número compara por valor, não por tipografia.** `sameCell` em `src/lib/socratic.ts`
   converte os dois lados quando ambos são número; `0,75` e `0,750` são a mesma resposta. O
   gerador passa a emitir `sim`/`não` no lugar do travessão, que não se digita.

A regra que generaliza as três, e que é o que precisa sobreviver ao caso do hash: **se o
aluno tem de reproduzir alguma coisa, a forma dessa coisa está declarada na tela onde ele a
reproduz.**

## Opções consideradas

### A, Deixar a convenção no enunciado de cada exercício
**Descartada.** Repete a mesma explicação em todo exercício de traço da trilha, e é
exatamente o lugar onde ela já podia estar e não estava. Convenção declarada uma vez, num
arquivo, é o padrão que o resto do projeto já usa.

### B, Normalizar agressivamente no motor e aceitar qualquer forma
**Descartada.** Resolveria a comparação e não o problema: o aluno continua sem saber o que
escrever, encara trinta campos vazios e adivinha. Além disso, normalização ampla esconde erro
real, `3:[3,7,11]` e `3:[3,11]` não podem virar a mesma resposta.

### C, Pré-preencher a primeira linha do traço como exemplo resolvido
**Descartada por ora.** Resolve o formato mostrando em vez de descrevendo, e é o andaime
clássico. Mas entrega um passo do gabarito, e o princípio 3 não tem exceção escrita para
"só o primeiro". Fica como pergunta para a revisão didática: o lugar do exemplo resolvido é o
`workedExample`, não o exercício.

### D, Declarar o formato e comparar número por valor
**Adotada.** O `placeholder` mostra a forma sem revelar nenhum valor do gabarito, e a
comparação numérica remove uma classe inteira de falso negativo em vez de um caso.

## Consequências

- **Fica mais fácil:** um exercício de traço em qualquer unidade futura herda a convenção
  declarada e a comparação por valor; o defeito não volta por esquecimento.
- **Fica mais difícil:** toda unidade nova precisa escrever `symbols`, o schema exige, e o
  build reprova sem. É atrito deliberado, do mesmo tipo que `wrongWhen` e `everydayAnchor`.
- **A observar:** `symbols` é por unidade, mas algumas letras são da trilha inteira (`n` como
  tamanho da entrada). Se a repetição incomodar em três unidades, promover as comuns para um
  registro compartilhado, não antes, para não inventar abstração sobre um caso.
- **Não coberto por checagem:** que a explicação de cada símbolo esteja em palavras e não em
  outra letra. É julgamento, e o lugar dele é o `/audit-unit`.

## Itens de ação

1. [x] `symbols` no schema, preenchido na unidade de hash, renderizado na barra lateral
2. [x] `placeholder` por coluna, `traceConventions`, bloco "Como preencher"
3. [x] `sameCell` comparando número por valor, com asserção em `scripts/test-reference.ts`
4. [x] `guia-de-unidade.md`, `content-author.md` e `exercise-designer.md` citando os campos novos
5. [x] Checagem `formato`: toda coluna editável declara `placeholder`, **e** o placeholder
   não pode ser um valor que o gerador emite, declarar o formato e entregar um passo do
   gabarito são coisas diferentes, e a primeira versão do `alpha` fazia a segunda
