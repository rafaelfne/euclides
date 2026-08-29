# Spec, Unidade 7: Ordenação e busca

**Status:** implementada
**Kind:** `structure`.

O ADR-0012 já resolveu a dúvida sobre esta unidade e vale repetir o argumento, porque ele
não é óbvio: **ordenação encaixa na espinha de estrutura.** O contrato não é um TAD de
coleção, é a especificação do problema, `ordenar(coleção)`, e as garantias que um
algoritmo pode ou não *também* oferecer moram exatamente onde a ordem mora no `Map`: na
lista do que o contrato não promete.

Estabilidade e uso de memória não são detalhes de implementação aqui. São `cannotAnswer`.

## Problema motivador

Uma lista de pedidos ordenada por data e depois reordenada por cliente. Os pedidos do mesmo
cliente saíram fora da ordem de data, e ninguém pediu isso. A ordenação por cliente
"funcionou", e desfez o trabalho da anterior.

O que o aluno já tem: sabe chamar `sort`. O que ele não tem: saber que a função que ele
chamou não prometeu preservar a ordem anterior entre iguais, e que a linguagem ao lado
promete.

A pergunta que abre a unidade: **o que exatamente `ordenar` promete, e o que ele
deliberadamente não promete?**

## Contrato

`Ordenação`, devolve os mesmos elementos em ordem não decrescente.

| operação | garantia |
|---|---|
| `ordenar(coleção, comparar)` | uma permutação da entrada em que nenhum elemento vem antes de um menor |

**Responde:** "quais são os elementos, em ordem".

**Não responde**, e esta lista é a unidade inteira:

- **em que ordem ficam os iguais** (é estabilidade, e é o problema motivador)
- **quanta memória extra usa** (é in-place)
- **se aproveita ordem parcial já existente** (é adaptatividade)
- **quanto custa no pior caso**, que não é o mesmo que no caso médio

Cada ausência é uma garantia que *alguns* algoritmos oferecem de graça e outros não, e
escolher entre eles é escolher qual dessas você precisa.

## Implementações comparadas

**Merge sort**, divide ao meio, ordena as metades, intercala.
Invariante: ao intercalar, a saída já contém, em ordem, todos os elementos menores que os
dois da frente.
Custo: O(n log n) no pior caso, garantido. Espaço O(n).
Estável: sim, se a intercalação desempata pela esquerda, e é uma linha de código que
decide isso.
Errada quando: memória é o limite, ou n é pequeno.
Âncora: é a metade do Timsort, que é o `sort` do Python e do Java para objetos, e é por
isso que esses são estáveis.

**Quicksort**, particiona em torno de um pivô e recorre nas partes.
Invariante: depois de particionar, o pivô está na posição final e tudo à esquerda é menor.
Custo: O(n log n) no caso médio, **O(n²) no pior**. Espaço O(log n).
Estável: não.
Errada quando: o pior caso é inaceitável, ou a entrada é adversária, a mesma família de
`hash-flooding` da unidade 4, e vale nomear a ponte.
Âncora: é o `sort` de quase toda biblioteca para tipos primitivos, e a razão de ser
`unstable_sort` explicitamente em algumas.

**Insertion sort**, insere cada elemento na parte já ordenada.
Invariante: à esquerda de `i`, tudo já está ordenado entre si.
Custo: O(n²) no pior, **O(n) quando a entrada já está quase ordenada**.
Estável: sim. Espaço O(1).
Errada quando: n é grande e a entrada é aleatória.
Âncora: é a outra metade do Timsort, e o motivo de bibliotecas trocarem para ele abaixo de
umas dezenas de elementos.

As três entraram: o par merge/quick sozinho ensina menos, porque os dois são O(n log n) no
caso médio e o trade-off some. Insertion sort é o que traz adaptatividade e espaço O(1).

## Busca

Busca binária entrou como ciclo na banda `cost`, não como contrato próprio. O movimento é
"ordenar custa n log n uma vez para tornar toda busca seguinte log n", decisão de
engenharia, não operação nova. Tratá-la como contrato conflitaria com a unidade 4, que já
respondeu `contém`.

## Ciclos, como implementados

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | contrato | O que ordenar promete, e o que ele cala | ordenação, permutação |
| c1 | contrato | Estabilidade: a ausência que reordena o que ninguém pediu | estabilidade, comparador |
| c2 | implementação · insertion-sort | Insertion sort e a parte que já está pronta | insertion sort, adaptatividade |
| c3 | implementação · merge-sort | Merge sort e a intercalação | merge sort, intercalação |
| c4 | implementação · quicksort | Quicksort, o pivô e o pior caso | quicksort, pivô, partição |
| c5 | custo | O preço que o contrato não menciona | in-place |
| c6 | custo | Ordenar uma vez para buscar muitas | busca binária |
| c7 | custo | Quando ordenar é a escolha errada |, |
| c8 | implementação *(aprofundamento)* · merge-sort | O que as bibliotecas realmente fazem | Timsort |

Insertion sort veio antes de merge sort de propósito: ele é o único traçável à mão sem
recursão, e o `c8` volta a ele para mostrar que a biblioteca usa os dois juntos.

## Armadilhas conhecidas

- `sort-e-estavel`, supor que a ordem anterior entre iguais sobrevive. A do problema motivador
- `quicksort-e-n-log-n`, sem regime. Irmã direta de `o1-sem-qualificar`
- `in-place-e-sem-memoria`, supor que in-place significa espaço O(1) mesmo com recursão
- `comparador-inconsistente`, um `comparar` que não é transitivo, e o resultado que não é ordem
- `ordenar-para-achar-um`, ordenar tudo O(n log n) para responder uma pergunta que era O(n)
- `adaptativo-e-caso-medio`, a propriedade de uma entrada concreta lida como distribuição
- `estabilidade-custa`, supor que preservar a ordem entre iguais tem preço assintótico

`ordenar-para-achar-um` é a mais valiosa para o objetivo da trilha: é o erro mais comum em
código gerado por IA que um júnior aceita, porque a saída está certa.

A que mais rende exercício é `sort-e-estavel`, e o motivo é o mesmo de
`rehash-copia-buckets` na unidade 4: **o defeito é parcial.** No traço de `sorting.e3`, quem
inverte o desempate produz uma saída ordenada, só a letra denuncia. É por isso que ele
sobrevive a um teste que compara apenas as chaves.

## Critério de domínio

Diante de uma chamada de ordenação em código que nunca viu: dizer se a ordem entre iguais é
preservada e como saber; nomear o pior caso do algoritmo usado e construir a entrada que o
ativa; e decidir, para uma carga de trabalho dada, se vale ordenar uma vez ou buscar
linearmente sempre.

Operacionalmente: `sorting.e3` e `sorting.e7` resolvidos **sem ativar nenhuma armadilha**,
numa revisita feita ao menos sete dias depois.

## Decidido na implementação, sem validação prévia

- **`estabilidade-custa` no lugar de `estavel-e-mais-lento`.** O id proposto continha uma
  expressão da lista de abstrações vagas, e o eixo estava implícito. O que a armadilha
  ataca é a suposição de custo assintótico, e o id passou a dizer isso.
- **Timsort virou o ciclo de aprofundamento**, elaborando merge sort. É a melhor âncora
  cotidiana da unidade: é literalmente o `sort` que o aluno chama todo dia.

## Perguntas em aberto

1. **O catálogo de armadilhas ainda é candidato, não observação.** As sete foram escritas a
   partir do que é atestado na área e verificável contra fato, se o `sort` da linguagem é
   estável, se o comparador booleano quebra, não a partir de leitura do aluno. É o que
   `docs/specs/README.md` avisa sobre todos estes specs, e vale para esta unidade mesmo
   implementada.
2. **`quicksort-e-n-log-n` e `o1-sem-qualificar` são a mesma armadilha em estruturas
   diferentes.** O glossário tem `id` único por termo; o catálogo de armadilhas é por
   unidade. Duas armadilhas com o mesmo ensinamento em unidades diferentes é repetição útil
   ou dívida? A checagem `órfã` não tem opinião sobre isso.
3. **Esta unidade é a que mais depende da 2.** Sem regime e sem pior caso declarados, `c5`
   não existe. Confirma que a ordem 2 → 7 é dura, não sugerida.
