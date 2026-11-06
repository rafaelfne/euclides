import type { Figure } from '@/content/schema'
import { bfsRounds, type Edge, type Round } from '@/lib/traversal'
import { positions, type Dims } from '@/lib/graph-layout'
import { flowEdges, FlowCanvas, type FlowNode, type FlowTone } from './FlowCanvas'
import { Stepper } from './Stepper'

const DIMS: Dims = { col: 84, row: 58, r: 17, pad: 26 }

function Graph({
  edges, origin, current, accent,
}: {
  edges: Edge[]
  origin: string
  current: string | undefined
  accent: FlowTone
}) {
  const { at, height } = positions(edges, origin, DIMS)
  const nodes: FlowNode[] = [...at.entries()].map(([vertex, point]) => ({
    id: vertex,
    type: 'euclides',
    position: { x: point.x, y: point.y },
    data: { label: vertex, tone: vertex === current ? accent : 'neutral' },
  }))

  return <FlowCanvas nodes={nodes} edges={flowEdges(edges, 'neutral', at)} height={Math.max(155, height + 22)} ariaLabel={`grafo, vértice atual ${current ?? 'nenhum'}`} />
}

function Queue({ round, accent }: { round: Round | undefined; accent: string }) {
  if (!round) {
    return <span className="font-mono text-[12px] text-fg-4">fila vazia, o percurso terminou</span>
  }
  return (
    <div className="flex flex-wrap items-baseline gap-1.5 font-mono text-[12px]">
      <span className="text-fg-4">fila</span>
      {round.queue.length === 0 ? (
        <span className="text-fg-4">vazia</span>
      ) : (
        round.queue.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="border px-1.5"
            style={{ borderColor: 'var(--rule)', color: accent }}
          >
            {v}
          </span>
        ))
      )}
    </div>
  )
}

export function VisitedFigure({
  figure, autoPlay,
}: {
  figure: Extract<Figure, { kind: 'visited' }>
  autoPlay?: boolean
}) {
  const sem = bfsRounds(figure.edges, figure.origin, { marking: false, maxRounds: figure.rounds })
  const com = bfsRounds(figure.edges, figure.origin, { marking: true, maxRounds: figure.rounds })

  const colunas = [
    { titulo: 'sem marcar visitados', accent: 'implementation' as FlowTone, run: sem },
    { titulo: 'marcando visitados', accent: 'contract' as FlowTone, run: com },
  ]

  return (
    <div className="border border-rule bg-panel">
      <figure className="m-0">
        <div className="border-b border-rule bg-panel-head px-3.5 py-2">
          <span className="lbl">A mesma busca, uma linha de diferença</span>
        </div>

        <Stepper
          autoPlay={autoPlay}
          count={figure.rounds}
          labelFor={(k) => `rodada ${k + 1}`}
        >
          {(at) => (
            <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
              {colunas.map((c) => {
                const round = c.run.rounds[at]
                const acabou = at >= c.run.rounds.length
                return (
                  <div key={c.titulo} className="flex flex-col gap-2 border border-rule-soft bg-panel-head p-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`lbl text-${c.accent}`}>{c.titulo}</span>
                      <span className="font-mono text-[12px] text-fg-4">
                        {acabou && c.run.drained
                          ? 'terminou'
                          : round
                            ? `retira ${round.dequeued}`
                            : 'terminou'}
                      </span>
                    </div>
                    <Graph
                      edges={figure.edges}
                      origin={figure.origin}
                      current={round?.dequeued}
                      accent={c.accent}
                    />
                    <Queue round={round} accent={`var(--${c.accent})`} />
                    <span className="text-[12px] leading-snug text-fg-4">
                      {c.run.drained
                        ? `esvaziou em ${c.run.rounds.length} rodadas`
                        : `${figure.rounds} rodadas e a fila tem ${c.run.rounds[figure.rounds - 1]?.queue.length ?? 0}, e continua`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Stepper>

        <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
          {figure.caption}
        </figcaption>
      </figure>
    </div>
  )
}
