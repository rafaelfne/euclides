import type { TraceStep } from '../socratic'

export function countTrace(): TraceStep[] {
  const points = [2, 4, 1]
  const steps: TraceStep[] = []
  let total = 0
  let i = 0

  while (i < points.length) {
    const value = points[i]!
    total += value
    i += 1
    steps.push({
      step: String(steps.length + 1),
      key: `posição ${i - 1}`,
      read: String(value),
      total: String(total),
      next: String(i),
    })
  }
  return steps
}

export const preludeReferenceGenerators: Record<string, () => TraceStep[]> = {
  'prelude.count-trace': countTrace,
}
