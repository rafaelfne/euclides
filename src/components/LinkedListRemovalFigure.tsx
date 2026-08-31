import type { Figure } from '@/content/schema'
import { flowEdges, FlowCanvas, type FlowNode } from './FlowCanvas'
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
            {(() => {
              const nodes: FlowNode[] = figure.values.map((value, index) => {
                const removed = step === lastStep && index === figure.targetIndex
                const visited = index <= Math.min(step, figure.targetIndex)
                return {
                  id: `node-${index}`,
                  type: 'euclides',
                  position: { x: index * 104 + 20, y: 28 },
                  data: {
                    label: value,
                    tone: removed ? 'cost' : visited ? 'implementation' : 'neutral',
                    faded: removed,
                  },
                }
              })
              const edgeSpecs = step === lastStep
                ? figure.values.flatMap((_, index) => {
                    if (index >= figure.values.length - 1 || index === figure.targetIndex) return []
                    if (index === figure.targetIndex - 1) return [{ from: `node-${index}`, to: `node-${index + 2}` }]
                    return [{ from: `node-${index}`, to: `node-${index + 1}` }]
                  })
                : figure.values.slice(0, -1).map((_, index) => ({ from: `node-${index}`, to: `node-${index + 1}` }))
              return <FlowCanvas nodes={nodes} edges={flowEdges(edgeSpecs, step === lastStep ? 'implementation' : 'neutral')} height={150} ariaLabel={figure.caption} />
            })()}
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
