# ADR-0003: Espinha taxonômica contrato → implementação → custo

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

A confusão mais estrutural da área não é de terminologia, é de categoria: contrato
confundido com implementação. Pilha é contrato; array é implementação; O(1) é
consequência da implementação, **nunca** do contrato.

Sem essa separação, "qual estrutura devo usar?" é pergunta mal formada — e é exatamente o
objetivo (b) do projeto. É também o motivo de `HashMap` e `TreeMap` existirem em Java com
a mesma interface e garantias opostas.

## Decisão

A separação vira **tipo**, não convenção de escrita. `AbstractDataType` não tem campo de
custo; `Implementation` tem `cost`, `wrongWhen`, `everydayAnchor` e `invariant`
obrigatórios. Todo ciclo declara sua `band`, e o validador exige que a unidade abra pelo
contrato.

O mapa da unidade renderiza a partir dessa espinha, então a navegação não pode derivar da
taxonomia que a unidade ensina.

## Opções consideradas

### A — Convenção documentada, sem tipo
Escrever no guia de autoria que contrato e implementação são coisas diferentes.
**Descartada:** foi o que eu fiz na primeira versão e escorreguei na terceira frase
("promete presença"). Convenção que depende da vigilância do autor não sobrevive.

### B — Separação no tipo, com o campo de custo ausente do contrato
Adotada. É impossível escrever complexidade num contrato porque não existe onde.

### C — Um tipo só, com campos opcionais
**Descartada:** campo opcional é convite. O valor da decisão está em tornar o erro
inexprimível, não desaconselhado.

## Consequências

- **Fica mais fácil:** comparar implementações — o trade-off vive na diferença entre elas,
  e a matriz sai de graça a partir dos dados.
- **Fica mais difícil:** unidades cujo assunto não é uma estrutura (análise assintótica,
  recursão) não encaixam bem na espinha. Precisarão de uma banda diferente ou de uma
  variante do modelo — problema conhecido e ainda não resolvido.
- **Consequência pedagógica:** o último ciclo de uma unidade ("quando esta escolha é a
  errada") deixa de ser lista decorada e vira dedução — tudo que o contrato não promete é
  onde a estrutura falha.

## Itens de ação

1. [x] `AbstractDataType` sem campo de custo
2. [x] Checagem "espinha" no validador
3. [ ] Decidir a variante do modelo para unidades sem estrutura central
