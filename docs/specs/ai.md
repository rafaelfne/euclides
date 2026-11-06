# Spec, Unidade 9: Como uma IA decide

**Status:** rascunho, não implementar antes de resolver as perguntas em aberto
**Kind:** `method` (ADR-0012). O assunto não é uma estrutura, é o julgamento que o aluno
produz diante de uma conta com pesos: o que ela devolve, quanto errou e para que lado mexer.

A unidade nasceu da trilha de estudo de SLM do autor, que estuda pelo micrograd (Andrej
Karpathy, repositório público karpathy/micrograd no GitHub). A unidade não é sobre o micrograd: é
sobre o mecanismo que ele implementa, em pseudocódigo, como todo o resto da trilha.

## Problema motivador

**A DEFINIR, com um caso real.** O desenho de tela usou um exemplo inventado: um modelo de
triagem de chamados que soma três sinais com pesos e, depois de um retreino, passa a marcar
quase tudo como urgente, sem que ninguém saiba dizer qual peso mudou. A forma serve, os
números não: a regra `número` exige um número real, e um número inventado no chamado é o
tipo de afirmação que o projeto existe para não fazer.

A pergunta que abre a unidade: **quando um modelo erra, como se descobre qual número mexer,
e para que lado, sem tentar um por um?**

## Critério, o julgamento que a unidade ensina a produzir

| parte | o que ela afirma |
|---|---|
| saída | o valor que a conta devolve para uma entrada, nó por nó |
| loss | um número só que mede o quanto a saída errou |
| gradient por nó | quanto o loss muda se aquele número subir um pouco, com os outros parados |
| direção do passo | para que lado cada peso mexe para o loss cair, e o tamanho do passo |

**Quando cada parte é omitida**, e é daqui que saem as armadilhas:

- sem a **saída** nó por nó: não há valor local para a regra da cadeia multiplicar
- sem o **loss**: "o modelo errou" vira opinião, e não há para onde descer
- sem o **gradient**: mexer em peso vira tentativa, um por um
- sem a **direção do passo**: o gradient é calculado e ninguém usa, ou é usado com o sinal trocado

## Técnicas comparadas

**Gradient numérico**, mexer um número um pouco, refazer a conta inteira e medir a diferença.
Invariante: o empurrão é pequeno o bastante para a conta se comportar como reta naquele trecho.
Custo: uma passada inteira por peso. Com 3 pesos são 4 passadas; com 1 milhão, 1 milhão e uma.
Errada quando: há mais de um punhado de pesos. Serve para conferir a outra técnica.
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

## Ciclos

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | critério | Uma decisão é uma soma com pesos | bias, A DEFINIR o termo de peso |
| c1 | técnica | tanh, o if que não é seco | activation function |
| c2 | critério | Loss: um número para o quanto errou | loss |
| c3 | técnica | Mexer um pouco e medir | gradient |
| c4 | técnica | Regra da cadeia: o impacto atravessa as contas | chain rule |
| c5 | técnica | Backprop em ordem | backpropagation |
| c6 | técnica | O passo: learning rate | learning rate, gradient descent |
| c7 | falha | O gradient que acumula sem zerar | nenhum |
| c8 | falha | Postmortem: o retreino do chamado | nenhum |

Exercícios previstos, a confirmar na implementação:

- **c5, trace:** a passada para trás do carrinho, `total = (preço × quantidade + frete) × fator`,
  com 10, 3, 5 e 2. Colunas: nó, valor (dado), derivada local, gradient. O gabarito sai de um
  gerador novo em `src/lib/reference/`, nunca digitado. O exemplo trabalhado do ciclo usa outra
  conta, `y = a × b + c`, e a checagem `vazamento` confere isso.
- **c7, defeito:** um laço de treino com `zeroGrad()` fora do laço. A alternativa correta não
  pode ser a mais longa (checagem `equilíbrio`).
- Os demais ciclos: **A DEFINIR**.

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

- `derivada-local-como-gradient`, escrever no nó o impacto da última conta e esquecer de
  multiplicar pelo gradient de quem vem depois
- `grad-sobrescrito`, um nó usado duas vezes recebe `=` em vez de `+=`, e a segunda
  contribuição apaga a primeira
- `grad-acumula-entre-rodadas`, esquecer de zerar o gradient entre rodadas de treino
- `valor-como-gradient`, supor que um peso grande tem gradient grande
- `passo-maior-converge-antes`, supor que learning rate maior chega mais rápido
- `decisao-binaria`, procurar o `if` dentro da rede, em vez de ler a saída como pontuação

**A DEFINIR:** quais dessas o público da trilha erra. Mesmo argumento do spec de `tracing`:
catálogo inventado produz distractor plausível e pedagogicamente vazio.

## Critério de domínio (proposta)

Diante de uma conta de até seis nós que nunca viu, sem executar: calcular a saída, produzir
o gradient de cada nó na ordem da passada para trás, e dizer para que lado cada peso precisa
mexer para o loss cair.

O exercício de trace de c5 entra em `requiresClean`.

## Perguntas em aberto

1. **Escopo.** A definição de sucesso do projeto é julgar código gerado por IA, não entender
   como a IA funciona. Esta unidade é tangente a esse objetivo. Proposta: ela entra como a
   pré-trilha, navegável mas fora do conjunto curricular, para não mudar nivelamento, faixas
   e a regra da faixa `design-reviewer` ("as oito unidades dominadas").
2. **Colisão de termo.** `peso` / `weight` já é do glossário, como peso de aresta em
   `graphs.c1`. A checagem `ambiguidade` reprova um segundo dono. Opções: registrar `weight`
   em `OVERLOADED_TERMS` com o peso de aresta como falso amigo, ou usar outra forma canônica.
3. **Matemática.** O público não é matemático. Proposta: nenhuma notação de cálculo na tela,
   derivada apresentada como "impacto de mexer um pouco", e o gradient numérico (c3) antes da
   regra da cadeia (c4). Falta decidir se "derivada" entra no glossário ou fica só na prosa.
4. **Problema motivador real**, com número que se sustente.
5. **Referência ao Python.** O desenho sugere um quadro "no seu micrograd" que manda conferir
   o código do aluno contra a tabela. Isso conversa com o princípio 1 (a implementação é
   exercício), mas cita um projeto externo. Decidir se o quadro fala de "a sua implementação",
   sem nomear linguagem nem repositório.
6. **Ordem na trilha.** A unidade usa trace (unidade 01) e custo (unidade 02). Ela pode vir
   depois da 02 ou só depois da síntese.

## Decisões tomadas

1. `kind: method`. As quatro partes do critério couberam sem campo opcional.
2. Pseudocódigo em pt-BR, como toda a trilha. A versão TypeScript é derivada, nunca escrita
   ao lado.
3. O primeiro exemplo concreto é o carrinho (preço, quantidade, frete, fator), porque soma e
   produto são as duas únicas contas de que a regra da cadeia precisa, e um dev já tem
   referente para elas.
