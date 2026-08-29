# ADR-0014: O mapa mostra a taxonomia; a trilha mostra a ordem

**Status:** Proposto
**Data:** 2026-08-28
**Decisores:** Rafael Neves

> Rascunho escrito junto com a correção que ele descreve. O código foi portado para a
> linha principal.

## Contexto

O mapa da unidade agrupa os ciclos por banda taxonômica, contrato, implementações, custo.
Isso é o ADR-0003 aparecendo na navegação, e é bom: a espinha que a trilha ensina é a mesma
que o aluno vê ao abrir a unidade.

O problema é que o mapa era **também** o único caminho. Lido na ordem da tela, o percurso da
unidade de hash é `c0 │ c1 c2 c3 c5 │ c7 │ c4 c6 c8`. O aluno que segue o mapa chega ao ciclo
do rehash antes do ciclo que apresenta a carga, e a primeira frase do rehash é *"Quando α
passa do limite"*. O ciclo de aprofundamento aparecia no meio da trilha principal sem marca de
que é opcional.

Somava-se a isso a tela do ciclo não ter saída: ela terminava no botão de verificar. Não havia
anterior nem próximo, e os tracinhos de progresso do cabeçalho, a única pista visual de que
existe uma sequência, não eram links. Terminado o exercício, o aluno voltava ao mapa e
escolhia o próximo nó à mão, no mapa que está ordenado por banda.

A sequência existia só na ordem do array `cycles`. Nada na interface a expunha.

## Decisão

São duas informações diferentes e cada uma ganha seu lugar.

- **As bandas continuam como estão.** Elas respondem "onde este ciclo vive na taxonomia", que
  é conteúdo, não navegação.
- **O mapa ganha uma trilha "Por onde começar"**, na ordem de `unit.cycles`, numerada, com o
  ciclo de aprofundamento marcado como opcional.
- **A tela do ciclo ganha anterior e próximo**, com o título do destino e não só a seta, e os
  tracinhos do cabeçalho viram links.

## Opções consideradas

### A, Ordenar o mapa por sequência e abandonar as bandas
**Descartada.** O mapa é onde a espinha taxonômica é ensinada; trocá-lo por uma lista
ordenada resolveria a navegação destruindo a única representação visual do ADR-0003.

### B, Numerar os nós dentro das bandas
**Descartada.** Numeração espalhada por três blocos não vira caminho: o aluno ainda precisa
varrer a tela procurando o próximo número, e o salto visual entre bandas continua. Resolve a
ambiguidade e não a continuidade.

### C, Só anterior/próximo, sem mexer no mapa
**Descartada.** Conserta o beco sem saída e deixa a porta de entrada errada: quem chega pelo
mapa continua começando pelo lugar que a tela sugere.

### D, Trilha e bandas convivendo, mais anterior/próximo
**Adotada.** Duas perguntas, duas respostas, no mesmo lugar.

## Consequências

- **Fica mais fácil:** a ordem de leitura passa a ser uma decisão editorial visível. Reordenar
  `cycles` reordena a trilha, e a consequência aparece na tela em vez de ficar implícita.
- **Fica mais difícil:** a ordem do array vira contrato com o aluno. Reordenar ciclos hoje
  invalida silenciosamente o `introducedIn` do glossário, um termo pode passar a ser usado
  antes de introduzido sem que nada reprove.
- **A observar:** com mais de doze ciclos a trilha vira uma parede de botões. Provavelmente
  agrupa por marco, não por banda, decidir quando acontecer.

## Itens de ação

1. [x] Trilha "Por onde começar" no mapa, com aprofundamento marcado
2. [x] Anterior/próximo no ciclo, tracinhos do cabeçalho como links
3. [x] `LAYER_LABEL` exaustivo, a banda deixou de ser escondida pelo aprofundamento
4. [~] Checagem: a metade exata entrou no gate, `introducedIn` e o `introducesTerms` do
       ciclo têm de concordar nos dois sentidos, então reordenar `cycles` sem atualizar o
       glossário reprova. A varredura de prosa **não** entrou, e o motivo está no ADR-0011:
       a unidade de hash tem duas referências antecipadas deliberadas (`buckets` em `c2`,
       `rehash` em `c3`, esta precedida de "Guarde essa frase"), e um gate que não distingue
       antecipação de deriva mandaria apagar as duas. Fica no `/audit-unit`.

> **Nota de port.** O item 3 já estava feito na linha principal antes deste port, pelo mesmo
> motivo e com o mesmo `LAYER_LABEL`. Duas leituras independentes acharam o mesmo defeito.
