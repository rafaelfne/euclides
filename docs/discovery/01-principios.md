# Os sete princípios

Não são valores; são restrições. Cada um custa alguma coisa, e o custo é o que os torna
úteis.

Nenhum dos sete é mecanizado por inteiro, e a contagem honesta é esta: cinco têm checagem
correspondente no validador (2, 3, 4, 5, 6), dois deles só em parte (3 e 5); o 1 é
mecanizado de lado, pelas convenções de pseudocódigo; o 7 é declaradamente não
mecanizável. O que cada um deixa de fora está marcado abaixo, e é ali que `/audit-unit`
trabalha.

## 1. Agnóstico a linguagem

Conceitos em pseudocódigo, diagramas e invariantes. A implementação é exercício, não é o
conteúdo.

**O que custa:** o exercício de implementação obriga a escolher uma linguagem. Resolvido
declarando a fronteira, o exercício canônico é em pseudocódigo, e a implementação é
opcional para o critério de domínio.

**Mecanizado, de lado:** o validador não sabe se um conceito ficou preso a uma linguagem,
mas a checagem de convenção reprova `return`, `%`, `==` e `null` em todo pseudocódigo. É
a fronteira, não o princípio.

## 2. Prática deliberada acima de consumo

Toda unidade termina em exercício com critério objetivo de verificação.

**Mecanizado:** o schema torna `exerciseId` obrigatório em todo ciclo. Um ciclo sem
exercício não compila.

## 3. Nunca entregue a resposta

Aponte onde o raciocínio quebrou e faça a pergunta que leva à correção.

**Mecanizado, parcialmente:** o validador exige que toda pergunta socrática termine em
`?`, que todo distractor nomeie uma armadilha, e que a `escalation` tenha no máximo três
entradas, sem teto, a ajuda cresce até virar resposta. O que nenhum validador pega é uma
devolutiva que *explica* em vez de perguntar, isso é trabalho de auditoria.

## 4. Complexidade sempre

Para cada estrutura: custo de tempo, custo de espaço, e o cenário em que aquela escolha é
a errada.

**Mecanizado:** complexidade não pode ser string. `CostClaim` exige regime, amortização,
hipóteses e unidade de medida; `Implementation` exige `wrongWhen` não vazio.

## 5. Do concreto ao abstrato

Primeiro o problema que a estrutura resolve, depois a estrutura.

**Mecanizado, parcialmente:** o validador exige que a primeira banda de toda unidade seja
o contrato, e que exista `motivatingProblem`. Se cada *ciclo* abre pelo problema é
julgamento, está no `/audit-unit`.

## 6. Ancorar no cotidiano

Ligue o conceito a algo do trabalho real: consulta lenta, cache, fila, índice.

**Mecanizado:** `everydayAnchor` é obrigatório e não pode ser vazio. Se ele é específico
o bastante é auditoria.

## 7. Honestidade de nível

Se uma resposta está superficial, diga. Elogio vago atrapalha o objetivo.

**Não mecanizável, e o mais fácil de perder.** Vale para o app, o painel de lacunas em
`/gaps` diz "resolvido em quatro tentativas, chegar lá não é o mesmo que dominar" em vez
de mostrar um percentual, e `scripts/test-export.ts` reprova se algum número percentual
aparecer no export, e vale para quem escreve o conteúdo.
