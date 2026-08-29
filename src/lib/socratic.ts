import type { Misconception } from '../content/schema'

/**
 * The deterministic socratic engine.
 *
 * Socratic correction is not runtime intelligence, it is authoring-time
 * anticipation. This module never reveals a correct value. It reveals WHERE
 * the reasoning broke, then which field, then the question that attacks the
 * root. Three rungs, and the last one still withholds the answer.
 *
 * Rung 3 escalates through `misconception.escalation` and then STOPS. See
 * ADR-0011 and `docs/discovery/02-motor-socratico.md`.
 */

export type TraceStep = Record<string, string>

export interface Divergence {
  /** 1-based index of the first step that differs. null when the trace is right. */
  firstDivergentStep: number | null
  /** Field that differs at that step, released only on the second attempt. */
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
      if (!sameCell(got[col], ref[col])) {
        return { firstDivergentStep: i + 1, divergentField: col }
      }
    }
  }
  return { firstDivergentStep: null, divergentField: null }
}

const normalize = (v: string | undefined) => (v ?? '').replace(/\s+/g, '').toLowerCase()

/** Número em pt-BR, ou null quando a célula não é um número. */
const asNumber = (v: string | undefined): number | null => {
  const s = normalize(v).replace(',', '.')
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null
}

/**
 * Compara uma célula do traço com a referência.
 *
 * Número é comparado por VALOR, não por tipografia: `0,75` e `0,750` são a
 * mesma resposta, e quem escreve a primeira entendeu α tão bem quanto quem
 * escreve a segunda. Reprovar por casa decimal é o motor errando, não o aluno, 
 * e o custo desse erro é alto, porque a devolutiva do terceiro degrau manda o
 * aluno voltar amanhã sem que exista nada para ele reconsiderar. ADR-0013.
 */
const sameCell = (got: string | undefined, ref: string | undefined) => {
  const a = asNumber(got)
  const b = asNumber(ref)
  if (a !== null && b !== null) return a === b
  return normalize(got) === normalize(ref)
}

export interface Feedback {
  head: string
  body: string
  /** Rung reached. Rendered so the student can see the help is bounded. */
  rung: number
  /** True once the escalation ran out and the engine closed the exercise. */
  exhausted: boolean
  misconceptionId: string | null
}

/**
 * Builds the feedback for one attempt. `attempt` is 1-based.
 *
 * Rung 1, where it broke, and what is still correct.
 * Rung 2, which field, or that the trace stopped short.
 * Rung 3, the misconception's question, escalating one entry per attempt.
 *
 * There is no rung 4. A student who exhausts the escalation is told to stop
 * and come back, which is a better outcome than an answer.
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
      exhausted: false,
      head: `Seu traço diverge no passo ${step}.`,
      body: `${correctSoFar} Volte ao passo ${step} e reexecute a condição que o governa, linha por linha.`,
      misconceptionId: null,
    }
  }

  if (attempt === 2) {
    return divergence.divergentField
      ? {
          rung: 2,
          exhausted: false,
          head: `A divergência está na coluna “${divergence.divergentField}”, no passo ${step}.`,
          body: 'Os outros valores desse passo estão certos. Só esse campo não.',
          misconceptionId: null,
        }
      : {
          rung: 2,
          exhausted: false,
          head: `Seu traço termina antes do passo ${step}.`,
          body: `${correctSoFar} O que falta não é um valor corrigido: é o passo em si. Releia a condição que decide se há um passo ${step}.`,
          misconceptionId: null,
        }
  }

  const escalationIndex = attempt - 3
  if (misconception && escalationIndex < misconception.escalation.length) {
    return {
      rung: 3,
      exhausted: false,
      head: misconception.socraticQuestion,
      body: misconception.escalation[escalationIndex]!,
      misconceptionId: misconception.id,
    }
  }

  return {
    rung: 3,
    exhausted: true,
    head: 'Vamos parar aqui.',
    body: 'Releia a invariante e volte a este exercício amanhã. Insistir agora treina a tentativa, não o raciocínio.',
    misconceptionId: misconception?.id ?? null,
  }
}
