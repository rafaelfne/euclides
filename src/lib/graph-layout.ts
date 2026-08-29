import { adjacency, layers, type Edge } from './traversal'

/**
 * Onde cada vértice fica, e por onde cada aresta passa.
 *
 * A posição sai das camadas da busca em largura, e nenhuma coordenada é
 * autorada — ADR-0017. O que este módulo acrescenta é a aresta de volta.
 *
 * Uma aresta que anda para trás liga duas colunas com uma terceira no meio, e
 * em linha reta ela passa POR DENTRO do vértice do meio: o desenho fica idêntico
 * ao de um grafo sem ciclo. É o defeito de sempre de desenho derivado — a
 * figura não mente sobre o dado, ela só esconde. Aresta de volta sai por baixo,
 * em curva, e a área do desenho cresce para caber a barriga dela.
 */
export interface Dims {
  col: number
  row: number
  r: number
  pad: number
}

export type Point = { x: number; y: number }

const DIP = 36

export function positions(edges: Edge[], origin: string, d: Dims) {
  const byLayer = layers(edges, origin)
  const tallest = Math.max(...byLayer.map((l) => l.length))
  const at = new Map<string, Point>()
  byLayer.forEach((layer, depth) => {
    layer.forEach((v, i) => {
      const offset = (tallest - layer.length) / 2
      at.set(v, { x: d.pad + depth * d.col, y: d.pad + (i + offset) * d.row })
    })
  })

  const curved = [...adjacency(edges).entries()].some(([from, tos]) =>
    tos.some((to) => at.has(from) && at.has(to) && at.get(to)!.x <= at.get(from)!.x),
  )

  return {
    at,
    width: d.pad * 2 + (byLayer.length - 1) * d.col,
    height: d.pad * 2 + (tallest - 1) * d.row + (curved ? DIP + d.r : 0),
  }
}

/** Verdadeiro quando a aresta anda para trás ou fica na mesma coluna. */
export const goesBack = (a: Point, b: Point) => b.x <= a.x

export function edgePath(a: Point, b: Point, d: Dims): string {
  if (goesBack(a, b)) {
    const dip = Math.max(a.y, b.y) + d.r + DIP
    return `M ${a.x} ${a.y + d.r} Q ${(a.x + b.x) / 2} ${dip} ${b.x} ${b.y + d.r + 5}`
  }
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const x1 = a.x + (dx / len) * d.r
  const y1 = a.y + (dy / len) * d.r
  const x2 = b.x - (dx / len) * (d.r + 5)
  const y2 = b.y - (dy / len) * (d.r + 5)
  return `M ${x1} ${y1} L ${x2} ${y2}`
}

export function edgesOf(edges: Edge[]): Array<{ from: string; to: string }> {
  return [...adjacency(edges).entries()].flatMap(([from, tos]) => tos.map((to) => ({ from, to })))
}
