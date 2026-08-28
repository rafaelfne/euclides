# Os sete princípios

Não são valores; são restrições. Cada um custa alguma coisa, e o custo é o que os torna
úteis. Sete deles têm checagem correspondente no validador — o que não é mecanizável está
marcado.

## 1. Agnóstico a linguagem

Conceitos em pseudocódigo, diagramas e invariantes. A implementação é exercício, não é o
conteúdo.

**O que custa:** o exercício de implementação obriga a escolher uma linguagem. Resolvido
declarando a fronteira — o exercício canônico é em pseudocódigo, e a implementação é
opcional para o critério de domínio.

## 2. Prática deliberada acima de consumo

Toda unidade termina em exercício com critério objetivo de verificação.

**Mecanizado:** o schema torna `exerciseId` obrigatório em todo ciclo. Um ciclo sem
exercício não compila.

## 3. Nunca entregue a resposta

Aponte onde o raciocínio quebrou e faça a pergunta que leva à correção.

**Mecanizado, parcialmente:** o validador exige que toda pergunta socrática termine em
`?` e que todo distractor nomeie uma armadilha. O que nenhum validador pega é uma
devolutiva que *explica* em vez de perguntar — isso é trabalho de auditoria.

## 4. Complexidade sempre

Para cada estrutura: custo de tempo, custo de espaço, e o cenário em que aquela escolha é
a errada.

**Mecanizado:** complexidade não pode ser string. `CostClaim` exige regime, amortização,
hipóteses e unidade de medida; `Implementation` exige `wrongWhen` não vazio.

## 5. Do concreto ao abstrato

Primeiro o problema que a estrutura resolve, depois a estrutura.

**Mecanizado, parcialmente:** o validador exige que a primeira banda de toda unidade seja
o contrato, e que exista `motivatingProblem`. Se cada *ciclo* abre pelo problema é
julgamento — está no `/audit-unit`.

## 6. Ancorar no cotidiano

Ligue o conceito a algo do trabalho real: consulta lenta, cache, fila, índice.

**Mecanizado:** `everydayAnchor` é obrigatório e não pode ser vazio. Se ele é específico
o bastante é auditoria.

## 7. Honestidade de nível

Se uma resposta está superficial, diga. Elogio vago atrapalha o objetivo.

**Não mecanizável, e o mais fácil de perder.** Vale para o app — o painel de lacunas diz
"você resolveu em quatro tentativas, isso não conta como domínio" em vez de mostrar um
percentual — e vale para quem escreve o conteúdo.
