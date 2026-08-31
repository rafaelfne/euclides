'use client'

import dynamic from 'next/dynamic'
import { MarkerType, type Edge, type Node } from '@xyflow/react'

export type FlowTone = 'contract' | 'implementation' | 'cost' | 'neutral'

export type FlowNodeData = {
  label: string
  secondary?: string
  tone?: FlowTone
  faded?: boolean
  direction?: 'horizontal' | 'vertical'
}

type FlowPoint = { x: number; y: number }

export type FlowNode = Node<FlowNodeData>

export function flowEdges(
  edges: Array<{ from: string; to: string }>,
  tone: FlowTone = 'neutral',
  positions?: ReadonlyMap<string, FlowPoint>,
): Edge[] {
  const color = tone === 'neutral' ? 'var(--fg-4)' : `var(--${tone})`
  return edges.map(({ from, to }) => {
    const source = positions?.get(from)
    const target = positions?.get(to)
    const routeBack = Boolean(source && target && target.x < source.x)
    const routeVertical = Boolean(source && target && target.x === source.x && target.y !== source.y)
    const sourceHandle = routeBack ? 'bottom' : routeVertical ? (target!.y > source!.y ? 'bottom' : 'top') : undefined
    const targetHandle = routeBack ? 'bottom' : routeVertical ? (target!.y > source!.y ? 'top' : 'bottom') : undefined
    return {
      id: `${from}-${to}`,
      source: from,
      target: to,
      sourceHandle,
      targetHandle,
      type: 'step',
      pathOptions: { offset: 18, stepPosition: 0.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color },
      style: { stroke: color, strokeWidth: 1.7 },
    }
  })
}

const FlowCanvasView = dynamic(() => import('./FlowCanvasView').then((module) => module.FlowCanvasView), {
  ssr: false,
  loading: () => <div className="euclides-flow" aria-hidden />,
})

export function FlowCanvas({
  nodes,
  edges,
  height = 220,
  ariaLabel,
}: {
  nodes: FlowNode[]
  edges: Edge[]
  height?: number
  ariaLabel: string
}) {
  return (
    <FlowCanvasView nodes={nodes} edges={edges} height={height} ariaLabel={ariaLabel} />
  )
}
