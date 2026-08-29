import type { Figure } from '@/content/schema'
import { Stepper } from './Stepper'

/**
 * A árvore de recursão de `asymptotics.c4`, desenhando-se nível a nível.
 *
 * O ciclo se chama "A árvore de recursão, desenhada" e não tinha desenho: a
 * tabela do exercício conferia uma derivação que o aluno nunca via. Aqui o
 * desenho e a tabela mostram a mesma conta, e a tabela continua sendo o
 * equivalente textual exigido pela acessibilidade.
 *
 * Tudo é derivado de `branches`, `divisor` e `n`. As duas afirmações que a
 * figura precisa fazer saem sozinhas da recorrência, e é por isso que ela não
 * pode discordar do texto: **o custo por nível não cresce**, porque as chamadas
 * multiplicam por `branches` enquanto o tamanho divide por `divisor`; e **o
 * número de níveis é log na base do divisor**, não n. Ver ADR-0025.
 *
 * A disposição é aritmética, e não um algoritmo de layout: a árvore de
 * recursão é completa e uniforme por definição, então o nível `i` tem
 * `branches^i` chamadas igualmente espaçadas. Era isso que o dagre calculava.
 */
type Level = { level: number; calls: number; size: number; cost: number }

const NODE_W = 46
const NODE_H = 26
const GAP_X = 12
const LEVEL_H = 62
const PAD = 10

/** Acima disto o nível vira uma faixa: 32 caixas não ensinam o que 8 ensinam. */
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

/** O x do centro da caixa k, com a linha centrada na largura do desenho. */
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
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full min-w-[260px]"
                role="img"
                aria-label={`Árvore de recursão com ${levels.length} níveis; a tabela ao lado traz os mesmos números.`}
              >
                {levels.flatMap((l, i) => {
                  if (i === 0) return []
                  const drawn = drawnAt(l.calls)
                  const above = drawnAt(levels[i - 1]!.calls)
                  return Array.from({ length: drawn }, (_, k) => {
                    const parent = Math.min(Math.floor(k / figure.branches), above - 1)
                    return (
                      <line
                        key={`e${i}-${k}`}
                        x1={centerX(parent, above, width)}
                        y1={(i - 1) * LEVEL_H + PAD + NODE_H}
                        x2={centerX(k, drawn, width)}
                        y2={i * LEVEL_H + PAD}
                        stroke={i > upTo ? 'var(--rule-soft)' : 'var(--contract-rule)'}
                        strokeWidth="1.2"
                      />
                    )
                  })
                })}

                {levels.flatMap((l, i) => {
                  const drawn = drawnAt(l.calls)
                  const muted = i > upTo
                  return Array.from({ length: drawn }, (_, k) => {
                    const cx = centerX(k, drawn, width)
                    const y = i * LEVEL_H + PAD
                    return (
                      <g key={`n${i}-${k}`}>
                        <rect
                          x={cx - NODE_W / 2}
                          y={y}
                          width={NODE_W}
                          height={NODE_H}
                          fill={muted ? 'var(--panel)' : 'var(--contract-bg)'}
                          stroke={muted ? 'var(--rule)' : 'var(--contract)'}
                          strokeWidth="1"
                        />
                        <text
                          x={cx}
                          y={y + NODE_H / 2 + 4}
                          textAnchor="middle"
                          fill={muted ? 'var(--fg-5)' : 'var(--fg)'}
                          fontSize="11"
                          fontFamily="var(--mono)"
                        >
                          {/* O rótulo é a fração, não o valor: é assim que a recorrência é lida. */}
                          {l.size === figure.n ? 'n' : `n/${Math.round(figure.n / l.size)}`}
                        </text>
                      </g>
                    )
                  })
                })}

                {levels.map((l, i) =>
                  l.calls > MAX_DRAWN ? (
                    <text
                      key={`m${i}`}
                      x={width - PAD}
                      y={i * LEVEL_H + PAD + NODE_H / 2 + 4}
                      textAnchor="end"
                      fill="var(--fg-5)"
                      fontSize="10"
                      fontFamily="var(--mono)"
                    >
                      de {l.calls}
                    </text>
                  ) : null,
                )}
              </svg>
            </div>

            {/* O equivalente textual, e ele é a mesma conta. */}
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

      <div className="border-t border-rule px-3.5 py-2 font-mono text-[11.5px] text-fg-3">
        {levels.length} níveis × {levels[0]!.cost} por nível ={' '}
        <span className="text-contract">{levels.length * levels[0]!.cost}</span>, e é daí que
        n log n sai
      </div>

      <p className="m-0 border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </p>
    </div>
  )
}
