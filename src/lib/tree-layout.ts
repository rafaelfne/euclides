import dagre from '@dagrejs/dagre'
import type { BstNode } from './bst'

const NODE_WIDTH = 52
const NODE_HEIGHT = 36

export type TreeLayoutNode = {
  key: number
  position: { x: number; y: number }
}

export type TreeLayout = {
  nodes: TreeLayoutNode[]
  edges: Array<{ from: string; to: string }>
  width: number
  height: number
}

type TreeRelation = { from: number; to: number }

function layoutRelations(keys: readonly number[], relations: readonly TreeRelation[]): TreeLayout {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  graph.setGraph({ rankdir: 'TB', nodesep: 28, ranksep: 42, marginx: 24, marginy: 24 })

  keys.forEach((key) => {
    const id = String(key)
    graph.setNode(id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })
  const edges = relations.map(({ from, to }) => ({ from: String(from), to: String(to) }))
  edges.forEach(({ from, to }) => graph.setEdge(from, to))
  dagre.layout(graph)
  const dimensions = graph.graph()
  const width = dimensions.width ?? NODE_WIDTH

  const nodes = graph.nodes().map((id) => {
    const point = graph.node(id)
    return {
      key: Number(id),
      position: { x: width - point.x - NODE_WIDTH / 2, y: point.y - NODE_HEIGHT / 2 },
    }
  })

  return {
    nodes,
    edges,
    width,
    height: dimensions.height ?? NODE_HEIGHT,
  }
}

export function layoutTree(root: BstNode | null): TreeLayout {
  const keys: number[] = []
  const relations: TreeRelation[] = []
  const visit = (node: BstNode | null) => {
    if (!node) return
    keys.push(node.key)
    if (node.left) relations.push({ from: node.key, to: node.left.key })
    if (node.right) relations.push({ from: node.key, to: node.right.key })
    visit(node.left)
    visit(node.right)
  }
  visit(root)
  return layoutRelations(keys, relations)
}

export function layoutTreeRelations(keys: readonly number[], relations: readonly TreeRelation[]): TreeLayout {
  return layoutRelations(keys, relations)
}
