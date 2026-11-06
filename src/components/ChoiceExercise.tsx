'use client'

import { useEffect, useState } from 'react'
import type { Unit, Choice } from '@/content/schema'
import { misconceptionById } from '@/content'
import { Badge } from './ui/badge'
import { exerciseState, recordAttempt } from '@/lib/progress'
import { seededShuffle } from '@/lib/shuffle'
import { cn } from '@/lib/utils'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'
import { TrapNote } from './TrapNote'
import { cycleNumber } from '@/lib/cycle-label'

export function ChoiceExercise({
  unit, exerciseId, prompt, choices,
}: { unit: Unit; exerciseId: string; prompt: string; choices: Choice[] }) {
  const shown = seededShuffle(choices, exerciseId)

  const [picked, setPicked] = useState<number | null>(null)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    const st = exerciseState(unit.id, exerciseId)
    if (!st) return
    setAttempts(st.attempts)

    if (st.solved) {
      const i = shown.findIndex((c) => c.correct)
      if (i >= 0) setPicked(i)
      return
    }
    const last = st.misconceptionsTriggered[st.misconceptionsTriggered.length - 1]
    if (!last) return
    const i = shown.findIndex((c) => !c.correct && c.misconceptionId === last)
    if (i >= 0) setPicked(i)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit.id, exerciseId])

  const chosen = picked === null ? null : shown[picked]!
  const misconception = chosen && !chosen.correct
    ? misconceptionById(unit, chosen.misconceptionId)
    : undefined
  const escalation = misconception?.escalation ?? []
  const escalationIndex = attempts - 2
  const exhausted = misconception ? escalationIndex >= escalation.length : false

  const onPick = (i: number) => {
    const c = shown[i]!
    setPicked(i)
    setAttempts((a) => a + 1)
    recordAttempt(unit.id, exerciseId, {
      solved: c.correct,
      misconception: c.correct ? undefined : c.misconceptionId,
      revisitAfterDays: unit.mastery.revisitIntervalDays,
    })
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Exercício</PanelTitle>
        <PanelMeta>
          {attempts === 0
            ? 'sem tentativa'
            : misconception
              ? `tentativa ${attempts} · ${
                  exhausted
                    ? 'acabaram as pistas'
                    : escalationIndex < 0
                      ? 'pergunta socrática'
                      : `tarefa ${escalationIndex + 1} de ${escalation.length}`
                }`
              : `tentativa ${attempts}`}
        </PanelMeta>
      </PanelHeader>
      <PanelBody className="flex flex-col gap-4">
        <p className="m-0 text-[15px] leading-relaxed text-fg">{prompt}</p>

        <div className="flex flex-col gap-1.5">
          {shown.map((c, i) => {
            const isPicked = picked === i
            return (
              <button
                key={i}
                data-choice={i + 1}
                onClick={() => onPick(i)}
                className={cn(
                  'm-tap cursor-pointer border px-4 py-3 text-left text-[13.5px] leading-relaxed',
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
          <div className="m-rise border-l-2 border-implementation pl-4">
            <div className="mb-2">
              <TrapNote unit={unit} />
            </div>
            <div className="mb-1.5 text-[14.5px] font-semibold text-implementation">
              {misconception.socraticQuestion}
            </div>
            {escalationIndex >= 0 && (
              <div className="text-[13.5px] leading-relaxed text-fg-2">{escalation[escalationIndex]}</div>
            )}
          </div>
        )}

        {chosen && !chosen.correct && misconception && exhausted && (
          <div className="m-rise border-l-2 border-rule pl-4">
            <div className="mb-1.5 text-[14.5px] font-semibold text-fg">Vamos parar aqui.</div>
            <div className="text-[13.5px] leading-relaxed text-fg-3">
              Releia o ciclo {cycleNumber(unit, misconception.reviewCycle)} e volte a este exercício amanhã.
              Insistir agora treina a tentativa, não o raciocínio.
            </div>
            <div className="mt-2">
              <TrapNote unit={unit} />
            </div>
          </div>
        )}

        {chosen?.correct && (
          <div className="m-rise flex flex-col gap-3.5">
            <div className="border-l-2 border-contract pl-4 text-[13.5px] leading-relaxed text-fg-2">
              {attempts === 1
                ? 'Resolvido na primeira tentativa, sem ativar nenhuma ideia errada. Isto conta para o critério de domínio.'
                : `Resolvido em ${attempts} tentativas. Chegar lá não é o mesmo que dominar, este exercício volta na revisita.`}
            </div>

            <div className="border border-rule bg-panel-head">
              <div className="border-b border-rule px-4 py-2.5">
                <div className="lbl">Compare as alternativas</div>
              </div>
              <div className="divide-y divide-rule">
                {shown.map((c, i) => {
                  const m = c.correct ? undefined : misconceptionById(unit, c.misconceptionId)
                  return (
                    <div
                      key={i}
                      className={cn(
                    'grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 border-l-2 px-4 py-3',
                        c.correct ? 'border-contract' : 'border-implementation',
                      )}
                    >
                      <div className="text-[13px] leading-relaxed text-fg">
                        {c.text}
                      </div>
                      <Badge tone={c.correct ? 'contract' : 'implementation'} className="w-fit self-start">
                        {c.correct ? 'se sustenta' : 'suposição errada'}
                      </Badge>
                      <div className="col-span-2 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-t border-rule pt-2 text-[12.5px] leading-relaxed text-fg-2">
                        <span className="lbl pt-0.5">Leitura</span>
                        <span className="min-w-0">{c.correct ? c.why : m?.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}
