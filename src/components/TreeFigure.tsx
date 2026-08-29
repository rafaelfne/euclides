import type { Figure } from '@/content/schema'
import { Stepper } from './Stepper'

/**
 * Duas árvores das mesmas chaves, em ordens de chegada diferentes.
 *
 * A construção e a medida são derivadas: o conteúdo declara só as sequências.
 * É o que permite `scripts/test-traces.ts` conferir a altura da figura contra a
 * do gerador de referência de `trees.e1`, que insere a mesma sequência.
 */
type Node = { key: number; left: Node | null; right: Node | null }

function insert(root: Node | null, key: number): Node {
  if (!root) return { key, left: null, right: null }
  if (key < root.key) root.left = insert(root.left, key)
  else root.right = insert(root.right, key)
  return root
}

const heightOf = (n: Node | null): number => (n ? 1 + Math.max(heightOf(n.left), heightOf(n.right)) : -1)

type Placed = { key: number; x: number; y: number; parent: { x: number; y: number } | null }

/**
 * Coluna pela ordem simétrica, linha pela profundidade, a disposição clássica,
 * e a única em que a árvore degenerada fica visivelmente diagonal.
 */
function place(root: Node | null): Placed[] {
  const column = new Map<number, number>()
  let next = 0
  const inorder = (n: Node | null) => {
    if (!n) return
    inorder(n.left)
    column.set(n.key, next++)
    inorder(n.right)
  }
  inorder(root)

  const nodes: Placed[] = []
  const visit = (n: Node | null, depth: number, parent: Node | null) => {
    if (!n) return
    nodes.push({
      key: n.key,
      x: column.get(n.key)!,
      y: depth,
      parent: parent ? { x: column.get(parent.key)!, y: depth - 1 } : null,
    })
    visit(n.left, depth + 1, n)
    visit(n.right, depth + 1, n)
  }
  visit(root, 0, null)
  return nodes
}

const COL = 42
const LEVEL = 46
const R = 15

export function TreeFigure({ figure, autoPlay }: { figure: Extract<Figure, { kind: 'tree' }>; autoPlay?: boolean }) {
  const total = figure.sequences[0]!.keys.length

  const render = (upTo: number) => {
    const trees = figure.sequences.map((seq) => {
      const keys = seq.keys.slice(0, upTo + 1)
      let root: Node | null = null
      for (const k of keys) root = insert(root, k)
      return { label: seq.label, nodes: place(root), height: heightOf(root), keys }
    })
    return (
    <figure className="m-0">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">As mesmas chaves, duas ordens de chegada</span>
      </div>
      <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
        {trees.map((t) => {
          const cols = Math.max(...t.nodes.map((n) => n.x)) + 1
          const levels = t.height + 1
          const w = cols * COL + 24
          const h = levels * LEVEL + 16
          return (
            <div key={t.label} className="flex flex-col gap-2 border border-rule-soft bg-panel-head p-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[11px] text-fg-2">{t.keys.join(' ')}</span>
                <span
                  className={`lbl ${t.keys.length > 2 && t.height >= t.keys.length - 1 ? 'text-implementation' : 'text-contract'}`}
                >
                  altura {t.height}
                </span>
              </div>
              <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={t.label}>
                {t.nodes.map((n) =>
                  n.parent ? (
                    <line
                      key={`e${n.key}`}
                      x1={n.parent.x * COL + 12 + R}
                      y1={n.parent.y * LEVEL + 8 + R}
                      x2={n.x * COL + 12 + R}
                      y2={n.y * LEVEL + 8 + R}
                      stroke="var(--rule)"
                      strokeWidth="1.25"
                    />
                  ) : null,
                )}
                {t.nodes.map((n) => (
                  <g key={n.key}>
                    <circle
                      cx={n.x * COL + 12 + R}
                      cy={n.y * LEVEL + 8 + R}
                      r={R}
                      fill="var(--panel)"
                      stroke={t.keys.length > 2 && t.height >= t.keys.length - 1 ? 'var(--implementation)' : 'var(--contract)'}
                      strokeWidth="1.5"
                    />
                    <text
                      x={n.x * COL + 12 + R}
                      y={n.y * LEVEL + 8 + R + 4}
                      textAnchor="middle"
                      fill="var(--fg-2)"
                      fontSize="11.5"
                      fontFamily="var(--mono)"
                    >
                      {n.key}
                    </text>
                  </g>
                ))}
              </svg>
              <span className="text-[11.5px] leading-snug text-fg-4">{t.label}</span>
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
