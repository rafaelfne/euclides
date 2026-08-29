# ADR-0029: Uma palavra pertence a uma coisa só, e isso vale para o nome das checagens

**Status:** Aceito
**Data:** 2026-08-29
**Decisores:** Rafael Neves

## Contexto

A deriva 1 do `CLAUDE.md` diz: *bilinguismo sem regra, um mesmo documento com "encadeamento"
e "chaining"*. O glossário existe para arbitrar isso, e ele arbitra bem os termos de
computação.

Só que **eu passei 29 ADRs inventando vocabulário e nunca submeti nenhum ao glossário.**
Espinha, banda, sonda, chamado, faixa, selo, bestiário, degrau, incidente, marca. Alguns
foram registrados na Fase 1; a maioria dos que nasceram das fases 2 a 7 não.

Uma revisão do jargão encontrou quatro colisões, e três delas eram reais.

## O que estava quebrado

### `sondagem` significava duas coisas

O glossário registra `probing` com "sondagem" entre os apelidos: é a política de resolução
de colisão da unidade 04. E eu chamei o nivelamento de entrada de sondagem, com rota
`/sondagem` e uma checagem homônima.

O aluno leria "sondagem" na unidade 04 e na home, sobre coisas sem relação nenhuma.

### `faixa` significava duas coisas

`app.band` tinha "faixa" como apelido de **banda**, que é onde o ciclo fica no mapa. E eu usei
"faixa" no ADR-0022 para o nível do aluno, de Leitor a Árbitro.

### `traço de execução` tinha dois verbetes

`execution-trace` nasce em `tracing.c0` desde o scaffold. Na Fase 1 eu acrescentei
`app.trace` com o mesmo canônico, **sem procurar se já existia**. Duas definições, dois
`isNot`, e o glossário arbitrando contra si mesmo.

### Cinco checagens tinham nome de outra coisa

O relatório do validador cita a checagem pelo nome, e **"FALHA síntese" lia como se a unidade
08 tivesse falhado**. `revisão` era o nome de uma checagem, de um modo de leitura e de um
apelido de revisita. `instância` em computação é objeto.

## Decisão

### As checagens foram renomeadas

| antes | agora | por quê |
|---|---|---|
| `síntese` | `abertura` | "Síntese" é o título da unidade 08 |
| `instância` | `número` | "instância" em computação é objeto; o que ela cobra é um número |
| `revisão` | `desfaz` | já era o modo de leitura e o apelido de revisita |
| `sondagem` | `sonda` | "sondagem" é o apelido de probing |
| `chamado` | `incidente` | "chamado" era invenção minha; "incidente" é o que os ADRs já usavam |

`abertura` e `número` ficaram melhores como nome, não só menos ambíguos: elas dizem o que
cobram.

### Os apelidos ambíguos saíram

`probing` perdeu "sondagem" e ganhou "sondagem linear". `app.band` perdeu "faixa".
`app.revisit` perdeu "revisão". `vertex` perdeu "nó" e "node", que são de `node` — e o falso
amigo dele já explicava a coincidência, então o apelido só duplicava a informação no lugar
errado.

`app.trace` foi **removido**, e o falso amigo de observabilidade que só existia nele passou
para `execution-trace`, que é o verbete que nasce num ciclo.

### Seis termos do produto entraram no glossário

`faixa`, `sondagem`, `selo de domínio`, `bestiário`, `postmortem`, `degrau`. Todos com
`isNot`, e `sondagem` com o falso amigo do probing, que é a colisão registrada em vez de
evitada.

### A checagem `ambiguidade`

Dois eixos: forma reivindicada por dois termos, e nome de checagem igual a um termo. Foi ela
que achou os três problemas depois de eu ter corrigido os que enxerguei à mão — inclusive um
que **eu mesmo criei durante esta correção**, ao dar à checagem renomeada o nome que eu
tinha acabado de registrar no glossário.

## Opções consideradas

### A — Renomear só o que colide, sem checagem
**Descartada.** Foi o que eu tentei primeiro, e a checagem pegou uma colisão nova que eu
tinha acabado de introduzir. Sem ela, a próxima palavra inventada repete o ciclo.

### B — Prefixar as checagens, tipo `check:abertura`
**Descartada.** Resolve a colisão e piora o relatório, que é lido por pessoa.

### C — Deixar o nome das checagens fora do escopo do glossário
**Descartada.** O nome aparece no relatório do gate, que é a superfície mais lida do
projeto depois das telas.

## Análise de trade-off

O custo é que renomear checagem quebra citação em documento. Cinco ADRs e o `CLAUDE.md`
foram atualizados, e o `docs:check` não pega isso porque ele confere caminho de arquivo, não
nome de checagem.

O risco é a checagem virar burocracia: um termo novo pode legitimamente ter o nome de outra
coisa em outro contexto, e é para isso que `falseFriends` existe. A checagem não proíbe a
coincidência, proíbe **a coincidência não declarada**.

## Consequências

- **Fica mais fácil:** ler o relatório do validador sem confundir checagem com unidade.
- **Fica mais difícil:** inventar palavra. É o objetivo.
- **Fica exposto:** o vocabulário dos ADRs continua fora do glossário. Espinha, deriva,
  fresta, andaime e gate não estão registrados, e são metáfora de prosa, não termo de tela.
  A linha que separa os dois é julgamento.
- **A observar:** se um termo do app precisar mesmo colidir com um de computação. Aí a saída
  é `falseFriends`, e não renomear.

## Itens de ação

1. [x] Cinco checagens renomeadas; descrições realinhadas ao novo id
2. [x] Apelidos ambíguos removidos de `probing`, `app.band`, `app.revisit` e `vertex`
3. [x] `app.trace` removido como duplicata; falso amigo migrado para `execution-trace`
4. [x] Seis termos do produto registrados, com `isNot`
5. [x] Checagem `ambiguidade`, nos dois eixos, com as duas injeções conferidas
6. [ ] Decidir se o vocabulário de metáfora dos ADRs entra em algum lugar
