import type { Figure } from '@/content/schema'
import { Stepper } from './Stepper'

/**
 * A tabela com chaining. A distribuição é derivada de m e das chaves, com a
 * mesma h(k) = k que a implementação de referência de `hash.e1` usa, e é por
 * isso que `scripts/test-traces.ts` consegue conferir a figura contra o passo
 * do traço em que a tabela tem exatamente estas chaves.
 */
const ROW = 48
const PAD_LEFT = 104
const CELL = 78
const NOTE = 190

export function BucketsFigure({ figure, autoPlay }: { figure: Extract<Figure, { kind: 'buckets' }>; autoPlay?: boolean }) {
  const full = Array.from({ length: figure.m }, (_, i) => figure.keys.filter((k) => k % figure.m === i))
  const widest = Math.max(...full.map((b) => b.length))
  const w = PAD_LEFT + Math.max(1, widest) * CELL + NOTE
  const h = figure.m * ROW + 14

  const target = figure.searchFor
  const targetBucket = target === undefined ? -1 : target % figure.m

  const render = (upTo: number) => {
    const inserted = figure.keys.slice(0, upTo + 1)
    const buckets = Array.from({ length: figure.m }, (_, i) => inserted.filter((k) => k % figure.m === i))
    return (
    <figure className="m-0">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">Chaining · m = {figure.m}, h(k) = k</span>
      </div>
      <div className="overflow-x-auto p-3">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full min-w-[440px]"
          style={{ maxWidth: w * 1.05 }}
          role="img"
          aria-label={figure.caption}
        >
          {buckets.map((bucket, i) => {
            const y = 6 + i * ROW
            const hit = i === targetBucket
            return (
              <g key={i}>
                <text x={10} y={y + 25} fill="var(--fg-4)" fontSize="11" fontFamily="var(--mono)">
                  bucket {i}
                </text>
                <rect
                  x={PAD_LEFT - 12}
                  y={y}
                  width={10}
                  height={ROW - 12}
                  fill={hit ? 'var(--implementation)' : 'var(--rule)'}
                />

                {bucket.length === 0 && (
                  <text x={PAD_LEFT + 4} y={y + 25} fill="var(--fg-5)" fontSize="11.5" fontFamily="var(--mono)">
                    vazio
                  </text>
                )}

                {bucket.map((k, j) => (
                  <g key={k}>
                    {j > 0 && (
                      <line
                        x1={PAD_LEFT + j * CELL - 16}
                        y1={y + (ROW - 12) / 2}
                        x2={PAD_LEFT + j * CELL}
                        y2={y + (ROW - 12) / 2}
                        stroke="var(--implementation)"
                        strokeWidth="1.25"
                      />
                    )}
                    <rect
                      x={PAD_LEFT + j * CELL}
                      y={y}
                      width={CELL - 16}
                      height={ROW - 12}
                      fill={hit ? 'var(--implementation-bg)' : 'var(--panel-head)'}
                      stroke={hit ? 'var(--implementation)' : 'var(--rule)'}
                    />
                    <text
                      x={PAD_LEFT + j * CELL + (CELL - 16) / 2}
                      y={y + 25}
                      textAnchor="middle"
                      fill={hit ? 'var(--implementation)' : 'var(--fg-2)'}
                      fontSize="12.5"
                      fontFamily="var(--mono)"
                    >
                      {k}
                    </text>
                  </g>
                ))}

                {bucket.length > 1 && (
                  <text
                    x={PAD_LEFT + Math.max(1, widest) * CELL + 4}
                    y={y + 25}
                    fill="var(--fg-4)"
                    fontSize="11"
                    fontFamily="var(--mono)"
                  >
                    todas deixam resto {i} mod {figure.m}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      {target !== undefined && buckets[targetBucket]!.includes(target) && (
        <div className="border-t border-rule px-3.5 py-2 font-mono text-[11.5px] text-fg-3">
          buscar({target}): 1 endereço, e depois{' '}
          <span className="text-implementation">
            {buckets[targetBucket]!.indexOf(target) + 1} comparações de chave
          </span>{' '}
          dentro do bucket {targetBucket}
        </div>
      )}
    </figure>
    )
  }

  return (
    <div className="border border-rule bg-panel">
      <Stepper
        autoPlay={autoPlay}
        count={figure.keys.length}
        labelFor={(k) => `inserida a chave ${figure.keys[k]} → bucket ${figure.keys[k]! % figure.m}`}
      >
        {render}
      </Stepper>
      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </figcaption>
    </div>
  )
}
