import dagre from '@dagrejs/dagre'

const NODE_WIDTH = 174
const NODE_HEIGHT = 42

export type FlowLayout = {
  nodes: Array<{ id: string; position: { x: number; y: number } }>
  edges: Array<{ from: string; to: string }>
  width: number
  height: number
}

export function layoutHorizontalFlow(ids: readonly string[], edges: readonly { from: string; to: string }[]): FlowLayout {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  graph.setGraph({ rankdir: 'LR', nodesep: 34, ranksep: 62, marginx: 24, marginy: 24 })

  ids.forEach((id) => graph.setNode(id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  edges.forEach(({ from, to }) => graph.setEdge(from, to))
  dagre.layout(graph)

  const dimensions = graph.graph()
  const width = dimensions.width ?? NODE_WIDTH
  return {
    nodes: graph.nodes().map((id) => {
      const point = graph.node(id)
      return {
        id,
        position: { x: point.x - NODE_WIDTH / 2, y: point.y - NODE_HEIGHT / 2 },
      }
    }),
    edges: edges.map(({ from, to }) => ({ from, to })),
    width,
    height: dimensions.height ?? NODE_HEIGHT,
  }
}
