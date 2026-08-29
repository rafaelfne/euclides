import type { TraceStep } from '../socratic'

/**
 * Reference implementation. It exists to GENERATE the correct trace.
 *
 * The loop advances by two, not by one. Everything the unit teaches hangs on
 * that: a student who reads "percorre a coleção" and assumes one round per
 * element diverges at the second round, and the divergence is in `i`, the
 * variable he did not observe.
 */

const A = [4, 7, 3, 9, 6, 1, 8]

/** The trace for `tracing.e2`: contar_pares sobre [4, 7, 3, 9, 6, 1, 8]. */
export function countEvenTrace(): TraceStep[] {
  const steps: TraceStep[] = []
  let total = 0
  let i = 0

  while (i < A.length) {
    const value = A[i]!
    const even = value % 2 === 0
    if (even) total += 1
    i += 2
    steps.push({
      step: String(steps.length + 1),
      read: String(value),
      even: even ? 'sim' : 'não',
      total: String(total),
      next: String(i),
    })
  }
  return steps
}

export const tracingReferenceGenerators: Record<string, () => TraceStep[]> = {
  'tracing.count-even-trace': countEvenTrace,
}
