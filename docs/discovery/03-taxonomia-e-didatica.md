# Taxonomia, terminologia e carga cognitiva

## O diagnóstico

Cinco famílias de confusão, em ordem de gravidade:

**F1 — A palavra que é quatro coisas.** *Hash* é a função, o valor produzido, a estrutura e
uma família criptográfica com outro propósito. *Heap* é uma estrutura de dados **e** a
região de alocação dinâmica — a pior colisão de nomes da área. *Stack* é contrato, região
de memória e conjunto de tecnologias.

**F2 — Contrato confundido com implementação.** A mais estrutural. Pilha é contrato; array
é implementação; O(1) é consequência da implementação, nunca do contrato. Sem essa
separação, "qual estrutura usar?" é pergunta mal formada — e é o objetivo (b) da trilha.

**F3 — O com qualificadores omitidos.** "Hash é O(1)" omite quatro: regime (médio),
hipótese (hashing uniforme), amortização (rehash) e o que `n` mede (ignora hashear a
chave). Três eixos ortogonais colapsados num símbolo de três caracteres.

**F4 — Falsos amigos entre linguagens.** `list` do Python é array dinâmico — acesso O(1),
inserção no início O(n), o oposto do que o nome sugere. `List` do Java é interface e o tipo
declarado não revela custo. Um curso agnóstico que não enfrenta isso é omisso, não neutro.

**F5 — PT/EN sem regra.** Medido no primeiro rascunho desta trilha: nove conceitos, quatro
políticas diferentes, e "encadeamento" e "chaining" no mesmo documento.

## Os consertos, todos mecanizados

### A espinha taxonômica
`AbstractDataType` não tem campo de custo — é impossível escrever complexidade num
contrato. `Implementation` tem `cost`, `wrongWhen`, `everydayAnchor` e `invariant`
obrigatórios. Toda unidade abre pelo contrato e depois compara implementações concorrentes;
o trade-off vive na diferença entre elas.

### `CostClaim` no lugar da string
Não é possível escrever `'O(1)'`. O tipo exige `regime`, `amortized`, `assumptions` e
`measuredIn`. F3 deixa de depender da disciplina de quem escreve.

### Glossário com espaço negativo
Cada termo declara `isNot` e `falseFriends`. `heap` explica que a região de memória não tem
relação com a estrutura; `list` explica o `list` do Python. Vira card inline no app.

### Regra de terminologia
Critério único: **a forma que o aluno vai encontrar em documentação, código e posts.**
O glossário fixa cada caso uma vez; o build recusa a variante. Resultado: 17 termos, 10 em
inglês e 7 em português — e o corte não é arbitrário. Conceitos gerais e antigos mantiveram
a tradução porque ela pegou (*pilha*, *colisão*, *invariante*, *amortizado*); termos de arte
de implementação ficaram em inglês porque a tradução nunca pegou (*bucket*, *chaining*,
*probing*, *load factor*, *tombstone*). Ninguém diz "balde" numa code review.

### Fronteira de idioma, declarada
| Camada | Idioma | Exemplo |
|---|---|---|
| Código da aplicação | inglês | `ExecutionTrace`, `misconceptionsTriggered` |
| Conteúdo autorado | pt-BR | enunciados, prosa, rubricas |
| Pseudocódigo | pt-BR | `inserir(tabela, chave, valor)` |
| Código do sandbox | inglês | `insert(table, key, value)` |

A travessia entre as duas últimas linhas é ela mesma um momento de ensino: a mesma
operação, um nome para pensar e outro para entregar.

### Convenções de pseudocódigo
`←` para atribuição, `=` para comparação, `mod` e não `%`, `|A|` para tamanho, blocos por
indentação, `NULO`, e — a mais importante — **base 0 declarada explicitamente**. Um aluno
carregando modelo mental base 1 contra uma referência base 0 diverge em todo passo e conclui
que não entende tabelas hash, quando o que ele encontrou foi uma convenção não declarada.
Validado no build por lista de padrões proibidos.

### Densidade em quatro camadas
1. **Teto rígido**: máximo 4 termos novos por ciclo, validado no build
2. **Exemplo trabalhado** abrindo todo ciclo de primeira exposição
3. **Camadas**: `essential` e `deep-dive` — o aluno escolhe descer
4. **Pré-teste diagnóstico** roteando a entrada da unidade

## A unidade de hash refatiada

Os 24 termos viraram 9 ciclos, ordenados pela espinha contrato → implementação → custo:

| ciclo | camada | novos | título |
|---|---|---|---|
| c0 | essential | 3 | O contrato, antes da estrutura |
| c1 | essential | 3 | A aposta: transformar chave em endereço |
| c2 | essential | 2 | Colisão é matemática, não defeito |
| c3 | essential | 3 | Chaining e a invariante de posição |
| c4 | essential | 2 | Load factor |
| c5 | essential | 2 | Rehash e o custo amortizado |
| c6 | essential | 2 | O custo, com todos os qualificadores |
| c7 | **deep-dive** | 4 | Open addressing e a deleção que apaga demais |
| c8 | essential | 1 | Quando a tabela hash é a escolha errada |

**C0 é a mudança mais importante.** A unidade agora abre sem mencionar hash: primeiro o
contrato Map, quais operações promete e — sobretudo — o que ele *não* promete. Ordem não
está no contrato. Só depois entra a implementação. Isso faz C8 ("quando é a escolha errada")
deixar de ser uma lista decorada e virar consequência: tudo que o Map não promete é onde
esta estrutura falha.
