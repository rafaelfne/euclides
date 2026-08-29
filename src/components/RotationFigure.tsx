import type { Figure } from '@/content/schema'
import { build, heightOf, inorder, place, rebalanceOnce, ROTATION_LABEL, type Placed } from '@/lib/bst'

/**
 * A mesma árvore antes e depois da rotação, com as duas travessias embaixo.
 *
 * As travessias aparecem porque a afirmação do ciclo não é "a altura cai": é
 * "a altura cai E a ordem não muda". Mostrar só as duas árvores deixa a metade
 * que legitima a operação por conta da memória de quem lê, e é justamente a
 * metade que se confere em trinta segundos.
 */
const COL = 42
const LEVEL = 46
const R = 15

function Tree({ nodes, moved }: { nodes: Placed[]; moved: Set<number> }) {
  const cols = Math.max(...nodes.map((n) => n.x)) + 1
  const levels = Math.max(...nodes.map((n) => n.y)) + 1
  const cx = (n: { x: number }) => n.x * COL + 12 + R
  const cy = (n: { y: number }) => n.y * LEVEL + 8 + R

  return (
    <svg viewBox={`0 0 ${cols * COL + 24} ${levels * LEVEL + 16}`} className="w-full">
      {nodes.map((n) =>
        n.parent ? (
          <line
            key={`e${n.key}`}
            x1={cx(n.parent)}
            y1={cy(n.parent)}
            x2={cx(n)}
            y2={cy(n)}
            stroke="var(--rule)"
            strokeWidth="1.25"
          />
        ) : null,
      )}
      {nodes.map((n) => (
        <g key={n.key}>
          <circle
            cx={cx(n)}
            cy={cy(n)}
            r={R}
            fill={moved.has(n.key) ? 'var(--contract-bg)' : 'var(--panel)'}
            stroke={moved.has(n.key) ? 'var(--contract)' : 'var(--rule)'}
            strokeWidth="1.5"
          />
          <text
            x={cx(n)}
            y={cy(n) + 4}
            textAnchor="middle"
            fill={moved.has(n.key) ? 'var(--contract)' : 'var(--fg-2)'}
            fontSize="11.5"
            fontFamily="var(--mono)"
          >
            {n.key}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function RotationFigure({ figure }: { figure: Extract<Figure, { kind: 'rotation' }> }) {
  const before = build(figure.keys)
  const { root: after, rotation } = rebalanceOnce(before)

  const placedBefore = place(before)
  const placedAfter = place(after)
  const depthBefore = new Map(placedBefore.map((n) => [n.key, n.y]))
  const moved = new Set(placedAfter.filter((n) => depthBefore.get(n.key) !== n.y).map((n) => n.key))

  const panels = [
    { label: 'antes', nodes: placedBefore, height: heightOf(before), moved: new Set<number>() },
    { label: 'depois', nodes: placedAfter, height: heightOf(after), moved },
  ]
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
                  altura {p.height}
                </span>
              </div>
              <Tree nodes={p.nodes} moved={p.moved} />
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
