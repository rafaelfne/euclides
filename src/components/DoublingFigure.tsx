import type { Figure } from '@/content/schema'
import { Stepper } from './Stepper'

/**
 * A dobra de capacidade, uma inserção por passo.
 *
 * As posições em que a cópia acontece são DERIVADAS da regra de dobrar, nunca
 * digitadas: mudar a capacidade inicial move as marcas sozinho.
 *
 * A figura existe para uma coisa só, e ela é a afirmação do ciclo: a barra de
 * custo tem picos altíssimos e a média por inserção desce e estabiliza. Ver as
 * duas ao mesmo tempo é o que separa amortizado de caso médio. ADR-0025.
 */
const W = 640
const H = 130
const PAD = 34

interface Step { i: number; copied: number; capacity: number; cost: number; total: number; avg: number }

function steps(figure: Extract<Figure, { kind: 'growth-doubling' }>): Step[] {
  const out: Step[] = []
  let capacity = figure.initialCapacity
  let size = 0
  let total = 0

  for (let i = 1; i <= figure.insertions; i++) {
    let copied = 0
    if (size === capacity) { copied = size; capacity *= 2 }
    size += 1
    const cost = 1 + copied
    total += cost
    out.push({ i, copied, capacity, cost, total, avg: total / i })
  }
  return out
}

export function DoublingFigure({ figure }: { figure: Extract<Figure, { kind: 'growth-doubling' }> }) {
  const all = steps(figure)
  const maxCost = Math.max(...all.map((s) => s.cost))
  const bar = (W - PAD * 2) / all.length

  return (
    <div className="border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">
          {figure.insertions} inserções · capacidade dobra a partir de {figure.initialCapacity}
        </span>
      </div>

      <Stepper
        count={all.length}
        labelFor={(k) => {
          const s = all[k]!
          return s.copied
            ? `inserção ${s.i}: copiou ${s.copied}, capacidade vai a ${s.capacity}`
            : `inserção ${s.i}: custo 1`
        }}
      >
        {(upTo) => {
          const shown = all.slice(0, upTo + 1)
          const here = all[upTo]!
          return (
            <div className="flex flex-col gap-0 md:flex-row">
              <div className="min-w-0 flex-1 overflow-x-auto p-3">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[420px]" role="img"
                     aria-label="custo de cada inserção, com picos nas dobras de capacidade">
                  <line x1={PAD} y1={H - 24} x2={W - PAD} y2={H - 24} stroke="var(--rule)" />

                  {shown.map((s) => {
                    const h = (s.cost / maxCost) * (H - 46)
                    return (
                      <rect
                        key={s.i}
                        x={PAD + (s.i - 1) * bar}
                        y={H - 24 - h}
                        width={Math.max(2, bar - 3)}
                        height={h}
                        fill={s.copied ? 'var(--implementation)' : 'var(--rule)'}
                      />
                    )
                  })}

                  {/* a média por inserção, que é a afirmação do ciclo */}
                  <polyline
                    fill="none"
                    stroke="var(--contract)"
                    strokeWidth="1.75"
                    points={shown
                      .map((s) => `${PAD + (s.i - 1) * bar + bar / 2},${H - 24 - (s.avg / maxCost) * (H - 46)}`)
                      .join(' ')}
                  />

                  <text x={PAD} y={H - 8} fill="var(--fg-4)" fontSize="10" fontFamily="var(--mono)">1</text>
                  <text x={W - PAD} y={H - 8} textAnchor="end" fill="var(--fg-4)" fontSize="10" fontFamily="var(--mono)">
                    {figure.insertions}
                  </text>
                  <text x={PAD} y={16} fill="var(--implementation)" fontSize="10.5" fontFamily="var(--mono)">
                    barra: custo da inserção
                  </text>
                  <text x={W - PAD} y={16} textAnchor="end" fill="var(--contract)" fontSize="10.5" fontFamily="var(--mono)">
                    linha: média por inserção
                  </text>
                </svg>
              </div>

              <table className="w-full shrink-0 border-collapse text-left md:w-[280px]">
                <thead>
                  <tr>
                    {['nº', 'custo', 'total', 'média'].map((h) => (
                      <th key={h} className="lbl border-b border-rule px-2.5 py-1.5 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.slice(-6).map((s) => (
                    <tr key={s.i} className={s.i === here.i ? 'bg-contract-bg' : undefined}>
                      <td className="border-b border-rule-soft px-2.5 py-1 font-mono text-[12px] text-fg-3">{s.i}</td>
                      <td className={`border-b border-rule-soft px-2.5 py-1 font-mono text-[12px] ${s.copied ? 'text-implementation' : 'text-fg-2'}`}>{s.cost}</td>
                      <td className="border-b border-rule-soft px-2.5 py-1 font-mono text-[12px] text-fg-2">{s.total}</td>
                      <td className="border-b border-rule-soft px-2.5 py-1 font-mono text-[12px] text-contract">
                        {s.avg.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }}
      </Stepper>

      <p className="m-0 border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </p>
    </div>
  )
}
