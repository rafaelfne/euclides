'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Progress, Unit } from '@/content/schema'
import { read } from '@/lib/progress'
import { buildSessionExport, collectGaps, type UnitGaps } from '@/lib/session-export'

export function GapPanel({ units }: { units: Unit[] }) {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { setProgress(read()) }, [])

  if (!progress) {
    return <p style={{ fontSize: 15, color: 'var(--ink-3)' }}>Lendo o progresso deste navegador…</p>
  }

  const gaps = collectGaps(units, progress, Date.now())
  const markdown = buildSessionExport(units, progress, Date.now())

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 30 }}>
        <button
          onClick={copy}
          style={{
            border: '1.5px solid var(--ink)', background: 'var(--ink)', color: 'var(--paper)',
            padding: '11px 18px', font: 'inherit', fontSize: 13, letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Copiar sessão
        </button>
        <span style={{ fontSize: 13.5, color: 'var(--ink-3)', fontStyle: 'italic' }}>
          {copied
            ? 'copiado — cole no seu projeto do Claude'
            : 'markdown com suas lacunas, sem nenhuma resposta dentro'}
        </span>
      </div>

      {!gaps.length && (
        <p style={{ fontSize: 15.5, color: 'var(--ink-2)', maxWidth: 640 }}>
          Nenhuma lacuna registrada neste navegador. Ou nada foi tentado ainda, ou tudo saiu
          na primeira tentativa — e só a segunda hipótese conta.
        </p>
      )}

      {gaps.map((g) => <UnitGapBlock key={g.unit.id} gaps={g} />)}

      <details style={{ marginTop: 36, maxWidth: 820 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13.5, color: 'var(--ink-3)' }}>
          Ver o markdown antes de copiar
        </summary>
        <pre
          className="mono"
          style={{
            fontSize: 12, background: '#F8F5EE', border: '1px solid var(--rule)',
            padding: 16, marginTop: 12, overflowX: 'auto', whiteSpace: 'pre-wrap',
          }}
        >
          {markdown}
        </pre>
      </details>
    </>
  )
}

function UnitGapBlock({ gaps }: { gaps: UnitGaps }) {
  const { unit, lines, masteryBlockers, dueForReview } = gaps
  return (
    <section style={{ borderTop: '2px solid var(--ink)', paddingTop: 18, marginBottom: 34, maxWidth: 820 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <Link href={`/units/${unit.id}`} style={{ color: 'var(--ink)' }}>
          <span style={{ fontSize: 20, fontWeight: 600 }}>{unit.title}</span>
        </Link>
        <span className="lbl" style={{ color: 'var(--ink-4)' }}>Unidade {unit.number}</span>
      </div>

      <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 0, marginBottom: 14 }}>
        {unit.mastery.statement}
      </p>

      <div style={{ fontSize: 14, marginBottom: 18 }}>
        {masteryBlockers.length ? (
          <span style={{ color: '#A32A22' }}>
            Falta resolver na primeira tentativa: {masteryBlockers.join(', ')}.
          </span>
        ) : (
          <span style={{ color: 'var(--blue)' }}>
            Os exercícios exigidos pelo critério saíram na primeira tentativa.
          </span>
        )}
        {dueForReview.length > 0 && (
          <span style={{ color: 'var(--ochre-ink)', marginLeft: 10 }}>
            Venceu a revisita: {dueForReview.join(', ')}.
          </span>
        )}
      </div>

      {lines.map((line) => (
        <div key={line.exerciseId} style={{ borderLeft: '3px solid var(--rule)', paddingLeft: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 4 }}>
            <span className="mono" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{line.exerciseId}</span>
            <span style={{ fontSize: 13.5 }}>{line.verdict}</span>
          </div>
          {line.misconceptions.map((m) => (
            <div key={m.id} style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 6 }}>
              <span style={{ fontWeight: 600 }}>{m.label}</span> — “{m.socraticQuestion}”{' '}
              <Link href={`/units/${unit.id}/cycles/${m.reviewCycle}`} style={{ color: 'var(--blue)' }}>
                rever {m.reviewCycle.split('.')[1]}
              </Link>
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}
