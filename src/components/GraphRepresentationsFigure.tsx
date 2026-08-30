import type { Figure } from '@/content/schema'

export function GraphRepresentationsFigure({ figure }: { figure: Extract<Figure, { kind: 'graph-representations' }> }) {
  const neighbors = new Map(figure.vertices.map((vertex) => [vertex, [] as string[]]))
  for (const edge of figure.edges) neighbors.get(edge.from)!.push(edge.to)
  const hasEdge = (from: string, to: string) => figure.edges.some((edge) => edge.from === from && edge.to === to)

  return (
    <figure className="m-0 border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">Os mesmos {figure.edges.length} fatos, duas formas de guardar</span>
      </div>
      <div className="grid gap-5 p-4 md:grid-cols-2">
        <section className={`border p-3 ${figure.focus === 'list' ? 'border-implementation bg-implementation-bg' : 'border-rule'}`}>
          <div className="lbl mb-3">Lista de adjacência</div>
          <div className="space-y-2 font-mono text-xs">
            {figure.vertices.map((vertex) => (
              <div className="flex items-center gap-2" key={vertex}>
                <span className="w-5 text-fg-2">{vertex}</span>
                <span className="text-fg-5">→</span>
                <span className="text-implementation">{neighbors.get(vertex)!.join(', ') || '∅'}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11.5px] text-fg-3">guarda {figure.vertices.length + figure.edges.length} entradas</div>
        </section>
        <section className={`border p-3 ${figure.focus === 'matrix' ? 'border-implementation bg-implementation-bg' : 'border-rule'}`}>
          <div className="lbl mb-3">Matriz de adjacência</div>
          <div className="mb-2 text-[11px] text-fg-4">linha = origem · coluna = destino</div>
          <div className="grid gap-1 font-mono text-[11px]" style={{ gridTemplateColumns: `repeat(${figure.vertices.length + 1}, minmax(24px, 1fr))` }}>
            <span />
            {figure.vertices.map((vertex) => <span className="text-center text-fg-4" key={`h-${vertex}`}>{vertex}</span>)}
            {figure.vertices.flatMap((from) => [
              <span className="flex items-center text-fg-4" key={`r-${from}`}>{from}</span>,
              ...figure.vertices.map((to) => {
                const present = hasEdge(from, to)
                return <span className={`flex aspect-square items-center justify-center border ${present ? 'border-implementation text-implementation' : 'border-rule text-fg-5'}`} key={`${from}-${to}`}>{present ? '1' : '0'}</span>
              }),
            ])}
          </div>
          <div className="mt-3 text-[11.5px] text-fg-3">reserva {figure.vertices.length}² = {figure.vertices.length ** 2} células</div>
        </section>
      </div>
      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </figcaption>
    </figure>
  )
}
