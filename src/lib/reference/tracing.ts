import type { TraceStep } from '../socratic'

const A = [4, 7, 3, 9, 6, 1, 8]

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

export function strideValuesTrace(): TraceStep[] {
  const length = 10
  const additiveValues: number[] = []
  const multiplicativeValues: number[] = []
  let additiveIndex = 0
  let multiplicativeIndex = 1

  while (additiveIndex < length) {
    additiveValues.push(additiveIndex)
    additiveIndex += 3
  }

  while (multiplicativeIndex < length) {
    multiplicativeValues.push(multiplicativeIndex)
    multiplicativeIndex *= 2
  }

  return [
    { step: '1', key: 'i ← i + 3', values: additiveValues.join(', '), rejected: String(additiveIndex) },
    { step: '2', key: 'j ← j × 2', values: multiplicativeValues.join(', '), rejected: String(multiplicativeIndex) },
  ]
}

export const tracingReferenceGenerators: Record<string, () => TraceStep[]> = {
  'tracing.count-even-trace': countEvenTrace,
  'tracing.stride-values-trace': strideValuesTrace,
}
