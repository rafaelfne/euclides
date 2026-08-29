import type { Figure } from '@/content/schema'
import { build, heightOf, place } from '@/lib/bst'
import { Stepper } from './Stepper'

/**
 * Duas árvores das mesmas chaves, em ordens de chegada diferentes.
 *
 * A construção e a medida são derivadas: o conteúdo declara só as sequências.
 * É o que permite `scripts/test-traces.ts` conferir a altura da figura contra a
 * do gerador de referência de `trees.e1`, que insere a mesma sequência.
 */
const COL = 42
const LEVEL = 46
const R = 15

export function TreeFigure({ figure, autoPlay }: { figure: Extract<Figure, { kind: 'tree' }>; autoPlay?: boolean }) {
  const total = figure.sequences[0]!.keys.length

  const render = (upTo: number) => {
    const trees = figure.sequences.map((seq) => {
      const keys = seq.keys.slice(0, upTo + 1)
      const root = build(keys)
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
