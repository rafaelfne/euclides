# Specs do primeiro módulo

O escopo está em `docs/discovery/00-problema.md`, numa linha. Aqui ele está aberto em oito
specs, e as oito unidades estão implementadas e registradas.

| # | spec | kind | status |
|---|---|---|---|
| 1 | [tracing](tracing.md), Lógica e execution trace | `method` | implementada |
| 2 | [asymptotics](asymptotics.md), Análise assintótica | `method` | implementada |
| 3 | [linear](linear.md), Estruturas lineares | `structure` | implementada |
| 4 | [hash](hash.md), Tabelas hash | `structure` | implementada |
| 5 | [trees](trees.md), Árvores de busca | `structure` | implementada |
| 6 | [graphs](graphs.md), Grafos | `structure` | implementada |
| 7 | [sorting](sorting.md), Ordenação e busca | `structure` | implementada |
| 8 | [synthesis](synthesis.md), Síntese | `method` | implementada |

Todas implementadas. As três decisões que travavam a escrita foram tomadas na
implementação, sem validação prévia, sob autorização explícita, e estão registradas abaixo
junto com o que cada uma custou.

## As três decisões, e como foram resolvidas

**1. Um contrato por unidade, resolvido por caminhos diferentes nas duas unidades.**

Em `linear`, saída A: o contrato é `Lista`, e pilha e fila entram como **restrições** dela,
na banda `contract`. Elas não são implementações da lista, e pôr as duas ali teria exigido
`elaborates` apontando uma implementação, o que seria falso. `stack` saiu de `planned` e
nasce em `linear.c1`.

Em `trees`, saída B: o contrato é `SortedMap`, e **heap saiu do primeiro módulo**. Um heap
não é uma árvore de busca restrita, e inventar um supercontrato que cobrisse os dois violaria
o ADR-0005, ninguém encontra esse termo no mundo. `heap` continua `planned`, agora apontando
`heaps.c0`, e a checagem de glossário reprova no dia em que esse ciclo existir sem que o termo
tenha sido promovido. A unidade mudou de nome para **Árvores de busca**, que é o que ela é.

**2. Algoritmos escritos *sobre* um contrato ficam na banda `cost`.** Em grafos, busca em
largura e em profundidade não são operações do TAD nem implementações dele. Foram para a
banda de consequência, e o argumento é este: o percurso é justamente onde o custo da
representação escolhida aparece, O(V+E) sobre lista de adjacência, O(V²) sobre matriz.

A decisão funciona e deixa um desconforto honesto: a banda `cost` da unidade de grafos tem
quatro ciclos e carrega o conteúdo central dela, enquanto nas outras unidades ela carrega o
fechamento. Se isso incomodar numa segunda unidade com o mesmo formato, é sinal de que falta
uma banda, e aí é ADR.

**3. `kind: 'method'` coube na síntese, com uma parte esticada.** O critério é a
justificativa de escolha, com quatro partes, e `whenOmitted` gerou as armadilhas como nas
outras unidades de método. A parte que estica é `custo nas candidatas`: ela não é uma
afirmação, é uma comparação, duas afirmações mais uma relação. O modelo aceitou; a leitura
fica registrada aqui porque o ADR-0012 mandou observar exatamente isso.

## O que muda em quem já está escrito

A unidade 4 foi escrita primeiro de propósito e depende das unidades 1 e 2. Três termos, 
`pior caso`, `caso médio`, `amortizado`, estão no glossário com `introducedIn` apontando
ciclos de hash, e passam a nascer na unidade 2. Trocar os valores é mecânico e a checagem
`glossário` reprova até que os dois lados concordem; decidir que hash passa a *usar* termo
introduzido depois dela é editorial.

## O aviso que continua valendo, agora sobre conteúdo implementado

Os catálogos de armadilhas das oito unidades **foram escritos a partir de erros que aparecem
em livro e em fórum, e ninguém observou uma pessoa usando este app e errando**. O ADR-0002
diz que correção socrática é antecipação em tempo de autoria: ela vale pelo que alguém já viu
outra pessoa errar.

O gate não sabe a diferença. A checagem `órfã` confere que toda armadilha é exercitada por
algum exercício; ela não confere que alguém comete a armadilha. Uma que ninguém comete passa
em todas as checagens ocupando um exercício sem medir nada, e é o único modo de
falha que este projeto foi construído inteiro para impedir.

É a primeira coisa a revisar, unidade por unidade, e provavelmente a única que não pode ser
delegada.
