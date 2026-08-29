export type Edge = { from: string; to: string }

/**
 * As duas ordens de percurso, derivadas das arestas declaradas.
 *
 * Este módulo existe para a figura de `graphs.c5`, e é DELIBERADAMENTE separado
 * de `src/lib/reference/graphs.ts`: lá o grafo é uma constante e a saída é um
 * traço com fila e visitados; aqui o grafo vem do conteúdo e a saída é só a
 * ordem. `scripts/test-traces.ts` afirma que os dois caminhos concordam, se
 * concordassem por construção, a asserção não valeria nada.
 */
export function adjacency(edges: Edge[]): Map<string, string[]> {
  const map = new Map<string, string[]>()
  const ensure = (v: string) => { if (!map.has(v)) map.set(v, []); return map.get(v)! }
  for (const e of edges) { ensure(e.from).push(e.to); ensure(e.to) }
  return map
}

export const vertices = (edges: Edge[]) => [...adjacency(edges).keys()]

export function bfsOrder(edges: Edge[], origin: string): string[] {
  const map = adjacency(edges)
  const queue = [origin]
  const seen = new Set([origin])
  const order: string[] = []
  while (queue.length) {
    const current = queue.shift()!
    order.push(current)
    for (const v of map.get(current) ?? []) {
      if (!seen.has(v)) { seen.add(v); queue.push(v) }
    }
  }
  return order
}

export function dfsOrder(edges: Edge[], origin: string): string[] {
  const map = adjacency(edges)
  const stack = [origin]
  const seen = new Set([origin])
  const order: string[] = []
  while (stack.length) {
    const current = stack.pop()!
    order.push(current)
    for (const v of map.get(current) ?? []) {
      if (!seen.has(v)) { seen.add(v); stack.push(v) }
    }
  }
  return order
}

/** As camadas da busca em largura, é delas que sai a posição de cada vértice. */
export function layers(edges: Edge[], origin: string): string[][] {
  const map = adjacency(edges)
  const depth = new Map([[origin, 0]])
  const queue = [origin]
  while (queue.length) {
    const current = queue.shift()!
    for (const v of map.get(current) ?? []) {
      if (!depth.has(v)) { depth.set(v, depth.get(current)! + 1); queue.push(v) }
    }
  }
  const out: string[][] = []
  for (const [v, d] of depth) { (out[d] ??= []).push(v) }
  return out
}

// ---------------------------------------------------------------------------
// A fila rodada a rodada, com e sem o conjunto de visitados
// ---------------------------------------------------------------------------

export interface Round {
  /** O vértice retirado no começo desta rodada. */
  dequeued: string
  /** A fila depois de enfileirar os vizinhos do retirado. */
  queue: string[]
}

/**
 * As rodadas da busca em largura, com a marcação ligada ou desligada.
 *
 * É a mesma busca de `bfsOrder`, exposta rodada a rodada em vez de só na ordem
 * final, porque a afirmação de `graphs.c4` é sobre a FILA e não sobre a ordem:
 * sem marcar visitados ela nunca esvazia, e isso só se vê acompanhando o
 * tamanho dela.
 *
 * `maxRounds` existe porque a versão sem marcação não termina. `drained` diz se
 * a fila esvaziou sozinha ou se o corte é que parou o laço, e é essa diferença
 * que a figura mostra.
 */
export function bfsRounds(
  edges: Edge[],
  origin: string,
  { marking, maxRounds }: { marking: boolean; maxRounds: number },
): { rounds: Round[]; drained: boolean } {
  const map = adjacency(edges)
  const queue = [origin]
  const seen = new Set([origin])
  const rounds: Round[] = []

  while (queue.length && rounds.length < maxRounds) {
    const current = queue.shift()!
    for (const v of map.get(current) ?? []) {
      if (marking) {
        if (seen.has(v)) continue
        seen.add(v)
      }
      queue.push(v)
    }
    rounds.push({ dequeued: current, queue: [...queue] })
  }

  return { rounds, drained: queue.length === 0 }
}

/**
 * Existe ciclo alcançável a partir da origem.
 *
 * Sem ciclo, a busca sem marcação também termina, e a figura de `graphs.c4`
 * estaria ilustrando o oposto do que o ciclo afirma. A checagem `figura` usa
 * isto para reprovar um grafo dessa forma.
 */
export function reachesCycle(edges: Edge[], origin: string): boolean {
  const map = adjacency(edges)
  const open = new Set<string>()
  const done = new Set<string>()

  const visit = (v: string): boolean => {
    if (open.has(v)) return true
    if (done.has(v)) return false
    open.add(v)
    for (const w of map.get(v) ?? []) if (visit(w)) return true
    open.delete(v)
    done.add(v)
    return false
  }

  return visit(origin)
}
