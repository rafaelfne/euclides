import type { Figure } from '@/content/schema'
import { bfsRounds, type Edge, type Round } from '@/lib/traversal'
import { edgePath, edgesOf, positions, type Dims } from '@/lib/graph-layout'
import { Stepper } from './Stepper'

/**
 * A mesma busca em largura, com e sem marcar visitados.
 *
 * O que a figura mostra é a FILA, e não a ordem de visita: a afirmação de
 * `graphs.c4` é que sem marcação ela nunca esvazia, e isso só aparece
 * acompanhando o tamanho dela rodada a rodada. As duas colunas rodam a mesma
 * busca com uma linha de diferença, que é exatamente a diferença que o ciclo
 * ensina.
 */
const DIMS: Dims = { col: 84, row: 58, r: 17, pad: 26 }
const R = DIMS.r

function Graph({
  edges, origin, current, accent,
}: {
  edges: Edge[]
  origin: string
  current: string | undefined
  accent: string
}) {
  const { at, width, height } = positions(edges, origin, DIMS)
  const marker = `ponta-${accent.replace(/\W/g, '')}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxWidth: width * 1.5 }}>
      <defs>
        <marker id={marker} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--rule)" />
        </marker>
      </defs>
      {edgesOf(edges).map(({ from, to }) => (
        <path
          key={`${from}-${to}`}
          d={edgePath(at.get(from)!, at.get(to)!, DIMS)}
          fill="none"
          stroke="var(--rule)"
          strokeWidth="1.25"
          markerEnd={`url(#${marker})`}
        />
      ))}
      {[...at.entries()].map(([v, p]) => (
        <g key={v}>
          <circle
            cx={p.x}
            cy={p.y}
            r={R}
            fill={v === current ? 'var(--panel-head)' : 'var(--panel)'}
            stroke={v === current ? accent : 'var(--rule)'}
            strokeWidth="1.5"
          />
          <text
            x={p.x}
            y={p.y + 4}
            textAnchor="middle"
            fill={v === current ? accent : 'var(--fg-3)'}
            fontSize="12"
            fontFamily="var(--mono)"
          >
            {v}
          </text>
        </g>
      ))}
    </svg>
  )
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
    { titulo: 'sem marcar visitados', accent: 'var(--implementation)', run: sem },
    { titulo: 'marcando visitados', accent: 'var(--contract)', run: com },
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
                      <span className="lbl" style={{ color: c.accent }}>{c.titulo}</span>
                      <span className="font-mono text-[11px] text-fg-4">
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
                    <Queue round={round} accent={c.accent} />
                    <span className="text-[11.5px] leading-snug text-fg-4">
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
