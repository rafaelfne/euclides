# ADR-0020: Branco não é hipótese, e a tela reidrata o traço inteiro

**Status:** Aceito
**Data:** 2026-08-29
**Decisores:** Rafael Neves

## Contexto

Três defeitos na tela de traço, e o terceiro só apareceu porque fui conferir os dois
primeiros no navegador em vez de confiar no teste.

1. **A tabela voltava vazia com as tentativas cheias.** `attempts` era reidratado do
   progresso e as células não. O aluno reabria o ciclo devendo três tentativas por um traço
   que ele não podia mais ver.
2. **A devolutiva tratava branco e errado como a mesma coisa.** A mensagem dizia "faltam N
   células" sem dizer qual coluna, e o motor socrático rodava por cima disso.
3. **Havia um vazamento de diagnóstico.** Verificar com qualquer célula em branco não conta
   tentativa, de propósito. Mas a devolutiva mostrada era a da primeira DIVERGÊNCIA DE
   VALOR, que podia estar numa rodada anterior ao branco. Bastava preencher uma célula
   errada, deixar o resto em branco e verificar em série para colher o degrau 2 de graça,
   sem gastar tentativa nenhuma.

## Decisão

**Branco não é hipótese, e a escada socrática não gasta degrau com ele.**

`findFirstBlank` varre o traço inteiro em ordem de leitura e **ganha de qualquer divergência
de valor, em qualquer posição**. Enquanto houver uma célula em branco, a única devolutiva
possível é a do branco: qual coluna, em qual rodada, e o aviso de que aquilo não conta como
tentativa.

O degrau 0 é do motor e não é um degrau novo. Ele não diagnostica nada, não nomeia
armadilha e não consome escalation. Os três degraus do `buildFeedback` continuam três, e o
`CLAUDE.md` continua valendo: não há quarto degrau.

**Valor de enum não vai para a tela.** A coluna divergente era nomeada pela chave (`read`,
`next`), que é código. `buildFeedback` passou a receber `labelOf`, e a tela entrega o rótulo
autorado. É a deriva 4 do `CLAUDE.md`, agora fechada também na devolutiva.

**As células são gravadas no progresso.** `savedRows` é opcional, então o `v1` já gravado
continua válido e a migração da fase seguinte não precisa tratar caso especial.

**Rótulo dentro de navegação sobe para 12px.** 11px serve a um rótulo de seção, que é cromo
ao lado do conteúdo que ele nomeia. Não serve a um destino clicável: quem ainda não sabe o
que procura lê a navegação letra por letra, e é esse leitor que a trilha precisa manter.

## Opções consideradas

### A — Nomear a coluna divergente já no degrau 1
Pedido literal do plano de evolução.
**Descartada para valor errado, adotada para branco.** O degrau 1 diz ONDE quebrou e o
degrau 2 diz QUAL CAMPO; nomear a coluna no primeiro esvazia o segundo e a escada vira dois
degraus com três nomes. Para branco a objeção não existe, porque não há raciocínio a
diagnosticar: a coluna é dado, não diagnóstico.

### B — Recusar a verificação enquanto houver branco
Não mostrar devolutiva nenhuma até a tabela estar cheia.
**Descartada.** Fecharia o vazamento e puniria quem travou de verdade numa célula. Dizer
qual coluna está vazia é informação sobre a própria tabela, não sobre a resposta.

### C — Contar tentativa quando há branco
Fecharia o vazamento pelo outro lado.
**Descartada.** Cobraria tentativa de quem ainda não tentou, e o critério de domínio conta
resolver na primeira. Um branco acidental custaria o domínio da unidade.

### D — Branco vence errado, em qualquer posição
Adotada.

## Análise de trade-off

O custo é uma varredura a mais por verificação, irrelevante para tabelas de quatro a oito
linhas.

O risco é o inverso: com branco sempre ganhando, um aluno que deixa uma célula do fim em
branco de propósito nunca vê o diagnóstico do erro que ele cometeu no começo. Isso é
aceitável e até desejável — a tabela é uma peça só, e um traço incompleto não é uma
hipótese sobre a execução.

## Consequências

- **Fica mais fácil:** voltar a um ciclo. A tela devolve o traço, o resultado e a devolutiva.
- **Fica mais difícil:** colher diagnóstico sem gastar tentativa. Era possível e não é mais.
- **Fica exposto:** o degrau 0 é uma superfície nova na devolutiva. Se um dia ele começar a
  explicar em vez de apontar, virou o quarto degrau por outro nome.
- **A observar:** se o aluno entende que branco não conta. A frase diz, mas dizer não é o
  mesmo que ser entendido.

## Itens de ação

1. [x] `savedRows` no progresso, opcional, e reidratação completa do traço
2. [x] `findFirstBlank`, degrau 0, e branco vencendo valor errado em qualquer posição
3. [x] `labelOf` em `buildFeedback`; nenhuma chave de coluna na tela
4. [x] Cartão por rodada abaixo de 1100px
5. [x] `nav .lbl` e `header .lbl` em 12px; quatro rotas medidas em 4,5:1
