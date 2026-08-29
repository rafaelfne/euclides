# Euclides — contrato do projeto

Trilha de fundamentos de computação para um desenvolvedor júnior reconstruir base
técnica com um fim explícito: **julgar código gerado por IA sem executá-lo**.

O nome é o método. Nos *Elementos*, nada é assumido que não esteja declarado. Aqui
vale igual: complexidade não existe sem regime e hipóteses, termo não existe sem o
que ele não é, notação não existe sem sua convenção.

## Princípios inegociáveis

1. **Agnóstico a linguagem.** Conceitos em pseudocódigo, diagramas e invariantes. A
   implementação é exercício, não é o conteúdo.
2. **Prática deliberada acima de consumo.** Toda unidade termina em exercício com
   critério objetivo de verificação.
3. **Nunca entregue a resposta de um exercício.** Aponte onde o raciocínio quebrou e
   faça a pergunta que leva à correção.
4. **Complexidade sempre.** Para cada estrutura: custo de tempo, custo de espaço, e o
   cenário em que aquela escolha é a errada.
5. **Do concreto ao abstrato.** Primeiro o problema que a estrutura resolve, depois a
   estrutura.
6. **Ancorar no cotidiano.** Ligue o conceito a algo do trabalho real: consulta lenta,
   cache, fila, índice.
7. **Honestidade de nível.** Se uma resposta está superficial, diga. Elogio vago
   atrapalha o objetivo desta trilha.

## As regras operacionais

**O validador é a autoridade, não o seu julgamento.** `npm run validate` roda antes de
todo build. A lista de checagens é declarada em `CHECKS`, no topo de
`scripts/validate-content.ts`, e o relatório é derivado dela — não cite um número, cite a
lista. Não há nível de aviso: aviso é regra que ninguém cumpre. Se o validador reprova, o
conteúdo está errado; não relaxe a checagem.

`npm run docs:check` cobre o que fica fora do gate de conteúdo: todo caminho de arquivo
citado em `docs/` e `.claude/` precisa existir. Terminologia em prosa não entra aí — fica
no `/audit-unit`, e o ADR-0011 diz por quê.

**Terminologia: a forma canônica é a que o aluno vai encontrar no mundo.** Documentação,
código-fonte, Stack Overflow. O glossário em `src/content/glossary.ts` arbitra cada caso
uma vez. Nunca invente um termo; se precisar de uma palavra que não está lá, registre-a
com `isNot` e ponto de introdução antes de usá-la.

**Figura é dado, nunca desenho.** O ciclo declara a afirmação — as formas das curvas, os
fatores, a faixa — e o componente emite o SVG. Um caminho autorado afirma coisas que
nenhuma checagem confere, e cor autorada não sobrevive a redesenho. ADR-0017.

**Acolhimento é afirmação verificável, ou não entra.** O princípio 7 proíbe elogio vago, não
proíbe informação verdadeira sobre dificuldade. A diferença é mecânica: "muita gente erra
aqui" o app não sabe; "uma das 6 armadilhas desta unidade" o catálogo prova. Não existe
campo de encorajamento no conteúdo, e nenhuma frase de conforto é autorada — o que consola
é o dado. ADR-0018.

**A prosa do ciclo aceita `**assim**` e mais nada.** É a única marcação interpretada, e a
checagem `ênfase` reprova asterisco desemparelhado ou usado fora do `body` de um ciclo.
Antes disso a prosa era texto puro e os asteriscos apareciam literais na tela.

**Fronteira de idioma:**

| camada | idioma | exemplo |
|---|---|---|
| código, rotas, identificadores | inglês | `ExecutionTrace`, `/units/hash` |
| conteúdo autorado | pt-BR | enunciados, prosa, rubricas |
| pseudocódigo | pt-BR | `inserir(tabela, chave, valor)` |
| código do sandbox | inglês | `insert(table, key, value)` |

Valor de enum é código; rótulo de tela é conteúdo. Nunca renderize um enum direto.

**Duas espinhas, escolhidas por `kind`.** Unidade sobre uma estrutura promete operações:
`adt` e `implementations`, bandas contrato · implementação · custo. Unidade sobre um método
promete um julgamento: `criterion` e `techniques`, bandas critério · técnica · falha. As
duas vão do que é prometido, pelas formas concorrentes de entregar, até onde a escolha é a
errada — por isso o `Cycle` é um só e o mapa é o mesmo. ADR-0012 tem a tabela e o que foi
descartado. Não há campo opcional decidindo o formato; se você precisa de um, o kind está
errado.

**A alternativa correta não pode se denunciar pelo formato.** A ordem é embaralhada pelo
id do exercício, e a justificativa mora em `why`, revelada depois de resolver — nunca
colada no texto da alternativa. A checagem `equilíbrio` reprova a correta que for a mais
longa. Um exercício que se acerta pelo comprimento zera o sinal do painel de lacunas, que
é o que mede se o aluno aprendeu.

**Nenhuma devolutiva contém a resposta.** Ela contém a *tarefa que produz* a resposta.
`buildFeedback` em `src/lib/socratic.ts` tem três degraus e nenhum revela o valor
correto. Não adicione um quarto degrau.

Dois nomes distintos, porque já se atropelaram: **degrau** é do motor, igual para toda
armadilha, e o autor não escreve nenhum; **escalation** é do conteúdo — de uma a três
tarefas dentro do degrau 3, uma por tentativa. Esgotada a escalation, o motor encerra o
exercício. Ajuda ilimitada é resposta entregue devagar.

## Como o conteúdo nasce

Fluxo híbrido, decidido em ADR-0010:

1. O design pedagógico de cada unidade é discutido fora do repo e vira um **spec**
   versionado em `docs/specs/`.
2. Dentro do repo, `/implement-unit <id>` escreve conteúdo, exercícios e implementação
   de referência **contra aquele spec**.
3. `/audit-unit <id>` audita terminologia, carga cognitiva e cobertura de armadilhas.

Não invente escopo de unidade sem spec. Se o spec estiver incompleto, diga o que falta
em vez de preencher a lacuna sozinho.

## Onde as coisas moram

```
src/content/schema.ts        content model em zod — as duas espinhas
src/lib/validate.ts          as checagens, como módulo chamável
src/content/index.ts         o registro de unidades — é daqui que o validador lê
src/content/glossary.ts      termos por unidade, allTerms, e OVERLOADED_TERMS
src/content/vocabulary.ts    abstrações vagas e as licenças de citação
src/content/conventions.ts   a folha de notação do pseudocódigo
src/components/ui/            primitivos shadcn — código do projeto, não da dependência
src/components/band-tokens.ts a paleta e o rótulo de cada banda, exaustivos por tipo
src/content/units/<id>/index.ts      unidade, ciclos, ADT, implementações
src/content/units/<id>/exercises.ts  exercícios e catálogo de armadilhas
src/lib/socratic.ts          divergência de traço e os três degraus
src/lib/session-export.ts    o markdown do painel de lacunas — sem resposta dentro
src/lib/reference/index.ts   o registro agregado dos geradores de gabarito
src/lib/reference/           implementações que GERAM o gabarito (nunca digitado)
src/lib/pseudocode.ts        tokenizador semântico do pseudocódigo
scripts/validate-content.ts  o relatório do validador
scripts/check-docs.ts        caminhos citados em documento existem
docs/discovery/              por que este projeto existe e como ele pensa
docs/adr/                    as decisões, com as alternativas descartadas
docs/authoring/              o procedimento de autoria que os agentes seguem
docs/specs/                  o spec de cada unidade, insumo de /implement-unit
```

Uma unidade se registra em três lugares e o validador confere os três: a unidade em
`src/content/index.ts`, os termos num array próprio em `src/content/glossary.ts` somado a
`allTerms`, e os geradores de traço num registro por unidade agregado em
`src/lib/reference/index.ts`, com id prefixado pela unidade.

## Como este projeto costuma ser quebrado

Quatro derivas reais observadas durante o desenho. Elas se repetem; leia antes de
escrever conteúdo.

1. **Bilinguismo sem regra.** Um mesmo documento com "encadeamento" e "chaining".
   Escolha pelo glossário, nunca pela intuição da frase.
2. **Armadilha declarada e nunca exercitada.** Uma misconception no catálogo sem
   exercício que a ative é conteúdo morto — e o validador reprova.
3. **Substantivo abstrato no lugar de operação.** "Promete presença e recuperação" no
   lugar de `contém(chave)` e `obter(chave)`. Soa preciso e não é. A lista de palavras
   proibidas está em `src/content/vocabulary.ts`; para citar uma, registre a licença em
   `allowedVagueUses` — unidade, palavra, o trecho e a razão. Nunca dentro da string: não
   há renderizador que remova marcador, e ele chega ao aluno.
4. **Enum em inglês vazando para a tela.** `BANDA · IMPLEMENTATION`. Todo enum
   renderizado precisa de mapa de rótulos exaustivo por tipo. Os mapas de banda e de
   camada vivem em `src/components/band-tokens.ts`; nenhum componente escreve o rótulo
   à mão.

## Comandos

As telas transversais existem porque o dado já estava indexado e faltava a
vista: `/glossary` mostra os termos com `isNot` e falsos amigos, `/traps` é o
caderno de armadilhas com as que o aluno já ativou, `/gaps` é o painel de
lacunas. Nenhuma delas tem conteúdo próprio — todas leem `src/content`.

```
npm run dev         desenvolvimento
npm run validate    só o validador pedagógico
npm run docs:check  caminhos citados em docs/ e .claude/
npm run typecheck   tsc --strict
npm test            todas as suítes em scripts/test-*.ts
npm run build       validador + docs:check + export estático em out/
```

## O que este projeto não é

Não é preparação para entrevista de big tech, não é curso de linguagem, não é revisão
de faculdade. Não use ferramenta de IA como atalho para um exercício, e não sugira isso
ao aluno. Não invente bibliografia, autor, capítulo ou link — se não tiver certeza da
fonte, diga que precisa ser verificada.
