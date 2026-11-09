# Spec, Unidade 1: Lógica e execution trace

**Status:** implementada e revisada
**Kind:** `method` (ADR-0012). O assunto não é uma estrutura: é o julgamento que o aluno
tem de produzir diante de um trecho de código.

Esta é a unidade de entrada da trilha e a que o objetivo do projeto nomeia mais de perto, 
"dizer o que o código faz **sem executar**" é literalmente o que ela treina.

## Problema motivador

Um pull request de trinta linhas, gerado por IA, que passa nos testes existentes. A
pergunta do revisor não é "compila?", é "o que isto faz quando a lista tem um elemento
só, e o que faz quando ela está vazia?".

O que o aluno faz hoje: roda. Coloca um `print`, executa, olha a saída. Funciona, e é
exatamente o hábito que a trilha desfaz, porque em revisão de código não há execução, e
porque quem só sabe verificar executando não sabe dizer *por que* o resultado é aquele.

A pergunta que abre a unidade: **como se sabe o que um laço faz sem rodá-lo?**

## Critério, o julgamento que a unidade ensina a produzir

`Execution trace`, o estado do programa a cada passo.

| parte | o que ela afirma |
|---|---|
| variáveis observadas | quais nomes carregam o estado que decide o resultado |
| estado por passo | o valor de cada uma ao fim de cada iteração |
| condição que governa | a expressão que decide se há um próximo passo |
| saída | o valor devolvido, e a condição sob a qual ele é devolvido |

**Quando cada parte é omitida**, e é daqui que saem as armadilhas:

- sem a **condição que governa**: "o laço roda n vezes" (roda enquanto a condição valer, e
  descobrir quantas é o trabalho)
- sem o **estado por passo**: "no fim a soma é o total" (afirmação sobre o fim, derivada de
  nada)
- sem as **variáveis observadas**: o aluno traça o índice e não percebe que o acumulador
  também mudou
- sem a **saída**: "funciona", sem dizer o que devolve quando a coleção está vazia

## Técnicas comparadas

**Simulação passo a passo**, escrever a tabela, linha por linha.
Invariante: só vale se cada passo for derivado do anterior, nunca adivinhado.
Errada quando: o número de passos depende da entrada e é grande. Use invariante.
Âncora: é o que se faz no quadro branco quando duas pessoas discordam sobre um laço.

**Raciocínio por invariante**, declarar a propriedade que vale antes e depois de cada
passo, e mostrar que o passo a preserva.
Invariante: a propriedade tem de valer na entrada do laço, não só no fim.
Errada quando: o aluno ainda não consegue enunciar a propriedade. Simule primeiro; a
invariante costuma aparecer da tabela.
Âncora: é o que um comentário `// aqui a lista à esquerda de i já está ordenada` está
tentando dizer, e quase sempre diz mal.

**A DEFINIR**, duas técnicas bastam para a unidade de entrada, ou falta uma terceira
(execução simbólica, com faixas em vez de valores)? Ela é a que mais transfere para
revisão de código real, e é a mais difícil de exercitar com espaço de erro fechado.

## Ciclos

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | critério | O que é saber o que um código faz | execution trace, estado |
| c1 | critério | A condição que decide se há próxima rodada | condição de guarda |
| c2 | técnica | Simular passo a passo | nenhum |
| c3 | técnica | A propriedade que sobrevive a cada rodada | invariante de laço |
| c4 | falha | A fronteira, e a entrada que ninguém testou | off-by-one, caso vazio |
| c5 | falha | O laço não roda n vezes | nenhum |
| c6 | falha | O que não chega a ser avaliado | curto-circuito |

Sete ciclos mantêm a unidade de entrada mais lenta que as seguintes. O segundo exercício de
trace fica em c5: o aluno produz as sequências de índices de dois laços sob a mesma condição,
em vez de reconhecer a contagem correta entre alternativas.

## Armadilhas conhecidas

Propostas, e cada uma precisa da sua leitura antes de virar catálogo:

- `laco-roda-n-vezes`, contar iterações pelo tamanho da coleção em vez de pela condição
- `off-by-one`, a fronteira do índice, na leitura e não na escrita
- `estado-nao-observado`, traçar o índice e esquecer o acumulador
- `vazio-nao-considerado`, nunca perguntar o que acontece com zero elementos
- `mutacao-durante-iteracao`, remover da coleção enquanto a percorre
- `curto-circuito`, supor que os dois lados de um `e`/`ou` são avaliados

**A DEFINIR, e é a decisão mais importante do spec:** quais dessas seu aluno de fato erra.
O catálogo de armadilhas é antecipação em tempo de autoria (ADR-0002); inventá-lo a partir
do que é comum "em geral" produz distractor plausível e pedagogicamente vazio, que é
justamente o que o validador não consegue pegar.

## Critério de domínio (proposta)

Diante de um laço de até vinte linhas que nunca viu, sem executar e em menos de cinco
minutos: nomear as variáveis que carregam o estado, dizer quantas vezes o corpo roda **em
função da condição**, produzir o trace dos três primeiros passos e do último, e dizer o
que a função devolve para a entrada vazia.

`tracing.e2` e `tracing.e5` entram em `requiresClean`: um cobra o estado completo por rodada;
o outro cobra a sequência produzida pela condição e pelo passo.

## Decisões tomadas

1. A unidade usa `kind: method`; as quatro partes do critério couberam sem campo opcional.
2. O primeiro trace declara o formato de cada coluna e mostra as convenções antes da tabela.
3. Recursão fica fora desta unidade e estreia quando a trilha já estabeleceu o trace iterativo.
4. O bug hunt usa JavaScript, identificado na própria tela.
5. A sonda de nivelamento usa `tracing.e4`, que cabe no limite de quatro minutos; `tracing.e5`
   deixa de ser escolha porque faz parte do critério de domínio.

## Decidido na revisão externa

1. O postmortem nomeia o lado certo: em `tracing.e6` quem quebra é o primeiro lado,
   `itens[i].ativo`, avaliado antes da conferência de posição.
2. A afirmação que faltava é escrita como afirmação, não como formulário: o que a
   função devolve para a coleção vazia, sem ler posição nenhuma.
3. O exemplo de c5 mostra o valor inicial de cada laço. `i ← i × 2` começando em 0
   nunca sai do 0, e o laço não para; o valor inicial é parte do passo.
4. O aviso de que errar é esperado aparece só no primeiro ciclo. Repetido em três
   ciclos seguidos, virava ruído.
