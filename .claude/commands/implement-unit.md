---
description: Implementa uma unidade a partir do seu spec versionado em docs/specs/
argument-hint: <id-da-unidade>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task
---

Implemente a unidade `$1` a partir de `docs/specs/$1.md`.

## Antes de escrever

1. Leia `docs/specs/$1.md`. **Se o spec não existir, pare** e diga que o design
   pedagógico precisa vir antes — não invente escopo de unidade.
2. Leia `docs/authoring/guia-de-unidade.md` e `CLAUDE.md`.
3. Leia `src/content/units/hash/index.ts` como referência de forma — não de conteúdo.
4. Decida o `kind` antes de escrever. Estrutura promete operações (`adt` e
   `implementations`); método promete um julgamento (`criterion` e `techniques`). ADR-0012
   tem a tabela. Se o spec não deixa claro qual é, isso é lacuna do spec — diga.
5. Confira o spec contra os sete princípios. Se ele violar algum, diga qual e por quê
   **antes** de implementar; um spec que apresenta a estrutura antes do problema não
   melhora com boa prosa.

## Execução

Rode em sequência, cada um esperando o anterior:

- `exercise-designer` primeiro, para o catálogo de armadilhas e os exercícios. A ordem
  importa: o conteúdo é escrito para preparar os exercícios, não o contrário.
- `content-author` depois, para os ciclos, a prosa e o pseudocódigo.
- `terminology-auditor` por último, em modo relatório.

Registre a unidade em `src/content/index.ts` — é o único registro, e é dele que o
validador lê. Os termos novos vão para um array próprio da unidade em
`src/content/glossary.ts`, somado em `allTerms`. A implementação de referência vai para
`src/lib/reference/`, num registro por unidade com id prefixado (`<id>.<gerador>`),
agregado em `src/lib/reference/index.ts`.

## Critério de pronto

- `npm run validate` passa — a lista de checagens está em `CHECKS`, no topo de
  `scripts/validate-content.ts`, e o relatório é derivado dela
- `npm run docs:check` passa — nenhum caminho citado em documento está morto
- `npm run typecheck` limpo
- `npm test` passa, incluindo asserções novas sobre a implementação de referência
- `npm run build` conclui e as páginas da unidade aparecem no export
- O relatório do `terminology-auditor` não tem achado de gravidade alta

## Ao terminar

Diga o que ficou faltando no spec, quais armadilhas você considerou e descartou, e
onde a unidade encosta em outra — isso vira insumo do próximo spec.
