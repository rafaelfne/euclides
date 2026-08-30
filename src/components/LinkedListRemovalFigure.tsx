import type { Figure } from '@/content/schema'
import { Stepper } from './Stepper'

export function LinkedListRemovalFigure({ figure }: { figure: Extract<Figure, { kind: 'linked-list-removal' }> }) {
  const lastStep = figure.targetIndex + 1

  return (
    <figure className="m-0 border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">Lista ligada · buscar primeiro, religar depois</span>
      </div>
      <Stepper
        count={lastStep + 1}
        labelFor={(step) => step === lastStep ? 'nó removido com uma religação' : `visitados ${step + 1} de ${figure.targetIndex + 1} nós`}
      >
        {(step) => (
          <div className="overflow-x-auto p-5">
            <div className="flex min-w-[520px] items-center gap-2" role="img" aria-label={figure.caption}>
              {figure.values.map((value, index) => {
                const removed = step === lastStep && index === figure.targetIndex
                const visited = index <= Math.min(step, figure.targetIndex)
                return (
                  <div className="contents" key={`${value}-${index}`}>
                    <div className={`flex h-14 w-20 shrink-0 items-center justify-center border font-mono text-sm ${removed ? 'border-cost text-cost line-through opacity-50' : visited ? 'border-implementation bg-implementation-bg text-implementation' : 'border-rule bg-panel-head text-fg-3'}`}>
                      {value}
                    </div>
                    {index < figure.values.length - 1 && (
                      <span className={`font-mono text-lg ${removed || (step === lastStep && index === figure.targetIndex - 1) ? 'text-implementation' : 'text-fg-5'}`}>
                        →
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-4 font-mono text-[11.5px] text-fg-3">
              {step === lastStep
                ? `linha aplicada: anterior.próximo ← alvo.próximo`
                : `linha aplicada: atual ← atual.próximo`}
            </div>
          </div>
        )}
      </Stepper>
      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </figcaption>
    </figure>
  )
}
