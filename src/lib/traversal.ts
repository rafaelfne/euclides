export type Edge = { from: string; to: string }

/**
 * As duas ordens de percurso, derivadas das arestas declaradas.
 *
 * Este módulo existe para a figura de `graphs.c5`, e é DELIBERADAMENTE separado
 * de `src/lib/reference/graphs.ts`: lá o grafo é uma constante e a saída é um
 * traço com fila e visitados; aqui o grafo vem do conteúdo e a saída é só a
 * ordem. `scripts/test-traces.ts` afirma que os dois caminhos concordam — se
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

/** As camadas da busca em largura — é delas que sai a posição de cada vértice. */
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
