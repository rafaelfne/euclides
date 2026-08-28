# ADR-0002: Correção socrática por antecipação em tempo de autoria

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

ADR-0001 tirou o LLM do runtime. Resta cumprir o princípio 3 sem ele.

A observação que destrava: **correção socrática não é inteligência em runtime, é
antecipação em tempo de autoria**. Um professor experiente não improvisa a pergunta — ele
já viu os oito jeitos de errar aquilo. O LLM só é necessário quando o espaço de erro é
aberto.

## Decisão

Todo exercício da trilha tem **espaço de erro fechado**. As maneiras de errar são
catalogadas como `Misconception`, cada uma com uma pergunta socrática e uma escada de
pistas. Cinco mecanismos cobrem os tipos de exercício; nenhum revela o valor correto.

## Opções consideradas

### A — Texto livre com correção heurística
Casamento de palavras-chave na resposta do aluno. **Descartada:** frágil, e pior que
inútil quando erra — devolve confiança falsa.

### B — Espaço de erro fechado com armadilhas catalogadas
Adotada. O feedback nunca contém a resposta; contém **a tarefa que produz** a resposta.

### C — Só verificação binária (certo/errado)
**Descartada:** viola o princípio 3 pelo outro lado. Dizer "errado" sem apontar onde
quebrou não é socrático, é um portão.

## Análise de trade-off

Restringir o formato do exercício parece uma concessão à ausência de LLM. Não é:
**a restrição aumenta o rigor**. Texto livre deixa o aluno se esconder atrás de vagueza —
"hash é mais rápido" passa num ensaio e não passa num
formulário que exige nomear a operação dominante e o custo assintótico nas duas
estruturas.

O custo é que exercício de espaço aberto sai do app. Ele vira autoexplicação com rubrica
diferida, exportável para correção fora dali.

## Consequências

- **Fica mais fácil:** auditar a qualidade da devolutiva; ela é texto versionado.
- **Fica mais difícil:** desenhar exercício. Se você não consegue listar as maneiras de
  errar, o exercício está mal posto — o que é um sinal útil e desconfortável.
- **Regra dura:** a escada tem três degraus e não ganha um quarto. Quem esgota recebe
  "vamos parar aqui, volte amanhã", que é melhor desfecho que uma resposta.

## Itens de ação

1. [x] `findDivergence` e `buildFeedback` em `src/lib/socratic.ts`
2. [x] Teste provando que nenhum degrau contém o valor correto
3. [x] Schema obriga `misconceptionId` em toda alternativa incorreta
