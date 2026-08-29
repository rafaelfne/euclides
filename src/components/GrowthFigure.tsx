'use client'

import { useState } from 'react'
import type { CurveShape, Figure } from '@/content/schema'

/**
 * O gráfico de crescimento, desenhado a partir de dado declarado.
 *
 * `EVAL` é exaustivo por forma: uma forma nova não compila até ser definida
 * aqui. É a mesma regra dos mapas de banda, um andar acima, o autor escreve
 * `quadratic`, nunca uma expressão, e o desenho não pode afirmar nada que o
 * schema não tenha declarado.
 *
 * O controle de n é do leitor, e não uma animação: a afirmação de
 * `asymptotics.c1` é "depende de n", e a única forma de ler isso é variando n e
 * vendo a comparação inverter. Os valores saem das mesmas funções que desenham
 * as curvas, então a leitura ao lado do controle não tem como discordar do
 * gráfico. O controle é uma faixa nativa, então funciona pelo teclado, e não é
 * animação: nada se move sozinho. ADR-0019.
 */
const EVAL: Record<CurveShape, (n: number) => number> = {
  constant: () => 1,
  logarithmic: (n) => (n <= 1 ? 0 : Math.log2(n)),
  linear: (n) => n,
  linearithmic: (n) => (n <= 1 ? n : n * Math.log2(n)),
  quadratic: (n) => n * n,
}

const STROKE = ['var(--contract)', 'var(--implementation)', 'var(--cost)']

const W = 640
const H = 280
const PAD = { top: 16, right: 96, bottom: 34, left: 48 }

export function GrowthFigure({ figure }: { figure: Extract<Figure, { kind: 'growth' }> }) {
  const at = (c: (typeof figure.curves)[number], n: number) => c.factor * EVAL[c.shape](n)
  const yMax = Math.max(...figure.curves.map((c) => at(c, figure.xMax)))

  const px = (n: number) => PAD.left + (n / figure.xMax) * (W - PAD.left - PAD.right)
  const py = (y: number) => H - PAD.bottom - (y / yMax) * (H - PAD.top - PAD.bottom)

  const samples = Array.from({ length: 81 }, (_, i) => (i / 80) * figure.xMax)

  const [probe, setProbe] = useState(figure.highlight ? Math.round(figure.highlight.to) : Math.round(figure.xMax / 2))
  const lidos = figure.curves.map((c) => ({ label: c.label, value: at(c, probe) }))
  const barato = lidos.reduce((min, x) => (x.value < min.value ? x : min), lidos[0]!)
  const caro = lidos.reduce((max, x) => (x.value > max.value ? x : max), lidos[0]!)
  const razao = barato.value > 0 ? caro.value / barato.value : 0
  const fmt = (v: number) => (v >= 1000 ? Math.round(v).toLocaleString('pt-BR') : String(Math.round(v)))

  // O cruzamento é achado por varredura, não digitado: se o autor mudar o
  // fator, a marca anda junto.
  const crossings: number[] = []
  if (figure.curves.length === 2) {
    const [a, b] = figure.curves as [typeof figure.curves[number], typeof figure.curves[number]]
    for (let i = 1; i < samples.length; i++) {
      const prev = at(a, samples[i - 1]!) - at(b, samples[i - 1]!)
      const here = at(a, samples[i]!) - at(b, samples[i]!)
      if (prev !== 0 && Math.sign(prev) !== Math.sign(here)) crossings.push(samples[i]!)
    }
  }

  return (
    <figure className="m-0 border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">Crescimento</span>
      </div>
      <div className="overflow-x-auto p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label={figure.caption}>
          {figure.highlight && (
            <>
              <rect
                x={px(figure.highlight.from)}
                y={PAD.top}
                width={Math.max(2, px(figure.highlight.to) - px(figure.highlight.from))}
                height={H - PAD.top - PAD.bottom}
                fill="var(--cost)"
                fillOpacity={0.14}
              />
              <text
                x={px(figure.highlight.to) + 6}
                y={PAD.top + 12}
                fill="var(--cost)"
                fontSize="10.5"
                fontFamily="var(--mono)"
              >
                {figure.highlight.label}
              </text>
            </>
          )}

          <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="var(--rule)" />
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="var(--rule)" />

          <text x={PAD.left} y={H - 12} fill="var(--fg-4)" fontSize="10" fontFamily="var(--mono)">0</text>
          <text x={W - PAD.right} y={H - 12} textAnchor="end" fill="var(--fg-4)" fontSize="10" fontFamily="var(--mono)">
            {figure.xMax}
          </text>
          <text x={(PAD.left + W - PAD.right) / 2} y={H - 12} textAnchor="middle" fill="var(--fg-4)" fontSize="10" fontFamily="var(--mono)">
            {figure.xLabel}
          </text>
          <text x={PAD.left - 6} y={PAD.top + 4} textAnchor="end" fill="var(--fg-4)" fontSize="10" fontFamily="var(--mono)">
            custo
          </text>

          {crossings.map((n) => (
            <g key={n}>
              <line x1={px(n)} y1={PAD.top} x2={px(n)} y2={H - PAD.bottom} stroke="var(--fg-5)" strokeDasharray="3 3" />
              <text x={px(n)} y={PAD.top + 12} textAnchor="middle" fill="var(--fg-3)" fontSize="10.5" fontFamily="var(--mono)">
                empatam aqui
              </text>
            </g>
          ))}

          <line
            x1={px(probe)}
            y1={PAD.top}
            x2={px(probe)}
            y2={H - PAD.bottom}
            stroke="var(--fg-3)"
            strokeWidth="1.25"
          />
          <text
            x={px(probe)}
            y={H - PAD.bottom + 13}
            textAnchor="middle"
            fill="var(--fg-2)"
            fontSize="10.5"
            fontFamily="var(--mono)"
          >
            n = {probe}
          </text>

          {figure.curves.map((c, i) => (
            <circle
              key={`p${c.label}`}
              cx={px(probe)}
              cy={py(Math.min(at(c, probe), yMax))}
              r="3.5"
              fill={STROKE[i % STROKE.length]}
            />
          ))}

          {figure.curves.map((c, i) => (
            <g key={c.label}>
              <polyline
                fill="none"
                stroke={STROKE[i % STROKE.length]}
                strokeWidth="1.75"
                points={samples.map((n) => `${px(n)},${py(Math.min(at(c, n), yMax))}`).join(' ')}
              />
              <text
                x={W - PAD.right + 8}
                y={py(Math.min(at(c, figure.xMax), yMax)) + 4}
                fill={STROKE[i % STROKE.length]}
                fontSize="11.5"
                fontFamily="var(--mono)"
              >
                {c.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex flex-col gap-2 border-t border-rule px-3.5 py-2.5">
        <label className="flex items-center gap-3">
          <span className="lbl shrink-0">n</span>
          <input
            type="range"
            min={1}
            max={figure.xMax}
            value={probe}
            onChange={(e) => setProbe(Number(e.target.value))}
            className="min-w-0 flex-1 accent-[var(--contract)]"
            aria-label={`${figure.xLabel}, entre 1 e ${figure.xMax}`}
          />
          <span className="w-16 shrink-0 text-right font-mono text-[12px] text-fg-2">{probe}</span>
        </label>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[11.5px]">
          {lidos.map((l, i) => (
            <span key={l.label} style={{ color: STROKE[i % STROKE.length] }}>
              {l.label} = {fmt(l.value)}
            </span>
          ))}
          {razao > 1 && (
            <span className="text-fg-3">
              {barato.label} custa {razao >= 10 ? Math.round(razao) : razao.toFixed(1)}× menos aqui
            </span>
          )}
          {razao === 1 && <span className="text-fg-3">empatam aqui</span>}
        </div>
      </div>

      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </figcaption>
    </figure>
  )
}
