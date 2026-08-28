# ADR-0007: Fronteira de idioma entre código e conteúdo

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

O projeto é pt-BR e o código é escrito por quem trabalha em inglês. Sem uma fronteira
declarada, a mistura acontece nos dois sentidos — e aconteceu: um rótulo de tela chegou a
exibir `BANDA · IMPLEMENTATION`, com o valor do enum em inglês vazando para o aluno.

## Decisão

| camada | idioma | exemplo |
|---|---|---|
| código, rotas, identificadores | inglês | `ExecutionTrace`, `/units/hash` |
| conteúdo autorado | pt-BR | enunciados, prosa, rubricas |
| pseudocódigo | pt-BR | `inserir(tabela, chave, valor)` |
| código do sandbox | inglês | `insert(table, key, value)` |

Regra derivada: **valor de enum é código, rótulo de tela é conteúdo.** Nenhum enum é
renderizado direto; cada um tem mapa de rótulos exaustivo por tipo, de modo que um valor
novo quebra o build até ser nomeado em português.

## Análise de trade-off

Pseudocódigo em português e sandbox em inglês parece incoerente, e é deliberado: o
pseudocódigo é conteúdo (serve ao raciocínio) e o sandbox é código (serve à entrega). A
travessia entre os dois vira momento de ensino — a mesma operação, um nome para pensar e
outro para entregar.

Rotas em inglês são consequência direta da regra, e evitam caracteres acentuados em URL.

## Consequências

- **Fica mais fácil:** um contribuidor que não lê português ainda navega o código.
- **Fica mais difícil:** cada enum exibido precisa de mapa de rótulos — pequeno imposto,
  cobrado toda vez.

## Itens de ação

1. [x] `languageBoundary` declarado em `src/content/conventions.ts`
2. [x] `BAND_LABEL` exaustivo por tipo em `CycleScreen`
