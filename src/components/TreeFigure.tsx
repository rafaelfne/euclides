import type { Figure } from '@/content/schema'
import { build, heightOf } from '@/lib/bst'
import { layoutTree } from '@/lib/tree-layout'
import { flowEdges, FlowCanvas, type FlowNode } from './FlowCanvas'
import { Stepper } from './Stepper'

export function TreeFigure({ figure, autoPlay }: { figure: Extract<Figure, { kind: 'tree' }>; autoPlay?: boolean }) {
  const total = figure.sequences[0]!.keys.length

  const render = (upTo: number) => {
    const trees = figure.sequences.map((seq) => {
      const keys = seq.keys.slice(0, upTo + 1)
      const root = build(keys)
      return { label: seq.label, layout: layoutTree(root), height: heightOf(root), keys }
    })
    const canvasHeight = Math.max(150, Math.max(...trees.map((tree) => tree.layout.height)) + 20)
    return (
    <figure className="m-0">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">As mesmas chaves, duas ordens de chegada</span>
      </div>
      <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
        {trees.map((t) => {
          const unbalanced = t.keys.length > 2 && t.height >= t.keys.length - 1
          const nodes: FlowNode[] = t.layout.nodes.map((n) => ({
            id: String(n.key),
            type: 'euclides',
            position: n.position,
            data: { label: String(n.key), tone: unbalanced ? 'implementation' : 'contract', direction: 'vertical' },
          }))
          const edges = flowEdges(t.layout.edges)
          return (
            <div key={t.label} className="flex flex-col gap-2 border border-rule-soft bg-panel-head p-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[12px] text-fg-2">{t.keys.join(' ')}</span>
                <span
                  className={`lbl ${unbalanced ? 'text-implementation' : 'text-contract'}`}
                >
                  altura {t.height}
                </span>
              </div>
              <FlowCanvas nodes={nodes} edges={edges} height={canvasHeight} ariaLabel={t.label} />
              <span className="text-[12px] leading-snug text-fg-4">{t.label}</span>
            </div>
          )
        })}
      </div>
    </figure>
    )
  }

  return (
    <div className="border border-rule bg-panel">
      <Stepper
        autoPlay={autoPlay}
        count={total}
        labelFor={(k) =>
          figure.sequences.map((seq) => seq.keys[k]).join('  ·  ') + '  inseridas'
        }
      >
        {render}
      </Stepper>
      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </figcaption>
    </div>
  )
}
