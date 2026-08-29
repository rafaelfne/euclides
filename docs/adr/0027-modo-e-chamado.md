# ADR-0027: O modo que eu tinha descartado, e o chamado que fecha

**Status:** Aceito
**Data:** 2026-08-29
**Decisores:** Rafael Neves

## Contexto

Duas coisas ficaram abertas depois do ADR-0019, e uma delas eu tinha fechado errado.

## Decisão

### O alternador Iniciante / Revisão volta, e o ADR-0019 estava errado

O ADR-0019 descartou este alternador com o seguinte argumento: depois que a frase de
abertura, o exemplo trabalhado e o diagrama viraram incondicionais, o modo iniciante não
teria o que mostrar, e um modo que só pode **esconder** não é um modo.

**O argumento estava incompleto.** Ele tratava esconder como perda, e esconder só é perda
quando quem esconde não é o leitor. Para quem já julgou aquele conteúdo, o exemplo aberto e
o diagrama rodando são ruído entre a prosa e o exercício, e recolher é ganho.

O que muda entre os modos:

| | iniciante | revisão |
|---|---|---|
| exemplo trabalhado | aberto | recolhido |
| diagrama | roda uma passada ao abrir | parado, no último passo |
| "errar aqui é o esperado" | nos 3 primeiros ciclos da unidade 01 | não aparece |

**A frase de abertura continua incondicional nos dois modos.** Ela é a peça de rampa que
importa, e o ADR-0019 continua valendo nessa parte: ela não é opcional para ninguém.

A frase de conforto é **derivada**, não autorada: o número de armadilhas vem do catálogo da
unidade. É o ADR-0018 valendo, e é por isso que ela pode existir.

`prefers-reduced-motion` desliga a passada automática, e a figura abre inteira. Quem pediu
menos movimento não recebe menos informação.

### Toda unidade fecha o chamado que abriu

Cada unidade abre com um incidente concreto em `motivatingProblem`: a consulta que foi de
40 ms para 4 s, a fila de jobs que travou, a tela de permissões que nunca carregava. Nenhuma
voltava a ele.

**Uma história pela metade é pior que nenhuma**: o aluno guarda a abertura e nunca recebe a
resposta.

O `postmortem` é campo do último ciclo, com quatro partes que são as mesmas nas oito
unidades, de propósito — é o roteiro que ele deve levar para a próxima revisão de verdade:
o incidente retomado, qual armadilha estava ali, qual afirmação de custo faltava, e o que
teria pego isso.

A checagem `chamado` confere os dois lados: sem postmortem no último ciclo reprova, e com
postmortem em qualquer outro também. **Fechar o chamado no meio da unidade seria fechá-lo
antes de o aluno ter as ferramentas para fechá-lo.** E o `trapId` tem de existir no catálogo
da unidade.

## Opções consideradas

### A — Manter o alternador descartado
**Descartada.** O argumento do ADR-0019 tratava o leitor como quem sofre a escolha, não como
quem a faz.

### B — Três modos, com um intermediário
**Descartada.** Dois modos já são um estado que o autor precisa considerar em cada peça
nova. Um terceiro dobra isso para caber uma diferença que ninguém pediu.

### C — Postmortem como parágrafo na prosa
**Descartada.** As quatro perguntas são o roteiro, e um roteiro precisa de forma estável
para ser reconhecido na oitava vez. Em prosa livre, cada unidade fecharia diferente.

### D — Postmortem em todos os ciclos de fechamento de banda
**Descartada.** O chamado é da unidade, não da banda.

## Análise de trade-off

O custo do modo é que toda peça nova de tela agora tem duas versões possíveis, e alguém tem
de decidir qual. O custo do postmortem é autoria: oito, escritos à mão, e o `trapId` amarra
cada um ao catálogo.

O risco do modo é a divergência: o iniciante ganha uma peça, o de revisão não recebe, e em
seis meses são duas telas diferentes. A defesa é a tabela acima ficar curta.

## Consequências

- **Fica mais fácil:** ler o mesmo ciclo pela segunda vez.
- **Fica mais difícil:** acrescentar peça de tela sem decidir em qual modo ela vive.
- **Fica exposto:** o postmortem é prosa autorada e nenhuma checagem confere se ele diz a
  verdade sobre o incidente. Só que o `trapId` existe.
- **A observar:** se alguém troca de modo. Se ninguém trocar, o ADR-0019 estava certo e este
  é que erra.

## Itens de ação

1. [x] `ModeToggle` no cabeçalho do ciclo, persistido em `profile.mode`
2. [x] Exemplo trabalhado recolhido em revisão; `autoPlay` no `Stepper` só em iniciante
3. [x] Frase de conforto derivada, nos 3 primeiros ciclos da unidade 01
4. [x] `postmortem` no schema e a checagem `chamado`, conferindo os dois lados
5. [x] Os 8 postmortems escritos, cada um amarrado a uma armadilha do catálogo
