# ADR-0006: O validador pedagógico é gate de build, sem nível de aviso

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

Escolher motor estático (ADR-0001) significou abrir mão do julgamento de um LLM em
runtime. Alguma coisa precisa ocupar esse lugar, ou os princípios viram decoração no
README.

Evidência de que a vigilância humana não basta: durante o desenho da primeira unidade, as
mesmas regras foram quebradas **quatro vezes por quem as escreveu** — bilinguismo sem
regra, armadilha órfã, substantivo abstrato no lugar de operação, e enum em inglês
vazando para a tela.

## Decisão

`npm run build` roda `npm run validate` antes de `next build`. Doze checagens, cada uma
um princípio do projeto. **Não há nível de aviso** — aviso é regra que ninguém cumpre.

Um hook `PostToolUse` roda o validador no instante em que conteúdo é editado, para o erro
aparecer com o raciocínio ainda carregado.

## Opções consideradas

### A — Lint com avisos
**Descartada.** Um aviso que não quebra nada acumula até virar ruído, e o conteúdo entra
mesmo assim.

### B — Gate duro no build
Adotada. Se o validador reprova, o conteúdo está errado.

### C — Revisão humana no PR
**Descartada como mecanismo principal.** É o mesmo humano que quebrou as regras quatro
vezes. Serve como camada extra, não como a camada.

## Análise de trade-off

O custo é atrito: o build recusa conteúdo incompleto. Na primeira execução ele reprovou
imediatamente — nove ciclos, três exercícios, seis ciclos sem fechamento e três armadilhas
órfãs. Foi exatamente o comportamento desejado.

O risco real é a tentação de relaxar uma checagem para destravar. Por isso a regra está no
`CLAUDE.md` em voz ativa: **se o validador reprova, corrija o conteúdo, nunca a checagem.**

## Consequências

- **Fica mais fácil:** confiar no conteúdo publicado sem reler tudo.
- **Fica mais difícil:** commitar trabalho pela metade — o que é intencional e às vezes
  incômodo.
- **A observar:** algumas violações são de julgamento e não de forma (um ciclo que abre
  pela estrutura em vez do problema). Essas ficam no `/audit-unit`, que é relatório e não
  gate — e essa fronteira precisa continuar honesta.

## Itens de ação

1. [x] Doze checagens em `scripts/validate-content.ts`
2. [x] Hook `PostToolUse` em edições de conteúdo
3. [x] CI roda o validador em passo próprio, separado do build
