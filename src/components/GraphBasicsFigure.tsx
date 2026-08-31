import type { Figure } from '@/content/schema'
import { flowEdges, FlowCanvas, type FlowNode } from './FlowCanvas'
import { positions } from '@/lib/graph-layout'

const DIMS = { col: 116, row: 72, r: 22, pad: 34 }

export function GraphBasicsFigure({ figure }: { figure: Extract<Figure, { kind: 'graph-basics' }> }) {
  const { at, height } = positions(figure.edges, figure.origin, DIMS)
  const nodes: FlowNode[] = [...at.entries()].map(([vertex, point]) => ({
    id: vertex,
    type: 'euclides',
    position: { x: point.x, y: point.y },
    data: { label: vertex, tone: 'contract', direction: 'horizontal' },
  }))

  return (
    <figure className="m-0 border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">Um grafo em uma imagem</span>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
        <FlowCanvas
          nodes={nodes}
          edges={flowEdges(figure.edges, 'contract', at)}
          height={Math.max(190, height + 28)}
          ariaLabel={figure.caption}
        />
        <div className="flex flex-col gap-3 border-l border-rule-soft pl-4">
          <div>
            <div className="lbl mb-1 text-contract">vértice</div>
            <p className="m-0 text-[12.5px] leading-relaxed text-fg-3">Um ponto do grafo. Aqui, A, B, C e D.</p>
          </div>
          <div>
            <div className="lbl mb-1 text-contract">aresta</div>
            <p className="m-0 text-[12.5px] leading-relaxed text-fg-3">Uma ligação entre dois vértices. A seta mostra a direção.</p>
          </div>
          <div className="border-t border-rule-soft pt-2 font-mono text-[12px] text-fg-2">A → B, A → C, B → C e B → D</div>
        </div>
      </div>
      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </figcaption>
    </figure>
  )
}
