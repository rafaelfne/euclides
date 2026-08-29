'use client'

import Link from 'next/link'
import { useState } from 'react'
import { units, misconceptionById } from '@/content'
import { probes } from '@/content/placement'
import type { Choice } from '@/content/schema'
import { read, recordAttempt, write } from '@/lib/progress'
import { seededShuffle } from '@/lib/shuffle'
import { cn } from '@/lib/utils'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'

/**
 * A sondagem de entrada.
 *
 * Duas decisões que a fazem valer alguma coisa, e as duas contrariam o que uma
 * sondagem costuma ser:
 *
 * 1. **Não há nota nem percentual.** O resultado é uma frase sobre por onde
 *    começar. Um número aqui viraria a coisa que o aluno persegue, e o que ele
 *    deve perseguir é a unidade certa.
 *
 * 2. **As respostas CONTAM.** São os mesmos exercícios que moram nos ciclos, e
 *    tratá-los como simulado criaria duas verdades sobre o mesmo exercício: uma
 *    no painel de lacunas e outra aqui. Errar aqui ativa a armadilha, exatamente
 *    como erraria lá, e a tela avisa isso antes de começar.
 *
 * Nada é bloqueado pelo resultado. Uma unidade vencida entra marcada para
 * revisita, e revisitar não é a mesma coisa que estudar do zero. Ver ADR-0022.
 */
type Answers = Record<string, { correct: boolean; misconceptionId?: string }>

export function Placement() {
  const [at, setAt] = useState(-1)
  const [answers, setAnswers] = useState<Answers>({})

  const probe = at >= 0 && at < probes.length ? probes[at]! : null
  const unit = probe ? units.find((u) => u.id === probe.unitId)! : null
  const exercise = probe && unit
    ? unit.exercises.find((e) => e.id === probe.exerciseId)!
    : null

  const answer = (c: Choice) => {
    if (!probe || !unit) return
    recordAttempt(unit.id, probe.exerciseId, {
      solved: c.correct,
      misconception: c.correct ? undefined : c.misconceptionId,
      revisitAfterDays: unit.mastery.revisitIntervalDays,
    })
    setAnswers((prev) => ({
      ...prev,
      [probe.unitId]: { correct: c.correct, misconceptionId: c.correct ? undefined : c.misconceptionId },
    }))
    setAt((i) => i + 1)
  }

  if (at === -1) return <Intro onStart={() => setAt(0)} />
  if (!probe || !exercise || exercise.kind !== 'choice' || !unit) {
    return <Result answers={answers} />
  }

  const shown = seededShuffle(exercise.choices, exercise.id)

  return (
    <Panel className="max-w-[820px]">
      <PanelHeader>
        <PanelTitle>Sondagem</PanelTitle>
        <PanelMeta>{at + 1} de {probes.length}</PanelMeta>
      </PanelHeader>
      <PanelBody className="flex flex-col gap-4">
        <div className="flex h-1 gap-1">
          {probes.map((p, i) => (
            <span
              key={p.unitId}
              className={cn('h-full flex-1', i <= at ? 'bg-contract' : 'bg-rule')}
            />
          ))}
        </div>

        <span className="lbl">{unit.title}</span>
        <p className="m-0 text-[15px] leading-relaxed text-fg">{exercise.prompt}</p>

        <div className="flex flex-col gap-1.5">
          {shown.map((c, i) => (
            <button
              key={i}
              onClick={() => answer(c)}
              className="m-tap cursor-pointer border border-rule bg-panel-head px-4 py-3 text-left text-[13.5px] leading-relaxed text-fg-2 hover:bg-panel-hover hover:text-fg"
            >
              {c.text}
            </button>
          ))}
        </div>

        <p className="m-0 text-[12px] text-fg-4">
          Sem devolutiva agora. Ela mora no ciclo, junto do conteúdo que a explica.
        </p>
      </PanelBody>
    </Panel>
  )
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex max-w-[720px] flex-col gap-4">
      <span className="lbl">Sondagem</span>
      <h1 className="m-0 text-[30px] font-semibold leading-tight">
        Seis perguntas, uma por unidade, para saber por onde começar.
      </h1>
      <p className="m-0 text-[14.5px] leading-relaxed text-fg-2">
        Não há nota, não há percentual e nada fica bloqueado. No fim você recebe uma frase
        dizendo em qual unidade começar e quais já dá para tratar como revisita.
      </p>
      <p className="m-0 text-[14.5px] leading-relaxed text-fg-2">
        <strong className="font-semibold text-fg">As respostas contam.</strong> São os mesmos
        exercícios que moram nos ciclos, e não faria sentido medir duas vezes a mesma coisa com
        dois resultados diferentes. Errar aqui ativa a armadilha, exatamente como erraria lá.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={onStart}
          className="m-tap cursor-pointer border border-contract-rule bg-contract-bg px-4 py-2 text-[14px] font-semibold text-fg hover:bg-panel-hover"
        >
          Começar a sondagem
        </button>
        <Link href={`/units/${units[0]!.id}`} className="text-[13px] text-fg-4 underline decoration-rule underline-offset-2 hover:text-fg-2">
          pular e ir para a unidade 01
        </Link>
      </div>
    </div>
  )
}

function Result({ answers }: { answers: Answers }) {
  const cleared = probes.filter((p) => answers[p.unitId]?.correct).map((p) => p.unitId)
  const missed = probes.filter((p) => answers[p.unitId] && !answers[p.unitId]!.correct)
  const suggested = probes.find((p) => !answers[p.unitId]?.correct)?.unitId ?? 'synthesis'

  // O resultado é gravado uma vez, no fim. Gravar a cada resposta deixaria um
  // nivelamento pela metade no perfil se alguém fechar a aba no meio.
  if (typeof window !== 'undefined') {
    const p = read()
    if (p.placement?.suggestedStart !== suggested) {
      write({ ...p, placement: { takenAt: new Date().toISOString(), suggestedStart: suggested, clearedUnits: cleared } })
    }
  }

  const unitOf = (id: string) => units.find((u) => u.id === id)!
  const start = unitOf(suggested)

  return (
    <div className="flex max-w-[820px] flex-col gap-5">
      <span className="lbl">Sondagem, resultado</span>

      <p className="m-0 text-[17px] leading-relaxed text-fg">
        {cleared.length === 0
          ? 'Nenhuma das seis saiu de primeira, e é para isso que a trilha começa no começo.'
          : cleared.length === probes.length
            ? 'As seis saíram de primeira. Comece pela síntese, e trate as outras como revisita.'
            : `Você já julga ${cleared.map((id) => unitOf(id).title.toLowerCase()).join(', ')} sem tropeçar.`}
      </p>

      <div className="flex flex-col gap-2 border border-contract-rule bg-contract-bg p-4">
        <span className="lbl text-contract">Comece aqui</span>
        <Link href={`/units/${start.id}`} className="text-[18px] font-semibold text-fg hover:text-contract">
          {String(start.number).padStart(2, '0')} · {start.title}
        </Link>
        <span className="text-[13px] leading-relaxed text-fg-3">{start.learningObjective}</span>
      </div>

      {missed.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="lbl">O que cada uma sondava</span>
          {missed.map((p) => {
            const u = unitOf(p.unitId)
            const m = answers[p.unitId]?.misconceptionId
              ? misconceptionById(u, answers[p.unitId]!.misconceptionId!)
              : undefined
            return (
              <div key={p.unitId} className="border-l-2 border-implementation pl-4">
                <div className="text-[14px] text-fg-2">{u.title}</div>
                <div className="text-[13px] leading-relaxed text-fg-3">{p.whatItProbes}</div>
                {m && <div className="mt-0.5 text-[12.5px] text-implementation">armadilha ativada: {m.label}</div>}
              </div>
            )
          })}
        </div>
      )}

      {cleared.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-rule pt-4">
          <span className="lbl">Marcadas para revisita, não para estudo</span>
          <div className="flex flex-wrap gap-2">
            {cleared.map((id) => (
              <Link
                key={id}
                href={`/units/${id}`}
                className="m-tap border border-rule bg-panel-head px-3 py-1.5 font-mono text-[12px] text-fg-3 hover:text-fg"
              >
                {unitOf(id).title}
              </Link>
            ))}
          </div>
          <span className="text-[12.5px] leading-relaxed text-fg-4">
            Uma unidade vencida na sondagem não está dominada: dominada exige os exercícios do
            critério na primeira tentativa, e a sondagem fez uma pergunta por unidade.
          </span>
        </div>
      )}
    </div>
  )
}
