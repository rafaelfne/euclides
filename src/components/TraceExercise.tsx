'use client'

import { useEffect, useState } from 'react'
import type { Unit, TraceExercise as TraceEx } from '@/content/schema'
import { misconceptionById } from '@/content'
import { referenceGenerators } from '@/lib/reference'
import { buildFeedback, findDivergence, findFirstBlank, type TraceStep } from '@/lib/socratic'
import { TrapNote } from './TrapNote'
import { exerciseState, recordAttempt } from '@/lib/progress'
import { traceConventions } from '@/content/conventions'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'
import { Stepper } from './Stepper'

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

  // Reidrata o traço inteiro, não só o contador. Sem isto a tabela voltava
  // vazia com três tentativas gastas, e o aluno devia por um traço que não
  // podia mais ver. ADR-0020.
  useEffect(() => {
    const st = exerciseState(unit.id, exercise.id)
    if (!st) return
    setAttempts(st.attempts)
    if (st.savedRows?.length) {
      setRows((prev) => prev.map((r, i) => ({ ...r, ...(st.savedRows![i] ?? {}) })))
      setChecked(st.attempts > 0)
    }
  }, [unit.id, exercise.id])

  const blanks = rows.reduce(
    (n, r) => n + editable.filter((c) => !(r[c.key] ?? '').trim()).length,
    0,
  )

  const divergence = findDivergence(rows, reference, editable.map((c) => c.key))
  const misconception = divergence.firstDivergentStep
    ? misconceptionById(unit, exercise.misconceptionByStep[String(divergence.firstDivergentStep)] ?? '')
    : undefined
  const labelOf = (key: string) => exercise.columns.find((c) => c.key === key)?.label ?? key

  const feedback = checked && blanks === 0
    ? buildFeedback(divergence, attempts, misconception, labelOf)
    : null

  // Com branco em qualquer lugar, a devolutiva é sobre o branco e mais nada:
  // diagnosticar o valor errado aqui entregaria o degrau 2 de graça, porque
  // verificar com branco não consome tentativa.
  const firstBlank = checked ? findFirstBlank(rows, editable.map((c) => c.key)) : null
  const blankFeedback = firstBlank
    ? buildFeedback(
        { firstDivergentStep: firstBlank.step, divergentField: firstBlank.field, blank: true },
        attempts, undefined, labelOf,
      )
    : null
  const solved = checked && divergence.firstDivergentStep === null

  const set = (i: number, key: string, value: string) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [key]: value } : r)))

  const saved = () => rows.map((r) => Object.fromEntries(editable.map((c) => [c.key, r[c.key] ?? ''])))

  const check = () => {
    // Célula em branco não consome tentativa: o motor não tem hipótese para
    // diagnosticar, e cobrar por ela é cobrar de quem ainda não tentou.
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
      savedRows: saved(),
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
                  <span className="text-fg-2">{c.rule}</span>, {c.why}
                </span>
              </div>
            ))}
          </div>
        </details>

        {/*
          Abaixo de lg, a tabela vira um cartão por rodada.

          A rolagem lateral obrigatória era o pior lugar para ela existir: o
          traço é o exercício em que o aluno compara a linha de cima com a de
          baixo, e comparar exige as duas na tela. Um cartão por rodada troca
          rolagem horizontal por vertical, que é a que o dedo já faz.
        */}
        <div className="flex flex-col gap-2.5 min-[1100px]:hidden">
          {rows.map((r, i) => {
            const isDivergent = checked && divergence.firstDivergentStep === i + 1
            return (
              <div
                key={i}
                className={cn(
                  'border border-rule bg-panel-head',
                  isDivergent && 'border-implementation bg-implementation-bg',
                )}
              >
                <div className="flex items-baseline gap-3 border-b border-rule px-3 py-1.5">
                  <span className="lbl">rodada {r['step']}</span>
                  <span className="font-mono text-[12.5px] text-fg-2">{r['key']}</span>
                </div>
                <div className="flex flex-col gap-2 px-3 py-2.5">
                  {editable.map((c) => (
                    <label key={c.key} className="flex flex-col gap-1">
                      <span className="lbl">{c.label}</span>
                      <Input
                        value={r[c.key] ?? ''}
                        onChange={(e) => set(i, c.key, e.target.value)}
                        placeholder={c.placeholder ?? ''}
                        aria-label={`${c.label}, passo ${i + 1}`}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="relative hidden overflow-x-auto border border-rule min-[1100px]:block">
          <table className="w-full min-w-[720px] border-collapse [&_td:first-child]:w-16 [&_th:first-child]:w-16">
            <thead>
              <tr>
                {exercise.columns.map((c) => (
                  <th
                    key={c.key}
                    className={cn(
                      'lbl border-b border-rule bg-panel-head px-2.5 py-2 text-left font-normal',
                      c.key === 'step' && 'sticky left-0 z-10',
                      c.key === 'key' && 'sticky left-[64px] z-10 border-r border-rule',
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
                          c.key === 'step' && 'sticky left-0 z-10 bg-panel',
                          c.key === 'key' && 'sticky left-[64px] z-10 border-r border-rule bg-panel',
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

        {blankFeedback && (
          <div className="m-rise border-l-2 border-cost pl-4">
            <div className="flex items-baseline justify-between gap-4">
              <div className="text-[14.5px] font-semibold text-cost">{blankFeedback.head}</div>
              <span className="lbl whitespace-nowrap">
                {blanks === 1 ? '1 célula em branco' : `${blanks} células em branco`}
              </span>
            </div>
            <div className="mt-1.5 text-[13.5px] leading-relaxed text-fg-2">{blankFeedback.body}</div>
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
            {feedback.misconceptionId && (
              <div className="mt-2.5">
                <TrapNote unit={unit} />
              </div>
            )}
          </div>
        )}

        {blanks === 0 && solved && (
          <div className="border-l-2 border-contract pl-4 text-[13.5px] leading-relaxed text-fg-2">
            O traço confere com a implementação de referência em todos os passos.
          </div>
        )}

        {/*
          O traço rodando, e só DEPOIS que o exercício fecha.
          Preencher a tabela passo a passo é entregar a resposta, e o princípio 3
          proíbe isso enquanto há tentativa em aberto. Resolvido ou com a escada
          esgotada, o exercício acabou: aí a mesma animação deixa de ser cola e
          vira a explicação que o aluno veio buscar. ADR-0019.
        */}
        {blanks === 0 && (solved || feedback?.exhausted) && reference.length > 0 && (
          <div className="border border-rule bg-panel-head">
            <div className="border-b border-rule px-3.5 py-2">
              <span className="lbl">O traço rodando</span>
            </div>
            <Stepper
              count={reference.length}
              labelFor={(k) => `rodada ${k + 1} de ${reference.length}`}
            >
              {(upTo) => (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse">
                    <tbody>
                      {reference.slice(0, upTo + 1).map((r, i) => (
                        <tr key={i} className={cn(i === upTo && 'm-fade-in bg-contract-bg')}>
                          {exercise.columns.map((c) => (
                            <td
                              key={c.key}
                              className="border-b border-rule-soft px-2.5 py-1.5 font-mono text-[12px]"
                            >
                              <span className="lbl mr-2 hidden sm:inline">{c.label}</span>
                              <span className={i === upTo ? 'text-fg' : 'text-fg-3'}>{r[c.key]}</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Stepper>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3.5">
          <Button onClick={check}>Verificar</Button>
          <span className="lbl hidden min-[1100px]:inline min-[1400px]:hidden">a tabela rola para o lado →</span>
          <span className="text-[12px] italic text-fg-4">errar não bloqueia, mas marca o ciclo</span>
        </div>
      </PanelBody>
    </Panel>
  )
}
