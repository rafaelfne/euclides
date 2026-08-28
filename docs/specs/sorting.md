# Spec — Unidade 7: Ordenação e busca

**Status:** spec — não implementada
**Kind:** `structure`.

O ADR-0012 já resolveu a dúvida sobre esta unidade e vale repetir o argumento, porque ele
não é óbvio: **ordenação encaixa na espinha de estrutura.** O contrato não é um TAD de
coleção, é a especificação do problema — `ordenar(coleção)` — e as garantias que um
algoritmo pode ou não *também* oferecer moram exatamente onde a ordem mora no `Map`: na
lista do que o contrato não promete.

Estabilidade e uso de memória não são detalhes de implementação aqui. São `cannotAnswer`.

## Problema motivador

Uma lista de pedidos ordenada por data e depois reordenada por cliente. Os pedidos do mesmo
cliente saíram fora da ordem de data, e ninguém pediu isso. A ordenação por cliente
"funcionou" — e desfez o trabalho da anterior.

O que o aluno já tem: sabe chamar `sort`. O que ele não tem: saber que a função que ele
chamou não prometeu preservar a ordem anterior entre iguais, e que a linguagem ao lado
promete.

A pergunta que abre a unidade: **o que exatamente `ordenar` promete — e o que ele
deliberadamente não promete?**

## Contrato

`Ordenação` — devolve os mesmos elementos em ordem não decrescente.

| operação | garantia |
|---|---|
| `ordenar(coleção, comparar)` | uma permutação da entrada em que nenhum elemento vem antes de um menor |

**Responde:** "quais são os elementos, em ordem".

**Não responde** — e esta lista é a unidade inteira:

- **em que ordem ficam os iguais** (é estabilidade, e é o problema motivador)
- **quanta memória extra usa** (é in-place)
- **se aproveita ordem parcial já existente** (é adaptatividade)
- **quanto custa no pior caso**, que não é o mesmo que no caso médio

Cada ausência é uma garantia que *alguns* algoritmos oferecem de graça e outros não, e
escolher entre eles é escolher qual dessas você precisa.

## Implementações comparadas

**Merge sort** — divide ao meio, ordena as metades, intercala.
Invariante: ao intercalar, a saída já contém, em ordem, todos os elementos menores que os
dois da frente.
Custo: O(n log n) no pior caso, garantido. Espaço O(n).
Estável: sim, se a intercalação desempata pela esquerda — e é uma linha de código que
decide isso.
Errada quando: memória é o limite, ou n é pequeno.
Âncora: é a metade do Timsort, que é o `sort` do Python e do Java para objetos — e é por
isso que esses são estáveis.

**Quicksort** — particiona em torno de um pivô e recorre nas partes.
Invariante: depois de particionar, o pivô está na posição final e tudo à esquerda é menor.
Custo: O(n log n) no caso médio, **O(n²) no pior**. Espaço O(log n).
Estável: não.
Errada quando: o pior caso é inaceitável, ou a entrada é adversária — a mesma família de
`hash-flooding` da unidade 4, e vale nomear a ponte.
Âncora: é o `sort` de quase toda biblioteca para tipos primitivos, e a razão de ser
`unstable_sort` explicitamente em algumas.

**Insertion sort** — insere cada elemento na parte já ordenada.
Invariante: à esquerda de `i`, tudo já está ordenado entre si.
Custo: O(n²) no pior, **O(n) quando a entrada já está quase ordenada**.
Estável: sim. Espaço O(1).
Errada quando: n é grande e a entrada é aleatória.
Âncora: é a outra metade do Timsort, e o motivo de bibliotecas trocarem para ele abaixo de
umas dezenas de elementos.

**A DEFINIR** — três implementações ou duas? Três dão o triângulo completo (garantia contra
memória contra adaptatividade) e podem estourar a carga. Duas exigem escolher qual par, e
merge/quick é o par que ensina menos, porque as duas são O(n log n) no caso médio.

## Busca — a segunda metade da unidade

Busca binária cabe aqui e é o motivo de ordenar. **A DEFINIR:** ela é um ciclo desta
unidade ou uma implementação concorrente do contrato `contém`? A segunda leitura conflita
com a unidade 4, que já respondeu `contém` com hash.

Recomendo: um ciclo na banda `cost`, cujo movimento é "ordenar custa O(n log n) uma vez para
transformar toda busca futura em O(log n)" — que é a decisão real de engenharia, e liga esta
unidade à 3, à 4 e à 5 de uma vez.

## Ciclos (proposta)

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | contrato | O que `ordenar` promete e o que ele cala | ordenação, permutação |
| c1 | contrato | Estabilidade: a ausência que o problema motivador ativa | estabilidade |
| c2 | implementação | Merge sort e a intercalação | merge sort, intercalação |
| c3 | implementação | Quicksort, o pivô e o pior caso | quicksort, pivô, partição |
| c4 | implementação | Insertion sort e a entrada quase ordenada | insertion sort, adaptatividade |
| c5 | custo | Pior caso garantido contra caso médio bom | *(a definir)* |
| c6 | custo | Ordenar uma vez para buscar muitas | busca binária |
| c7 | custo | Quando ordenar é a escolha errada | *(a definir)* |

## Armadilhas conhecidas

- `sort-e-estavel` — supor que a ordem anterior entre iguais sobrevive. A do problema motivador
- `quicksort-e-n-log-n` — sem regime. Irmã direta de `o1-sem-qualificar`
- `in-place-e-sem-memoria` — supor que in-place significa espaço O(1) mesmo com recursão
- `comparador-inconsistente` — um `comparar` que não é transitivo, e o resultado que não é ordem
- `ordenar-para-achar-um` — ordenar tudo O(n log n) para responder uma pergunta que era O(n)

A última é a mais valiosa para o objetivo da trilha: é o erro mais comum em código gerado
por IA que um júnior aceita, porque a saída está certa.

**A DEFINIR** — sua leitura.

## Critério de domínio (proposta)

Diante de uma chamada de ordenação em código que nunca viu: dizer se a ordem entre iguais é
preservada e como saber; nomear o pior caso do algoritmo usado e construir a entrada que o
ativa; e decidir, para uma carga de trabalho dada, se vale ordenar uma vez ou buscar
linearmente sempre.

## Perguntas em aberto

1. **Duas ou três implementações.**
2. **Busca binária: ciclo desta unidade ou contrato próprio.**
3. **`quicksort-e-n-log-n` e `o1-sem-qualificar` são a mesma armadilha em estruturas
   diferentes.** O glossário tem `id` único por termo; o catálogo de armadilhas é por
   unidade. Duas armadilhas com o mesmo ensinamento em unidades diferentes é repetição útil
   ou dívida? A checagem `órfã` não tem opinião sobre isso.
4. **Esta unidade é a que mais depende da 2.** Sem regime e sem pior caso declarados, `c5`
   não existe. Confirma que a ordem 2 → 7 é dura, não sugerida.
