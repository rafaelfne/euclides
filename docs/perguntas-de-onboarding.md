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
O documento é um retrato daquele commit, com as respostas dadas em 28/08/2026. Parte dos
achados já foi corrigida antes deste arquivo entrar na `main`.
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

> **O registro é `src/content/index.ts`. O validador está errado**, e o `implement-unit.md` está certo.
>
> O que existe hoje em `scripts/validate-content.ts:34` é uma *segunda* lista de unidades, mantida à
> mão, que por acaso coincide com a primeira. Duas listas do mesmo fato é a definição de deriva; a
> pergunta não é se elas vão divergir, é quando.
>
> Corrigir isso não é relaxar a checagem. Relaxar é diminuir a exigência sobre o conteúdo; aqui o
> conjunto validado **cresce** — passam a valer, para toda unidade registrada, também as checagens que
> dependem de `units` para derivar o universo (a 5, que resolve `introducesTerms` contra os ciclos
> existentes, e a 11, que resolve `introducedIn`). A regra do `CLAUDE.md` protege o rigor, não o
> código; um gate que não lê o conteúdo não está rigoroso, está cego.
>
> Ação: `import { units } from '../src/content/index'` e apagar a lista local.
>
> **E, junto, uma segunda correção que essa leitura revela:** com a lista vazia o validador imprime
> `12 checagens, nenhuma violação` e sai 0. Todo laço é `for (const u of units)`. Um gate que aprova o
> vazio aprova o pior caso de todos — o registro esquecido. Some `if (!units.length) fail('registro',
> 'nenhuma unidade registrada')`.

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

> **O agregador estava previsto e não foi escrito. O `CLAUDE.md` e o `exercise-designer.md` estão
> certos — os dois falam da pasta `src/lib/reference/`; quem aponta para um arquivo de unidade é o
> validador** (`scripts/validate-content.ts:16`). É o mesmo defeito do Q1 uma camada abaixo: o gate
> acoplado a uma unidade específica.
>
> Ação: criar `src/lib/reference/index.ts` que reexporta um `referenceGenerators` unificado, e o
> validador importa dele. O agregador precisa falhar em id duplicado — dois arquivos exportando
> `insert-trace` fariam um sobrescrever o outro em silêncio, e o traço errado passaria por todas as
> checagens (a 10 só exige que o gerador rode e produza as colunas).
>
> Decisão adicional, para não depender de vigilância: **id de gerador passa a ser prefixado pela
> unidade** (`hash.chaining-insert-trace`, `graphs.bfs-trace`). Migrar o único id existente agora custa
> uma linha de conteúdo e uma de registro; depois de três unidades custa uma varredura. O validador
> pode então checar que o prefixo do gerador bate com a unidade que o referencia — colar um traço de
> outra unidade num exercício vira erro de build, não achado de revisão.

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

> **(a) Array por unidade, todos no mesmo arquivo, mais um agregador.**
>
> `glossary.ts` exporta `hashGlossary`, `<proxima>Glossary`, `crossUnitGlossary` e um `allTerms` que os
> junta e é o que o validador e os componentes consomem. Um arquivo porque o `CLAUDE.md` diz que o
> glossário "arbitra cada caso uma vez" — a arbitragem é entre unidades, e ela fica mais barata quando
> os candidatos a colisão estão à vista um do outro. Arrays separados porque a procedência do termo é
> informação (ela responde "posso usar isso no ciclo 2 da unidade 3?").
>
> `crossUnitGlossary` **não** é o depósito de tudo que atravessa: é para o termo que mais de uma
> unidade *já registrada* usa. E é aqui que a pergunta expõe outra coisa — `heap` e `stack` não são
> termos cross-unit, são termos de unidades que não existem. Estão no array errado, sob o rótulo
> errado, e é isso que a escotilha do check 11 está encobrindo.
>
> **(b) A escotilha é provisória e já falhou.** Ela não protege termos de unidade futura por desenho:
> ela desliga a checagem para todo `introducedIn` que não comece com `hash.`. Um `introducedIn:
> 'hahs.c3'` (typo) passa. Uma unidade nova chamada `graphs` nasce com a validação inteira desligada.
>
> Substituição, com estado explícito como a pergunta propõe:
>
> - `introducedIn` continua obrigatório e passa a resolver contra os ciclos de **todas** as unidades
>   registradas — sem exceção por prefixo.
> - Termo de unidade futura declara `introducedIn: 'planned'` (literal aceito no schema) e um
>   `plannedIn: 'trees.c4'` livre, que o validador não resolve porque não pode.
> - Duas checagens novas, baratas, que dão dente ao estado: um termo `planned` **não pode** aparecer em
>   `introducesTerms` de nenhum ciclo (se apareceu, ele nasceu — atualize o registro); e quando a
>   unidade `trees` for registrada, um termo cujo `plannedIn` aponta para um ciclo dela que já existe
>   **falha** até virar `introducedIn` de verdade. O estado provisório passa a ter data de validade
>   imposta pelo gate, não pela memória de quem escreve.

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

> **(a) Confirmado, e a leitura do código está certa.** `ladder` não são os três degraus. Os três
> degraus são os `rung` de `buildFeedback`, fixos, iguais para toda armadilha, e independentes do
> conteúdo. `ladder` é consumida dentro do degrau 3, indexada por `attempt - 3`: é a escalada de
> tentativas *depois* que a pergunta socrática já foi feita.
>
> Quem está errado é o `exercise-designer.md`. A frase "A escada tem três degraus (...) Não escreva um
> quarto" aparece na seção de regras que o agente aplica ao **escrever conteúdo**, onde o único campo
> com esse nome é `ladder`. O agente lê aquilo como instrução sobre `ladder` — e a unidade de hash é a
> prova de que ele leu assim ou de que ignorou: seis `ladder` com uma entrada, uma com duas, nenhuma
> com três. O texto deveria dizer que os três degraus são do motor, já estão escritos, e que o autor
> não os controla.
>
> **(b) Uma entrada por padrão; duas quando a armadilha tem um segundo movimento.**
>
> O exemplo bom já está no repo: `hash.rehash-copia-buckets` tem duas porque a armadilha tem dois
> tempos — primeiro dirigir a atenção a uma chave concreta, depois nomear o fato desconcertante (o
> defeito é *parcial*, e é por isso que sobrevive ao teste manual). As outras seis têm uma porque a
> pergunta da raiz já é o movimento inteiro. A regra que eu escreveria no agente: *cada entrada precisa
> ser uma tarefa nova, não a mesma tarefa reformulada; se você não consegue dizer o que a segunda faz
> que a primeira não fez, ela não existe.*
>
> **(c) Sim, `.max(3)`.** Sem teto, o autor frustrado com o aluno que não chega lá resolve adicionando
> degraus — que é o quarto degrau proibido entrando por outra porta, sem tocar em `socratic.ts`. Três
> mapeia para as tentativas 3, 4 e 5; da sexta em diante ver a mesma frase repetida já é o sinal de
> parar (ver a ressalva no Q16, porque hoje o código não para).
>
> **(d) Sim, precisa de outro nome.** A palavra "escada" hoje nomeia duas coisas em todos os
> documentos, e o Q4 existir é o custo disso. Proposta: `escalation` no schema e "escalada" na prosa,
> reservando "escada"/`rung` para os três degraus de `buildFeedback`. Toca schema, um arquivo de
> conteúdo, `socratic.ts`, `test-reference.ts` e três documentos — é barato agora, com uma unidade, e
> fica caro exatamente na hora em que a segunda unidade estiver escrita.

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

> **Não desenhe M3/M4/M5. O documento é que está adiantado em relação ao código, e mente por omissão**
> ao apresentar os cinco como "o motor" para um agente que precisa escolher um formato hoje.
>
> Sobre o `bug`: **não é um sexto mecanismo, é M2 em outro suporte.** O schema entrega isso —
> `consequences: z.array(choice).min(2)` é a mesma estrutura de `choiceExercise.choices`, com o mesmo
> `misconceptionId` obrigatório no distractor, e o validador trata os dois pelo mesmo caminho
> (`ex.kind === 'choice' ? ex.choices : ex.kind === 'bug' ? ex.consequences : []`). A diferença é o
> enunciado: em vez de escolher entre afirmações, o aluno aponta a linha e depois nomeia a
> consequência. Isso é exatamente o objetivo declarado do projeto — julgar código sem executar — então
> o `bug` merece estar no documento, como aplicação de M2 a código, e não ficar de fora dele.
>
> E há uma distinção que o documento apaga e que muda o custo de cada um: M1, M2 e `bug` funcionam num
> app estático porque o espaço de erro é fechado *e* a verificação é comparação. M3 exige o aluno
> **implementar** — sandbox de execução no cliente, geração de entradas, shrinking. Não é "mais um
> `kind`", é outro produto. M4 é viável sem isso (slots tipados com distractors mapeados são M2
> composto). M5 não precisa de motor nenhum, precisa de uma tela e de persistência que já existe.
>
> Ação: cada mecanismo ganha estado no `02-motor-socratico.md` — M1 implementado como `trace`, M2 como
> `choice` e `bug`, M4 viável sem infraestrutura nova, M5 pendente de tela, M3 dependente de decisão de
> produto (sandbox). Sem isso, todo agente novo vai propor um exercício M3 e descobrir tarde.

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

> **Edita. E isso precisa estar escrito no agente, porque hoje não está.**
>
> A ordem "exercícios antes do conteúdo" do `guia-de-unidade.md` só significa alguma coisa se o segundo
> passo não puder apagar o primeiro. Um `content-author` que reescreve o arquivo inteiro inverte a
> tese: a prosa deixa de existir para preparar o exercício e passa a arrastá-lo atrás de si.
>
> O `content-author.md` deve dizer, em voz ativa: *você recebe um arquivo que já contém `exercises` e
> `misconceptions` escritos por outro agente. Não reescreva esses dois arrays. Se a prosa que você
> escreveu exigir mudar um exercício, pare e diga qual e por quê — a mudança é do exercise-designer.*
>
> **A separação de arquivos não está prevista em lugar nenhum do repo — e deveria estar.** Recomendo
> `src/content/units/<id>/exercises.ts` (exercícios + catálogo de armadilhas) e
> `src/content/units/<id>/index.ts` (unidade, ciclos, ADT, implementações, importando o primeiro). Com
> isso a regra deixa de ser textual e vira estrutural: o agente errado tocando o arquivo errado aparece
> no diff, e o hook do `PostToolUse` vê o path. Regra que depende de o agente lembrar da regra é
> exatamente o que o ADR-0006 diz que não funciona.

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

> **Não há forma canônica dentro da string, e não deve haver. Nem doc nem código estão "errados" — a
> peça nunca foi construída, e o `terminology-auditor.md` documenta como pronta uma escotilha que só
> funciona em Markdown.**
>
> Contra o `stripVocabEscape` nos componentes: seriam N pontos de remoção (prosa de ciclo, enunciado,
> alternativa, invariante, `whatToNotice`, `wrongWhen`...), cada um deles um lugar para esquecer. O
> esquecimento imprime `vocab-ok:` na tela do aluno — e ninguém nota até um leitor externo notar. É a
> deriva 4 de novo: a correção que depende de todo renderizador lembrar dela.
>
> Proposta: **a razão sai da string e vira lista de exceções por path**, em `src/content/vocabulary.ts`:
>
>     export const allowedVagueUses = [
>       { path: 'hash.cycles[6].body[1]', word: 'mais rápido', reason: 'citação de prosa ruim, não uso' },
>     ]
>
> O validador já caminha o conteúdo com o path na mão (`walk`), então a checagem 8 passa a consultar
> `(path, word)`. Três ganhos: a razão nunca chega ao aluno, a lista de exceções é auditável de uma vez
> só (é a pergunta "o que este projeto se permitiu?" respondida em dez linhas), e a escotilha deixa de
> liberar a string inteira — libera uma palavra num lugar.
>
> O ponto fraco óbvio é a fragilidade do path: mover um parágrafo invalida a entrada. **Isso vira
> feature com uma checagem a mais: entrada de exceção que não casa com nada é falha.** O conteúdo se
> move, a exceção fica órfã, o build reprova, e o autor é obrigado a reconfirmar que aquela palavra
> ainda é citação e não uso. É a única forma de a exceção não virar permissão permanente.
>
> `VOCAB_ESCAPE` some do fluxo de conteúdo. O comentário HTML no `02-motor-socratico.md` pode ficar
> como marcação humana, mas o `terminology-auditor.md` precisa parar de chamá-lo de escotilha.

## Q8 — "No mínimo duas implementações" é regra ou recomendação?

**Evidência.** `docs/authoring/guia-de-unidade.md`: "As implementações concorrentes. No
mínimo duas. O trade-off vive na diferença entre elas; uma implementação sozinha não ensina
escolha." Schema: `implementations: z.array(implementation).min(1)`. Validador: nenhuma
checagem.

É a única regra estrutural do guia sem mecanismo, num projeto cuja tese (ADR-0006) é que a
vigilância humana não basta.

**Pergunta.** Vira `.min(2)` no schema, ou o guia passa a dizer "recomendado"?

**Resposta:**

> **Vira `.min(2)` no schema. O guia está certo; o schema é que está frouxo.**
>
> O argumento não é de simetria, é do princípio 4: `wrongWhen` exige "o cenário em que essa escolha é a
> errada" e uma `useInstead` nomeada. Com uma implementação só, o `useInstead` aponta para fora da
> unidade e o aluno lê uma afirmação que não pode conferir em lugar nenhum — a comparação vira
> retórica. O trade-off só é ensinável quando os dois lados estão escritos com o mesmo nível de
> detalhe, custo por operação e invariante.
>
> E é a única regra estrutural do guia sem mecanismo, num repositório cujo ADR-0006 nasceu da
> constatação de que quem escreveu as regras as quebrou quatro vezes. Deixá-la como recomendação é
> escolher a hipótese que o próprio projeto já descartou.
>
> O custo real: uma unidade legitimamente monolítica (se existir) passa a precisar de uma segunda
> implementação. Na prática isso empurra para o conteúdo certo — a alternativa quase sempre é de outra
> família (array ordenado contra tabela hash, lista de adjacência contra matriz), e é justamente aí que
> mora a decisão que o aluno vai tomar no trabalho.

## Q9 — Um exercício por ciclo é 1:1 ou pode compartilhar?

**Evidência.** `guia-de-unidade.md`: "Os exercícios. **Um por ciclo.**" O validador só checa
que `c.exerciseId` resolve para um exercício existente; nada impede dois ciclos apontarem o
mesmo. Na unidade de hash são nove ciclos e nove exercícios distintos — resultado de autoria,
não do gate.

**Pergunta.** 1:1 é regra? Se sim, vira checagem. Se não, o guia deveria parar de dizer "um
por ciclo".

**Resposta:**

> **É regra, e vira checagem — mas a checagem que falta não é só a que a pergunta descreve.**
>
> 1:1 porque o ciclo é a unidade de carga cognitiva e o exercício é o fechamento dele. Dois ciclos
> apontando o mesmo exercício significa uma de duas coisas, e as duas são defeito: os ciclos não estão
> de fato separados (deveriam ser um), ou o exercício é genérico o bastante para servir aos dois — e um
> exercício que serve a dois ciclos não verifica o que distingue nenhum deles.
>
> Duas checagens, não uma:
>
> - **injetividade** — nenhum `exerciseId` aparece em dois ciclos;
> - **exercício órfão** — todo exercício é referenciado por algum ciclo.
>
> A segunda é a simetria que falta: a checagem 3 pega a misconception declarada e nunca exercitada, mas
> um exercício escrito e nunca alcançado por ciclo nenhum passa em silêncio hoje. É o mesmo conteúdo
> morto, do outro lado da relação.
>
> A unidade de hash já satisfaz as duas (nove ciclos, nove exercícios distintos) — o que torna o custo
> de escrever a checagem agora igual a zero, e o custo de descobrir a violação depois igual a uma
> reescrita de unidade.

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

> **`domínio` vira checagem própria, com seu `ok`, e a contagem passa a treze em todos os documentos.**
>
> Reusar a chave `exercício` seria mais barato e é a opção errada: as duas regras respondem perguntas
> diferentes — "todo ciclo tem fechamento?" e "o critério de domínio aponta exercícios que existem?" —
> e um `ok` só passaria a afirmar duas coisas com uma frase. O relatório é o produto do validador para
> quem lê; fundir checagens para preservar um número em três markdowns é otimizar o número, não o
> relatório.
>
> Documentos a atualizar: `CLAUDE.md`, `docs/adr/0006-validador-como-gate.md` (contexto, decisão e item de ação 1),
> `.claude/commands/implement-unit.md`, `docs/authoring/guia-de-unidade.md`.
>
> **Mas o defeito de fundo é outro, e ele vai voltar.** O commit `bca77ac` corrigiu o sintoma
> (`pass()` filtrando por chave) e deixou de pé a causa: o relatório depende de o autor lembrar de
> casar a string de `fail()` com a de `pass()`, à mão, em dois lugares distantes do arquivo. A décima
> quarta checagem vai errar de novo.
>
> Correção estrutural, que eu faria junto: declarar as checagens numa lista (`{ id, descrição }`),
> `fail` aceitar só `id` tipado, e o relatório ser **derivado** dessa lista — imprime `ok` para todo id
> sem falha e `FALHA` para os demais. Aí a contagem vira `CHECKS.length`, os documentos podem citar a
> lista em vez de um número, e a divergência que o Q10 encontrou passa a ser impossível de escrever.

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

> **Deriva. E o próprio repositório dá a prova de que não é design: no mapa da unidade a banda de
> `hash.c7` aparece normalmente** — `CycleNode` recebe `band` e a codifica em forma e cor, para todo
> ciclo, inclusive os `deep-dive`. Se esconder a banda fosse decisão pedagógica, as duas telas
> concordariam. Elas discordam, e a tela do ciclo é a que perde informação.
>
> Além disso, `layer` renderizado por ternário é literalmente a deriva 4 do `CLAUDE.md`: enum
> renderizado sem mapa exaustivo. Um terceiro valor de `layer` amanhã não quebra o build — cai
> silenciosamente no ramo `essential` e vira rótulo de banda.
>
> Correção: dois badges, cada enum com seu mapa.
>
>     const LAYER_LABEL: Record<Cycle['layer'], string | null> = {
>       essential: null,          // banda basta; rotular "Essencial" é ruído
>       'deep-dive': 'Aprofundamento',
>     }
>
> Exaustivo por tipo (um `layer` novo quebra a compilação até ser nomeado), e o `null` diz em voz alta
> que a ausência de rótulo é escolha, não esquecimento. A banda passa a ser sempre exibida; o
> aprofundamento entra ao lado dela, não no lugar dela.

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

> **Não aceitar, e não incluir `Bash` cru no matcher. A alternativa que a própria pergunta levanta — o
> hook decidir por path tocado — é a certa, e ela é implementável apesar de o payload de `Bash` não
> trazer `file_path`.**
>
> O hook já tem a estrutura: hoje ele extrai `file_path` do payload e sai com 0 se o path não interessa.
> Basta um segundo caminho para quando não há `file_path`:
>
>     if [ -z "$path" ]; then
>       git diff --name-only; git diff --cached --name-only; git ls-files -o --exclude-standard
>     fi | grep -qE 'src/content/|src/lib/socratic|src/lib/reference/|scripts/validate-content' || exit 0
>
> Custo por chamada de shell: um `git diff --name-only`, milissegundos. O validador só roda quando
> conteúdo mudou de fato — que é a condição que o ADR-0006 quis capturar, e que o matcher por
> ferramenta só aproxima.
>
> Vale registrar a proporção: isto é sobre **timing**, não sobre garantia. O build e o CI seguram o
> conteúdo de qualquer jeito; o que a edição por shell custa hoje é o erro chegar tarde, com o
> raciocínio já descarregado. É deste tamanho o problema — e por isso ele não justifica rodar o
> validador em toda chamada de `Bash`.

## Q13 — `scripts/test-pseudocode.ts` não roda em lugar nenhum

**Evidência.** O arquivo existe desde o scaffold e passa (3 asserções sobre o tokenizador
semântico). `npm test` roda só `scripts/test-reference.ts`. O `.github/workflows/ci.yml`
também não o chama. O guia diz "`npm test` — referência e motor socrático", o que é
literalmente verdade e esconde o terceiro arquivo.

**Pergunta.** Entra no `npm test` e no CI, ou foi descartado e deveria ser apagado? Se entra,
`npm test` vira um runner que descobre `scripts/test-*.ts`?

**Resposta:**

> **Entra no `npm test` e no CI. Não foi descartado — o tokenizador que ele testa é dependência viva:
> `src/lib/pseudocode.ts` é o que o componente `Pseudocode` usa para renderizar todo bloco de
> pseudocódigo da trilha.**
>
> Um teste que existe, passa e não roda é pior que nenhum: ele produz a impressão de cobertura sem a
> cobertura. E a checagem 9 do validador é uma lista de proibições por regex — ela pega `==` e
> `return`, e não pega o tokenizador classificando `mod` como identificador. São guardas
> complementares, e uma delas está desligada.
>
> Ação: `"test": "tsx scripts/test-reference.ts && tsx scripts/test-pseudocode.ts"` resolve hoje; um
> runner que descobre `scripts/test-*.ts` resolve o próximo esquecimento — e vai haver um próximo,
> porque a unidade nova traz asserções novas. Prefiro o runner pelo mesmo motivo do Q10: o modo de
> falha aqui é humano e repetido.
>
> Junto, corrigir a frase do guia e do `CLAUDE.md`: "referência, motor socrático e tokenizador de
> pseudocódigo". Hoje ela é literalmente verdadeira e por isso ninguém a lê como incompleta — o pior
> tipo de documentação errada.

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

> **(a) Sim, `hash` ganha entrada própria — e a ausência dela é deriva de conteúdo, não do documento.**
> A regra 5 do auditor nomeia `hash` explicitamente; o glossário registra `hash-function` e
> `hash-flooding` e deixa de fora a palavra que o aluno vai encontrar sozinha em toda parte. Os falsos
> amigos existem e são exatamente o tipo de coisa que o projeto diz combater: `Hash` como a estrutura
> inteira em Ruby, hash criptográfico, hash de commit no Git, hash de partição em sistemas
> distribuídos, e o uso coloquial "hasheia isso" que às vezes significa a função e às vezes o valor.
> O `isNot` obrigatório resolve boa parte da confusão que hoje está distribuída em três verbetes.
>
> **(b) `falseFriends` obrigatório para todo termo, não.** Muitos termos não têm falso amigo real, e a
> obrigação universal produziria entrada inventada — que é pior que campo vazio, porque parece
> conteúdo. O que falta é a regra 5 ter contraparte no gate em vez de ser julgamento puro: uma lista
> explícita de termos sobrecarregados (`OVERLOADED_TERMS`) que o validador exige com
> `falseFriends.length >= 1`.
>
> Olhando o glossário atual, os candidatos com falso amigo verdadeiro e não preenchido:
>
> - `clustering` — cluster de máquinas. Homônimo total, e o aluno vive nesse contexto.
> - `probing` — liveness/readiness probe em Kubernetes; e "probe" de monitoração.
> - `bucket` — bucket de object storage (S3). É o falso amigo mais provável do público-alvo.
> - `chaining` — method chaining, e blockchain. Nenhum tem relação com política de colisão.
> - `load-factor` — "carga" de sistema (load average). Mesma palavra, outra métrica.
>
> Preencher esses cinco e registrar `hash` fecha a regra 5 com conteúdo real; a lista
> `OVERLOADED_TERMS` impede que a próxima unidade repita o padrão.

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

> **As três correções pontuais primeiro, porque são defeitos objetivos e independentes de qualquer
> decisão de processo:** "balde" no `02-motor-socratico.md:39` (contradiz o canônico `bucket` e, pior,
> está no documento que o `exercise-designer` é mandado ler antes de escrever); o caminho morto na
> primeira instrução do `terminology-auditor.md`; e a contagem no `01-principios.md`.
>
> Sobre a terceira, o número certo depende de como se conta, e a frase deveria dizer isso em vez de um
> número: cinco princípios têm mecanização (2, 3, 4, 5, 6), dois deles parciais (3 e 5), o 1 é
> mecanizado de lado — pelas convenções de pseudocódigo, checagem 9 — e o 7 é declaradamente não
> mecanizável. Escrever "sete deles têm checagem" num documento sobre honestidade de nível é o tipo de
> erro que o próprio princípio 7 existe para pegar.
>
> **Depois, uma checagem — mas não dentro do validador pedagógico.** Um script separado
> (`npm run docs:check`, passo próprio no CI) que verifica **caminho de arquivo citado em `docs/**` e
> `.claude/**` existe**. É barato, tem zero falso positivo, e teria pego a deriva 2 no commit em que
> ela nasceu. Isso não contradiz o ADR-0006: o `validate-content.ts` continua sendo o gate de
> *conteúdo*, com o escopo que o ADR define. É outro script, com outra pergunta, no mesmo pipeline.
>
> **A parte de terminologia em prosa fica de fora do gate, e fica no `/audit-unit`** — que já é
> relatório e já tem essa tarefa na regra 1 do auditor. O motivo é o "balde" do ADR-0005: a forma não
> canônica em prosa é legítima quando é citação, menção ou `alsoKnownAs`, e um gate que não distingue
> uso de menção empurraria o autor a apagar exatamente os exemplos que ensinam a distinção. O que muda
> é o escopo do auditor: ele precisa ler `docs/` e `.claude/`, não só `src/content/`.
>
> Vale um ADR curto (0011) registrando essa fronteira — o que é gate, o que é relatório, e por quê —
> porque a pergunta vai voltar na primeira vez que alguém propuser validar prosa.

---

# Parte 4 — Aberto

## Q16 — O que mais eu deveria estar perguntando?

Sou o primeiro leitor externo do contrato. Este levantamento veio de ler `CLAUDE.md`, os três
agentes em `.claude/agents/`, `docs/authoring/guia-de-unidade.md`, `docs/README.md` e
`docs/discovery/01-principios.md`, e depois conferir cada afirmação contra o código.

**Pergunta.** Que decisão de design importante não aparece em nenhum desses documentos e eu
teria descoberto só ao errar?

**Resposta:**

> Quatro coisas. A primeira é a que eu teria descoberto só ao errar, e ela contradiz o documento mais
> central do projeto.
>
> **1. A escada não para. O aluno com armadilha mapeada nunca recebe o "vamos parar aqui".**
> `02-motor-socratico.md` fecha afirmando que quem esgota a escada recebe "vamos parar aqui, releia a
> invariante e volte amanhã — que é um desfecho melhor do que uma resposta", e o `CLAUDE.md` repete a
> tese. No código, com `misconception` presente, `buildFeedback` devolve degrau 3 para sempre, com
> `ladder[Math.min(attempt - 3, ladder.length - 1)]` grudado no último item. Na décima tentativa o
> aluno lê a mesma frase que leu na terceira. O desfecho de parada só existe no ramo em que **não há**
> misconception — ou seja, é oferecido exatamente ao exercício menos preparado e negado ao mais bem
> desenhado. Aqui o código está errado e o documento certo: depois de esgotada a `escalation`, o degrau
> 3 deve dar lugar ao encerramento. E `test-reference.ts` não pega isso porque só exercita as
> tentativas 1, 2 e 3.
>
> **2. A ordem dos ciclos é a ordem do array, e nada verifica isso contra o glossário.** `introducedIn`
> diz onde um termo nasce; nenhuma checagem confirma que ele não é *usado* antes disso — a regra 3 do
> `terminology-auditor` é julgamento. Reordenar dois ciclos é uma operação de trinta segundos que
> invalida silenciosamente o mapa de introdução da unidade inteira. É mecanizável: procurar a forma
> canônica (e as `alsoKnownAs`) no `body` dos ciclos anteriores ao `introducedIn`.
>
> **3. O gerador de referência da unidade de hash usa `h(k) = k`.** É defensável — o traço ensina
> rehash e invariante de posição, e uma h realista só adicionaria aritmética — mas é uma decisão
> pedagógica não registrada em lugar nenhum, num projeto cujo ciclo `hash.c1` se chama "A aposta:
> transformar chave em endereço". O aluno vê a aposta descrita na prosa e nunca a executa no traço.
> Registrar (no spec ou num comentário no gerador) que a identidade é deliberada, e por quê.
>
> **4. A checagem que mais me faria falta ao escrever conteúdo não existe: nada verifica o
> `reviewCycle` da misconception.** `misconception.reviewCycle` é `z.string().min(1)` e nenhuma
> checagem resolve esse id contra os ciclos — é o mesmo defeito do `mastery.requiresClean` que o Q10
> descreve, num campo onde ninguém olhou ainda. Um `reviewCycle` inválido não quebra nada no build e
> manda o aluno para uma revisão que não existe.
