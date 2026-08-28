import type { Misconception } from '../content/schema'

/**
 * The deterministic socratic engine.
 *
 * Socratic correction is not runtime intelligence — it is authoring-time
 * anticipation. This module never reveals a correct value. It reveals WHERE
 * the reasoning broke, then which field, then the question that attacks the
 * root. Three rungs, and the last one still withholds the answer.
 */

export type TraceStep = Record<string, string>

export interface Divergence {
  /** 1-based index of the first step that differs. null when the trace is right. */
  firstDivergentStep: number | null
  /** Field that differs at that step — released only on the second attempt. */
  divergentField: string | null
}

export function findDivergence(
  submitted: TraceStep[],
  reference: TraceStep[],
  columns: string[],
): Divergence {
  for (let i = 0; i < reference.length; i++) {
    const ref = reference[i]!
    const got = submitted[i]
    if (!got) return { firstDivergentStep: i + 1, divergentField: null }
    for (const col of columns) {
      if (normalize(got[col]) !== normalize(ref[col])) {
        return { firstDivergentStep: i + 1, divergentField: col }
      }
    }
  }
  return { firstDivergentStep: null, divergentField: null }
}

const normalize = (v: string | undefined) => (v ?? '').replace(/\s+/g, '').toLowerCase()

export interface Feedback {
  head: string
  body: string
  /** Rung reached. Rendered so the student can see the help is bounded. */
  rung: number
  misconceptionId: string | null
}

/**
 * Builds the feedback for one attempt. `attempt` is 1-based.
 *
 * Rung 1 — where it broke, and what is still correct.
 * Rung 2 — which field.
 * Rung 3 — the misconception's question.
 *
 * There is no rung 4. A student who exhausts the ladder is told to stop and
 * come back, which is a better outcome than an answer.
 */
export function buildFeedback(
  divergence: Divergence,
  attempt: number,
  misconception: Misconception | undefined,
): Feedback | null {
  const step = divergence.firstDivergentStep
  if (step === null) return null

  const correctSoFar = step > 1
    ? `Os passos 1 a ${step - 1} estão corretos.`
    : 'A divergência aparece já no primeiro passo.'

  if (attempt <= 1) {
    return {
      rung: 1,
      head: `Seu traço diverge no passo ${step}.`,
      body: `${correctSoFar} Volte ao passo ${step} e reexecute a condição que o governa, linha por linha.`,
      misconceptionId: null,
    }
  }
  if (attempt === 2 && divergence.divergentField) {
    return {
      rung: 2,
      head: `A divergência está na coluna “${divergence.divergentField}”, no passo ${step}.`,
      body: 'Os outros valores desse passo estão certos. Só esse campo não.',
      misconceptionId: null,
    }
  }
  if (misconception) {
    return {
      rung: 3,
      head: misconception.socraticQuestion,
      body: misconception.ladder[Math.min(attempt - 3, misconception.ladder.length - 1)]!,
      misconceptionId: misconception.id,
    }
  }
  return {
    rung: 3,
    head: 'Vamos parar aqui.',
    body: `Releia a invariante e volte a este exercício amanhã. Insistir agora treina a tentativa, não o raciocínio.`,
    misconceptionId: null,
  }
}
