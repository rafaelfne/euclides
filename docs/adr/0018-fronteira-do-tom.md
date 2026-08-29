# ADR-0018: Acolhimento é dado derivado, ou não entra

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves (delegado)

## Contexto

O ADR-0016 fechou com um item que deliberadamente não virou checagem:

> **A observar:** a severidade do tom. O princípio 7 é inegociável e não é o mesmo que
> ausência de acolhimento, "é normal errar aqui" é informação verdadeira, não afago. A
> fronteira entre os dois é julgamento, e é do Rafael.

A leitura de aluno tinha dito que o app é severo. A objeção é real e a resposta óbvia é a
errada: amaciar as frases dissolve o princípio 7, que existe porque elogio vago atrapalha
o objetivo desta trilha.

## Decisão

**Toda frase de acolhimento tem de ser uma afirmação verificável sobre dado que o app já
tem. O que não puder ser derivado não entra.**

É o ADR-0017 aplicado ao tom. Lá a figura não podia ser desenho autorado porque nenhuma
checagem confere um caminho SVG; aqui a nota de acolhimento não pode ser frase autorada
porque nenhuma checagem confere "não desanime".

O teste é mecânico e responde sozinho:

| frase | passa? | por quê |
|---|---|---|
| "Não desanime, isso é difícil." | não | não afirma nada sobre nada |
| "Muita gente erra aqui." | não | o app não sabe isso; seria invenção |
| "armadilha prevista · uma das 6 desta unidade" | sim | o catálogo existe e tem tamanho |
| "tentativa 2 · tarefa 1 de 3" | sim | o motor sabe onde está e quanto resta |

A primeira nota derivada é `TrapNote`, e o que ela faz não é consolar: ela informa que
**esta armadilha estava escrita no catálogo antes de o aluno chegar**. O erro deixa de ser
falha pessoal e vira terreno mapeado, sem que nenhuma frase precise dizer isso. O link para
o caderno de armadilhas fecha o movimento, o aluno vai ver a armadilha com nome, ao lado
das outras cinco.

A segunda é o contador de ajuda restante. A tela do traço já mostrava `degrau N de 3`; a de
escolha não mostrava nada, e a ajuda parecia poder acabar a qualquer momento. Saber que a
escada é finita **e onde se está nela** é o que faz o terceiro degrau chegar como limite
anunciado em vez de abandono.

## Opções consideradas

### A, Amaciar as frases severas
"Chegar lá não é o mesmo que dominar" viraria "bom trabalho, e vale revisitar".
**Descartada.** É exatamente o elogio vago que o princípio 7 nomeia. A frase severa está
dizendo uma coisa verdadeira e útil: resolver na quarta tentativa não é o mesmo estado
cognitivo que resolver na primeira, e o critério de domínio já trata os dois de forma
diferente. Suavizar a frase faria a tela mentir sobre o que o app faz.

### B, Um campo `encouragement` no conteúdo
Deixar o autor escrever a nota de acolhimento por unidade.
**Descartada,** e por dois motivos. É a deriva 3 do `CLAUDE.md` num lugar novo: prosa vaga
onde cabia dado. E o autor escreveria "é normal errar aqui" sem que ninguém saiba se é.

### C, Acolhimento derivado
Adotada.

### D, Nada, e manter o registro aberto
**Descartada.** O item estava aberto desde o ADR-0016 sem critério, e um item sem critério
não fecha nunca, é a mesma razão pela qual o ADR-0006 recusou o nível de aviso.

## Análise de trade-off

O custo é que a decisão **não resolve a queixa inteira**, e vale dizer sem enfeite. A
leitura de aluno chamou o app de severo; o que muda aqui é o enquadramento do erro e a
previsibilidade da ajuda, não a densidade da prosa. Um aluno que ache o texto duro vai
continuar achando.

O que a decisão dá é uma regra que sobrevive ao autor seguinte. Sem ela, "suavizar o tom"
é um pedido que cada pessoa atende de um jeito, e daqui a seis unidades o app tem elogio
vago em metade das telas sem que nenhuma checagem perceba.

**O que esta decisão deliberadamente NÃO faz:** não há checagem nova. A regra é de autoria,
não de gate, porque uma checagem que tentasse separar "frase derivada" de "frase autorada"
precisaria de julgamento, e é por essa porta que o nível de aviso volta. Fica no
`/audit-unit`, como a rampa textual do ADR-0016 e a terminologia em prosa do ADR-0011.

## Consequências

- **Fica mais fácil:** responder "dá para acolher mais?" sem reabrir o princípio 7. A
  pergunta vira "que dado o app tem que eu não estou mostrando?".
- **Fica mais difícil:** acolher onde não há dado. Se um lugar precisa de acolhimento e
  nada foi medido ali, a resposta é medir, não escrever.
- **Fica exposto:** o catálogo de armadilhas agora é citado ao aluno pelo tamanho. Isso
  torna mais visível a dívida que já estava registrada, **as armadilhas são candidatas de
  campo, não observação deste aluno.** Uma nota que diz "uma das 6 desta unidade" é
  verdadeira sobre o catálogo e só vale pedagogicamente se o catálogo valer.
- **A observar:** se a nota derivada virar ruído. Ela aparece em toda devolutiva com
  armadilha nomeada, e a repetição pode esvaziá-la.

## Itens de ação

1. [x] `TrapNote`, derivado de `unit.misconceptions`, com link para o caderno
2. [x] Contador de ajuda restante na tela de escolha, no vocabulário do conteúdo (tarefa),
   não no do motor (degrau)
3. [ ] Conferir o catálogo de armadilhas contra alguém usando o app. As 52 foram escritas a
   partir de erros que aparecem em livro e em fórum, e ninguém observou uma pessoa errando
   aqui. Esta decisão torna a dívida mais visível, porque agora a tela cita o catálogo pelo
   tamanho
