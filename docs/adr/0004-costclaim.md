# ADR-0004: Complexidade é `CostClaim`, nunca string

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

"Hash é O(1)" omite quatro qualificadores: o regime (caso médio), a hipótese (hashing
uniforme), a amortização (vinda do rehash) e o que `n` mede (ignora o custo de hashear a
própria chave). Quatro omissões num símbolo de três caracteres.

Três eixos ortogonais, pior/médio, amortizado/por-operação, determinístico/esperado, 
são rotineiramente colapsados num só. Esta é a fonte número um de falsa confiança na
área, e o princípio 4 existe por causa dela.

## Decisão

Complexidade não pode ser escrita como string. O tipo exige `bound`, `regime`,
`amortized`, `assumptions` e `measuredIn`. `assumptions: []` é permitido, e por ser
explícito passa a ser uma escolha em vez de um esquecimento.

## Opções consideradas

### A, String com convenção de formato
`'O(1) caso médio, hashing uniforme'`. **Descartada:** não é verificável, e a primeira
pressa produz `'O(1)'` de novo.

### B, Objeto com campos obrigatórios
Adotada. Quem não sabe uma das quatro respostas descobre que não sabe o custo.

## Consequências

- **Fica mais fácil:** a tela de custo exibe os qualificadores sem trabalho extra, e o
  aluno vê que a afirmação honesta é sempre mais longa que o símbolo.
- **Fica mais difícil:** escrever conteúdo. Preencher `measuredIn` para cada operação
  força uma decisão que normalmente fica implícita, que é o ponto.
- **Efeito colateral bom:** a diferença entre "amortizado" e "caso médio" fica visível no
  próprio dado, e virou um ciclo da unidade.

## Itens de ação

1. [x] `costClaim` em `src/content/schema.ts`
2. [x] Painel da matriz renderiza os quatro campos
