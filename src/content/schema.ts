import { z } from 'zod'

/**
 * The content model.
 *
 * The schema is the pedagogical contract: what it makes impossible to write
 * matters as much as what it allows. Every `.min(1)` below is a principle
 * from the project brief turned into a build error.
 */

// ---------------------------------------------------------------------------
// Cost — never a bare string.
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
  /** What n counts — the guard against the "cost of hashing the key" blind spot. */
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
  /** Explicit negative space — what stops one word meaning four things. */
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
    /** Semantic guarantee only — never a complexity. */
    guarantee: z.string().min(1),
  })).min(1),
  /** Plain language, no invented nouns — the field where "presença" died. */
  answers: z.string().min(1),
  cannotAnswer: z.array(z.string().min(1)).min(1),
})

export const implementation = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  implementsAdt: z.string().min(1),
  summary: z.string().min(1),
  /** Keys must match the ADT's operation names — checked at build. */
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
// Cycles — the unit of study, and of cognitive load.
// ---------------------------------------------------------------------------

export const MAX_NEW_TERMS_PER_CYCLE = 4

/**
 * The two spines. A unit about a structure promises operations; a unit about a
 * method promises a judgment. Both go from what is promised, through the
 * competing ways of delivering it, to where the choice is wrong — which is why
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
  body: z.array(z.string().min(1)).min(1),
  pseudocode: z.string().optional(),
  invariant: z.string().optional(),
  workedExample: z.object({
    problem: z.string().min(1),
    whatToNotice: z.string().min(1),
  }).optional(),
  /** Every cycle ends in an exercise. Not optional — principle 2. */
  exerciseId: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Misconceptions and exercises
// ---------------------------------------------------------------------------

export const misconception = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  /** Must end in "?" — checked at build. It is a question, not an explanation. */
  socraticQuestion: z.string().min(1),
  escalation: z.array(z.string().min(1)).min(1).max(3),
  reviewCycle: z.string().min(1),
})

/** A wrong choice without a named misconception is a lazy distractor. */
export const choice = z.discriminatedUnion('correct', [
  z.object({ correct: z.literal(true), text: z.string().min(1) }),
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
   * adivinha a notação do gabarito e diverge por tipografia — que foi como o
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
 * tenta seguir o raciocínio — e o raciocínio é o que a trilha quer treinar.
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
 * `whenOmitted` is to a criterion what `cannotAnswer` is to a contract — the
 * negative space. It is also the generator of the unit's misconceptions:
 * dropping `regime` from a cost claim is literally "hash é O(1)".
 */
export const judgmentCriterion = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** The canonical form, in plain language. No cost — a criterion has none. */
  produces: z.string().min(1),
  parts: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    /** What this part asserts. Semantic only, never a complexity. */
    guarantee: z.string().min(1),
  })).min(2),
  whenOmitted: z.array(z.object({
    partId: z.string().min(1),
    /** How the judgment reads without it — the sentence that sounds right. */
    reads: z.string().min(1),
  })).min(1),
})

/** A way of deriving the judgment. Two compete, or there is no choice to teach. */
export const technique = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  derivesCriterion: z.string().min(1),
  summary: z.string().min(1),
  /** Criterion part ids this technique actually produces — checked at build. */
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
// Unit — one shape per spine, discriminated. No optional field decides which.
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
// Progress — localStorage, versioned, validated on read.
// ---------------------------------------------------------------------------

export const progress = z.object({
  schemaVersion: z.literal(1),
  units: z.record(z.string(), z.object({
    exercises: z.record(z.string(), z.object({
      attempts: z.number().int().nonnegative(),
      solved: z.boolean(),
      solvedClean: z.boolean(),
      /** The student's gap map — what the export-to-Claude button emits. */
      misconceptionsTriggered: z.array(z.string()),
      freeText: z.string().optional(),
      lastVisited: z.string(),
    })),
  })),
})

export type CostClaim = z.infer<typeof costClaim>
export type GlossaryTerm = z.infer<typeof glossaryTerm>
export type AbstractDataType = z.infer<typeof abstractDataType>
export type Implementation = z.infer<typeof implementation>
export type Cycle = z.infer<typeof cycle>
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
export type Unit = z.infer<typeof unit>
export type Progress = z.infer<typeof progress>
