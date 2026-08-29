# ADR-0012: Duas espinhas, estrutura e método, discriminadas por `kind`

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

Resolve o item de ação 3 do ADR-0003, aberto desde a adoção da espinha taxonômica.

## Contexto

O ADR-0003 tornou contrato → implementação → custo um tipo, e registrou o custo disso na
própria decisão: *"unidades cujo assunto não é uma estrutura não encaixam bem na espinha.
Precisarão de uma banda diferente ou de uma variante do modelo, problema conhecido e
ainda não resolvido."*

O escopo do primeiro módulo tem oito unidades (`docs/discovery/00-problema.md`). Três não
são estruturas: **lógica e teste de mesa**, **análise assintótica**, e a **síntese** final.
Hoje elas não são exprimíveis: o schema exige `adt`, a checagem `espinha` exige o primeiro
ciclo na banda `contract`, e `implementations` passou a exigir duas (ADR-0011). Um terço
do currículo não passa no gate nem em teoria.

Uma correção de leitura, feita ao levantar isto: **ordenação e busca não está no grupo
bloqueado.** Ela parecia estar, e não está, o contrato dela é `ordenar(coleção)`, com
`cannotAnswer` carregando exatamente o que a especificação do problema não promete
("não diz nada sobre a ordem entre elementos iguais" é estabilidade; "não promete memória
constante" é in-place). As implementações concorrentes são os algoritmos. A espinha de
estrutura serve inteira, e serve bem: o movimento do último ciclo de hash, *volte ao
contrato, tudo que ele não promete é onde a estrutura falha*, transfere sem ajuste.

## Decisão

Duas espinhas, uma união discriminada por `kind`. Nenhum campo opcional decide qual.

| | `kind: 'structure'` | `kind: 'method'` |
|---|---|---|
| o que se promete | `adt`, operações que se pode chamar | `criterion`, a forma canônica de um julgamento |
| espaço negativo | `cannotAnswer` | `whenOmitted` |
| como se entrega | `implementations` (mín. 2) | `techniques` (mín. 2) |
| bandas | contrato · implementação · custo | critério · técnica · falha |
| a consequência | o custo pertence à implementação | a falha pertence à técnica |

O paralelo não é decorativo, é a tese. As duas espinhas vão **do que é prometido, pelas
formas concorrentes de entregar, até onde a escolha é a errada**. Por isso um `Cycle` só
serve às duas, o mapa da unidade é o mesmo componente, e a forma do nó no mapa passou a
codificar a *posição* na espinha (quadrado, triângulo, círculo) em vez do substantivo.
Quem aprendeu a ler o mapa na unidade de hash lê o de análise assintótica sem reaprender.

`whenOmitted` é a peça que faz a espinha de método valer a pena. Ela é o espaço negativo
do critério, e é geradora: retirar `regime` de uma afirmação de custo produz
literalmente "hash é O(1)". A lista de omissões de um critério **é** o catálogo de
armadilhas da unidade, do mesmo jeito que a lista de ausências de um contrato é a resposta
do último ciclo.

Duas checagens acompanham:

- **`cobertura`**, toda parte do critério é produzida por alguma técnica, nenhuma técnica
  cita parte inexistente, e todo `whenOmitted` aponta parte que existe. É o análogo exato
  de `custo`, que exige de toda implementação o custo de toda operação do contrato.
- **`espinha`, agora por `kind`**, a banda tem de pertencer ao kind da unidade, o primeiro
  ciclo abre pela banda de abertura daquele kind, e a banda do meio exige `elaborates`.

`cycle.implementationId` virou **`elaborates`**. O nome antigo mentiria metade das vezes, e
dois campos opcionais, um por kind, seria o convite que o ADR-0003 recusou.

`custo` não se aplica a unidade de método, e isso é declarado, não contornado: uma técnica
de derivação não tem complexidade. O princípio 4 continua valendo pela outra metade, que é
`wrongWhen`, o cenário em que aquela derivação é a errada, obrigatório nas duas espinhas.

## Opções consideradas

### A, Campos opcionais no `unit` atual
`adt?`, `implementations?`, bandas somadas ao enum. **Descartada** pelo argumento do próprio
ADR-0003: campo opcional é convite. Pior aqui do que lá, porque enfraqueceria em silêncio o
gate das cinco unidades que *são* estruturas, `implementations` deixaria de ser obrigatório
para todas elas para acomodar três.

### B, Generalizar uma espinha só, renomeando os campos
`adt` → `contract`, `implementations` → `approaches`, e tudo caberia. **Descartada:** obriga
"análise assintótica" a ter duas *abordagens* no mesmo sentido em que hash tem duas
implementações, e o custo por operação continuaria exigido sem existir. Elegante no nome e
falso no conteúdo.

### C, União discriminada por `kind`
Adotada. Cada kind é obrigatório por inteiro no seu próprio formato; a checagem sabe qual
está lendo; nada é opcional.

### D, Tirar do currículo o que não encaixa
**Descartada**, e vale registrar por quê: lógica/teste de mesa e análise assintótica são
pré-requisito declarado das outras seis (`prerequisites` da unidade de hash cita as duas).
Cortá-las para preservar o modelo seria deixar o modelo escolher o currículo.

## Análise de trade-off

O custo é um segundo formato para aprender, e um segundo caminho em toda checagem que olha
a espinha. Mitigado por três coisas: as bandas são três nos dois casos, o `Cycle` é um só,
e o mapa é o mesmo componente com um adaptador de nomes.

O risco real é `kind: 'method'` virar depósito de unidade que ninguém soube modelar. O
antídoto é `criterion.parts` exigir no mínimo duas e `techniques` no mínimo duas: uma
unidade cujo julgamento tem uma parte só, ou que só admite uma forma de derivar, não é
unidade de método, é um ciclo de outra unidade.

## Consequências

- **Fica mais fácil:** as três unidades bloqueadas passam a ser escrevíveis, e o gate vale
  para elas com o mesmo rigor.
- **Fica mais difícil:** inventar uma unidade sem decidir antes o que ela promete. Um
  `criterion` sem `whenOmitted` não compila, e sem omissões declaradas não há armadilhas, 
  ou seja, o modelo cobra o design pedagógico na entrada.
- **A observar:** a síntese (unidade 8) foi classificada como método por eliminação, sem
  spec. Se o critério dela ("escolher estrutura diante de um problema novo") não couber em
  `parts` + `whenOmitted`, é sinal de que existe uma terceira espinha, e ela merece ADR
  próprio em vez de um campo opcional aqui.
- **Não decidido:** nenhuma unidade de método foi escrita. A prova de que o modelo funciona
  é `scripts/test-schema.ts`, que roda uma fixture pelo `checkAll` inteiro. A fixture **não
  é spec e não é conteúdo**, o design pedagógico continua nascendo fora do repo (ADR-0010).

## Itens de ação

1. [x] `unit` como união discriminada; `structureUnit` e `methodUnit`
2. [x] `espinha` e `custo` sensíveis ao `kind`; checagem `cobertura` nova
3. [x] `implementationId` → `elaborates`
4. [x] Mapa e nós do ciclo neutros quanto ao kind (forma = posição na espinha)
5. [x] Checagens extraídas para `src/lib/validate.ts`, com fixture em `scripts/test-schema.ts`
6. [ ] Spec da primeira unidade de método, fora do repo (ADR-0010)
