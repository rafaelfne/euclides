import type { Figure } from '@/content/schema'
import { Stepper } from './Stepper'

function splitLevels(values: number[]) {
  const levels: number[][][] = [[values]]
  let current = [values]
  while (current.some((part) => part.length > 1)) {
    current = current.flatMap((part) => {
      const middle = Math.ceil(part.length / 2)
      return [part.slice(0, middle), part.slice(middle)].filter((part) => part.length)
    })
    levels.push(current)
  }
  return levels
}

export function MergeStructureFigure({ figure }: { figure: Extract<Figure, { kind: 'merge-structure' }> }) {
  const levels = splitLevels(figure.values)
  const merges = levels.slice(0, -1).reverse().map((_, mergeIndex) => {
    const size = 2 ** (mergeIndex + 1)
    return Array.from({ length: Math.ceil(figure.values.length / size) }, (_, index) =>
      figure.values.slice(index * size, (index + 1) * size).sort((a, b) => a - b),
    )
  })
  const count = levels.length + merges.length
  return (
    <figure className="m-0 border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2"><span className="lbl">Merge sort · dividir, ordenar, intercalar</span></div>
      <Stepper count={count} labelFor={(step) => step < levels.length ? (step === 0 ? 'coleção inteira' : `${levels[step]!.length} partes`) : `intercalação ${step - levels.length + 1}`}> 
        {(step) => (
          <div className="flex flex-col gap-3 p-4" role="img" aria-label={figure.caption}>
            {levels.slice(0, step + 1).map((level, levelIndex) => (
              <div className="flex flex-wrap items-center gap-2" key={levelIndex}>
                <span className="lbl w-16 shrink-0">{levelIndex === 0 ? 'entrada' : `nível ${levelIndex}`}</span>
                {level.map((part, partIndex) => (
                  <div className="flex items-center gap-1" key={`${levelIndex}-${partIndex}`}>
                    <span className={`border px-2.5 py-2 font-mono text-xs ${levelIndex === step ? 'border-implementation bg-implementation-bg text-implementation' : 'border-rule bg-panel-head text-fg-3'}`}>{part.join(' · ')}</span>
                    {partIndex < level.length - 1 && <span className="text-fg-5">│</span>}
                  </div>
                ))}
              </div>
            ))}
            {step >= levels.length && merges.slice(0, step - levels.length + 1).map((level, mergeIndex) => (
              <div className="flex flex-wrap items-center gap-2" key={`merge-${mergeIndex}`}>
                <span className="lbl w-16 shrink-0">volta {mergeIndex + 1}</span>
                {level.map((part, partIndex) => (
                  <div className="flex items-center gap-1" key={`merge-${mergeIndex}-${partIndex}`}>
                    <span className={`border px-2.5 py-2 font-mono text-xs ${mergeIndex === step - levels.length ? 'border-contract bg-contract-bg text-contract' : 'border-rule bg-panel-head text-fg-3'}`}>{part.join(' · ')}</span>
                    {partIndex < level.length - 1 && <span className="text-fg-5">│</span>}
                  </div>
                ))}
              </div>
            ))}
            <div className="border-t border-rule pt-3 text-[12px] text-fg-3">Na volta, cada nível intercala partes já ordenadas até reconstruir uma sequência.</div>
          </div>
        )}
      </Stepper>
      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">{figure.caption}</figcaption>
    </figure>
  )
}

export function QuicksortPartitionFigure({ figure }: { figure: Extract<Figure, { kind: 'quicksort-partition' }> }) {
  const pivot = figure.values[figure.pivotIndex]!
  const left = figure.values.filter((value, index) => index !== figure.pivotIndex && value < pivot)
  const right = figure.values.filter((value, index) => index !== figure.pivotIndex && value >= pivot)
  const extreme = left.length === 0 || right.length === 0
  return (
    <figure className="m-0 border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2"><span className="lbl">Quicksort · uma partição por pivô</span></div>
      <Stepper count={2} labelFor={(step) => step === 0 ? 'antes da partição' : 'depois da partição'}>
        {(step) => (
          <div className="flex flex-col gap-4 p-4" role="img" aria-label={figure.caption}>
            {step === 0 ? (
              <div className="flex flex-wrap gap-1.5">{figure.values.map((value, index) => <span className={`border px-3 py-2 font-mono text-xs ${index === figure.pivotIndex ? 'border-cost bg-cost-bg text-cost' : 'border-rule bg-panel-head text-fg-3'}`} key={`${value}-${index}`}>{value}{index === figure.pivotIndex ? ' · pivô' : ''}</span>)}</div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="min-h-12 border border-rule bg-panel-head p-2 font-mono text-xs text-fg-3">menores: {left.join(' · ') || '∅'}</div>
                <div className="border border-cost bg-cost-bg p-3 text-center font-mono text-xs text-cost">{pivot}<br />pivô</div>
                <div className="min-h-12 border border-rule bg-panel-head p-2 font-mono text-xs text-fg-3">maiores: {right.join(' · ') || '∅'}</div>
              </div>
            )}
            {step === 1 && <div className={`border-l-2 px-3 text-[12px] leading-relaxed ${extreme ? 'border-cost text-cost' : 'border-implementation text-fg-3'}`}>{extreme ? 'Uma parte ficou vazia: a próxima chamada recebe quase toda a coleção.' : 'As duas partes encolheram: as próximas chamadas trabalham em entradas menores.'}</div>}
          </div>
        )}
      </Stepper>
      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">{figure.caption}</figcaption>
    </figure>
  )
}
