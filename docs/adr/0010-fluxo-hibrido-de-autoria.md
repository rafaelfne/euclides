# ADR-0010: Design fora do repositório, autoria dentro dele

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

O gargalo do projeto não é código, é conteúdo. Oito unidades com a densidade da primeira
são muito mais trabalho que a plataforma inteira, e a qualidade do conteúdo é o produto.

Duas coisas diferentes acontecem ao criar uma unidade: **decidir o que ela ensina e em que
ordem** (design pedagógico, conversa, muita ida e volta) e **escrever o conteúdo contra
essa decisão** (autoria, mecânica, verificável).

## Decisão

Fluxo híbrido:

1. O design pedagógico acontece fora do repositório e aterrissa como **spec** versionado
   em `docs/specs/<id>.md`.
2. `/implement-unit <id>` escreve conteúdo, exercícios e implementação de referência
   contra aquele spec.
3. `/audit-unit <id>` audita o que o validador não mecaniza.

Se o spec não existe, o comando para. Nenhum agente inventa escopo de unidade.

## Opções consideradas

### A, Claude Code faz o ciclo inteiro no repositório
Um `/new-unit <tema>` conduziria do problema motivador aos exercícios validados.
**Descartada:** mais autônomo e mais sujeito a deriva. As quatro violações observadas
durante o desenho aconteceram em cima de regras já escritas, autonomia maior amplifica
isso, não corrige.

### B, Design e autoria ambos fora do repositório
**Descartada:** prende a produção a sessões longas de conversa e desperdiça o validador,
que é um excelente guia de autoria quando roda a cada edição.

### C, Híbrido (adotada)
O spec é o contrato entre as duas fases, e é revisável antes de virar conteúdo.

## Consequências

- **Fica mais fácil:** revisar o design pedagógico antes de gastar autoria; e a autoria
  ganha um alvo verificável.
- **Fica mais difícil:** manter o spec honesto. Um spec vago produz conteúdo vago com
  aparência de conformidade.
- **Regra:** o spec deve marcar suas lacunas como `A DEFINIR` em vez de preenchê-las por
  conta própria. Spec honesto sobre o que não sabe vale mais que spec completo e inventado.

## Itens de ação

1. [x] `docs/specs/hash.md` como modelo
2. [x] Comandos `/new-spec`, `/implement-unit`, `/audit-unit`
3. [x] Agentes de autoria, desenho de exercício e auditoria
