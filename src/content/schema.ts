import { z } from 'zod'

/**
 * The content model.
 *
 * The schema is the pedagogical contract: what it makes impossible to write
 * matters as much as what it allows. Every `.min(1)` below is a principle
 * from the project brief turned into a build error.
 */

// ---------------------------------------------------------------------------
// Cost, never a bare string.
// ---------------------------------------------------------------------------

export const complexity = z.enum([
  'O(1)', 'O(1) amortizado', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)',
  'O(n+m)', 'O(m)', 'O(log n + k)', 'O(k)',
])

/**
 * "Hash é O(1)" omits four qualifiers. None of them is optional here, which
 * is the only reliable way to stop the omission from happening again.
 */
export const costClaim = z.object({
  bound: complexity,
  regime: z.enum(['worst', 'average', 'best']),
  amortized: z.boolean(),
  /** Empty is allowed but must be a deliberate choice, not an oversight. */
  assumptions: z.array(z.string().min(1)),
  /** What n counts, the guard against the "cost of hashing the key" blind spot. */
  measuredIn: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

export const glossaryTerm = z.object({
  id: z.string().min(1),
  canonical: z.string().min(1),
  canonicalLanguage: z.enum(['pt', 'en']),
  /** Variants the student will meet elsewhere and must recognise. */
  alsoKnownAs: z.array(z.string()),
  definition: z.string().min(1),
  /** Explicit negative space, what stops one word meaning four things. */
  isNot: z.array(z.string().min(1)).min(1),
  /** Same word, unrelated meaning, another context. `heap` needs one. */
  falseFriends: z.array(z.object({
    context: z.string().min(1),
    meaning: z.string().min(1),
  })),
  introducedIn: z.string().min(1),
  plannedIn: z.string().min(1).optional(),
})

// ---------------------------------------------------------------------------
// The taxonomic spine: contract -> implementation -> cost.
// ---------------------------------------------------------------------------

/** No cost field. Deliberately: a contract cannot carry a complexity. */
export const abstractDataType = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  operations: z.array(z.object({
    name: z.string().min(1),
    signature: z.string().min(1),
    /** Semantic guarantee only, never a complexity. */
    guarantee: z.string().min(1),
  })).min(1),
  /** Plain language, no invented nouns, the field where "presença" died. */
  answers: z.string().min(1),
  cannotAnswer: z.array(z.string().min(1)).min(1),
})

export const implementation = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  implementsAdt: z.string().min(1),
  summary: z.string().min(1),
  /** Keys must match the ADT's operation names, checked at build. */
  cost: z.record(z.string(), costClaim),
  space: costClaim,
  /** Principle 4: the scenario where this choice is wrong. Required, non-empty. */
  wrongWhen: z.array(z.object({
    scenario: z.string().min(1),
    useInstead: z.string().min(1),
  })).min(1),
  /** Principle 6: where it shows up in real work. Required. */
  everydayAnchor: z.string().min(1),
  invariant: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Figures, declared, never free-form.
// ---------------------------------------------------------------------------

/**
 * Uma figura é DADO, não desenho.
 *
 * A curva não vem como caminho SVG nem como função: vem como uma forma nomeada
 * e um fator, e o renderizador tem o mapa exaustivo. É a mesma disciplina do
 * `CostClaim`, o que o autor não pode escrever importa tanto quanto o que
 * pode. Uma figura arbitrária seria a primeira coisa da trilha a afirmar algo
 * que nenhuma checagem consegue conferir. Ver ADR-0017.
 */
export const curveShape = z.enum(['constant', 'logarithmic', 'linear', 'linearithmic', 'quadratic'])

export const figure = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('growth'),
    caption: z.string().min(1),
    /** O que o eixo horizontal conta, a mesma disciplina de `measuredIn`. */
    xLabel: z.string().min(1),
    xMax: z.number().int().positive(),
    curves: z.array(z.object({
      label: z.string().min(1),
      shape: curveShape,
      factor: z.number().positive(),
    })).min(2),
    /** A faixa em que o problema real vive, quando ela não é o gráfico inteiro. */
    highlight: z.object({
      from: z.number().nonnegative(),
      to: z.number().positive(),
      label: z.string().min(1),
    }).optional(),
  }),

  /**
   * O deslocamento num bloco contíguo, uma linha por escrita.
   *
   * O conteúdo declara o bloco e a posição removida; o renderizador deriva os
   * estados. É o mesmo que o gerador de referência de `linear.e3` faz, e é de
   * propósito: `scripts/test-traces.ts` confere que os dois concordam, porque
   * uma figura que discorda do gabarito ensina a coisa errada com convicção.
   */
  z.object({
    kind: z.literal('shift'),
    caption: z.string().min(1),
    values: z.array(z.number()).min(3),
    removeAt: z.number().int().nonnegative(),
  }),

  /**
   * Duas árvores de busca construídas com as MESMAS chaves em ordens de chegada
   * diferentes.
   *
   * O conteúdo declara as sequências; o renderizador constrói e mede. Que os
   * dois conjuntos sejam iguais é checado no build, comparar árvores de chaves
   * diferentes não mostra o efeito da ordem, mostra o efeito das chaves, e a
   * figura estaria atribuindo a causa errada.
   */
  z.object({
    kind: z.literal('tree'),
    caption: z.string().min(1),
    sequences: z.array(z.object({
      label: z.string().min(1),
      keys: z.array(z.number()).min(3),
    })).length(2),
  }),

  /**
   * A rotação: a mesma árvore antes e depois, com a ordem intacta.
   *
   * O conteúdo declara só a sequência de chegada. Qual nó está desequilibrado,
   * qual rotação isso pede, as duas alturas e as duas travessias em ordem saem
   * de `src/lib/bst.ts`. É o que impede o desenho de discordar do dado: trocar
   * uma chave move a figura sozinha, e não há caminho SVG para desmentir.
   *
   * A checagem `figura` reprova sequência que não desequilibra nada, porque uma
   * figura de rotação sobre árvore já equilibrada não mostra rotação nenhuma.
   */
  z.object({
    kind: z.literal('rotation'),
    caption: z.string().min(1),
    keys: z.array(z.number()).min(3),
  }),

  /**
   * A tabela com chaining: m buckets, e as chaves caindo por h(k) mod m.
   *
   * A distribuição é derivada, o conteúdo declara m e as chaves. A figura
   * existe para a colisão, então a checagem exige que haja pelo menos uma:
   * um desenho em que nenhuma chave colide ilustra o caso que a unidade diz
   * ser impossível evitar.
   */
  z.object({
    kind: z.literal('buckets'),
    caption: z.string().min(1),
    m: z.number().int().positive(),
    keys: z.array(z.number().int().nonnegative()).min(3),
    /** A chave cuja busca a figura anota, quando há uma. */
    searchFor: z.number().int().nonnegative().optional(),
  }),

  /**
   * O mesmo grafo percorrido de dois jeitos.
   *
   * As duas ordens e a posição de cada vértice são derivadas das arestas; o
   * conteúdo declara só o grafo e a origem. A checagem exige que as duas ordens
   * sejam diferentes, uma figura em que largura e profundidade coincidem
   * ilustra o contrário do que o ciclo afirma.
   */
  /**
   * A árvore de recursão, nível a nível.
   *
   * O ciclo `asymptotics.c4` se chama "A árvore de recursão, desenhada" e não
   * tinha desenho. O conteúdo declara a recorrência — em quantos pedaços divide,
   * por quanto o tamanho cai, e o custo de juntar — e o componente deriva os
   * níveis, as chamadas por nível e o custo de cada um.
   */
  z.object({
    kind: z.literal('recursion'),
    caption: z.string().min(1),
    /** T(n) = branches · T(n/divisor) + n. */
    branches: z.number().int().min(1),
    divisor: z.number().int().min(2),
    n: z.number().int().min(2),
  }),

  /**
   * A dobra de capacidade: uma inserção por passo, e a média ao lado.
   *
   * O conteúdo declara quantas inserções e a capacidade inicial; as posições em
   * que a cópia acontece saem da regra de dobrar, nunca de uma lista digitada.
   */
  z.object({
    kind: z.literal('growth-doubling'),
    caption: z.string().min(1),
    insertions: z.number().int().min(4),
    initialCapacity: z.number().int().min(1),
  }),

  /**
   * Estabilidade: os mesmos elementos, dois algoritmos, um empate.
   *
   * `items` declara valor e etiqueta de chegada. A comparação é pelo valor, e o
   * que a figura mostra é o que cada algoritmo faz com o empate.
   */
  z.object({
    kind: z.literal('stability'),
    caption: z.string().min(1),
    items: z.array(z.object({
      value: z.number().int(),
      tag: z.string().min(1),
    })).min(4),
  }),

  z.object({
    kind: z.literal('traversal'),
    caption: z.string().min(1),
    edges: z.array(z.object({ from: z.string().min(1), to: z.string().min(1) })).min(3),
    origin: z.string().min(1),
  }),

  /**
   * A mesma busca em largura com e sem o conjunto de visitados.
   *
   * O conteúdo declara as arestas, a origem e quantas rodadas mostrar. Quem
   * enche e quem esvazia a fila é derivado, e é por isso que a figura não pode
   * discordar do pseudocódigo do ciclo: as duas rodam a mesma busca.
   *
   * A checagem `figura` exige ciclo alcançável a partir da origem. Sem ciclo, a
   * busca sem marcação também termina, e a figura ilustraria o oposto do que o
   * ciclo afirma.
   */
  z.object({
    kind: z.literal('visited'),
    caption: z.string().min(1),
    edges: z.array(z.object({ from: z.string().min(1), to: z.string().min(1) })).min(2),
    origin: z.string().min(1),
    /** Até onde acompanhar a fila que não esvazia. */
    rounds: z.number().int().min(4),
  }),
])

// ---------------------------------------------------------------------------
// Cycles, the unit of study, and of cognitive load.
// ---------------------------------------------------------------------------

export const MAX_ONE_LINE_WORDS = 20
export const MAX_NEW_TERMS_PER_CYCLE = 4

/**
 * The two spines. A unit about a structure promises operations; a unit about a
 * method promises a judgment. Both go from what is promised, through the
 * competing ways of delivering it, to where the choice is wrong, which is why
 * one `Cycle` serves both. See ADR-0012.
 */
export const BANDS_BY_KIND = {
  structure: ['contract', 'implementation', 'cost'],
  method: ['criterion', 'technique', 'failure'],
} as const

export const cycle = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  layer: z.enum(['essential', 'deep-dive']),
  /**
   * Where this cycle sits on the taxonomic spine. The map renders from this,
   * so the navigation cannot drift from the taxonomy the unit teaches. Which
   * values are legal depends on the unit's kind; checked at build.
   */
  band: z.enum(['contract', 'implementation', 'cost', 'criterion', 'technique', 'failure']),
  /** The implementation or technique this cycle details. Required on the middle band. */
  elaborates: z.string().optional(),
  /** Glossary ids first introduced here. Capped at build time. */
  introducesTerms: z.array(z.string()).max(MAX_NEW_TERMS_PER_CYCLE),
  /**
   * A afirmação do ciclo em uma frase, sem jargão, com verbo concreto.
   *
   * Ela existe para quem ainda não tem referente para o vocabulário do app, e
   * o teto de palavras é a checagem `síntese`, acima disso ela vira mais um
   * parágrafo, e o ciclo já tem parágrafos. Ver ADR-0019.
   */
  oneLine: z.string().min(1),
  body: z.array(z.string().min(1)).min(1),
  pseudocode: z.string().optional(),
  /**
   * Declara que este bloco tem passo escrito em prosa e por isso NÃO tem
   * versão em TypeScript derivável. A checagem `tradução` confere os dois
   * sentidos: declarar sem precisar também reprova.
   */
  pseudocodeIsProse: z.boolean().optional(),
  invariant: z.string().optional(),
  figure: figure.optional(),
  /** Obrigatório desde o ADR-0019: não há ciclo que vá do aforismo ao exercício. */
  workedExample: z.object({
    problem: z.string().min(1),
    whatToNotice: z.string().min(1),
  }),
  /**
   * O postmortem do incidente que abriu a unidade.
   *
   * Só o ÚLTIMO ciclo de cada unidade tem, e a checagem `chamado` confere os
   * dois lados: sem ele no último, e com ele em qualquer outro, reprova. Uma
   * unidade que abre com um incidente e termina sem voltar a ele deixou o aluno
   * com uma história pela metade. ADR-0027.
   */
  postmortem: z.object({
    /** A retomada do incidente, em uma frase. */
    incident: z.string().min(1),
    /** Qual armadilha estava ali. Precisa existir no catálogo da unidade. */
    trapId: z.string().min(1),
    /** Qual afirmação de custo faltava. */
    missingClaim: z.string().min(1),
    /** O que teria pego isso na revisão. */
    whatWouldCatch: z.string().min(1),
  }).optional(),
  /** Every cycle ends in an exercise. Not optional, principle 2. */
  exerciseId: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Misconceptions and exercises
// ---------------------------------------------------------------------------

export const misconception = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  /** Must end in "?", checked at build. It is a question, not an explanation. */
  socraticQuestion: z.string().min(1),
  escalation: z.array(z.string().min(1)).min(1).max(3),
  reviewCycle: z.string().min(1),
})

/**
 * A wrong choice without a named misconception is a lazy distractor.
 *
 * `why` existe porque a justificativa morava dentro do texto da alternativa
 * correta, depois de um travessão, e isso a tornava a mais longa em 93% dos
 * exercícios. O aluno acertava pelo comprimento sem ler o conteúdo, o que zera
 * o sinal do painel de lacunas. A justificativa é revelada DEPOIS de resolver;
 * a distratora não precisa da sua, porque a armadilha que ela nomeia já diz o
 * que ela erra.
 */
export const choice = z.discriminatedUnion('correct', [
  z.object({ correct: z.literal(true), text: z.string().min(1), why: z.string().min(1) }),
  z.object({ correct: z.literal(false), text: z.string().min(1), misconceptionId: z.string().min(1) }),
])

export const traceExercise = z.object({
  kind: z.literal('trace'),
  id: z.string().min(1),
  prompt: z.string().min(1),
  pseudocode: z.string().min(1),
  invariant: z.string().min(1),
  /**
   * `placeholder` declara o FORMATO da célula, nunca o valor. Sem ele o aluno
   * adivinha a notação do gabarito e diverge por tipografia, que foi como o
   * primeiro traço desta trilha reprovou quem tinha entendido a matéria.
   * Obrigatório em toda coluna editável; checado no build.
   */
  columns: z.array(z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    placeholder: z.string().min(1).optional(),
  })).min(2),
  /**
   * Como se escrevem as células DESTE traço. As convenções gerais estão em
   * `traceConventions`; estas são as da unidade, e são obrigatórias porque a
   * versão global delas apareceu num exercício de outra unidade descrevendo
   * uma estrutura que ele não tem. ADR-0013.
   */
  conventions: z.array(z.object({
    notation: z.string().min(1),
    rule: z.string().min(1),
    why: z.string().min(1),
  })).min(1),
  /** Name of the reference generator; resolved from the registry at runtime. */
  reference: z.string().min(1),
  /**
   * A linha do pseudocódigo que cada coluna observa.
   *
   * É o que transforma o traço rodando num painel de execução: a linha acende
   * enquanto o valor daquela coluna é escrito. Opcional, porque nem todo traço
   * tem pseudocódigo ao lado. ADR-0026.
   */
  lineByColumn: z.record(z.string(), z.number().int().positive()).optional(),
  misconceptionByStep: z.record(z.string(), z.string()),
})

export const choiceExercise = z.object({
  kind: z.literal('choice'),
  id: z.string().min(1),
  prompt: z.string().min(1),
  choices: z.array(choice).min(2),
})

export const bugHuntExercise = z.object({
  kind: z.literal('bug'),
  id: z.string().min(1),
  prompt: z.string().min(1),
  code: z.string().min(1),
  language: z.string().min(1),
  faultyLines: z.array(z.number().int().positive()).min(1),
  /**
   * As linhas que o pull request ACRESCENTA.
   *
   * Quando declaradas, o exercício é renderizado como diff de revisão em vez de
   * bloco de código: é o formato em que o aluno vai encontrar código de outra
   * pessoa no trabalho, e o formato faz parte do treino. ADR-0026.
   */
  addedLines: z.array(z.number().int().positive()).optional(),
  /** Right line for the wrong reason is not a pass. */
  consequences: z.array(choice).min(2),
})

export const exercise = z.discriminatedUnion('kind', [
  traceExercise, choiceExercise, bugHuntExercise,
])

// ---------------------------------------------------------------------------
// Unit
// ---------------------------------------------------------------------------

/**
 * O que cada letra do pseudocódigo significa.
 *
 * `m`, `n`, `T`, `h` e `α` aparecem no pseudocódigo, na invariante e no traço
 * sem que nada na tela diga o que são. Para quem está reconstruindo base, cada
 * letra não explicada é uma variável a mais para segurar na memória enquanto
 * tenta seguir o raciocínio, e o raciocínio é o que a trilha quer treinar.
 */
export const notationSymbol = z.object({
  symbol: z.string().min(1),
  /** Em palavras, sem outra letra dentro. */
  means: z.string().min(1),
})

// ---------------------------------------------------------------------------
// The method spine: criterion -> technique -> failure.
// ---------------------------------------------------------------------------

/**
 * What a unit about a method promises: not operations you may call, but the
 * canonical form of a judgment the student must be able to produce.
 *
 * `whenOmitted` is to a criterion what `cannotAnswer` is to a contract, the
 * negative space. It is also the generator of the unit's misconceptions:
 * dropping `regime` from a cost claim is literally "hash é O(1)".
 */
export const judgmentCriterion = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** The canonical form, in plain language. No cost, a criterion has none. */
  produces: z.string().min(1),
  parts: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    /** What this part asserts. Semantic only, never a complexity. */
    guarantee: z.string().min(1),
  })).min(2),
  whenOmitted: z.array(z.object({
    partId: z.string().min(1),
    /** How the judgment reads without it, the sentence that sounds right. */
    reads: z.string().min(1),
  })).min(1),
})

/** A way of deriving the judgment. Two compete, or there is no choice to teach. */
export const technique = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  derivesCriterion: z.string().min(1),
  summary: z.string().min(1),
  /** Criterion part ids this technique actually produces, checked at build. */
  produces: z.array(z.string().min(1)).min(1),
  /** Principle 4, in the only form it takes here: when this derivation is wrong. */
  wrongWhen: z.array(z.object({
    scenario: z.string().min(1),
    useInstead: z.string().min(1),
  })).min(1),
  everydayAnchor: z.string().min(1),
  invariant: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Unit, one shape per spine, discriminated. No optional field decides which.
// ---------------------------------------------------------------------------

const unitCore = {
  id: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().min(1),
  learningObjective: z.string().min(1),
  prerequisites: z.array(z.string().min(1)).min(1),
  /** Principle 5: the problem comes before the structure. */
  motivatingProblem: z.string().min(1),
  /** Legenda das letras usadas no pseudocódigo desta unidade. ADR-0013. */
  symbols: z.array(notationSymbol).min(1),
  cycles: z.array(cycle).min(1),
  exercises: z.array(exercise).min(1),
  misconceptions: z.array(misconception).min(1),
  mastery: z.object({
    statement: z.string().min(1),
    requiresClean: z.array(z.string().min(1)).min(1),
    revisitIntervalDays: z.number().int().positive(),
  }),
}

export const structureUnit = z.object({
  kind: z.literal('structure'),
  ...unitCore,
  adt: abstractDataType,
  implementations: z.array(implementation).min(2),
})

export const methodUnit = z.object({
  kind: z.literal('method'),
  ...unitCore,
  criterion: judgmentCriterion,
  techniques: z.array(technique).min(2),
})

export const unit = z.discriminatedUnion('kind', [structureUnit, methodUnit])

// ---------------------------------------------------------------------------
// Progress, localStorage, versioned, validated on read.
// ---------------------------------------------------------------------------

/**
 * O perfil, e o que ele deliberadamente NÃO guarda.
 *
 * Nome é opcional e o app funciona idêntico sem ele. Não há e-mail, idade,
 * empresa nem nada que identifique a pessoa fora deste navegador: as duas
 * perguntas que existem servem para escolher o modo de leitura e para o
 * nivelamento, e as duas podem ficar em branco.
 *
 * `codeLanguage` mora aqui e não numa chave solta. Ela era `euclides.codeLanguage`
 * ao lado do progresso, e duas chaves para um estado só é a garantia de que
 * exportar o perfil leva metade dele.
 */
export const profile = z.object({
  name: z.string().optional(),
  createdAt: z.string(),
  experience: z.enum(['menos-de-1-ano', '1-a-3-anos', 'mais-de-3-anos']).optional(),
  reviewsCode: z.enum(['nunca', 'as-vezes', 'sempre']).optional(),
  mode: z.enum(['iniciante', 'revisao']),
  codeLanguage: z.enum(['pseudo', 'typescript']),
  /** Desligado por padrão: quem não quiser um número não precisa ver nenhum. */
  showJudgmentIndex: z.boolean().optional(),
})

/** O resultado da sondagem. Recomenda, e não destrava nem bloqueia nada. */
export const placement = z.object({
  takenAt: z.string(),
  suggestedStart: z.string(),
  clearedUnits: z.array(z.string()),
})

export const progress = z.object({
  schemaVersion: z.literal(2),
  profile: profile.optional(),
  placement: placement.optional(),
  units: z.record(z.string(), z.object({
    exercises: z.record(z.string(), z.object({
      attempts: z.number().int().nonnegative(),
      solved: z.boolean(),
      solvedClean: z.boolean(),
      /** The student's gap map, what the export-to-Claude button emits. */
      misconceptionsTriggered: z.array(z.string()),
      freeText: z.string().optional(),
      /**
       * As células que o aluno escreveu num exercício de traço.
       *
       * Sem isto, a tabela voltava vazia na recarga e o contador de tentativas
       * voltava cheio: o aluno reabria o ciclo devendo três tentativas por um
       * traço que ele não podia mais ver. Opcional, para o v1 gravado continuar
       * válido.
       */
      savedRows: z.array(z.record(z.string(), z.string())).optional(),
      /**
       * As voltas depois do intervalo, e como cada uma saiu.
       *
       * O modelo não conseguia expressar "acertou de novo, limpo, depois de ter
       * errado": `solvedClean` congela na primeira visita e nunca mais volta a
       * ser verdadeiro. Sem isto não há revisita honrada, não há armadilha
       * desarmada e não há fila de repetição espaçada. ADR-0023.
       */
      revisits: z.array(z.object({ at: z.string(), clean: z.boolean() })).optional(),
      lastVisited: z.string(),
    })),
  })),
})

export type Profile = z.infer<typeof profile>
export type Placement = z.infer<typeof placement>
export type CostClaim = z.infer<typeof costClaim>
export type GlossaryTerm = z.infer<typeof glossaryTerm>
export type AbstractDataType = z.infer<typeof abstractDataType>
export type Implementation = z.infer<typeof implementation>
export type Cycle = z.infer<typeof cycle>
export type Figure = z.infer<typeof figure>
export type CurveShape = z.infer<typeof curveShape>
export type NotationSymbol = z.infer<typeof notationSymbol>
export type UnitKind = keyof typeof BANDS_BY_KIND
export type JudgmentCriterion = z.infer<typeof judgmentCriterion>
export type Technique = z.infer<typeof technique>
export type StructureUnit = z.infer<typeof structureUnit>
export type MethodUnit = z.infer<typeof methodUnit>
export type Misconception = z.infer<typeof misconception>
export type Choice = z.infer<typeof choice>
export type Exercise = z.infer<typeof exercise>
export type TraceExercise = z.infer<typeof traceExercise>
export type BugHuntExercise = z.infer<typeof bugHuntExercise>
export type Unit = z.infer<typeof unit>
export type Progress = z.infer<typeof progress>
