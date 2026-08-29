# Spec, Unidade 1: Lógica e teste de mesa

**Status:** spec, não implementada
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

`Traço de execução`, o estado do programa a cada passo.

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

## Ciclos (proposta)

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | critério | O que é saber o que um código faz | traço de execução, estado |
| c1 | técnica | Simular passo a passo | invariante de laço *(a definir)* |
| c2 | técnica | A propriedade que sobrevive a cada passo | invariante |
| c3 | falha | Onde a leitura quebra: fronteira e caso vazio | caso-base, off-by-one |
| c4 | falha | O laço não roda n vezes | *(a definir)* |

**A DEFINIR**, o número de ciclos. Cinco é o mínimo que cobre as duas técnicas e as duas
famílias de falha; se a unidade de entrada precisa ser mais lenta que as outras (e
provavelmente precisa, porque é a primeira), ela vira sete ou oito.

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
função da condição**, produzir o traço dos três primeiros passos e do último, e dizer o
que a função devolve para a entrada vazia.

**A DEFINIR**, quais exercícios entram em `requiresClean`.

## Perguntas em aberto

1. **É unidade de método mesmo?** ADR-0012 diz que sim, mas esta é a primeira aplicação da
   espinha nova e o spec é o lugar de conferir. Se `criterion.parts` não couber, o ADR-0012
   registra que isso é sinal de uma terceira espinha, não de um campo opcional.
2. **Esta unidade estreia o exercício de traço para o aluno.** O ADR-0013 declarou o formato
   e a legenda das letras porque o aluno de hash chegava sem eles, aqui ele chega sem *nada*.
   O primeiro traço da trilha precisa de tratamento especial, ou as convenções declaradas
   bastam?
3. **Recursão entra aqui ou fica para árvores?** ADR-0003 cita recursão como assunto sem
   estrutura central. Traçar uma chamada recursiva é a mesma técnica com outra pilha, mas o
   custo cognitivo é outro.
4. **Qual linguagem nos exercícios de bug hunt?** A unidade de hash usa JavaScript. A
   fronteira de idioma cobre pseudocódigo e sandbox, não a linguagem do `kind: 'bug'`.
