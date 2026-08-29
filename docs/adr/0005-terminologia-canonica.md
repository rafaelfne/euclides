# ADR-0005: A forma canônica é a que o aluno encontra no mundo

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

O primeiro rascunho da unidade de hash foi auditado: nove conceitos, **quatro políticas
diferentes de idioma**, nenhuma regra. "Balde" e "sondagem" em português, "tombstone" e
"hash flooding" em inglês, e "encadeamento" e "chaining" no mesmo documento. Isso não é
bilinguismo, é ausência de decisão, e confunde mais que qualquer das duas opções puras.

## Decisão

Critério único: **a forma que o aluno vai ler em documentação, código-fonte e posts.** O
glossário fixa cada caso uma vez e o build recusa a variante.

## Opções consideradas

| Opção | Prós | Contras |
|---|---|---|
| **A, o que ele encontra no mundo** (adotada) | Transferência máxima: o objetivo é autonomia, e terminologia que não transfere sabota o objetivo | Produz tabela mista, que parece arbitrária até você ver a regra |
| B, português canônico sempre | Menor carga na primeira exposição, texto mais fluido | Ele traduz sozinho toda vez que sai do curso, e sair do curso é o objetivo |
| C, inglês canônico sempre | Coerente com o código | Texto duro e pedante onde "pilha" é natural |
| D, toggle PT/EN na interface | Resolve pelo lado do usuário | Dobra o custo de autoria e ensina que os dois são intercambiáveis, o que faz o termo grudar menos |

## Análise de trade-off

A regra produziu 10 termos em inglês e 7 em português, e o corte caiu numa linha limpa
sem precisar de exceção: conceitos gerais e antigos mantiveram a tradução porque ela pegou
de verdade (*pilha*, *colisão*, *invariante*, *amortizado*); termos de arte de
implementação ficaram em inglês porque a tradução nunca pegou (*bucket*, *chaining*,
*probing*, *load factor*, *tombstone*).

Ninguém diz "balde" numa code review. Esse é o teste.

## Consequências

- **Fica mais fácil:** o aluno reconhece o termo quando abre o código do `HashMap`.
- **Fica mais difícil:** cada termo novo exige uma decisão consciente e uma entrada de
  glossário com `isNot`, falsos amigos e ponto de introdução.
- **Regra derivada:** palavras sobrecarregadas, `heap`, `stack`, `hash`, `list`, `array`
, precisam de `falseFriends` preenchido. `heap` é o pior caso da área: uma estrutura de
  dados e uma região de memória, sem relação nenhuma.

## Itens de ação

1. [x] Glossário com `isNot` obrigatório
2. [x] Checagem de vocabulário no validador
3. [x] Cards de desambiguação inline: `TermCard`, com definição, `isNot` e falsos amigos
