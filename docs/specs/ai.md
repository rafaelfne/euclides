# Spec, Unidade 9: Como uma IA decide

**Status:** pronto para implementar; as quatro decisões que travavam o conteúdo foram tomadas em 2026-11-06
**Kind:** `method` (ADR-0012). O assunto não é uma estrutura, é o julgamento que o aluno
produz diante de uma conta com pesos: o que ela devolve, quanto errou e para que lado mexer.

A unidade nasceu da trilha de estudo de SLM do autor, que estuda pelo micrograd (Andrej
Karpathy, repositório público karpathy/micrograd no GitHub). A unidade não é sobre o micrograd: é
sobre o mecanismo que ele implementa, em pseudocódigo, como todo o resto da trilha.

## Problema motivador

Decidido em 2026-11-06: o chamado usa o carrinho, com números que a própria unidade verifica.

Um e-commerce calcula o total do pedido como `(preço × quantidade + frete) × fator`, e o
`fator` é ajustado automaticamente toda noite para o total bater com o que o financeiro
fechou. Numa noite, o ajuste levou o fator de 2 para 2,6, e um pedido de 3 itens de 10 reais
com frete de 5 passou de 70 para 91 reais. Ninguém mexeu no código. O financeiro tinha fechado
77 para esse pedido, então o fator que zerava o loss era 2,2: o ajuste foi para o lado certo e
passou do ponto.

A pergunta do chamado: **qual número o ajuste mexeu, por que aquele, e por que tanto de uma
vez?** O ajuste automático é descida de gradient sobre um peso só, e o salto de 2 para 2,6
numa noite é um passo grande demais. O postmortem (c8) volta a isso.

A pergunta que abre a unidade: **quando um resultado erra, como se descobre qual número mexer,
e para que lado, sem tentar um por um?**

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
| c1 | critério | tanh, o if que não é seco | activation function |
| c2 | critério | Loss: um número para o quanto errou | loss |
| c3 | técnica | Mexer um pouco e medir | gradient |
| c4 | técnica | Regra da cadeia: o impacto atravessa as contas | regra da cadeia, impacto local |
| c5 | técnica | Backpropagation em ordem | backpropagation, passada para frente, passada para trás |
| c6 | técnica | O passo: learning rate | learning rate, gradient descent |
| c7 | falha | O gradient que acumula sem zerar | nenhum |
| c8 | falha | Postmortem: o fator que saltou numa noite | nenhum |

c1 mora na banda critério, e não na técnica como a primeira versão deste spec dizia: ele não
elabora nenhuma das duas técnicas, e a tanh é parte da saída do critério.

O gradient sempre diz de quê é: "o gradient do fator no total", "o gradient do peso no loss".
No carrinho, o gradient do fator no total é o tamanho do pedido antes do fator; no loss, é
isso vezes 2 × (total − alvo).

Exercícios, um por ciclo:

- **e0, escolha:** a pontuação de um filtro antifraude, `p = 0,5 × v + 3 × n − 4`. A conta
  devolve 2, não "bloquear".
- **e1, escolha:** if seco contra tanh quando a soma vai de 0,2 para 0,3.
- **e2, escolha:** dois modelos de prazo de entrega; a soma com sinal declara A perfeito, e o
  loss, 18 contra 2, escolhe B.
- **e3, escolha:** `p = w1 × x1 + w2 × x2 + b`, empurrão de 0,1 em cada; o peso menor move mais.
- **e4, escolha:** tarifa de corrida, `km × 2` e depois `× 1,5`; 1 km a mais sobe o total em 3.
- **e5, trace:** a passada para frente e a passada para trás do carrinho,
  `total = (preço × quantidade + frete) × fator`, com preço 4, quantidade 5, frete 6 e fator 3,
  e os dois nós do meio nomeados `subtotal = preço × quantidade` e `base = subtotal + frete`.
  Nem os números do chamado (10, 3, 5, 2), nem os do exemplo trabalhado de c5, que usa
  `y = w × x + b` e `y = a × a`. Linhas na ordem da passada para trás: total, fator, base,
  frete, subtotal, quantidade, preço. Colunas: ordem, nó, valor, impacto local, gradient. O
  gabarito sai de `src/lib/reference/ai.ts`, nunca digitado, e a checagem `vazamento` confere a
  prosa de c0 a c5 contra ele.
- **e6, escolha:** `loss = (w − 3)²` em 5, learning rate 1,5 contra 0,1; o passo maior passa do
  ponto e o loss vai a 16.
- **e7, defeito:** um laço de treino em que `zeroGrad()` fica entre `backward()` e a linha que
  muda o peso. O passo lê o gradient já zerado: nenhum peso muda e o loss fica igual em toda
  rodada. c7 ensina o mecanismo (a passada para trás soma ao que sobrou da rodada anterior) e
  não diz onde a chamada de zerar deve ficar; o exercício cobra essa leitura. O enunciado não
  descreve o defeito, e o diff marca a função inteira, para não apontar a linha. A correta não
  é a mais longa nem a mais curta.
- **e8, escolha:** com o pedido de 35, o alvo 77 e o loss `(total − 77)²`, qual fator zera o
  loss: 2,2. O postmortem de c8 diz que o passo passou do ponto e não diz qual era o ponto.

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
2. Pseudocódigo em pt-BR, como toda a trilha. A versão TypeScript é derivada, nunca escrita
   ao lado.
3. O primeiro exemplo concreto é o carrinho (preço, quantidade, frete, fator), porque soma e
   produto são as duas únicas contas de que a regra da cadeia precisa, e um dev já tem
   referente para elas.
4. **Termo de peso** (2026-11-06): `weight` entra em `OVERLOADED_TERMS`. O peso de aresta
   (`graphs.c1`) continua dono de `peso` e `weight`, e declara como falso amigo o termo novo
   `peso do neurônio`, que estreia em c0. Assim a checagem `ambiguidade` passa e o aluno é
   avisado nos dois lugares.
5. **Notação** (2026-11-06): nenhuma notação de cálculo na tela, nem `∂` nem a palavra
   "derivada" como termo do glossário. O gradient é "quanto o resultado muda se este número
   subir um pouco", e o gradient numérico (c3) vem antes da regra da cadeia (c4). A coluna do
   trace se chama "impacto local", não "derivada local", e "impacto local" é verbete do
   glossário, estreando em c4.
6. **Problema motivador** (2026-11-06): o carrinho, com o fator ajustado automaticamente,
   descrito acima.
7. **Escopo** (2026-11-06): a unidade fica **fora do conjunto curricular**, como a pré-trilha.
   Ela entra em `allUnits` e não em `units`, então não altera nivelamento, faixas, contadores
   nem a regra de `design-reviewer`. Promover depois custa uma linha em `src/content/index.ts`,
   e a condição para isso é ter armadilhas observadas em alunos, não só propostas.
