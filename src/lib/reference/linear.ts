import type { TraceStep } from '../socratic'

/**
 * Reference implementation. It exists to GENERATE the correct trace.
 *
 * `remover(0)` num array não é uma operação: são n − 1 escritas. O traço
 * existe para o aluno contar essas escritas com a própria mão, porque o custo
 * O(n) escrito numa tabela não convence ninguém que já chamou a função e viu
 * ela responder rápido com dez elementos.
 */

const A = [10, 20, 30, 40, 50]

/** The trace for `linear.e3`: remover(0) sobre [10, 20, 30, 40, 50]. */
export function removeFirstTrace(): TraceStep[] {
  const data = [...A]
  const steps: TraceStep[] = []
  let moves = 0

  for (let j = 0; j < data.length - 1; j++) {
    data[j] = data[j + 1]!
    moves += 1
    steps.push({
      step: String(steps.length + 1),
      key: `escreve na posição ${j}`,
      moved: String(data[j]),
      content: data.join(' '),
      moves: String(moves),
    })
  }
  return steps
}

export const linearReferenceGenerators: Record<string, () => TraceStep[]> = {
  'linear.remove-first-trace': removeFirstTrace,
}
