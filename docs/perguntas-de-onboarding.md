# Perguntas de onboarding — Euclides

Levantadas por um agente lendo o repositório pela primeira vez, com o objetivo de escrever
uma unidade nova. Cada pergunta nasceu de uma ambiguidade real ou de uma contradição entre
documento e código, com a evidência anexada.

## Instruções para quem responde

1. Devolva **este mesmo arquivo** com os blocos `**Resposta:**` preenchidos.
2. Não reescreva as perguntas nem reordene. Se uma pergunta está mal posta, responda dizendo
   isso e por quê — a pergunta mal posta também é um achado.
3. Onde a decisão ainda não foi tomada, escreva `A DEFINIR` e o que falta para tomá-la. Um
   documento honesto sobre suas lacunas vale mais que um documento completo e inventado
   (`new-spec.md`).
4. Quando doc e código divergem, diga **qual dos dois está errado**, não só qual é o
   comportamento atual. "O código faz X" não responde "X é o certo?".
5. Nenhuma resposta precisa vir com patch. O que se pede aqui é a decisão; a implementação
   vem depois.

**Estado do repositório na leitura:** commit `bca77ac`, branch claude/repo-onboarding-validation-1524ca.
O documento é um retrato daquele commit: parte dos achados já foi corrigida na própria branch
antes deste arquivo entrar na `main`.
`npm ci`, `npm run validate`, `npm run typecheck`, `npm test` e `npm run build` passam todos.

---

# Parte 1 — Bloqueadores

Sem estas quatro respostas não dá para começar uma unidade nova sem chutar.

## Q1 — Qual é o registro canônico de unidade?

**Evidência.** `.claude/commands/implement-unit.md` manda "Registre a unidade em
`src/content/index.ts`". O validador não lê esse arquivo: `scripts/validate-content.ts:13`
faz `import { hashUnit } from '../src/content/units/hash'` e monta
`const units: Unit[] = [hashUnit]` na linha 34. `src/content/index.ts` tem uma lista
própria, usada só pelo app.

**Consequência.** Uma unidade registrada apenas no `index.ts` produz
`12 checagens, nenhuma violação` sem que o validador tenha lido uma linha dela. O gate
aprovaria conteúdo que nunca viu.

**Pergunta.** Qual dos dois é o registro? E se a correção for o validador importar `units`
do `index.ts`, isso conta como "relaxar a checagem" no sentido do `CLAUDE.md`, ou é
conserto do gate?

**Resposta:**

>

## Q2 — Onde mora o gerador de referência da segunda unidade?

**Evidência.** `.claude/agents/exercise-designer.md`: "Traço vem de uma função em
`src/lib/reference/`". O validador importa o registro de um arquivo específico:
`scripts/validate-content.ts:16` — `import { referenceGenerators } from '../src/lib/reference/hash-table'`.
A checagem 10 resolve `ex.reference` só contra esse objeto.

**Consequência.** O gerador da unidade de grafos ou entra num arquivo chamado `hash-table.ts`,
ou o validador precisa mudar. O `CLAUDE.md` proíbe mexer na checagem.

**Pergunta.** Existe um agregador previsto (`src/lib/reference/index.ts`) que ainda não foi
escrito, ou a expectativa é outra?

**Resposta:**

>

## Q3 — Onde entram os termos do glossário da unidade nova, e a escotilha do check 11 fica?

**Evidência.** `src/content/glossary.ts` exporta dois arrays: `glossary` (linha 12, termos de
hash) e `crossUnitGlossary` (linha 135). Nenhum documento diz qual usar para uma unidade nova.

A checagem 11 valida `introducedIn` assim:

```ts
const known = cycleIds.has(t.introducedIn) || !t.introducedIn.startsWith('hash.')
```

Qualquer `introducedIn` que não comece com `hash.` passa sem verificação. `heap → trees.c4` e
`stack → linear.c2` são a prova: apontam ciclos de unidades inexistentes e o validador aprova.

**Pergunta.** (a) Array por unidade, array único, ou `crossUnitGlossary` para tudo que
atravessa? (b) A escotilha do `startsWith('hash.')` é provisória? Se sim, o que a substitui
quando a segunda unidade existir — termos de unidade futura precisam de um estado explícito
tipo `introducedIn: 'planned'`?

**Resposta:**

>

## Q4 — `misconception.ladder` tem quantas entradas?

**Evidência.** Três fontes discordam.

- `.claude/agents/exercise-designer.md`: "A escada tem três degraus. Onde quebrou → qual
  campo → a pergunta da raiz. (...) Não escreva um quarto."
- `src/content/schema.ts`: `ladder: z.array(z.string().min(1)).min(1)` — sem teto.
- `src/content/units/hash/index.ts`, que o `implement-unit.md` manda ler "como referência de
  forma": seis das sete `ladder` têm **uma** entrada, uma tem duas. Nenhuma tem três.

No código, `ladder` não são os três degraus. Os três degraus são os `rung` de `buildFeedback`
(`src/lib/socratic.ts`), fixos e independentes do conteúdo. `ladder` é consumida **só dentro
do degrau 3**, como `ladder[Math.min(attempt - 3, ladder.length - 1)]`. Ou seja: é a
escalada de tentativas depois que a pergunta socrática já foi feita.

`npm test` imprime `ok a escada tem exatamente três degraus`, que é sobre `buildFeedback` e
reforça a leitura errada de `ladder`.

**Pergunta.** (a) Confirma que `ladder` é a escalada interna ao degrau 3 e não os três
degraus? (b) Quantas entradas um autor deve escrever, e por quê? (c) Se o número é fixo, o
schema deve ganhar `.max()`? (d) `ladder` precisa de outro nome — os dois conceitos disputam
a palavra "escada" em todos os documentos.

**Resposta:**

>

---

# Parte 2 — Contradições que precisam de veredito

Doc e código divergem. Preciso saber qual lado corrigir.

## Q5 — Cinco mecanismos socráticos, três `kind`s de exercício

**Evidência.** `docs/discovery/02-motor-socratico.md` descreve M1–M5, e o
`exercise-designer.md` manda ler esse documento antes de começar. O schema
(`src/content/schema.ts`) suporta `trace` (M1), `choice` (M2) e `bug` — que não é nenhum dos
cinco. M3 (property-based com shrinking), M4 (justificativa por composição) e M5 (rubrica
diferida) não têm schema, componente nem checagem.

**Pergunta.** Posso desenhar exercício M3/M4/M5? Se não, o documento ganha uma marca de
roadmap por mecanismo? E de onde veio o `bug` — é um sexto mecanismo não documentado?

**Resposta:**

>

## Q6 — `content-author` sobrescreve o que `exercise-designer` escreveu?

**Evidência.** `.claude/commands/implement-unit.md` roda `exercise-designer` e depois
`content-author`, em sequência. Ambos produzem o mesmo arquivo:
`src/content/units/<id>/index.ts`. O `content-author.md` diz que ele "produz" o arquivo, sem
ressalva de preservar exercícios e catálogo de armadilhas.

O validador não pegaria a sobrescrita: a checagem `órfã` reclama de misconception não
exercitada, mas um exercício reescrito com outro distractor válido passa.

**Pergunta.** O `content-author` edita ou reescreve? Se edita, isso precisa estar escrito no
agente. Se a intenção era separar os arquivos (ex.: `exercises.ts` e `cycles.ts`), isso está
em algum lugar?

**Resposta:**

>

## Q7 — Qual a sintaxe de `vocab-ok:` dentro de uma string de conteúdo?

**Evidência.** `.claude/agents/terminology-auditor.md`: "a escotilha é `vocab-ok:` com uma
razão". O validador só faz `text.includes(VOCAB_ESCAPE)` na string autorada
(`scripts/validate-content.ts`, checagem 8). Nenhum componente remove o marcador — grep em
`src/components/` e `app/`: zero ocorrências de `vocab-ok` ou `VOCAB_ESCAPE`.

O único uso no repo é um comentário HTML dentro de um `.md`
(`docs/discovery/02-motor-socratico.md:18`), contexto onde a escotilha não faz nada porque o
validador não lê docs.

**Consequência.** Usar a escotilha numa string de conteúdo imprime `vocab-ok: ...` na tela do
aluno.

**Pergunta.** Qual a forma canônica dentro de uma string `.ts`, e quem a remove antes de
renderizar? Falta um `stripVocabEscape` nos componentes, ou a razão deveria morar fora da
string (um campo irmão, uma lista de exceções por path)?

**Resposta:**

>

## Q8 — "No mínimo duas implementações" é regra ou recomendação?

**Evidência.** `docs/authoring/guia-de-unidade.md`: "As implementações concorrentes. No
mínimo duas. O trade-off vive na diferença entre elas; uma implementação sozinha não ensina
escolha." Schema: `implementations: z.array(implementation).min(1)`. Validador: nenhuma
checagem.

É a única regra estrutural do guia sem mecanismo, num projeto cuja tese (ADR-0006) é que a
vigilância humana não basta.

**Pergunta.** Vira `.min(2)` no schema, ou o guia passa a dizer "recomendado"?

**Resposta:**

>

## Q9 — Um exercício por ciclo é 1:1 ou pode compartilhar?

**Evidência.** `guia-de-unidade.md`: "Os exercícios. **Um por ciclo.**" O validador só checa
que `c.exerciseId` resolve para um exercício existente; nada impede dois ciclos apontarem o
mesmo. Na unidade de hash são nove ciclos e nove exercícios distintos — resultado de autoria,
não do gate.

**Pergunta.** 1:1 é regra? Se sim, vira checagem. Se não, o guia deveria parar de dizer "um
por ciclo".

**Resposta:**

>

## Q10 — A checagem `domínio` é a décima terceira, e o relatório ainda mente sobre ela

**Evidência.** O `CLAUDE.md`, o `implement-unit.md` e o ADR-0006 dizem "doze checagens". O
validador aplica **treze** regras sob treze chaves de `fail()`; a décima terceira (`domínio`,
`scripts/validate-content.ts:117`) não tem `pass()` correspondente — vive dentro do bloco que
publica `ok exercício: ...`.

Verificado nesta sessão: com `mastery.requiresClean` apontando um id inexistente, a saída é

```
ok    exercício: todo ciclo tem exercício escrito e o critério de domínio referencia ids reais
...
FALHA [domínio] mastery.requiresClean cita "hash.NAO_EXISTE", que não existe
```

A linha `ok` afirma exatamente o que a `FALHA` nega. É o mesmo defeito que o commit `bca77ac`
diz ter corrigido — o `pass()` filtra por chave (`exercício`) e esse `fail()` usa outra
(`domínio`). O gate segura (exit 1); o relatório é que não é confiável.

**Pergunta.** `domínio` vira checagem própria com seu `ok` (e a contagem passa a treze em
todos os documentos), ou o `fail()` passa a usar a chave `exercício` (e continua doze)?

**Resposta:**

>

## Q11 — Ciclo `deep-dive` esconde a própria banda. Intencional?

**Evidência.** `src/components/CycleScreen.tsx:55`:

```tsx
{cycle.layer === 'deep-dive' ? 'Aprofundamento' : BAND_LABEL[cycle.band]}
```

`layer` é renderizado por ternário, não por mapa exaustivo — o `CLAUDE.md` (deriva 4) exige
"mapa de rótulos exaustivo por tipo" para todo enum renderizado. E o efeito passa do rótulo:
os dois enums dividem um badge só, então um ciclo `deep-dive` **nunca mostra sua banda**.
`hash.c7` é `implementation` + `deep-dive`; na tela sai "Aprofundamento" e a banda some.

**Pergunta.** É decisão de design (aprofundamento sobrepõe a banda) ou deriva? Se for design,
está registrado em algum lugar? Se for deriva, `layer` ganha `LAYER_LABEL` e os dois viram
badges separados?

**Resposta:**

>

---

# Parte 3 — Buracos no gate

Estas não travam a escrita, mas definem em que eu posso confiar enquanto escrevo.

## Q12 — O hook só pega `Edit|Write`; edição por shell pula o gate

**Evidência.** `.claude/settings.json` registra o `PostToolUse` com `"matcher": "Edit|Write"`.
Qualquer edição de conteúdo feita por Bash (`sed`, heredoc, script) não dispara o hook — foi
o que aconteceu nesta sessão ao injetar a violação de teste. O ADR-0006 apoia no hook a
propriedade de "o erro aparecer com o raciocínio ainda carregado".

**Pergunta.** Aceitar (o build e o CI seguram) ou o matcher passa a incluir `Bash`? Incluir
`Bash` dispara o validador em toda chamada de shell, o que é caro; a alternativa é o hook
disparar por path tocado em vez de por ferramenta.

**Resposta:**

>

## Q13 — `scripts/test-pseudocode.ts` não roda em lugar nenhum

**Evidência.** O arquivo existe desde o scaffold e passa (3 asserções sobre o tokenizador
semântico). `npm test` roda só `scripts/test-reference.ts`. O `.github/workflows/ci.yml`
também não o chama. O guia diz "`npm test` — referência e motor socrático", o que é
literalmente verdade e esconde o terceiro arquivo.

**Pergunta.** Entra no `npm test` e no CI, ou foi descartado e deveria ser apagado? Se entra,
`npm test` vira um runner que descobre `scripts/test-*.ts`?

**Resposta:**

>

## Q14 — `falseFriends` está vazio em 16 dos 21 termos, e `hash` não tem entrada

**Evidência.** `.claude/agents/terminology-auditor.md`, regra 5: "`heap`, `stack`, `hash`,
`list`, `array` precisam de `falseFriends` preenchido". No glossário atual:

- `hash` **não existe** como termo. Existem `hash-function` e `hash-flooding`; a palavra
  sozinha — a mais sobrecarregada da unidade — não está registrada.
- 16 de 21 termos têm `falseFriends: []`, incluindo `bucket`, `chaining`, `rehash` e
  `probing`. O schema não exige `.min(1)` e o validador não checa.

**Pergunta.** (a) `hash` ganha entrada própria? (b) `falseFriends` vira obrigatório para
alguma classe de termo, ou a regra 5 do auditor é julgamento puro sem contraparte no gate?

**Resposta:**

>

## Q15 — Os documentos estão fora do gate e já derivaram

**Evidência.** O validador cobre `src/content/`. Tudo que define *como escrever conteúdo* está
fora, e três derivas já aconteceram num repositório de dois commits:

1. `docs/discovery/02-motor-socratico.md:39` escreve a devolutiva-modelo como "cinco chaves
   que caem no mesmo **balde**". O canônico é `bucket`; o ADR-0005 e o `03-taxonomia` usam
   "ninguém diz balde numa code review" como *o* exemplo da deriva 1. O `exercise-designer` é
   mandado ler esse documento antes de começar.
2. `.claude/agents/terminology-auditor.md` manda ler, dentro de `docs/discovery/`, o arquivo
   03-taxonomia-e-terminologia.md. O arquivo é `03-taxonomia-e-didatica.md`.
   É a primeira instrução do agente e o caminho está morto.
3. `docs/discovery/01-principios.md` abre com "Sete deles têm checagem correspondente no
   validador". São sete princípios no total, e o corpo do mesmo documento marca o 7 como "Não
   mecanizável", o 3 e o 5 como "parcialmente", e o 1 sem marcador. O número real é cinco,
   dois deles parciais.

**Pergunta.** Correção pontual dos três, ou entra uma checagem para `docs/` e `.claude/`
(caminhos citados existem; formas não canônicas em prosa)? A segunda opção contradiz
parcialmente o ADR-0006, que trata o validador como gate de *conteúdo*.

**Resposta:**

>

---

# Parte 4 — Aberto

## Q16 — O que mais eu deveria estar perguntando?

Sou o primeiro leitor externo do contrato. Este levantamento veio de ler `CLAUDE.md`, os três
agentes em `.claude/agents/`, `docs/authoring/guia-de-unidade.md`, `docs/README.md` e
`docs/discovery/01-principios.md`, e depois conferir cada afirmação contra o código.

**Pergunta.** Que decisão de design importante não aparece em nenhum desses documentos e eu
teria descoberto só ao errar?

**Resposta:**

>

---

# Parte 5 — o que foi implementado

Todas as decisões da Parte 1 à Parte 4 foram aplicadas. Três respostas foram corrigidas
antes de virar código, e dois defeitos novos apareceram durante a implementação.

## Correções às respostas

**Q1, segunda metade — a afirmação estava errada.** "Com a lista vazia o validador imprime
`12 checagens, nenhuma violação` e sai 0" não se sustenta: testado, ele reprova com 19
violações e sai 1, porque o glossário é importado independente de `units` e os termos
`hash.*` param de resolver. O guard `registro` entrou mesmo assim — a proteção que existe
hoje é acidental e some no dia em que alguém esvaziar as duas coisas juntas.

**Q7, a chave da exceção — trocada.** A resposta propunha `path` do `walk`
(`hash.cycles[6].body[1]`), que é índice de array: inserir um parágrafo invalida toda
exceção abaixo dele e obriga a reconfirmar licenças que não mudaram de sentido — o que
treina carimbo, não atenção. A chave implementada é `quote`, um trecho da própria frase
citada. Reordenar não quebra nada; reescrever a frase orfana a licença e reprova o build,
que é exatamente quando a licença deveria ser reconfirmada.

**Q15, "zero falso positivo" — não era zero.** A primeira execução do `docs:check` acusou
13 caminhos, 12 deles falsos: caminho relativo ao documento que cita, placeholder `$1` de
slash command, e nome de arquivo sem diretório citado em prosa. O checador resolve os três
casos e o último virou regra explícita: um `index.ts` solto é um nome, não um local.
Sobrou o único achado verdadeiro, o `03-taxonomia-e-terminologia.md`.

## Defeitos encontrados durante a implementação

**O `ChoiceExercise` tinha o mesmo bug do Q16.1, e ninguém o tinha olhado.**
`Math.min(rung - 1, ladder.length - 1)` grudava na última entrada para sempre: o aluno que
erra a mesma alternativa dez vezes lê a mesma frase dez vezes. Corrigido junto, com o
mesmo encerramento.

**O hook novo saía em silêncio por `pipefail`.** A detecção por path fazia
`{ git diff; git ls-files; } | grep -q`, e o SIGPIPE que o `git` leva quando o `grep -q`
sai cedo derrubava a pipeline sob `set -o pipefail` — o `|| exit 0` disparava e o
validador nunca rodava. Só apareceu porque o caminho de falha foi testado; a versão que
"funcionava" passava em todo teste de caminho feliz.

## Uma decisão que mudou de escopo

**Q16.2, termo usado antes de introduzido.** A resposta propunha mecanizar procurando a
forma canônica nos ciclos anteriores ao `introducedIn`. Implementado até onde é exato e
não além: o validador exige que `introducedIn` e o `introducesTerms` do ciclo concordem
nos dois sentidos, o que pega reordenação de ciclos e registro incompleto sem um único
falso positivo.

A varredura de prosa ficou de fora, e o motivo é concreto: a unidade de hash tem duas
referências antecipadas deliberadas — `buckets` em `hash.c2` e `rehash` em `hash.c3`, esta
última precedida de "Guarde essa frase". Um gate que não distingue referência antecipada
de deriva mandaria apagar as duas. É o mesmo raciocínio da fronteira 3 do ADR-0011, e a
regra 3 do `terminology-auditor` foi reescrita para dizer qual metade é dele.

## Estado

`npm run validate` (16 checagens), `npm run docs:check`, `npm run typecheck`, `npm test`
(2 suítes) e `npm run build` passam. Nove violações injetadas — reviewCycle inexistente,
termo sobrecarregado sem falsos amigos, exercício fechando dois ciclos, gerador sem
prefixo de unidade, `escalation` com quatro entradas, ciclo que deixa de declarar um termo,
registro vazio, licença de citação órfã, e termo `planned` cujo ciclo passou a existir —
reprovam com a mensagem certa e exit 1.
