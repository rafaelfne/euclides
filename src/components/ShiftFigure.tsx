import type { Figure } from '@/content/schema'
import { Stepper } from './Stepper'

/**
 * O deslocamento num bloco contíguo, uma linha por escrita.
 *
 * Os estados são DERIVADOS do bloco e da posição removida, com a mesma regra do
 * gerador de `linear.e3`. A figura não pode discordar do gabarito porque nenhum
 * dos dois foi digitado.
 *
 * A última linha é o ponto da unidade e o motivo de a figura existir: o valor
 * do fim continua lá, duplicado. Remover não encolhe o bloco, encolhe o
 * tamanho lógico, e são duas grandezas diferentes.
 */
const CELL = 58
const ROW = 40
const PAD_LEFT = 92

export function ShiftFigure({ figure }: { figure: Extract<Figure, { kind: 'shift' }> }) {
  const n = figure.values.length
  const writes = n - 1 - figure.removeAt

  const states: Array<{ cells: number[]; wrote: number | null; from: number | null }> = [
    { cells: [...figure.values], wrote: null, from: null },
  ]
  const work = [...figure.values]
  for (let j = figure.removeAt; j < n - 1; j++) {
    work[j] = work[j + 1]!
    states.push({ cells: [...work], wrote: j, from: j + 1 })
  }

  const width = PAD_LEFT + n * CELL + 128
  const height = 26 + states.length * ROW + 22

  return (
    <figure className="m-0 border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">
          Deslocamento · remover a posição {figure.removeAt} custa {writes}{' '}
          {writes === 1 ? 'escrita' : 'escritas'}
        </span>
      </div>
      <Stepper
        count={states.length}
        labelFor={(k) => (k === 0 ? 'antes de escrever' : `${k} de ${writes} escritas`)}
      >
        {(upTo) => (
      <div className="overflow-x-auto p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[520px]" role="img" aria-label={figure.caption}>
          {figure.values.map((_, i) => (
            <text
              key={i}
              x={PAD_LEFT + i * CELL + CELL / 2}
              y={16}
              textAnchor="middle"
              fill="var(--fg-5)"
              fontSize="10"
              fontFamily="var(--mono)"
            >
              {i}
            </text>
          ))}

          {states.slice(0, upTo + 1).map((state, r) => {
            const y = 26 + r * ROW
            const last = r === upTo
            return (
              <g key={r}>
                <text x={PAD_LEFT - 12} y={y + 21} textAnchor="end" fill="var(--fg-4)" fontSize="10.5" fontFamily="var(--mono)">
                  {r === 0 ? 'início' : `escrita ${r}`}
                </text>

                {state.cells.map((v, i) => {
                  const wrote = state.wrote === i
                  const stale = last && i === n - 1
                  return (
                    <g key={i}>
                      <rect
                        x={PAD_LEFT + i * CELL}
                        y={y}
                        width={CELL - 4}
                        height={ROW - 8}
                        fill={wrote ? 'var(--implementation-bg)' : stale ? 'var(--cost-bg)' : 'var(--panel-head)'}
                        stroke={wrote ? 'var(--implementation)' : stale ? 'var(--cost)' : 'var(--rule)'}
                        strokeDasharray={stale ? '3 3' : undefined}
                      />
                      <text
                        x={PAD_LEFT + i * CELL + (CELL - 4) / 2}
                        y={y + 21}
                        textAnchor="middle"
                        fill={wrote ? 'var(--implementation)' : stale ? 'var(--cost)' : 'var(--fg-2)'}
                        fontSize="12.5"
                        fontFamily="var(--mono)"
                      >
                        {v}
                      </text>
                    </g>
                  )
                })}

                {state.from !== null && state.wrote !== null && (
                  <path
                    d={`M ${PAD_LEFT + state.from * CELL + (CELL - 4) / 2} ${y - 4}
                        q -${CELL / 2} -12 -${CELL} 0`}
                    fill="none"
                    stroke="var(--implementation)"
                    strokeWidth="1.25"
                    markerEnd="url(#seta)"
                  />
                )}

                {last && (
                  <text
                    x={PAD_LEFT + n * CELL + 8}
                    y={y + 21}
                    fill="var(--cost)"
                    fontSize="10.5"
                    fontFamily="var(--mono)"
                  >
                    n cai para {n - 1}
                  </text>
                )}
              </g>
            )
          })}

          <defs>
            <marker id="seta" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="var(--implementation)" />
            </marker>
          </defs>
        </svg>
      </div>
        )}
      </Stepper>
      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </figcaption>
    </figure>
  )
}
