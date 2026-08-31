import type { Figure } from '@/content/schema'
import { build, heightOf, inorder, place, rebalanceOnce, ROTATION_LABEL, type Placed } from '@/lib/bst'
import { layoutTreeRelations } from '@/lib/tree-layout'
import { flowEdges, FlowCanvas, type FlowNode } from './FlowCanvas'

function treeLayout(nodes: Placed[]) {
  const relations = nodes.flatMap((node) => {
    if (!node.parent) return []
    const parent = nodes.find((candidate) => candidate.x === node.parent!.x && candidate.y === node.parent!.y)
    return parent ? [{ from: parent.key, to: node.key }] : []
  })
  return layoutTreeRelations(nodes.map((node) => node.key), relations)
}

function Tree({ layout, moved, height }: { layout: ReturnType<typeof treeLayout>; moved: Set<number>; height: number }) {
  const flowNodes: FlowNode[] = layout.nodes.map((n) => ({
    id: String(n.key),
    type: 'euclides',
    position: n.position,
    data: { label: String(n.key), tone: moved.has(n.key) ? 'contract' : 'neutral', direction: 'vertical' },
  }))
  return <FlowCanvas nodes={flowNodes} edges={flowEdges(layout.edges)} height={height} ariaLabel="árvore antes ou depois da rotação" />
}

export function RotationFigure({ figure }: { figure: Extract<Figure, { kind: 'rotation' }> }) {
  const before = build(figure.keys)
  const { root: after, rotation } = rebalanceOnce(before)

  const placedBefore = place(before)
  const placedAfter = place(after)
  const depthBefore = new Map(placedBefore.map((n) => [n.key, n.y]))
  const moved = new Set(placedAfter.filter((n) => depthBefore.get(n.key) !== n.y).map((n) => n.key))

  const panels = [
    { label: 'antes', nodes: placedBefore, treeHeight: heightOf(before), layout: treeLayout(placedBefore), moved: new Set<number>() },
    { label: 'depois', nodes: placedAfter, treeHeight: heightOf(after), layout: treeLayout(placedAfter), moved },
  ]
  const canvasHeight = Math.max(150, Math.max(...panels.map((panel) => panel.layout.height)) + 20)
  const order = inorder(before).join(' ')

  return (
    <div className="border border-rule bg-panel">
      <figure className="m-0">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule bg-panel-head px-3.5 py-2">
          <span className="lbl">A rotação, e o que ela não muda</span>
          {rotation && (
            <span className="font-mono text-[11.5px] text-contract">
              {ROTATION_LABEL[rotation.kind]} em {rotation.at}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
          {panels.map((p) => (
            <div key={p.label} className="flex flex-col gap-2 border border-rule-soft bg-panel-head p-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="lbl">{p.label}</span>
                <span className={`lbl ${p.label === 'depois' ? 'text-contract' : 'text-implementation'}`}>
                  altura {p.treeHeight}
                </span>
              </div>
              <Tree layout={p.layout} moved={p.moved} height={canvasHeight} />
            </div>
          ))}
        </div>

        <div className="border-t border-rule px-3.5 py-2.5">
          <span className="lbl">Travessia em ordem</span>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-[12px]">
            <span className="text-fg-2">antes {order}</span>
            <span className="text-fg-2">depois {inorder(after).join(' ')}</span>
          </div>
        </div>

        <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
          {figure.caption}
        </figcaption>
      </figure>
    </div>
  )
}
