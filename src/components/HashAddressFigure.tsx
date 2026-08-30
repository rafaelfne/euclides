import type { Figure } from '@/content/schema'
import { Stepper } from './Stepper'

export function HashAddressFigure({ figure }: { figure: Extract<Figure, { kind: 'hash-address' }> }) {
  return (
    <figure className="m-0 border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">Chave → conta → endereço</span>
      </div>
      <Stepper count={figure.keys.length} labelFor={(step) => `${figure.keys[step]} mod ${figure.m} = ${figure.keys[step]! % figure.m}`}>
        {(step) => {
          const key = figure.keys[step]!
          const address = key % figure.m
          return (
            <div className="p-4">
              <div className="mb-4 flex items-center justify-center gap-3 font-mono text-sm" role="img" aria-label={figure.caption}>
                <span className="border border-rule bg-panel-head px-4 py-3 text-fg-2">chave {key}</span>
                <span className="text-fg-5">→</span>
                <span className="border border-implementation bg-implementation-bg px-4 py-3 text-implementation">{key} mod {figure.m}</span>
                <span className="text-fg-5">→</span>
                <span className="border border-contract bg-contract-bg px-4 py-3 text-contract">endereço {address}</span>
              </div>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${figure.m}, minmax(28px, 1fr))` }}>
                {Array.from({ length: figure.m }, (_, index) => (
                  <span className={`flex aspect-square items-center justify-center border font-mono text-xs ${index === address ? 'border-contract bg-contract-bg text-contract' : 'border-rule text-fg-5'}`} key={index}>{index}</span>
                ))}
              </div>
            </div>
          )
        }}
      </Stepper>
      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">{figure.caption}</figcaption>
    </figure>
  )
}
