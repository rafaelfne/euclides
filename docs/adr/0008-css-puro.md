# ADR-0008: CSS puro com custom properties, sem framework de utilitários

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

O padrão do ecossistema Next.js é Tailwind. A direção visual do Euclides — a edição de
Oliver Byrne dos *Elementos*, 1847 — é um sistema pequeno e fixo: cinco cores com função
semântica, três famílias tipográficas, uma escala.

## Decisão

CSS puro com custom properties em `app/globals.css`, mais estilos inline nos componentes.

## Opções consideradas

| Opção | Prós | Contras |
|---|---|---|
| **A — CSS puro com tokens** (adotada) | Os tokens *são* o design system; bundle mínimo; zero configuração | Sem as garantias de consistência que utilitários dão em time grande |
| B — Tailwind | Convenção do ecossistema, produtividade em UI densa | Configuração e peso para um sistema de cinco cores; classes utilitárias servem mal um design tipográfico |
| C — CSS Modules | Escopo por componente | Cerimônia sem ganho nesta escala |

## Análise de trade-off

O argumento a favor de Tailwind é força em time grande com muitos contribuidores. Este
repositório tem um. O argumento contra é que numa página pública estática cada kB conta, e
o design é tipográfico — o tipo de coisa que utilitário serve mal.

Decisão reversível a custo baixo enquanto o número de telas for pequeno. Se o app crescer
para dezenas de telas com vários autores, reavaliar.

## Consequências

- **Fica mais fácil:** ler o CSS e entender a intenção; trocar a paleta inteira em um
  lugar.
- **Fica mais difícil:** manter consistência à medida que as telas crescem, sem a rede que
  utilitários dão.

## Itens de ação

1. [x] Tokens em `:root`
2. [ ] Reavaliar se passar de ~15 telas ou ganhar um segundo autor
