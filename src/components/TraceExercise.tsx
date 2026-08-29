'use client'

import { useEffect, useState } from 'react'
import type { Unit, TraceExercise as TraceEx } from '@/content/schema'
import { misconceptionById } from '@/content'
import { referenceGenerators } from '@/lib/reference'
import { buildFeedback, findDivergence, type TraceStep } from '@/lib/socratic'
import { exerciseState, recordAttempt } from '@/lib/progress'
import { traceConventions } from '@/content/conventions'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'

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

  useEffect(() => {
    const st = exerciseState(unit.id, exercise.id)
    if (st) setAttempts(st.attempts)
  }, [unit.id, exercise.id])

  const blanks = rows.reduce(
    (n, r) => n + editable.filter((c) => !(r[c.key] ?? '').trim()).length,
    0,
  )

  const divergence = findDivergence(rows, reference, editable.map((c) => c.key))
  const misconception = divergence.firstDivergentStep
    ? misconceptionById(unit, exercise.misconceptionByStep[String(divergence.firstDivergentStep)] ?? '')
    : undefined
  const feedback = checked ? buildFeedback(divergence, attempts, misconception) : null
  const solved = checked && divergence.firstDivergentStep === null

  const set = (i: number, key: string, value: string) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [key]: value } : r)))

  const check = () => {
    if (blanks > 0) { setChecked(true); return }
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
    <Panel>
      <PanelHeader>
        <PanelTitle>Exercício · traço de execução</PanelTitle>
        <PanelMeta>{attempts === 0 ? 'sem tentativa' : `tentativa ${attempts}`}</PanelMeta>
      </PanelHeader>
      <PanelBody className="flex flex-col gap-4">
        <p className="m-0 text-[15px] leading-relaxed text-fg">{exercise.prompt}</p>

        {/*
          Como se escreve a resposta, antes de pedir a resposta. Sem isto o aluno
          inventa a notação, diverge no passo 1 por tipografia e recebe a
          devolutiva de quem errou o raciocínio.
        */}
        <details open className="border border-rule bg-panel-head">
          <summary className="lbl cursor-pointer px-3.5 py-2 hover:text-fg-2">Como preencher</summary>
          <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-3.5 gap-y-2 border-t border-rule px-3.5 py-3">
            {[...exercise.conventions, ...traceConventions].map((c) => (
              <div key={c.rule} className="contents">
                <span className="whitespace-nowrap font-mono text-[11.5px] text-contract">{c.notation}</span>
                <span className="text-[12px] text-fg-3">
                  <span className="text-fg-2">{c.rule}</span> — {c.why}
                </span>
              </div>
            ))}
          </div>
        </details>

        <div className="relative overflow-x-auto border border-rule">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                {exercise.columns.map((c) => (
                  <th
                    key={c.key}
                    className={cn(
                      'lbl border-b border-rule bg-panel-head px-2.5 py-2 text-left font-normal',
                      GIVEN.has(c.key) && 'sticky left-0 z-10 border-r border-rule',
                    )}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isDivergent = checked && divergence.firstDivergentStep === i + 1
                return (
                  <tr key={i} className={cn(isDivergent && 'bg-implementation-bg')}>
                    {exercise.columns.map((c) => (
                      <td
                        key={c.key}
                        className={cn(
                          'border-b border-rule-soft align-middle',
                          GIVEN.has(c.key) && 'sticky left-0 z-10 border-r border-rule bg-panel',
                          isDivergent && GIVEN.has(c.key) && 'bg-implementation-bg',
                        )}
                      >
                        {GIVEN.has(c.key) ? (
                          <span className="block px-2.5 py-1.5 font-mono text-[12.5px] text-fg-3">{r[c.key]}</span>
                        ) : (
                          <Input
                            value={r[c.key] ?? ''}
                            onChange={(e) => set(i, c.key, e.target.value)}
                            placeholder={c.placeholder ?? ''}
                            aria-label={`${c.label}, passo ${i + 1}`}
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

        {checked && blanks > 0 && (
          <div className="border-l-2 border-rule pl-4">
            <div className="text-[14.5px] font-semibold text-fg">
              Faltam {blanks} {blanks === 1 ? 'célula' : 'células'} em branco.
            </div>
            <div className="mt-1.5 text-[13.5px] leading-relaxed text-fg-2">
              Em branco não é uma resposta, e o motor não sabe distinguir “não sei” de “é vazio”.
              Preencha todas antes de verificar.
            </div>
          </div>
        )}

        {blanks === 0 && feedback && (
          <div
            className={cn(
              'border-l-2 pl-4',
              feedback.exhausted ? 'border-rule' : 'border-implementation',
            )}
          >
            <div className="flex items-baseline justify-between gap-4">
              <div
                className={cn(
                  'text-[14.5px] font-semibold',
                  feedback.exhausted ? 'text-fg' : 'text-implementation',
                )}
              >
                {feedback.head}
              </div>
              <span className="lbl whitespace-nowrap">
                {feedback.exhausted ? 'escada esgotada' : `degrau ${feedback.rung} de 3`}
              </span>
            </div>
            <div className="mt-1.5 text-[13.5px] leading-relaxed text-fg-2">{feedback.body}</div>
          </div>
        )}

        {blanks === 0 && solved && (
          <div className="border-l-2 border-contract pl-4 text-[13.5px] leading-relaxed text-fg-2">
            O traço confere com a implementação de referência em todos os passos.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3.5">
          <Button onClick={check}>Verificar</Button>
          <span className="lbl xl:hidden">a tabela rola para o lado →</span>
          <span className="text-[12px] italic text-fg-4">errar não bloqueia — mas marca o ciclo</span>
        </div>
      </PanelBody>
    </Panel>
  )
}
