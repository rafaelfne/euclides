'use client'

import { useState } from 'react'
import type { Unit, Choice } from '@/content/schema'
import { misconceptionById } from '@/content'
import { recordAttempt } from '@/lib/progress'

/**
 * The distractor mechanic. Feedback never contains the answer — it contains
 * the TASK that produces the answer, taken from the misconception the wrong
 * choice named. That mapping is enforced by the schema, so a lazy distractor
 * cannot exist.
 */
export function ChoiceExercise({
  unit, exerciseId, prompt, choices,
}: { unit: Unit; exerciseId: string; prompt: string; choices: Choice[] }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [attempts, setAttempts] = useState(0)

  const chosen = picked === null ? null : choices[picked]!
  const misconception = chosen && !chosen.correct
    ? misconceptionById(unit, chosen.misconceptionId)
    : undefined
  const escalation = misconception?.escalation ?? []
  const escalationIndex = attempts - 2
  const exhausted = misconception ? escalationIndex >= escalation.length : false

  const onPick = (i: number) => {
    const c = choices[i]!
    setPicked(i)
    setAttempts((a) => a + 1)
    recordAttempt(unit.id, exerciseId, {
      solved: c.correct,
      misconception: c.correct ? undefined : c.misconceptionId,
    })
  }

  return (
    <section style={{ borderTop: '2px solid var(--ink)', paddingTop: 20, maxWidth: 860 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span className="lbl">Exercício</span>
        <span className="lbl">{attempts === 0 ? 'sem tentativa' : `tentativa ${attempts}`}</span>
      </div>
      <p style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>{prompt}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {choices.map((c, i) => {
          const isPicked = picked === i
          const border = !isPicked ? 'var(--rule)' : c.correct ? 'var(--blue)' : 'var(--red)'
          const bg = !isPicked ? '#F8F5EE' : c.correct ? 'var(--blue-bg)' : 'var(--red-bg)'
          return (
            <button
              key={i}
              onClick={() => onPick(i)}
              style={{
                textAlign: 'left', border: `1.5px solid ${border}`, background: bg,
                padding: '13px 16px', font: 'inherit', fontSize: 14.5, cursor: 'pointer',
                color: 'var(--ink)',
              }}
            >
              {c.text}
            </button>
          )
        })}
      </div>

      {chosen && !chosen.correct && misconception && !exhausted && (
        <div style={{ borderLeft: '3px solid var(--red)', padding: '4px 0 4px 16px', marginTop: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#A32A22', marginBottom: 6 }}>
            {misconception.socraticQuestion}
          </div>
          {escalationIndex >= 0 && (
            <div style={{ fontSize: 14.5, color: 'var(--ink-2)' }}>
              {escalation[escalationIndex]}
            </div>
          )}
        </div>
      )}

      {chosen && !chosen.correct && misconception && exhausted && (
        <div style={{ borderLeft: '3px solid var(--ink-4)', padding: '4px 0 4px 16px', marginTop: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Vamos parar aqui.</div>
          <div style={{ fontSize: 14.5, color: 'var(--ink-2)' }}>
            Releia o ciclo {misconception.reviewCycle.split('.')[1]} e volte a este exercício amanhã.
            Insistir agora treina a tentativa, não o raciocínio.
          </div>
        </div>
      )}

      {chosen?.correct && (
        <div style={{ borderLeft: '3px solid var(--blue)', padding: '4px 0 4px 16px', marginTop: 16, fontSize: 14.5 }}>
          {attempts === 1
            ? 'Resolvido na primeira tentativa, sem ativar nenhuma ideia errada. Isto conta para o critério de domínio.'
            : `Resolvido em ${attempts} tentativas. Chegar lá não é o mesmo que dominar — este exercício volta na revisita.`}
        </div>
      )}
    </section>
  )
}
