import type { Figure } from '@/content/schema'
import { bfsOrder, dfsOrder } from '@/lib/traversal'
import { edgePath, edgesOf, positions, type Dims } from '@/lib/graph-layout'
import { Stepper } from './Stepper'

/**
 * O mesmo grafo, dois percursos, e a posição dos vértices vinda das camadas da
 * busca em largura, por isso o painel da esquerda cresce em colunas e o da
 * direita desce por um ramo. Nada aqui é coordenada autorada. Ver ADR-0017.
 */
const DIMS: Dims = { col: 92, row: 62, r: 17, pad: 30 }
const R = DIMS.r

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
  accent: string
}) {
  const { at, width, height } = positions(figure.edges, figure.origin, DIMS)
  const visited = order.slice(0, upTo + 1)
  const rank = new Map(visited.map((v, i) => [v, i + 1]))

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between border-b border-rule px-3 py-1.5">
        <span className="lbl" style={{ color: accent }}>{title}</span>
        <span className="font-mono text-[10.5px] text-fg-4">{frontier}</span>
      </div>
      <div className="overflow-x-auto px-3 py-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[220px]" style={{ maxWidth: width * 1.4 }}>
          {edgesOf(figure.edges).map(({ from, to }) => (
            <path
              key={`${from}-${to}`}
              d={edgePath(at.get(from)!, at.get(to)!, DIMS)}
              fill="none"
              stroke="var(--rule)"
              strokeWidth="1.25"
              markerEnd="url(#aresta)"
            />
          ))}

          {[...at.entries()].map(([v, p]) => (
            <g key={v}>
              <circle
                cx={p.x}
                cy={p.y}
                r={R}
                fill="var(--panel-head)"
                stroke={rank.has(v) ? accent : 'var(--rule)'}
                strokeWidth="1.25"
              />
              <text
                x={p.x}
                y={p.y + 4.5}
                textAnchor="middle"
                fill={rank.has(v) ? 'var(--fg-1)' : 'var(--fg-5)'}
                fontSize="13"
                fontFamily="var(--mono)"
              >
                {v}
              </text>
              <text
                x={p.x + R - 2}
                y={p.y - R + 2}
                textAnchor="middle"
                fill={accent}
                fontSize="11"
                fontFamily="var(--mono)"
              >
                {rank.get(v)}
              </text>
            </g>
          ))}

          <defs>
            <marker id="aresta" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="var(--rule)" />
            </marker>
          </defs>
        </svg>
      </div>
      <div className="border-t border-rule px-3 py-2 font-mono text-[11.5px]" style={{ color: accent }}>
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
              accent="var(--contract)"
            />
            <Panel
              figure={figure}
              title="Em profundidade"
              frontier="pilha, sai o último"
              order={dfsOrder(figure.edges, figure.origin)}
              upTo={upTo}
              accent="var(--cost)"
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
