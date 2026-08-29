# ADR-0024: O bestiário, o selo, e a fila que conta voltas em vez de dias

**Status:** Aceito
**Data:** 2026-08-29
**Decisores:** Rafael Neves

## Contexto

O `/traps` listava as 52 armadilhas e marcava as ativadas. Faltavam duas coisas: o estado do
meio não tinha saída, e não havia nada que trouxesse o aluno de volta depois.

Repetição espaçada é a peça onde quase todo app de estudo escorrega para a gamificação:
sequência de dias, chama que apaga, aviso diário. Todas sobem por abrir o app.

## Decisão

### Três estados, e a única saída do meio é a volta limpa

`nao-encontrada` · `ativada` · `desarmada`.

**Ler a explicação não desarma nada.** A transição de `ativada` para `desarmada` exige que o
mesmo exercício que a ativou volte limpo depois do intervalo. É a distinção que separa este
caderno de uma lista de leitura, e é a primeira asserção de `scripts/test-traps.ts`.

`ativada` não é marca de vergonha. O ADR-0018 já tinha decidido que a armadilha é terreno
previsto, e o bestiário é a mesma afirmação com o catálogo inteiro à vista: 52 nomes, e os
que você encontrou estão marcados porque alguém os escreveu antes de você chegar.

### O selo é carimbo de aprovação de PR, não troféu

A metáfora é o argumento. Um troféu premia ter feito; um carimbo de aprovação diz que alguém
leu o suficiente para se responsabilizar. É a coisa que a trilha inteira treina.

Ele acende no critério, ganha uma marca a mais na consolidação, e **não existe selo de
participação**: em `nao-visitada` e `em-curso` o carimbo é um contorno tracejado e vazio.

### A fila conta voltas honradas, nunca dias abertos

Intervalos de 3, 10 e 30 dias. Um exercício **sobe de degrau quando volta limpo** e volta ao
primeiro degrau quando volta sujo. Esperar não move nada, e abrir o app não move nada.

Só entra na fila o que já saiu limpo alguma vez: revisitar o que nunca foi resolvido não é
revisita, é o exercício ainda em aberto, e ele já está no ciclo esperando.

## Opções consideradas

### A — Sequência de dias, com chama
**Descartada.** Sobe por login. Se houver sequência algum dia, ela conta revisitas honradas,
que é o que a fila já faz.

### B — Desarmar ao abrir o ciclo de revisão
**Descartada.** É contador de páginas com outro nome.

### C — Notificação diária
**Descartada.** Não há servidor e não haverá, e uma notificação que o navegador emite sozinho
seria a mesma pressão pela porta dos fundos.

### D — Intervalos ajustados por desempenho, tipo SM-2
**Descartada por ora.** A curva do SM-2 é calibrada para cartões de memorização, e o que
está sendo revisitado aqui é um julgamento de dez minutos. Três degraus fixos são honestos
sobre o que se sabe; uma fórmula com fator de facilidade fingiria uma precisão que não existe.

## Análise de trade-off

O custo é que **desarmar é lento**: exige errar, esperar o intervalo e voltar limpo. O
contador vai andar devagar e isso é a mecânica funcionando.

O risco é a fila virar cobrança. A defesa está no texto e na ausência: a fila não persegue
ninguém, não notifica, e some quando está vazia.

## Consequências

- **Fica mais fácil:** saber o que voltar a fazer, e por quê.
- **Fica mais difícil:** simular progresso. Nenhum dos três estados sobe sozinho.
- **Fica exposto:** os intervalos são um chute informado. Três degraus fixos, sem evidência
  de que 3, 10 e 30 sejam melhores que outros três números.
- **A observar:** se alguém volta. Se a fila encher e ninguém a esvaziar, o problema não é a
  fila, é a trilha não estar dando motivo para voltar.

## Itens de ação

1. [x] `trapBook` com os três estados; `/traps` vira bestiário com filtro e contagem
2. [x] Destaque que decai na armadilha recém-ativada, reaproveitando `m-decay`
3. [x] `MasterySeal`, aceso no critério, com marca extra na consolidação
4. [x] `dueRevisits` com degraus que sobem por volta honrada; `/revisitas` e o aviso na home
5. [x] `scripts/test-traps.ts`, com "ler não desarma" e "esperar não pula degrau"
6. [ ] Revisar os intervalos quando houver uso real para olhar
