import type { TraceStep } from '../socratic'

/**
 * Reference implementation. It exists to GENERATE the correct trace.
 *
 * A árvore de T(n) = 2·T(n/2) + n, com n = 8. O ciclo afirmava que "resolver
 * essa relação dá n log n" e nunca mostrava como, que é o reconhecimento de
 * padrão que o próprio ciclo condena dois parágrafos depois.
 *
 * As duas colunas que carregam a derivação inteira são o custo por nível, que
 * NÃO cresce, e o número de níveis, que é log n e não n. Cada uma é um erro
 * que o traço deixa o aluno cometer com a própria mão.
 */

const N = 8

/** The trace for `asymptotics.e7`: a árvore de recursão de T(n) = 2·T(n/2) + n. */
export function recursionTreeTrace(): TraceStep[] {
  const steps: TraceStep[] = []
  let calls = 1
  let size = N
  let accumulated = 0

  while (size >= 1) {
    const levelCost = calls * size
    accumulated += levelCost
    steps.push({
      step: String(steps.length),
      calls: String(calls),
      size: String(size),
      levelCost: String(levelCost),
      accumulated: String(accumulated),
    })
    if (size === 1) break
    calls *= 2
    size /= 2
  }
  return steps
}

export const asymptoticsReferenceGenerators: Record<string, () => TraceStep[]> = {
  'asymptotics.recursion-tree-trace': recursionTreeTrace,
}
