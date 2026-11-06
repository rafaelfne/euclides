import type { Figure } from '@/content/schema'
import { bfsOrder, dfsOrder } from '@/lib/traversal'
import { positions, type Dims } from '@/lib/graph-layout'
import { flowEdges, FlowCanvas, type FlowNode, type FlowTone } from './FlowCanvas'
import { Stepper } from './Stepper'

const DIMS: Dims = { col: 92, row: 62, r: 17, pad: 30 }

function Panel({
  figure,
  title,
  frontier,
  order,
  upTo,
  accent,
}: {
  figure: Extract<Figure, { kind: 'traversal' }>
  title: string
  frontier: string
  order: string[]
  upTo: number
  accent: FlowTone
}) {
  const { at, height } = positions(figure.edges, figure.origin, DIMS)
  const visited = order.slice(0, upTo + 1)
  const rank = new Map(visited.map((v, i) => [v, i + 1]))
  const nodes: FlowNode[] = [...at.entries()].map(([vertex, point]) => ({
    id: vertex,
    type: 'euclides',
    position: { x: point.x, y: point.y },
    data: {
      label: vertex,
      secondary: rank.get(vertex)?.toString(),
      tone: rank.has(vertex) ? accent : 'neutral',
    },
  }))

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between border-b border-rule px-3 py-1.5">
        <span className={`lbl text-${accent}`}>{title}</span>
        <span className="font-mono text-[12px] text-fg-4">{frontier}</span>
      </div>
      <div className="overflow-x-auto px-3 py-2">
        <FlowCanvas
          nodes={nodes}
          edges={flowEdges(figure.edges, 'neutral', at)}
          height={Math.max(170, height + 26)}
          ariaLabel={`${title}: ${visited.join(' → ') || 'nenhum vértice visitado'}`}
        />
      </div>
      <div className={`border-t border-rule px-3 py-2 font-mono text-[12px] text-${accent}`}>
        {visited.join(' → ') || '—'}
      </div>
    </div>
  )
}

export function TraversalFigure({ figure, autoPlay }: { figure: Extract<Figure, { kind: 'traversal' }>; autoPlay?: boolean }) {
  return (
    <figure className="m-0 border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">Percurso · origem {figure.origin}, o mesmo grafo nos dois</span>
      </div>
      <Stepper
        autoPlay={autoPlay}
        count={bfsOrder(figure.edges, figure.origin).length}
        labelFor={(k) =>
          `${k + 1}º visitado, largura ${bfsOrder(figure.edges, figure.origin)[k]}, profundidade ${dfsOrder(figure.edges, figure.origin)[k]}`
        }
      >
        {(upTo) => (
          <div className="flex flex-col divide-y divide-rule sm:flex-row sm:divide-x sm:divide-y-0">
            <Panel
              figure={figure}
              title="Em largura"
              frontier="fila, sai o primeiro"
              order={bfsOrder(figure.edges, figure.origin)}
              upTo={upTo}
              accent="contract"
            />
            <Panel
              figure={figure}
              title="Em profundidade"
              frontier="pilha, sai o último"
              order={dfsOrder(figure.edges, figure.origin)}
              upTo={upTo}
              accent="cost"
            />
          </div>
        )}
      </Stepper>
      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </figcaption>
    </figure>
  )
}
