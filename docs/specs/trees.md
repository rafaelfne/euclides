# Spec, Unidade 5: Árvores

**Status:** spec, não implementada, **e depende da mesma decisão de `docs/specs/linear.md`**
**Kind:** `structure`.

## O conflito, primeiro, é o mesmo, e aqui ele é pior

O glossário planeja `heap` com `plannedIn: 'trees.c4'`. Mas heap e árvore de busca
implementam **contratos diferentes**, não o mesmo contrato de dois jeitos:

- BST balanceada implementa `SortedMap`, chave→valor, com ordem: mínimo, faixa, sucessor.
- Heap implementa `PriorityQueue`, insere e tira o menor. Não tem busca por chave, não tem
  faixa, não tem ordem total acessível.

Em `linear` a saída A funciona porque pilha e fila são genuinamente restrições da lista.
Aqui não há esse recurso: um heap **não** é uma BST restrita. Colocar os dois sob um
contrato só exigiria inventar um supercontrato que nenhum livro usa e que o aluno nunca vai
encontrar, o que a regra de terminologia canônica (ADR-0005) proíbe diretamente.

Saídas:

**A, Duas unidades.** `trees` com contrato `SortedMap` (BST, AVL/rubro-negra, B-tree) e
`heaps` com contrato `PriorityQueue`. O currículo passa de oito para nove unidades.

**B, `trees` só com `SortedMap`; heap sai do escopo do primeiro módulo.** O termo `heap`
continua no glossário como `planned`, apontando uma unidade futura. O `plannedIn` muda de
`trees.c4` para o id novo.

**C, O schema passa a aceitar mais de um contrato por unidade.** Resolve os dois casos
(este e `linear`) de uma vez, e é mudança na espinha do ADR-0003. Precisa de ADR próprio.

**Recomendo B para o primeiro módulo e C como decisão consciente para depois.** Heap é a
estrutura mais fácil de cortar sem prejudicar o objetivo declarado, quase nenhum código
gerado por IA que um júnior revisa depende de heap, e quase todo depende de índice
ordenado.

O resto deste spec assume que o contrato é `SortedMap`.

## Problema motivador

Um relatório que lista "os pedidos entre 1º e 15 de março, em ordem de data". A tabela tem
um índice, e o `EXPLAIN` diz que ele não foi usado, o índice é hash.

O que o aluno já tem, vindo da unidade 4: tabela hash responde `=` e nada mais, e a lista de
ausências do `Map` é exatamente essa. O que ele não tem: a estrutura que responde faixa, e
por que ela paga O(log n) na busca por chave que a hash fazia em O(1).

A pergunta que abre a unidade: **o que precisa ser verdade para responder "todos entre A e
B" sem varrer tudo?**

## Contrato

`SortedMap`, associa chave a valor **e preserva ordem de chave**.

| operação | garantia |
|---|---|
| `inserir(chave, valor)` | associa; substitui se a chave existir |
| `obter(chave)` | o valor, ou `NÃO_ENCONTRADO` |
| `remover(chave)` | descarta o par, se existir |
| `minimo()` | a menor chave |
| `faixa(a, b)` | os pares com chave entre a e b, em ordem |

**Responde:** tudo que `Map` responde, mais ordem.

**Não responde**, a resposta do último ciclo: qual o k-ésimo elemento sem varrer;
quantas chaves existem numa faixa sem enumerá-las; nada sobre valores, só sobre chaves.
E não responde `obter` em O(1), o preço da ordem.

## Implementações comparadas

**BST sem balanceamento**, cada nó tem chave, e tudo à esquerda é menor.
Invariante: para todo nó, toda chave da subárvore esquerda é menor que a dele, e toda da
direita é maior.
Chave igual não desce para lado nenhum: o contrato substitui o valor, e a invariante fica
estrita.
Custo: O(h), e **h não é log n por garantia nenhuma**.
Errada quando: as chaves chegam em ordem, a árvore vira lista e tudo vira O(n). Use uma
balanceada.
Âncora: é o motivo de nenhum banco usar BST simples em índice, e o exemplo mais direto de
"caso médio e pior caso são coisas diferentes" fora da unidade 2.

**Árvore balanceada (AVL ou rubro-negra)**, mantém a altura em O(log n) por rotação.
Invariante: **A DEFINIR**, a da AVL (diferença de altura ≤ 1) é mais fácil de enunciar e
de traçar; a da rubro-negra é a que está implementada em quase todo lugar real.
Custo: O(log n) garantido nas quatro operações.
Errada quando: a estrutura mora em disco, cada nó é um acesso. Use B-tree.
Âncora: é o `TreeMap` do Java e o `std::map` do C++.

**A DEFINIR**, B-tree entra como terceira implementação ou como âncora da segunda? Ela é
a que o aluno de fato encontra (todo índice de banco), e é a única cujo motivo, altura
menor porque o nó é grande, só faz sentido com o custo de acesso a disco declarado.

## Ciclos (proposta)

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | contrato | O que a ordem custa, e o que ela compra | SortedMap, ordem de chave |
| c1 | implementação | A invariante de busca binária numa árvore | árvore de busca, nó, subárvore |
| c2 | implementação | Altura não é log n | altura, degeneração |
| c3 | implementação | Balancear: rotação | rotação, balanceamento |
| c4 | custo | O(log n) garantido contra O(1) esperado | *(a definir)*; a garantia é só da balanceada |
| c5 | implementação *(aprofundamento)* | B-tree e o custo do acesso a disco | B-tree |
| c6 | custo | Quando a árvore é a escolha errada | *(a definir)* |

## Armadilhas conhecidas

- `bst-e-log-n`, supor O(log n) sem balanceamento. É a irmã de `o1-sem-qualificar`
- `altura-e-profundidade`, os dois termos, trocados; ambos precisam de `isNot`
- `arvore-ordena-valores`, a ordem é de chave, e o aluno espera que valha para o valor
- `rotacao-muda-ordem`, supor que rotacionar reordena as chaves
- `travessia-errada`, usar pré-ordem esperando saída ordenada
- `arvore-substitui-hash`, escolher entre tabela hash e árvore sem listar as consultas. O
  chamado da unidade é a metade em que a hash foi escolhida e a consulta pedia faixa; o
  último ciclo é a outra metade

`bst-e-log-n` é a mais valiosa: o aluno constrói a entrada ordenada, vê a árvore virar
lista, e a lição transfere direto para "hash é O(1)", o mesmo qualificador ausente, outra
estrutura.

**A DEFINIR**, sua leitura.

## Critério de domínio (proposta)

Diante de uma implementação de árvore de busca que nunca viu: dizer se ela balanceia, e
como; construir a sequência de inserções que a degrada; e dizer qual consulta do problema
motivador ela responde que a tabela hash não responde.

## Perguntas em aberto

1. **A saída A, B ou C.** Trave junto com `docs/specs/linear.md`, é a mesma decisão.
2. **Qual árvore balanceada.** AVL é traçável à mão; rubro-negra é a que existe no mundo. A
   regra de terminologia canônica empurra para rubro-negra, e a carga cognitiva empurra para
   AVL. É o conflito mais direto entre dois princípios do projeto que apareceu até aqui.
3. **Travessias entram?** Pré/in/pós-ordem é conteúdo clássico e pode ser conteúdo morto
   aqui: nenhuma delas serve ao objetivo de julgar código, exceto in-ordem, que serve muito.
4. **`heap` fica `planned` apontando o quê?** Se for a saída B, o `plannedIn` precisa de um
   id de unidade que ainda não existe, e a checagem `glossário` exige que ele não resolva.
