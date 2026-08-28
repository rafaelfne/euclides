'use client'

import { useState } from 'react'
import type { Unit, Choice } from '@/content/schema'
import { misconceptionById } from '@/content'
import { recordAttempt } from '@/lib/progress'
import { cn } from '@/lib/utils'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'

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
    <Panel>
      <PanelHeader>
        <PanelTitle>Exercício</PanelTitle>
        <PanelMeta>{attempts === 0 ? 'sem tentativa' : `tentativa ${attempts}`}</PanelMeta>
      </PanelHeader>
      <PanelBody className="flex flex-col gap-4">
        <p className="m-0 text-[15px] leading-relaxed text-fg">{prompt}</p>

        <div className="flex flex-col gap-1.5">
          {choices.map((c, i) => {
            const isPicked = picked === i
            return (
              <button
                key={i}
                onClick={() => onPick(i)}
                className={cn(
                  'cursor-pointer border px-4 py-3 text-left font-serif text-[14px] leading-relaxed transition-colors',
                  !isPicked && 'border-rule bg-panel-head text-fg-2 hover:bg-panel-hover hover:text-fg',
                  isPicked && c.correct && 'border-contract-rule bg-contract-bg text-fg',
                  isPicked && !c.correct && 'border-implementation-rule bg-implementation-bg text-fg',
                )}
              >
                {c.text}
              </button>
            )
          })}
        </div>

        {chosen && !chosen.correct && misconception && !exhausted && (
          <div className="border-l-2 border-implementation pl-4">
            <div className="mb-1.5 text-[14.5px] font-semibold text-implementation">
              {misconception.socraticQuestion}
            </div>
            {escalationIndex >= 0 && (
              <div className="text-[13.5px] leading-relaxed text-fg-2">{escalation[escalationIndex]}</div>
            )}
          </div>
        )}

        {chosen && !chosen.correct && misconception && exhausted && (
          <div className="border-l-2 border-rule pl-4">
            <div className="mb-1.5 text-[14.5px] font-semibold text-fg">Vamos parar aqui.</div>
            <div className="text-[13.5px] leading-relaxed text-fg-3">
              Releia o ciclo {misconception.reviewCycle.split('.')[1]} e volte a este exercício amanhã.
              Insistir agora treina a tentativa, não o raciocínio.
            </div>
          </div>
        )}

        {chosen?.correct && (
          <div className="border-l-2 border-contract pl-4 text-[13.5px] leading-relaxed text-fg-2">
            {attempts === 1
              ? 'Resolvido na primeira tentativa, sem ativar nenhuma ideia errada. Isto conta para o critério de domínio.'
              : `Resolvido em ${attempts} tentativas. Chegar lá não é o mesmo que dominar — este exercício volta na revisita.`}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}
