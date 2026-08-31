# Spec, pré-trilha: Ler um procedimento

**Status:** implementada
**Kind:** `method`

Esta etapa atende quem nunca programou e ainda não consegue ler a unidade 01. Ela
não ensina uma linguagem, instalação ou ferramenta. Ela constrói o modelo mínimo
para acompanhar valores, decisões e repetições em pseudocódigo.

## Problema motivador

Um e-mail foi parar na pasta de spam, e a pessoa quer saber por quê. A regra começa
com 0 sinais: soma 2 se houver um link desconhecido, soma 1 se o remetente não
estiver nos contatos e tira 1 se houver uma assinatura conhecida. Com 2 ou mais
sinais, o e-mail vai para o spam. Como acompanhar as regras para reconstruir a
decisão?

## Critério

`Leitura de procedimento`, a sequência verificável de estados, decisões e resultado.

| parte | o que ela afirma |
|---|---|
| estado inicial | quais valores existem antes do primeiro passo |
| transformação | qual valor muda e para qual valor vai |
| decisão | qual pergunta escolhe ou repete o próximo passo |
| resultado | o que sobra ao terminar, e de onde veio |

## Técnicas

**Tabela de estado**, escrever os nomes e os valores em cada passo.
Errada quando: há uma repetição longa; use a condição e a invariante da unidade
01.

**Leitura da condição**, separar a pergunta da ação que vem depois dela.
Errada quando: o trecho precisa de uma sequência de mudanças; use a tabela de
estado.

## Ciclos

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | critério | Um procedimento transforma valores | estado |
| c1 | técnica | Nomes guardam valores | variável, atribuição |
| c2 | técnica | Uma condição faz uma pergunta | condição |
| c3 | técnica | Repetir é perguntar de novo | rodada |
| c4 | falha | A ordem dos passos importa | — |
| c5 | falha | O caso sem itens também é uma entrada | lista, posição |
| c6 | falha | O que você consegue ler agora | — |

## Armadilhas

- `prelude.igualdade-nao-atribuicao`, ler a seta como uma igualdade matemática
- `prelude.condicao-e-acao`, confundir a pergunta com o que ela manda fazer
- `prelude.repeticao-automatica`, imaginar que uma repetição acontece sem testar a condição
- `prelude.ordem-ignorada`, calcular o resultado final sem acompanhar os passos
- `prelude.vazio-esquecido`, não considerar uma sequência sem elementos

## Critério de domínio

Diante de um procedimento de até 8 linhas, a pessoa identifica os valores
iniciais, acompanha duas transformações, responde uma condição e explica o
resultado final sem executar o código.

Os exercícios `prelude.e1` e `prelude.e5` entram em `requiresClean`: um cobra a
diferença entre atribuição e igualdade; o outro cobra uma entrada vazia e uma
posição válida.

## Decisões

1. A etapa usa `kind: method`, porque promete um julgamento: ler um procedimento
   e produzir um caminho verificável.
2. Ela fica fora de `units`, o conjunto curricular que alimenta nivelamento,
   faixas e contadores da trilha. `allUnits` a expõe em navegação, busca,
   retomada, armadilhas e lacunas.
3. A numeração `00` identifica a preparação e não desloca a unidade 01.
4. `state`, `iteration`, `list` e `position` passam a estrear aqui, porque a
   unidade 01 e a unidade 03 usam esses termos como vocabulário já estabelecido.
