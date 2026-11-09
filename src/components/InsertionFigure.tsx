import type { Figure } from '@/content/schema'
import { insertionRounds, totalShifts } from '@/lib/insertion'
import { Stepper } from './Stepper'

/**
 * O mesmo insertion sort sobre duas entradas com os mesmos elementos.
 *
 * O contador de deslocamentos é o assunto, e não o vetor ficando ordenado: os
 * dois vetores terminam iguais, e é a conta ao lado que separa O(n) de O(n²).
 * Uma animação só de ordenação mostraria as duas colunas chegando ao mesmo
 * lugar e não afirmaria nada sobre custo.
 */
export function InsertionFigure({
  figure, autoPlay,
}: {
  figure: Extract<Figure, { kind: 'insertion' }>
  autoPlay?: boolean
}) {
  const runs = figure.inputs.map((input) => ({
    label: input.label,
    values: input.values,
    rounds: insertionRounds(input.values),
  }))
  const total = Math.max(...runs.map((r) => r.rounds.length))
  const maior = Math.max(...runs.map((r) => totalShifts(r.rounds)))

  return (
    <div className="border border-rule bg-panel">
      <figure className="m-0">
        <div className="border-b border-rule bg-panel-head px-3.5 py-2">
          <span className="lbl">O mesmo código, duas entradas</span>
        </div>

        <Stepper
          autoPlay={autoPlay}
          count={total}
          labelFor={(k) => `encaixando o elemento da posição ${k + 1}`}
        >
          {(at) => (
            <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
              {runs.map((run) => {
                const round = run.rounds[Math.min(at, run.rounds.length - 1)]!
                const ateAqui = run.rounds.slice(0, at + 1)
                const parciais = totalShifts(ateAqui)
                const finais = totalShifts(run.rounds)
                const caro = finais === maior && runs.some((r) => totalShifts(r.rounds) !== maior)

                return (
                  <div key={run.label} className="flex flex-col gap-2.5 border border-rule-soft bg-panel-head p-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[12px] text-fg-2">{run.values.join(' ')}</span>
                      <span className={`lbl ${caro ? 'text-implementation' : 'text-contract'}`}>
                        {parciais} {parciais === 1 ? 'deslocamento' : 'deslocamentos'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {round.values.map((v, k) => {
                        const ordenado = k <= round.sortedUpTo
                        const encaixado = k === round.placedAt
                        return (
                          <span
                            key={`${k}-${v}`}
                            className="flex w-8 justify-center border py-1 font-mono text-[12px]"
                            style={{
                              borderColor: encaixado
                                ? 'var(--contract)'
                                : ordenado ? 'var(--contract-rule)' : 'var(--rule)',
                              background: ordenado ? 'var(--contract-bg)' : 'var(--panel)',
                              color: ordenado ? 'var(--fg)' : 'var(--fg-4)',
                            }}
                          >
                            {v}
                          </span>
                        )
                      })}
                    </div>

                    <span className="font-mono text-[12px] text-fg-4">
                      encaixa {round.taken}, o laço interno rodou {round.shifts}{' '}
                      {round.shifts === 1 ? 'vez' : 'vezes'}
                    </span>

                    <span className="text-[12px] leading-snug text-fg-4">{run.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Stepper>

        <div className="border-t border-rule px-3.5 py-2 font-mono text-[12px] text-fg-3">
          no fim:{' '}
          {runs.map((r, i) => (
            <span key={r.label}>
              {i > 0 && ' · '}
              <span className={totalShifts(r.rounds) === maior ? 'text-implementation' : 'text-contract'}>
                {totalShifts(r.rounds)}
              </span>{' '}
              {totalShifts(r.rounds) === 1 ? 'deslocamento' : 'deslocamentos'}
            </span>
          ))}
          , com os mesmos {figure.inputs[0]!.values.length} elementos
        </div>

        <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
          {figure.caption}
        </figcaption>
      </figure>
    </div>
  )
}
