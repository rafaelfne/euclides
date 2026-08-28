'use client'

import { useState } from 'react'
import type { Unit, TraceExercise as TraceEx } from '@/content/schema'
import { misconceptionById } from '@/content'
import { referenceGenerators } from '@/lib/reference/hash-table'
import { buildFeedback, findDivergence, type TraceStep } from '@/lib/socratic'
import { recordAttempt } from '@/lib/progress'

/** Columns the student fills in; `step` and `key` are given. */
const GIVEN = new Set(['step', 'key'])

export function TraceExercise({ unit, exercise }: { unit: Unit; exercise: TraceEx }) {
  const reference = (referenceGenerators[exercise.reference] ?? (() => []))()
  const editable = exercise.columns.filter((c) => !GIVEN.has(c.key))

  const [rows, setRows] = useState<TraceStep[]>(() =>
    reference.map((r) => {
      const blank: TraceStep = {}
      for (const c of exercise.columns) blank[c.key] = GIVEN.has(c.key) ? (r[c.key] ?? '') : ''
      return blank
    }),
  )
  const [attempts, setAttempts] = useState(0)
  const [checked, setChecked] = useState(false)

  const divergence = findDivergence(rows, reference, editable.map((c) => c.key))
  const misconception = divergence.firstDivergentStep
    ? misconceptionById(unit, exercise.misconceptionByStep[String(divergence.firstDivergentStep)] ?? '')
    : undefined
  const feedback = checked ? buildFeedback(divergence, attempts, misconception) : null
  const solved = checked && divergence.firstDivergentStep === null

  const set = (i: number, key: string, value: string) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [key]: value } : r)))

  const check = () => {
    const next = attempts + 1
    setAttempts(next)
    setChecked(true)
    const d = findDivergence(rows, reference, editable.map((c) => c.key))
    recordAttempt(unit.id, exercise.id, {
      solved: d.firstDivergentStep === null,
      misconception: d.firstDivergentStep
        ? exercise.misconceptionByStep[String(d.firstDivergentStep)]
        : undefined,
    })
  }

  return (
    <section style={{ borderTop: '2px solid var(--ink)', paddingTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span className="lbl">Exercício · traço de execução</span>
        <span className="lbl">{attempts === 0 ? 'sem tentativa' : `tentativa ${attempts}`}</span>
      </div>
      <p style={{ fontSize: 15.5, marginTop: 0, marginBottom: 16 }}>{exercise.prompt}</p>

      <div style={{ overflowX: 'auto', border: '1px solid var(--rule)', background: '#F8F5EE' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 720 }}>
          <thead>
            <tr style={{ background: 'var(--paper-3)' }}>
              {exercise.columns.map((c) => (
                <th key={c.key} className="lbl" style={{ fontSize: 10, textAlign: 'left', padding: '9px 12px', fontWeight: 600 }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isDivergent = checked && divergence.firstDivergentStep === i + 1
              return (
                <tr key={i} style={{ background: isDivergent ? 'var(--red-bg)' : 'transparent', borderTop: '1px solid var(--rule-2)' }}>
                  {exercise.columns.map((c) => (
                    <td key={c.key} style={{ padding: '6px 10px' }}>
                      {GIVEN.has(c.key) ? (
                        <span className="mono" style={{ fontSize: 13, color: c.key === 'step' ? 'var(--ink-4)' : 'var(--ink)' }}>
                          {r[c.key]}
                        </span>
                      ) : (
                        <input
                          value={r[c.key] ?? ''}
                          onChange={(e) => set(i, c.key, e.target.value)}
                          aria-label={`${c.label}, passo ${i + 1}`}
                          className="mono"
                          style={{
                            width: c.key === 'content' ? 250 : 66, fontSize: 13, padding: '5px 7px',
                            border: '1px solid var(--rule)', background: 'var(--paper)', color: 'var(--ink)',
                            font: 'inherit', fontFamily: 'var(--mono)',
                          }}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {feedback && (
        <div style={{ border: '1.5px solid var(--red)', background: 'var(--red-bg)', padding: '16px 20px', marginTop: 16, maxWidth: 820 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#A32A22' }}>{feedback.head}</div>
            <span className="lbl" style={{ fontSize: 9.5, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>degrau {feedback.rung} de 3</span>
          </div>
          <div style={{ fontSize: 14.5, color: 'var(--ink-2)', marginTop: 7 }}>{feedback.body}</div>
        </div>
      )}

      {solved && (
        <div style={{ borderLeft: '3px solid var(--blue)', padding: '4px 0 4px 16px', marginTop: 16, fontSize: 14.5 }}>
          O traço confere com a implementação de referência em todos os passos.
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
        <button
          onClick={check}
          style={{
            background: 'var(--ink)', color: 'var(--paper)', border: 'none', padding: '12px 26px',
            font: 'inherit', fontSize: 12.5, letterSpacing: '.08em', textTransform: 'uppercase',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          Verificar
        </button>
        <span style={{ fontSize: 12.5, color: 'var(--ink-4)', fontStyle: 'italic' }}>
          {attempts === 0 ? 'o avanço só aparece depois da tentativa' : 'errar não bloqueia — mas marca o ciclo'}
        </span>
      </div>
    </section>
  )
}
