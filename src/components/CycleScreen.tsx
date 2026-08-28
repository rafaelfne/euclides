'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, Map } from 'lucide-react'
import type { Cycle, Exercise, Unit } from '@/content/schema'
import { allTerms } from '@/content/glossary'
import { conventions } from '@/content/conventions'
import { cn } from '@/lib/utils'
import { Pseudocode } from './Pseudocode'
import { ChoiceExercise } from './ChoiceExercise'
import { TraceExercise } from './TraceExercise'
import { Badge } from './ui/badge'
import { Panel, PanelBody, PanelHeader, PanelTitle } from './ui/panel'
import { BAND_LABEL, BAND_TONE, LAYER_LABEL, TONE_TEXT } from './band-tokens'

/**
 * The cycle is the unit of navigation, not the page: prose, worked example and
 * exercise live in one scroll. Splitting the exercise onto its own screen is an
 * invitation to skip it — and the exercise is the product.
 */
export function CycleScreen({ unit, cycle, exercise }: { unit: Unit; cycle: Cycle; exercise: Exercise }) {
  const index = unit.cycles.findIndex((c) => c.id === cycle.id)
  const prev = unit.cycles[index - 1]
  const next = unit.cycles[index + 1]
  const terms = cycle.introducesTerms
    .map((id) => allTerms.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
  const tone = BAND_TONE[cycle.band]

  return (
    <div className="flex flex-grow items-start">
      <div className="min-w-0 flex-grow px-7 py-6 pb-16">
        <div className="mb-2.5 flex items-center gap-2">
          <span className={cn('lbl', TONE_TEXT[tone])}>{BAND_LABEL[cycle.band]}</span>
          {LAYER_LABEL[cycle.layer] && <span className="lbl text-cost">· {LAYER_LABEL[cycle.layer]}</span>}
        </div>

        <h1 className="m-0 mb-4 max-w-[820px] text-[30px] font-semibold leading-tight text-fg">{cycle.title}</h1>

        {terms.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-1.5">
            {terms.map((t) => (
              <Badge key={t.id} tone="neutral" title={t.definition}>{t.canonical}</Badge>
            ))}
            <span className="text-[11.5px] italic text-fg-4">termos novos deste ciclo</span>
          </div>
        )}

        <div className="flex max-w-[820px] flex-col gap-3.5">
          {cycle.body.map((p, i) => (
            <p key={i} className="m-0 text-[15px] leading-[1.72] text-fg-2">{p}</p>
          ))}
        </div>

        {cycle.pseudocode && (
          <div className="mt-6 max-w-[820px]">
            <Pseudocode source={cycle.pseudocode} />
          </div>
        )}

        {cycle.workedExample && (
          <Panel className="mt-6 max-w-[820px] border-cost-rule bg-cost-bg">
            <PanelHeader className="border-cost-rule bg-transparent">
              <PanelTitle className="text-cost">Exemplo trabalhado</PanelTitle>
            </PanelHeader>
            <PanelBody className="flex flex-col gap-2">
              <span className="text-[13.5px] text-fg-2">{cycle.workedExample.problem}</span>
              <span className="text-[13.5px] italic text-fg-3">{cycle.workedExample.whatToNotice}</span>
            </PanelBody>
          </Panel>
        )}

        <div className="mt-8 max-w-[860px]">
          {exercise.kind === 'trace'
            ? <TraceExercise unit={unit} exercise={exercise} />
            : exercise.kind === 'choice'
              ? <ChoiceExercise unit={unit} exerciseId={exercise.id} prompt={exercise.prompt} choices={exercise.choices} />
              : <ChoiceExercise unit={unit} exerciseId={exercise.id} prompt={exercise.prompt} choices={exercise.consequences} />}
        </div>

        {/*
          A sequência existia só no array. Sem isto a tela do ciclo terminava
          no botão de verificar e o aluno voltava ao mapa para achar o próximo
          à mão — e o mapa está ordenado por banda, não por leitura.
        */}
        <nav className="mt-12 flex max-w-[860px] justify-between gap-5 border-t border-rule-soft pt-4">
          {prev ? (
            <Link href={`/units/${unit.id}/cycles/${prev.id}`} className="max-w-[340px] text-inherit hover:text-fg">
              <div className="lbl mb-1 flex items-center gap-1"><ChevronLeft size={11} /> Anterior</div>
              <div className="text-[13.5px] text-fg-2">{prev.title}</div>
            </Link>
          ) : (
            <Link href={`/units/${unit.id}`} className="max-w-[340px] text-inherit hover:text-fg">
              <div className="lbl mb-1 flex items-center gap-1"><Map size={11} /> Mapa</div>
              <div className="text-[13.5px] text-fg-2">Unidade {unit.number}</div>
            </Link>
          )}
          {next ? (
            <Link href={`/units/${unit.id}/cycles/${next.id}`} className="max-w-[340px] text-right text-inherit hover:text-fg">
              <div className="lbl mb-1 flex items-center justify-end gap-1">
                Próximo {next.layer === 'deep-dive' && '(aprofundamento, opcional)'} <ChevronRight size={11} />
              </div>
              <div className="text-[13.5px] text-fg-2">{next.title}</div>
            </Link>
          ) : (
            <Link href={`/units/${unit.id}`} className="max-w-[340px] text-right text-inherit hover:text-fg">
              <div className="lbl mb-1 flex items-center justify-end gap-1">Fim da unidade <ChevronRight size={11} /></div>
              <div className="text-[13.5px] text-fg-2">Voltar ao mapa</div>
            </Link>
          )}
        </nav>
      </div>

      <aside className="sticky top-0 w-[300px] shrink-0 self-stretch border-l border-rule-soft bg-rail px-5 py-6">
        {cycle.invariant && (
          <Panel className="mb-6 border-contract-rule bg-contract-bg">
            <PanelHeader className="border-contract-rule bg-transparent">
              <PanelTitle className="text-contract">A invariante deste ciclo</PanelTitle>
            </PanelHeader>
            <PanelBody className="font-mono text-[12px] leading-relaxed text-fg-2">{cycle.invariant}</PanelBody>
          </Panel>
        )}

        <div className="lbl mb-2.5">O que cada letra é</div>
        <div className="mb-6 flex flex-col gap-2">
          {unit.symbols.map((s) => (
            <div key={s.symbol} className="flex items-baseline gap-2.5">
              <span className="min-w-[74px] shrink-0 font-mono text-[11.5px] text-contract">{s.symbol}</span>
              <span className="text-[11.5px] leading-snug text-fg-3">{s.means}</span>
            </div>
          ))}
        </div>

        <div className="lbl mb-2.5">Convenções</div>
        <div className="mb-6 flex flex-col gap-2">
          {conventions.map((c) => (
            <div key={c.rule} className="flex items-baseline gap-2.5" title={c.why}>
              <span className="min-w-[74px] shrink-0 font-mono text-[11.5px] text-fg-2">{c.notation}</span>
              <span className="text-[11.5px] text-fg-3">{c.rule}</span>
            </div>
          ))}
        </div>

        <div className="border border-dashed border-rule px-4 py-3.5 opacity-70">
          <div className="lbl mb-1.5">Matriz de trade-off</div>
          <div className="text-[11.5px] leading-snug text-fg-4">
            Travada enquanto o exercício está aberto. Consultar a resposta durante a tentativa é o
            hábito que esta trilha desfaz.
          </div>
        </div>
      </aside>
    </div>
  )
}
