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
  /**
   * A célula está EM BRANCO, não errada.
   *
   * Branco não é uma hipótese: não há raciocínio para diagnosticar, e gastar um
   * degrau da escada socrática nele é gastar ajuda com quem ainda não tentou. O
   * motor nomeia a coluna na hora e não conta tentativa.
   */
  blank: boolean
}

export function findDivergence(
  submitted: TraceStep[],
  reference: TraceStep[],
  columns: string[],
): Divergence {
  for (let i = 0; i < reference.length; i++) {
    const ref = reference[i]!
    const got = submitted[i]
    if (!got) return { firstDivergentStep: i + 1, divergentField: null, blank: false }
    for (const col of columns) {
      if (!(got[col] ?? '').trim()) {
        return { firstDivergentStep: i + 1, divergentField: col, blank: true }
      }
      if (!sameCell(got[col], ref[col])) {
        return { firstDivergentStep: i + 1, divergentField: col, blank: false }
      }
    }
  }
  return { firstDivergentStep: null, divergentField: null, blank: false }
}

/**
 * A primeira célula em branco do traço inteiro, em ordem de leitura.
 *
 * Existe separada de `findDivergence` porque branco GANHA de errado, e ganha em
 * qualquer posição. Sem isso havia um vazamento: bastava preencher uma célula
 * errada na rodada 1 e deixar o resto em branco para receber o diagnóstico do
 * degrau 2 sem gastar tentativa, já que a verificação não conta tentativa
 * enquanto há branco. Ver ADR-0020.
 */
export function findFirstBlank(
  submitted: TraceStep[], columns: string[],
): { step: number; field: string } | null {
  for (let i = 0; i < submitted.length; i++) {
    for (const col of columns) {
      if (!(submitted[i]![col] ?? '').trim()) return { step: i + 1, field: col }
    }
  }
  return null
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
  /** Rótulo de tela da coluna. Valor de enum não vai para a tela; deriva 4. */
  labelOf: (key: string) => string = (k) => k,
): Feedback | null {
  const step = divergence.firstDivergentStep
  if (step === null) return null

  /*
    Branco antes de qualquer degrau, e sem consumir degrau.

    O motor não sabe distinguir "não sei" de "é vazio", e tratar os dois como a
    mesma coisa produzia a devolutiva de quem errou o raciocínio para quem
    apenas não preencheu. A coluna é nomeada na hora porque não há hipótese a
    diagnosticar. Ver ADR-0020.
  */
  if (divergence.blank) {
    return {
      rung: 0,
      exhausted: false,
      head: `A coluna “${labelOf(divergence.divergentField ?? '')}” está em branco no passo ${step}.`,
      body: 'Em branco não é uma resposta, e o app não distingue “não sei” de “é vazio”. Preencha e verifique de novo; isto não conta como tentativa.',
      misconceptionId: null,
    }
  }

  const correctSoFar = step > 1
    ? `Os passos 1 a ${step - 1} estão corretos.`
    : 'A divergência aparece já no primeiro passo.'

  if (attempt <= 1) {
    return {
      rung: 1,
      exhausted: false,
      head: `Seu trace diverge no passo ${step}.`,
      body: `${correctSoFar} Volte ao passo ${step} e reexecute a condição que o governa, linha por linha.`,
      misconceptionId: null,
    }
  }

  if (attempt === 2) {
    return divergence.divergentField
      ? {
          rung: 2,
          exhausted: false,
          head: `A divergência está na coluna “${labelOf(divergence.divergentField)}”, no passo ${step}.`,
          body: 'Os outros valores desse passo estão certos. Só esse campo não.',
          misconceptionId: null,
        }
      : {
          rung: 2,
          exhausted: false,
          head: `Seu trace termina antes do passo ${step}.`,
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
