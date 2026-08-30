'use client'

import type { Figure } from '@/content/schema'
import { cn } from '@/lib/utils'
import { Stepper } from './Stepper'
import { useState } from 'react'

type ExecutionTraceFigureData = Extract<Figure, { kind: 'execution-trace' }>

interface TraceState {
  index: number
  accumulatorBefore: number
  accumulatorAfter: number
  value: number | null
  matches: boolean | null
}

function buildStates(figure: ExecutionTraceFigureData): TraceState[] {
  const states: TraceState[] = []
  let index = figure.initialIndex
  let accumulator = figure.initialAccumulator

  while (index < figure.values.length) {
    const value = figure.values[index]!
    const matches = figure.operation === 'sum' || value % 2 === 0
    const accumulatorAfter = figure.operation === 'sum'
      ? accumulator + value
      : accumulator + (matches ? 1 : 0)

    states.push({ index, accumulatorBefore: accumulator, accumulatorAfter, value, matches })
    accumulator = accumulatorAfter
    index += figure.indexStep
  }

  states.push({
    index,
    accumulatorBefore: accumulator,
    accumulatorAfter: accumulator,
    value: null,
    matches: null,
  })

  return states
}

export function ExecutionTraceFigure({ figure }: { figure: ExecutionTraceFigureData }) {
  const states = buildStates(figure)
  const [predictions, setPredictions] = useState<Record<number, number>>({})

  return (
    <figure className="m-0 overflow-hidden border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">Execution trace · avance uma condição por vez</span>
      </div>

      <Stepper
        count={states.length}
        startAt={0}
        canAdvance={(step) => step === states.length - 1 || predictions[step] !== undefined}
        labelFor={(step) => step === states.length - 1 ? 'a condição ficou falsa' : `rodada ${step + 1}`}
      >
        {(step) => {
          const state = states[step]!
          const running = state.value !== null
          const nextIndex = state.index + figure.indexStep
          const predictionOptions = [...new Set([state.index + 1, nextIndex, state.index])].sort((a, b) => a - b)
          const previousPrediction = step > 0 ? predictions[step - 1] : undefined

          return (
            <div className="grid gap-5 p-4 md:grid-cols-[minmax(0,1fr)_240px] md:p-5">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 font-mono text-[11px] text-fg-4">
                  <span>A</span>
                  <span className="text-fg-5">índices de 0 a {figure.values.length - 1}</span>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="flex min-w-max gap-1.5">
                    {figure.values.map((value, index) => {
                      const visited = states.slice(0, step).some((item) => item.index === index)
                      const current = running && state.index === index

                      return (
                        <div key={index} className="flex w-14 flex-col items-center gap-1">
                          <span className="font-mono text-[10px] text-fg-5">{index}</span>
                          <div className={cn(
                            'flex h-12 w-14 items-center justify-center border font-mono text-[15px]',
                            current && 'border-contract bg-contract-bg text-contract',
                            visited && !current && 'border-rule bg-panel-head text-fg-4',
                            !visited && !current && 'border-rule bg-panel text-fg-2',
                          )}>
                            {value}
                          </div>
                          <span className={cn(
                            'h-4 font-mono text-[10px]',
                            current ? 'text-contract' : 'text-transparent',
                          )}>
                            i = {index}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-3 border-l-2 border-contract pl-3 text-[13px] leading-relaxed text-fg-2">
                  {running
                    ? `A posição ${state.index} aponta para ${state.value}.`
                    : `i chegou a ${state.index}; não existe elemento para ler.`}
                </div>
                {previousPrediction !== undefined && (
                  <div className={cn(
                    'mt-3 border px-3 py-2 text-[12px]',
                    previousPrediction === state.index
                      ? 'border-contract-rule bg-contract-bg text-contract'
                      : 'border-cost-rule bg-cost-bg text-cost',
                  )}>
                    Sua previsão foi i = {previousPrediction}; o estado chegou a i = {state.index}.
                  </div>
                )}
              </div>

              <div className="flex flex-col border border-rule bg-panel-head">
                <div className="flex items-center justify-between border-b border-rule px-3 py-2">
                  <span className="lbl">condição</span>
                  <span className={cn('font-mono text-[12px]', running ? 'text-contract' : 'text-cost')}>
                    {state.index} &lt; {figure.values.length} · {running ? 'sim' : 'não'}
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 px-3 py-3 text-[12.5px]">
                  <span className="text-fg-4">elemento lido</span>
                  <span className="font-mono text-fg-2">{state.value ?? '—'}</span>

                  {figure.operation === 'count-even' && (
                    <>
                      <span className="text-fg-4">é par?</span>
                      <span className="font-mono text-fg-2">{state.matches === null ? '—' : state.matches ? 'sim' : 'não'}</span>
                    </>
                  )}

                  <span className="text-fg-4">total</span>
                  <span className="font-mono text-fg-2">
                    {running
                      ? `${state.accumulatorBefore} → ${state.accumulatorAfter}`
                      : state.accumulatorAfter}
                  </span>

                  <span className="text-fg-4">linha aplicada</span>
                  <span className="max-w-[130px] text-right font-mono text-[10px] leading-relaxed text-fg-2">
                    {running
                      ? figure.operation === 'sum'
                        ? 'total ← total + A[i]'
                        : state.matches
                          ? 'total ← total + 1'
                          : 'condição interna falsa'
                      : 'nenhuma'}
                  </span>
                </div>

                {running && (
                  <div className="border-t border-rule px-3 py-3">
                    <span className="block text-[11px] leading-relaxed text-fg-4">
                      Antes de avançar: qual será o próximo valor de i?
                    </span>
                    <div className="mt-2 flex gap-1.5">
                      {predictionOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setPredictions((current) => ({ ...current, [step]: option }))}
                          className={cn(
                            'm-tap flex-1 cursor-pointer border px-2 py-1 font-mono text-[12px]',
                            predictions[step] === option
                              ? 'border-contract-rule bg-contract-bg text-contract'
                              : 'border-rule bg-panel text-fg-3 hover:text-fg',
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        }}
      </Stepper>

      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </figcaption>
    </figure>
  )
}
