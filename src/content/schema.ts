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

export const cycle = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  layer: z.enum(['essential', 'deep-dive']),
  /**
   * Where this cycle sits on the taxonomic spine. The map renders from this,
   * so the navigation cannot drift from the taxonomy the unit teaches.
   */
  band: z.enum(['contract', 'implementation', 'cost']),
  /** Required when band is 'implementation'; checked at build. */
  implementationId: z.string().optional(),
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
  /** Released per attempt. The last rung still does not give the answer. */
  ladder: z.array(z.string().min(1)).min(1),
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
  columns: z.array(z.object({ key: z.string().min(1), label: z.string().min(1) })).min(2),
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

export const unit = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().min(1),
  learningObjective: z.string().min(1),
  prerequisites: z.array(z.string().min(1)).min(1),
  /** Principle 5: the problem comes before the structure. */
  motivatingProblem: z.string().min(1),
  adt: abstractDataType,
  implementations: z.array(implementation).min(1),
  cycles: z.array(cycle).min(1),
  exercises: z.array(exercise).min(1),
  misconceptions: z.array(misconception).min(1),
  mastery: z.object({
    statement: z.string().min(1),
    requiresClean: z.array(z.string().min(1)).min(1),
    revisitIntervalDays: z.number().int().positive(),
  }),
})

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
export type Misconception = z.infer<typeof misconception>
export type Choice = z.infer<typeof choice>
export type Exercise = z.infer<typeof exercise>
export type TraceExercise = z.infer<typeof traceExercise>
export type Unit = z.infer<typeof unit>
export type Progress = z.infer<typeof progress>
