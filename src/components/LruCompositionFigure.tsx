'use client'

import type { Figure } from '@/content/schema'
import { cn } from '@/lib/utils'
import { Stepper } from './Stepper'

type LruCompositionFigureData = Extract<Figure, { kind: 'lru-composition' }>

interface LruState {
  accessed: string | null
  order: string[]
}

function buildStates(figure: LruCompositionFigureData): LruState[] {
  const states: LruState[] = [{ accessed: null, order: [...figure.items] }]
  let order = [...figure.items]

  for (const accessed of figure.accesses) {
    order = [accessed, ...order.filter((item) => item !== accessed)]
    states.push({ accessed, order })
  }

  return states
}

export function LruCompositionFigure({ figure }: { figure: LruCompositionFigureData }) {
  const states = buildStates(figure)

  return (
    <figure className="m-0 overflow-hidden border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">Composição · mapa localiza, lista mantém a ordem</span>
      </div>

      <Stepper
        count={states.length}
        startAt={0}
        labelFor={(step) => step === 0 ? 'estado inicial' : `acesso a ${states[step]!.accessed}`}
      >
        {(step) => {
          const state = states[step]!

          return (
            <div className="grid gap-6 p-4 md:grid-cols-[minmax(220px,0.8fr)_minmax(360px,1.2fr)] md:p-5">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="lbl text-contract">Map</span>
                  <span className="font-mono text-[11px] text-fg-4">chave → nó</span>
                </div>

                <div className="flex flex-col gap-2">
                  {figure.items.map((item) => (
                    <div
                      key={item}
                      className={cn(
                        'grid grid-cols-[1fr_auto] items-center border px-3 py-2 font-mono text-[12px]',
                        state.accessed === item
                          ? 'border-contract bg-contract-bg text-contract'
                          : 'border-rule bg-panel-head text-fg-2',
                      )}
                    >
                      <span>{item}</span>
                      <span className="text-fg-4">→ nó {item}</span>
                    </div>
                  ))}
                </div>

                <p className="m-0 mt-3 text-[12px] leading-relaxed text-fg-4">
                  {state.accessed
                    ? `A chave ${state.accessed} encontra o nó diretamente.`
                    : 'Cada chave aponta para o nó correspondente.'}
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="lbl text-implementation">Lista ligada</span>
                  <span className="font-mono text-[11px] text-fg-4">mais recente → menos recente</span>
                </div>

                <div className="flex min-w-max items-center overflow-x-auto pb-2">
                  {state.order.map((item, index) => (
                    <div key={item} className="flex items-center">
                      <div className={cn(
                        'flex h-16 w-20 flex-col items-center justify-center border font-mono',
                        state.accessed === item
                          ? 'border-implementation bg-implementation-bg text-implementation'
                          : 'border-rule bg-panel-head text-fg-2',
                      )}>
                        <span className="text-[13px]">{item}</span>
                        <span className="mt-1 text-[9px] text-fg-5">
                          {index === 0 ? 'frente' : index === state.order.length - 1 ? 'fim' : `posição ${index + 1}`}
                        </span>
                      </div>
                      {index < state.order.length - 1 && (
                        <span className="px-2 font-mono text-[15px] text-fg-5">↔</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 border-l-2 border-implementation pl-3 text-[12.5px] leading-relaxed text-fg-3">
                  {state.accessed
                    ? `O mesmo nó ${state.accessed} sai da posição anterior e vai para a frente.`
                    : `Se faltar espaço, ${state.order[state.order.length - 1]} é o primeiro candidato a sair.`}
                </div>
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
