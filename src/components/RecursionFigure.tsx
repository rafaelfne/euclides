import type { Figure } from '@/content/schema'
import { flowEdges, FlowCanvas, type FlowNode } from './FlowCanvas'
import { Stepper } from './Stepper'

type Level = { level: number; calls: number; size: number; cost: number }

const NODE_W = 46
const NODE_H = 26
const GAP_X = 12
const LEVEL_H = 62
const PAD = 10

const MAX_DRAWN = 8

function levelsOf(figure: Extract<Figure, { kind: 'recursion' }>): Level[] {
  const out: Level[] = []
  let size = figure.n
  let calls = 1
  let level = 0
  while (size >= 1) {
    out.push({ level, calls, size, cost: calls * size })
    if (size === 1) break
    size = size / figure.divisor
    calls = calls * figure.branches
    level += 1
  }
  return out
}

const drawnAt = (calls: number) => Math.min(calls, MAX_DRAWN)

const rowWidth = (drawn: number) => drawn * NODE_W + (drawn - 1) * GAP_X

function centerX(k: number, drawn: number, width: number) {
  return (width - rowWidth(drawn)) / 2 + k * (NODE_W + GAP_X) + NODE_W / 2
}

export function RecursionFigure({
  figure, autoPlay,
}: {
  figure: Extract<Figure, { kind: 'recursion' }>
  autoPlay?: boolean
}) {
  const levels = levelsOf(figure)
  const total = levels.reduce((sum, l) => sum + l.cost, 0)
  const flat = levels.every((l) => l.cost === levels[0]!.cost)
  const widest = Math.max(...levels.map((l) => drawnAt(l.calls)))
  const width = rowWidth(widest) + PAD * 2
  const height = levels.length * LEVEL_H

  return (
    <div className="border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">
          T(n) = {figure.branches}·T(n/{figure.divisor}) + n, com n = {figure.n}
        </span>
      </div>

      <Stepper
        autoPlay={autoPlay}
        count={levels.length}
        labelFor={(k) => {
          const l = levels[k]!
          return `nível ${l.level}: ${l.calls} ${l.calls === 1 ? 'chamada' : 'chamadas'} × ${l.size} = ${l.cost}`
        }}
      >
        {(upTo) => (
          <div className="flex flex-col gap-0 md:flex-row">
            <div className="min-w-0 flex-1 overflow-x-auto border-b border-rule p-3 md:border-r md:border-b-0">
              {(() => {
                const nodes: FlowNode[] = levels.flatMap((l, i) => {
                  const drawn = drawnAt(l.calls)
                  return Array.from({ length: drawn }, (_, k) => ({
                    id: `n${i}-${k}`,
                    type: 'euclides',
                    position: { x: centerX(k, drawn, width) - NODE_W / 2, y: i * LEVEL_H + PAD },
                    data: {
                      label: l.size === figure.n ? 'n' : `n/${Math.round(figure.n / l.size)}`,
                      secondary: k === 0 && l.calls > MAX_DRAWN ? `de ${l.calls}` : undefined,
                      tone: i > upTo ? 'neutral' : 'contract',
                      faded: i > upTo,
                      direction: 'vertical',
                    },
                  }))
                })
                const edgeSpecs = levels.flatMap((l, i) => {
                  if (i === 0) return []
                  const drawn = drawnAt(l.calls)
                  const above = drawnAt(levels[i - 1]!.calls)
                  return Array.from({ length: drawn }, (_, k) => ({
                    from: `n${i - 1}-${Math.min(Math.floor(k / figure.branches), above - 1)}`,
                    to: `n${i}-${k}`,
                    level: i,
                  }))
                })
                const edges = flowEdges(edgeSpecs).map((edge, index) => ({
                  ...edge,
                  style: { ...edge.style, stroke: edgeSpecs[index]!.level > upTo ? 'var(--rule-soft)' : 'var(--contract-rule)' },
                }))
                return <FlowCanvas nodes={nodes} edges={edges} height={Math.max(190, height + 22)} ariaLabel={`Árvore de recursão com ${levels.length} níveis`} />
              })()}
            </div>

            <table className="w-full shrink-0 border-collapse text-left md:w-[300px]">
              <thead>
                <tr>
                  {['nível', 'chamadas', 'tamanho', 'custo'].map((h) => (
                    <th key={h} className="lbl border-b border-rule px-2.5 py-1.5 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {levels.slice(0, upTo + 1).map((l) => (
                  <tr key={l.level} className={l.level === upTo ? 'bg-contract-bg' : undefined}>
                    <td className="border-b border-rule-soft px-2.5 py-1 font-mono text-[12px] text-fg-3">{l.level}</td>
                    <td className="border-b border-rule-soft px-2.5 py-1 font-mono text-[12px] text-fg-2">{l.calls}</td>
                    <td className="border-b border-rule-soft px-2.5 py-1 font-mono text-[12px] text-fg-2">{l.size}</td>
                    <td className="border-b border-rule-soft px-2.5 py-1 font-mono text-[12px] text-contract">{l.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Stepper>

      <div className="border-t border-rule px-3.5 py-2 font-mono text-[12px] text-fg-3">
        {/* O último nível é o caso base, e a soma exata é n log n + n. Dizer que
            o total inteiro "é" n log n contradizia a própria tabela acima. */}
        {flat ? (
          <>
            {levels.length} níveis × {levels[0]!.cost} por nível ={' '}
            <span className="text-contract">{total}</span>: os {levels.length - 1} níveis de
            divisão somam n log n, e o nível do caso base soma mais n
          </>
        ) : (
          <>
            {levels.length} níveis, <span className="text-contract">{total}</span> no total
          </>
        )}
      </div>

      <p className="m-0 border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </p>
    </div>
  )
}
