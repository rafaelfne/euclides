import type { Figure } from '@/content/schema'
import { layoutHorizontalFlow } from '@/lib/flow-layout'
import { flowEdges, FlowCanvas, type FlowNode } from './FlowCanvas'

export function ConceptFlowFigure({ figure }: { figure: Extract<Figure, { kind: 'concept-flow' }> }) {
  const layout = layoutHorizontalFlow(figure.nodes.map((node) => node.id), figure.edges)
  const nodesById = new Map(figure.nodes.map((node) => [node.id, node]))
  const nodes: FlowNode[] = layout.nodes.map((node) => {
    const content = nodesById.get(node.id)!
    return {
      id: node.id,
      type: 'euclides',
      position: node.position,
      data: { label: content.label, tone: content.tone ?? 'neutral', direction: 'horizontal' },
    }
  })

  return (
    <figure className="m-0 border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">A ideia em uma sequência</span>
      </div>
      <div className="p-3">
        <FlowCanvas nodes={nodes} edges={flowEdges(layout.edges)} height={Math.max(160, layout.height + 24)} ariaLabel={figure.caption} />
      </div>
      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </figcaption>
    </figure>
  )
}
