# Spec, Unidade 9: Como uma IA decide

**Status:** pronto para implementar; as quatro decisões que travavam o conteúdo foram tomadas em 2026-11-06
**Revisão:** as mudanças em c1, no chamado (job por entrega, base fixa), no postmortem de c8, em e1 e em e7 vieram de uma revisão externa aceita pelo autor em 2026-11-09 (decisão 8).
**Kind:** `method` (ADR-0012). O assunto não é uma estrutura, é o julgamento que o aluno
produz diante de uma conta com pesos: o que ela devolve, quanto errou e para que lado mexer.

A unidade nasceu da trilha de estudo de SLM do autor, que estuda pelo micrograd (Andrej
Karpathy, repositório público karpathy/micrograd no GitHub). A unidade não é sobre o micrograd: é
sobre o mecanismo que ele implementa, em pseudocódigo, como todo o resto da trilha.

## Problema motivador

Decidido em 2026-11-06, segunda versão: o chamado é uma estimativa de prazo de entrega, com
números que a própria unidade verifica em `scripts/test-ai.ts`.

Uma transportadora mostra ao cliente um prazo previsto, em dias:

    prazo previsto = distância × peso da distância + base

A distância vai em centenas de km, e a base, 1 dia de separação, é fixa: é um prazo que a
operação define, não um número estimado, e o job só aprende o peso. Por anos o prazo saiu
de uma tabela da transportadora, com operações somando dias na mão quando as entregas
atrasavam. O time trocou a tabela pela conta, com o peso começando na média de um trimestre
(cada 100 km somavam 0,4 dia), e um job passou a ajustá-lo a cada entrega concluída: compara a
previsão daquela entrega com o prazo real e empurra o peso para o lado que diminui o erro. A
noite do chamado foi a entrega de uma rota de 500 km. O sistema não muda a entrega, muda o
número dentro da conta da estimativa.

A versão anterior dizia que o job comparava, toda noite, as previsões com as entregas do dia, e
o postmortem usava uma rota só. Agora as duas pontas falam da mesma coisa: uma atualização por
entrega concluída, e a do chamado foi a da rota de 500 km.

Duas versões anteriores foram trocadas. "O número que um dev chutava na mão" não dizia como o
número nascia. "Abria-se um chamado e alguém refazia a conta à mão" descrevia mal o antes: o
prazo costumava vir de tabela da transportadora, ajustada por operações, não de um peso
recalculado por dev. E o job não é "a IA" contra "o antes": empurrar um peso na direção que
reduz o erro é regressão linear treinada com descida de gradient, a forma mais simples do
mecanismo que uma rede neural repete com milhões de pesos. A unidade não deve sugerir um salto
que não existe.

A conta, passo a passo, é o que o chamado mostra antes da pergunta:

- rota de 500 km, distância 5, peso 0,4: 5 × 0,4 + 1 = 3 dias
- a entrega real levou 4 dias; loss (previsto − real)² = 1
- numa noite, o ajuste daquela entrega levou o peso de 0,4 para 1,0: a rota passou a prever 5 × 1,0 + 1 = 6
  dias, loss 4, e toda rota de 500 km ou mais passou a prever pelo menos o dobro
- ninguém mexeu no código

Por trás disso: o gradient do peso na previsão é 5, a distância, e cada 0,1 no peso soma meio
dia. O gradient do peso no loss, em 0,4, é 5 × 2 × (3 − 4) = −10, negativo, então subir era o
lado certo. O passo foi learning rate 0,06 vezes 10; com 0,02, o peso pararia no ponto. A
previsão estava 1 dia abaixo do real e terminou 2 acima: passo grande demais.

A causa, e não só o sintoma: a distância entra duas vezes no passo, no gradient do loss
(2 × erro × distância) e no quanto o peso move a previsão (a distância). Com learning rate 0,06
e distância 5, cada dia de erro vira 0,06 × 2 × 5² = 3 dias de correção, e o erro depois do passo
é o de antes vezes 1 − 3 = −2. Repetido na mesma rota, diverge: erros −1, +2, −4, +8; previsões
3, 6, 0, 12; pesos 0,4, 1,0, −0,2, 2,2. O erro só encolhe quando 0,06 × 2 × distância² < 2, ou
seja, distância² abaixo de 16,7 e distância abaixo de 4,08, uns 410 km. Uma rota de 200 km
(distância 2) multiplica o erro por 1 − 0,06 × 2 × 4 = 0,52 e converge. É isso que explica, com
número, o "toda rota de 500 km ou mais". A lição do postmortem: learning rate fixo para entradas
de escalas diferentes. O que teria pego: escolher o passo pela escala da entrada (ou medir a
distância numa escala em que toda rota fique pequena) e conferir que o loss cai em várias
rodadas seguidas. Recusar o passo que fez o loss subir fica como alarme, não como correção.
O `missingClaim` é a afirmação que faltava, "o passo é seguro para a escala desta entrada", com
a conta; a versão anterior abria com "nenhuma de custo de tempo:", que lia como template.

O peso que zera o loss nessa rota é 0,6 (5 × 0,6 + 1 = 4). Esse número não aparece em nada que o
aluno lê antes de e8, inclusive o postmortem de c8, que a tela mostra antes do exercício. Como o
passo daquela noite também mede 0,6, a prosa escreve "de 0,4 para 1,0" e nunca o tamanho do
passo. Os pesos da divergência (1,0, −0,2, 2,2) podem aparecer; o 0,6 não, e o 0,02 também não
aparece em c8. `scripts/test-ai.ts` confere.

A pergunta do chamado: **qual número o ajuste mexeu, por que aquele, e por que tanto de uma
vez?** O ajuste automático é descida de gradient sobre um peso só, e o salto de 0,4 para 1,0
numa noite é um passo grande demais para a escala daquela entrada. O postmortem (c8) volta a
isso.

A pergunta que abre a unidade: **quando uma estimativa erra, como se descobre qual número
mexer, e para que lado, sem tentar um por um?**

## Critério, o julgamento que a unidade ensina a produzir

| parte | o que ela afirma |
|---|---|
| saída | o valor que a conta devolve para uma entrada, conta por conta |
| loss | um número só que mede o quanto a saída errou |
| gradient por nó | quanto o loss muda se aquele número subir um pouco, com os outros parados |
| direção do passo | para que lado cada peso mexe para o loss cair, e o tamanho do passo |

**Quando cada parte é omitida**, e é daqui que saem as armadilhas:

- sem a **saída** conta por conta: não há valor local para a regra da cadeia multiplicar
- sem o **loss**: "o modelo errou" vira opinião, e não há para onde descer
- sem o **gradient**: mexer em peso vira tentativa, um por um
- sem a **direção do passo**: o gradient é calculado e ninguém usa, ou é usado com o sinal trocado

## Técnicas comparadas

**Gradient numérico**, mexer um número um pouco, refazer a conta inteira e medir a diferença.
Invariante: o empurrão é pequeno o bastante para a conta se comportar como reta naquele trecho.
Custo: uma execução da conta inteira por peso, mais a de referência. Com 3 pesos são 4
execuções; com 1 milhão, 1.000.001. Errada quando: há mais de um punhado de pesos. Serve para
conferir a outra técnica.
Âncora: é o que um dev faz por instinto, "muda esse valor e vê o que acontece".

**Backpropagation**, uma passada para frente guardando cada valor, e uma para trás
multiplicando os impactos pela regra da cadeia, do total até as entradas.
Invariante: quando chega a vez de um nó, o gradient dele já está completo, porque todo nó
que depende dele já passou.
Custo: duas passadas, qualquer que seja o número de pesos, e memória para guardar cada
valor intermediário da passada para frente.
Errada quando: a conta tem um ciclo, porque não existe "de trás para frente". Redes deste
tipo não têm.
Âncora: é o motivo de treinar ser viável. Sem ela, o custo do gradient numérico cresce com
o número de pesos.

A comparação de custo entre as duas é a afirmação de complexidade da unidade (princípio 4).

Nenhuma das duas ajusta peso. As duas declaram produzir a parte **direção do passo** porque o
passo da gradient descent consome o gradient que qualquer uma delas entrega, e o sinal e o
tamanho do passo saem desse gradient. Declarar a parte só na backpropagation sugeria que o
gradient numérico não serve para dar o passo, e serve, só custa mais.

## Ciclos

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | critério | Uma decisão é uma soma com pesos | neurônio, peso do neurônio, bias |
| c1 | critério | tanh: sem ela, dois neurônios valem um | activation function |
| c2 | critério | Loss: um número para o quanto errou | loss |
| c3 | técnica | Mexer um pouco e medir | gradient |
| c4 | técnica | Regra da cadeia: o impacto atravessa as contas | regra da cadeia, impacto local |
| c5 | técnica | Backpropagation em ordem | backpropagation, passada para frente, passada para trás |
| c6 | técnica | O passo: learning rate | learning rate, gradient descent |
| c7 | falha | O gradient que acumula sem zerar | nenhum |
| c8 | falha | Postmortem: o peso que saltou numa noite | nenhum |

c1 mora na banda critério, e não na técnica como a primeira versão deste spec dizia: ele não
elabora nenhuma das duas técnicas, e a tanh é parte da saída do critério.

O argumento de c1 é o colapso: sem activation function, neurônios de multiplicar e somar em
sequência viram uma conta de multiplicar e somar só. y = 2 × x + 1 seguido de z = 9 × y + 1 dá
z = 18 × x + 10, um neurônio com peso 18 e bias 10; com a tanh entre os dois, z deixa de ser uma
reta. A leitura "um if que não é seco" (perto de zero acompanha a soma, longe de zero trava em −1
ou 1) continua, como apoio. A versão anterior prometia que a curva suave permitia medir, adiante,
quanto cada peso move o resultado, e nenhum exemplo seguinte cumpria isso: todos são lineares e
têm gradient sem tanh nenhuma. A revisão sugeriu z = 3 × y + 1 (z = 6 × x + 4); 3, 4 e 6 são
células do gabarito de e5, que o teste proíbe na prosa de c0 a c5, por isso o 9.

c7 prepara e7 com uma frase: nunca zerar é um defeito, zerar no ponto errado da rodada é outro.
Não diz onde a chamada de zerar deve ficar.

O bias é "um número somado sempre, sem multiplicar entrada nenhuma", e não "o número somado no
fim": o pseudocódigo de c0 começa a soma por ele.

O gradient sempre diz de quê é: "o gradient do peso na previsão", "o gradient do peso no loss".
No chamado, o gradient do peso na previsão é a distância; no loss, é isso vezes
2 × (previsto − real).

O exemplo trabalhado de c8 é outra rota, com números próprios: outro centro de distribuição,
base 2, rota de 1.000 km (distância 10), peso 0,5, previsão 7 dias, real 11, loss 16, gradient
no loss −80. Um ajuste para 0,85 prevê 10,5 dias e leva o loss a 0,25; um para 1,5 prevê 17 e o
leva a 36.

Exercícios, um por ciclo:

- **e0, escolha:** a pontuação de um filtro antifraude, `p = 0,5 × v + 3 × n − 4`. A conta
  devolve 2, não "bloquear".
- **e1, escolha:** dois neurônios sem activation function, `y = 4 × x − 2` e `z = 0,5 × y + 3`;
  o aluno calcula z para x = 0, 1 e 2 (2, 4, 6) e vê que um neurônio só, `z = 2 × x + 2`, faz o
  mesmo. Os distratores exercitam `empilhar-sem-ativacao`. Antes da revisão, e1 era if seco
  contra tanh quando a soma ia de 0,2 para 0,3.
- **e2, escolha:** dois modelos de prazo de entrega; a soma com sinal declara A perfeito, e o
  loss, 18 contra 2, escolhe B.
- **e3, escolha:** `p = w1 × x1 + w2 × x2 + b`, empurrão de 0,1 em cada; o peso menor move mais.
- **e4, escolha:** tarifa de corrida, `km × 2` e depois `× 1,5`; 1 km a mais sobe o total em 3.
- **e5, trace:** a passada para frente e a passada para trás do carrinho,
  `total = (preço × quantidade + frete) × fator`, com preço 4, quantidade 5, frete 6 e fator 3,
  e os dois nós do meio nomeados `subtotal = preço × quantidade` e `base = subtotal + frete`.
  O carrinho é só uma conta de treino, não o caso do chamado. Os números não são os do
  exemplo trabalhado de c5, que usa `y = w × x + b` e `y = a × a`. Linhas na ordem da
  passada para trás: total, fator, base, frete, subtotal, quantidade, preço. Colunas: ordem,
  nó, valor, impacto local, gradient. O gabarito sai de `src/lib/reference/ai.ts`, nunca digitado, e a checagem `vazamento` confere a
  prosa de c0 a c5 contra ele.
- **e6, escolha:** `loss = (w − 3)²` em 5, learning rate 1,5 contra 0,1; o passo maior passa do
  ponto e o loss vai a 16.
- **e7, defeito:** um laço de treino, no estilo do micrograd, em que `zero_grad()` fica entre
  `backward()` e a linha que muda o peso. O enunciado diz que limpar o gradient escreve 0 em
  `p.grad`: no PyTorch 2.x a mesma chamada põe `None`, e a linha do passo lançaria `TypeError`, o
  que tornava falso o "roda sem erro" da versão anterior. O passo lê o gradient já zerado: nenhum peso muda e o loss fica igual em toda
  rodada. c7 ensina o mecanismo (a passada para trás soma ao que sobrou da rodada anterior) e
  não diz onde a chamada de zerar deve ficar; o exercício cobra essa leitura. O enunciado não
  descreve o defeito, e o diff marca a função inteira, para não apontar a linha. A correta não
  é a mais longa nem a mais curta.
- **e8, escolha:** com que peso a previsão da rota do chamado acerta os 4 dias. O enunciado
  traz distância 5, base 1 e real 4. Correta: 0,6. Distratores: 1,0, o valor depois do ajuste
  (`passo-maior-converge-antes`); 0,2, o passo certo com o sinal trocado
  (`passo-com-sinal-trocado`); 5, a distância (`valor-como-gradient`). A correta não é a mais
  longa nem a mais curta. O postmortem de c8 diz que o passo passou do ponto e não diz qual era
  o ponto.

"Rodada" é cada volta do laço de treino; "passo" é só o ajuste do peso.

## Armadilhas conhecidas

Há uma fonte que as outras unidades não tiveram: as dúvidas reais de um aluno, o autor,
estudando o micrograd. Elas foram, nesta ordem:

- "o que é medir inclinação, e o que isso faz numa situação prática?"
- "o que é um grad?"
- "onde entra a decisão de uma IA em tudo isso?", e "não visualizei o if acontecendo aqui"
- "de onde surgiram 1.0 e 2.0?", sobre pesos que o treino produziu
- "o que é um bias?"

É um aluno só, e um aluno que não é o público da trilha (16 anos de profissão, não dois).
Serve como sinal, não como catálogo.

Propostas, cada uma precisando da sua leitura antes de virar catálogo:

- `impacto-local-como-gradient`, escrever no nó o impacto local da última conta e esquecer de
  multiplicar pelo gradient do nó de cima
- `grad-sobrescrito`, um nó usado duas vezes recebe `=` em vez de `+=`, e a segunda
  contribuição apaga a primeira
- `grad-acumula-entre-rodadas`, supor que a passada para trás escreve o gradient do zero, e não
  soma ao que sobrou da rodada anterior
- `valor-como-gradient`, supor que um peso grande tem gradient grande
- `passo-maior-converge-antes`, supor que learning rate maior chega mais rápido
- `decisao-binaria`, procurar o `if` dentro da rede, em vez de ler a saída como pontuação

A implementação acrescentou três, todas exercitadas:

- `erros-se-cancelam`, somar os erros com sinal, do `whenOmitted` do loss
- `passo-com-sinal-trocado`, somar o gradient ao peso, do `whenOmitted` da direção do passo
- `zerar-em-qualquer-ponto`, supor que zerar o gradient em qualquer ponto da rodada dá o mesmo
  resultado, de e7

A revisão de 2026-11-09 acrescentou uma quarta, exercitada em e1:

- `empilhar-sem-ativacao`, supor que neurônios em sequência, sem activation function entre
  eles, fazem uma conta que um neurônio só não faz

**A DEFINIR:** quais dessas o público da trilha erra. Mesmo argumento do spec de `tracing`:
catálogo inventado produz distractor plausível e pedagogicamente vazio.

## Critério de domínio (proposta)

Diante de uma conta de até seis nós que nunca viu, sem executar: calcular a saída, produzir
o gradient de cada nó na ordem da passada para trás, e dizer para que lado cada peso precisa
mexer para o loss cair.

O exercício de trace de c5 entra em `requiresClean`.

## Perguntas em aberto

1. **Referência ao Python.** O desenho sugere um quadro "na sua implementação" que manda
   conferir o código do aluno contra a tabela. Decidir se ele existe; se existir, não nomeia
   linguagem nem repositório (princípio 1).
2. **Ordem na trilha.** A unidade usa trace (unidade 01) e custo (unidade 02). Ela pode vir
   depois da 02 ou só depois da síntese.

## Decisões tomadas

1. `kind: method`. As quatro partes do critério couberam sem campo opcional.
2. Pseudocódigo em pt-BR, como toda a trilha. A versão executável é derivada, nunca escrita
   ao lado, e nesta unidade é Python, não TypeScript (ADR-0032): é Python que o aluno encontra
   em código de rede neural. O exercício de defeito (e7) também é Python.
3. O carrinho (preço, quantidade, frete, fator) é a conta de treino do backpropagation (c5 e
   ai.e5), porque soma e produto são as duas únicas contas de que a regra da cadeia precisa, e
   um dev já tem referente para elas. Ele não é um cenário de sistema: o chamado é a
   estimativa de prazo (decisão 6), e c0 abre por outro caso do trabalho.
4. **Termo de peso** (2026-11-06): `weight` entra em `OVERLOADED_TERMS`. O peso de aresta
   (`graphs.c1`) continua dono de `peso` e `weight`, e declara como falso amigo o termo novo
   `peso do neurônio`, que estreia em c0. Assim a checagem `ambiguidade` passa e o aluno é
   avisado nos dois lugares.
5. **Notação** (2026-11-06): nenhuma notação de cálculo na tela, nem `∂` nem a palavra
   "derivada" como termo do glossário. O gradient é "quanto o resultado muda se este número
   subir um pouco", e o gradient numérico (c3) vem antes da regra da cadeia (c4). A coluna do
   trace se chama "impacto local", não "derivada local", e "impacto local" é verbete do
   glossário, estreando em c4.
6. **Problema motivador** (2026-11-06, revisto no mesmo dia): a estimativa de prazo de entrega,
   com o peso da distância ajustado toda noite, descrita acima. A primeira versão usava o
   carrinho de um e-commerce com o fator do total ajustado automaticamente, e foi trocada porque
   o cenário era irreal: ninguém ajusta sozinho o valor que o cliente paga, e estimativas de
   prazo são ajustadas a partir do histórico em sistemas reais. A versão anterior também
   comprimia a conta numa frase só; a nova mostra a conta passo a passo antes da pergunta. O
   carrinho continua em e5, como conta de treino.
7. **Escopo** (2026-11-06): a unidade fica **fora do conjunto curricular**, como a pré-trilha.
   Ela entra em `allUnits` e não em `units`, então não altera nivelamento, faixas, contadores
   nem a regra de `design-reviewer`. Promover depois custa uma linha em `src/content/index.ts`,
   e a condição para isso é ter armadilhas observadas em alunos, não só propostas.
8. **Revisão externa** (2026-11-09, aceita pelo autor): c1 passa a argumentar pelo colapso de
   neurônios lineares em sequência; o chamado passa a ter job por entrega concluída e diz por que
   a base é fixa; o postmortem de c8 nomeia a causa (learning rate fixo para entradas de escalas
   diferentes) com a conta do limiar; e7 declara o estilo micrograd; a definição de bias deixa de
   depender da ordem da soma.
