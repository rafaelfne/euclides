# ADR-0030: React Flow para figuras relacionais

**Status:** Accepted
**Date:** 2026-08-30
**Deciders:** Euclides

## Contexto

As figuras de grafos, árvores, percursos e estruturas ligadas tinham renderizadores SVG independentes. Cada um resolvia posicionamento, setas, zoom e estados visuais de uma forma diferente, e a qualidade variava entre unidades.

O custo de uma dependência adicional é aceitável porque a figura é parte do conteúdo, mas React Flow não é uma boa representação para curvas assintóticas, tabelas ou traces com células editáveis.

## Decisão

Usar `@xyflow/react` como base comum para figuras relacionais: grafos, árvores, árvores de recursão, percursos, listas ligadas e fluxos conceituais introdutórios. Usar `@dagrejs/dagre` para calcular o layout das árvores e dos fluxos a partir dos nós e das relações, preservando a ordem semântica de filho esquerdo e filho direito. Os nós continuam sendo derivados do conteúdo e não podem ser arrastados ou editados pelo aluno; as bibliotecas fornecem a camada visual e o enquadramento.

Manter SVG ou HTML sem React Flow para curvas, matrizes, tabelas, buckets e traces, nos quais a posição é uma escala ou uma célula e não uma relação entre nós.

## Consequências

- Arestas, setas, enquadramento e controles têm uma base visual única.
- Figuras relacionais ganham zoom e pan para leitura em telas menores.
- A dependência aumenta o bundle inicial das páginas que carregam figuras.
- Cada nova figura precisa declarar se seu dado é relacional ou tabular antes de escolher o renderizador.

## Ações

1. [x] Adicionar `@xyflow/react` e o estilo comum.
2. [x] Migrar grafos introdutórios, percursos, visitados, árvores, recursão e listas ligadas.
3. [ ] Revisar visualmente as figuras tabulares e de curva sem forçar React Flow.
