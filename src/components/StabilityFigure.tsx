import type { Figure } from '@/content/schema'

/**
 * Estabilidade: os mesmos elementos, dois algoritmos, um empate.
 *
 * As duas saídas são DERIVADAS da mesma lista. O estável é `sort` com desempate
 * pela ordem de chegada; o instável inverte só o desempate, e mais nada. É a
 * afirmação do ciclo na forma mais crua possível: **a única diferença entre os
 * dois é o que cada um faz quando o comparador diz "empate"**. ADR-0025.
 *
 * A cor marca o valor; a etiqueta marca a ordem de chegada. Sem a etiqueta as
 * duas saídas pareceriam idênticas, que é exatamente o erro que o ciclo desfaz.
 */
const CELL = 54

export function StabilityFigure({ figure }: { figure: Extract<Figure, { kind: 'stability' }> }) {
  const withIndex = figure.items.map((it, i) => ({ ...it, arrived: i }))

  const stable = [...withIndex].sort((a, b) => a.value - b.value || a.arrived - b.arrived)
  const unstable = [...withIndex].sort((a, b) => a.value - b.value || b.arrived - a.arrived)

  const values = [...new Set(figure.items.map((i) => i.value))].sort((a, b) => a - b)
  const toneOf = (v: number) =>
    ['var(--contract)', 'var(--cost)', 'var(--implementation)'][values.indexOf(v) % 3]!

  const Row = ({ items, label, note }: {
    items: typeof withIndex; label: string; note: string
  }) => (
    <div className="flex flex-col gap-1.5 px-3 py-2.5">
      <div className="flex items-baseline gap-2.5">
        <span className="lbl">{label}</span>
        <span className="text-[12px] text-fg-4">{note}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <div
            key={it.tag}
            className="flex flex-col items-center justify-center border"
            style={{
              width: CELL, height: CELL,
              borderColor: toneOf(it.value),
              background: 'var(--panel-head)',
            }}
          >
            <span className="font-mono text-[15px]" style={{ color: toneOf(it.value) }}>{it.value}</span>
            <span className="font-mono text-[10.5px] text-fg-4">{it.tag}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const changed = stable.some((s, i) => s.tag !== unstable[i]!.tag)

  return (
    <figure className="m-0 border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">Estabilidade · a ordenação compara só o número</span>
      </div>

      <div className="divide-y divide-rule">
        <Row items={withIndex} label="Como chegou" note="a etiqueta guarda a ordem de chegada" />
        <Row items={stable} label="Algoritmo estável" note="empate mantém quem chegou antes" />
        <Row items={unstable} label="Algoritmo instável" note="empate resolve como for conveniente" />
      </div>

      <div className="border-t border-rule px-3.5 py-2 font-mono text-[11.5px] text-fg-3">
        {changed
          ? 'as duas saídas estão ordenadas pelo número, e as etiquetas discordam'
          : 'sem empate na entrada, os dois devolvem a mesma coisa'}
      </div>

      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </figcaption>
    </figure>
  )
}
