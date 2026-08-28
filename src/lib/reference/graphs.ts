import type { TraceStep } from '../socratic'

/**
 * Reference implementation. It exists to GENERATE the correct trace.
 *
 * O grafo tem um ciclo de propósito: A → B → C → A. Um percurso sem o conjunto
 * de visitados não termina, e o traço é o lugar onde o aluno descobre isso
 * escrevendo a fila com a própria mão — sem executar nada, que é o ponto.
 */

const ADJACENCY: Record<string, string[]> = {
  A: ['B', 'D'],
  B: ['C'],
  C: ['A', 'E'],
  D: ['E'],
  E: [],
}

const show = (items: string[]) => (items.length ? items.join(' ') : 'vazia')

/** The trace for `graphs.e4`: busca em largura a partir de A. */
export function bfsTrace(): TraceStep[] {
  const queue = ['A']
  const visited = new Set(['A'])
  const steps: TraceStep[] = []

  while (queue.length) {
    const current = queue.shift()!
    const neighbours = ADJACENCY[current] ?? []
    const added = neighbours.filter((n) => !visited.has(n))
    added.forEach((n) => { visited.add(n); queue.push(n) })

    steps.push({
      step: String(steps.length + 1),
      key: `sai da fila: ${current}`,
      added: added.length ? added.join(' ') : 'nenhum',
      queue: show(queue),
      visited: [...visited].sort().join(' '),
    })
  }
  return steps
}

export const graphsReferenceGenerators: Record<string, () => TraceStep[]> = {
  'graphs.bfs-trace': bfsTrace,
}
