# ADR-0033: Preparar a máquina é conteúdo da unidade, e só cobre o que a unidade ensina

**Status:** Aceito
**Data:** 2026-11-09
**Decisores:** Rafael Neves

**Complementa o ADR-0032** (a linguagem executável é da unidade).

## Contexto

A unidade 09 promete que o aluno sai dela capaz de escrever o próprio micrograd em Python.
O app não dizia como chegar lá: não havia página que levasse da máquina vazia até um teste
passando. O desenho dessa página existia só no Claude Design, com quatro fases (micrograd,
PyTorch, modelo local e fine-tuning) e dois defeitos: o teste de exemplo usava um carrinho
com números que não eram mais os da unidade, e o comando `uv python pin 3.12` falha no uv
atual, porque o `uv init` cria o projeto pedindo Python 3.13 ou mais.

## Decisão

1. **A página mora em `/units/<unidade>/preparar` e o texto mora em `src/content/setup.ts`.**
   A tela não tem frase própria, como as outras telas transversais. A unidade 09 é a única
   com guia; o mapa da unidade mostra o link só quando o guia existe.
2. **Só a fase 1, o micrograd.** Python puro, uv e pytest. As outras fases dependem da trilha
   de SLM, que não tem spec, e o projeto não inventa escopo sem spec.
3. **O teste vem antes do código, e os números do teste são os da prosa.** O neurônio com
   w = 2, x = 7 e b = 9 e o a × a com a = 8 saem do exemplo trabalhado de `ai.c5`. O teste da
   tanh não traz número: mede empurrando a entrada, a técnica de `ai.c3`.
4. **O carrinho de `ai.e5` vem por último, em branco, e depois do exercício.** Com o
   micrograd pronto, um teste que falha imprime o valor calculado; rodá-lo antes entregaria a
   tabela. As asserções vão com `...`, e o passo declara `after: 'ai.e5'`.
5. **`scripts/test-setup.ts` confere** que os números do código saem de
   `src/lib/reference/ai.ts`, que nenhum gradient do carrinho aparece no bloco dele e que
   todo ciclo citado existe.
6. **Nenhuma linha do micrograd é dada.** O passo de escrever lista o que construir, cada item
   apontando o ciclo que o ensinou. O código original entra só no fim, como leitura depois
   dos testes passarem.

## Opções consideradas

- **As quatro fases do desenho.** Descartada por ora: fase 2 em diante instala PyTorch e
  modelos que nenhuma unidade ensina, e comandos de ferramenta que muda rápido envelhecem
  sem checagem que perceba.
- **Dar o `engine.py` pronto e pedir só para rodar.** Descartada: é a resposta entregue, e a
  página deixa de ser exercício.
- **Escrever o guia direto no componente.** Descartada pelo mesmo motivo das outras telas: o
  texto fora de `src/content` escapa das checagens.

## Consequências

- O comando de instalação do uv foi conferido na documentação do uv em 2026-11-09, e os
  passos foram rodados no uv 0.11. Mudou a ferramenta, muda este arquivo.
- Uma unidade nova com código executável fora do app ganha guia acrescentando um item em
  `setupGuides`; a rota e o link aparecem sozinhos.
