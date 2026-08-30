'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Map } from 'lucide-react'
import type { Cycle, Exercise, Unit } from '@/content/schema'
import { allTerms } from '@/content/glossary'
import { conventions } from '@/content/conventions'
import { cn } from '@/lib/utils'
import { cycleMinutes, humanMinutes } from '@/lib/duration'
import { CycleFigure } from './CycleFigure'
import { CycleShortcuts } from './CycleShortcuts'
import { ModeToggle, useMode } from './ModeToggle'
import { Prose } from './Prose'
import { TermCard } from './TermCard'
import { findMarks } from '@/lib/glossary-link'
import { CodeBlock } from './CodeBlock'
import { ChoiceExercise } from './ChoiceExercise'
import { TraceExercise } from './TraceExercise'
import { BugExercise } from './BugExercise'
import { Badge } from './ui/badge'
import { Panel, PanelBody, PanelHeader, PanelTitle } from './ui/panel'
import { exerciseState, PROGRESS_EVENT } from '@/lib/progress'
import { BAND_LABEL, BAND_TONE, LAYER_LABEL, TONE_TEXT } from './band-tokens'

/**
 * The cycle is the unit of navigation, not the page: prose, worked example and
 * exercise live in one scroll. Splitting the exercise onto its own screen is an
 * invitation to skip it, and the exercise is the product.
 */
export function CycleScreen({ unit, cycle, exercise }: { unit: Unit; cycle: Cycle; exercise: Exercise }) {
  const index = unit.cycles.findIndex((c) => c.id === cycle.id)
  const prev = unit.cycles[index - 1]
  const next = unit.cycles[index + 1]
  const terms = cycle.introducesTerms
    .map((id) => allTerms.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
  const tone = BAND_TONE[cycle.band]
  const mode = useMode()

  /*
    A frase de conforto aparece só nos três primeiros ciclos da unidade 01, e só
    no modo iniciante. Ela é derivada, não autorada: o número de armadilhas vem
    do catálogo, e é o ADR-0018 valendo — acolhimento é afirmação verificável.
  */
  const firstCycles = unit.number === 1 && unit.cycles.findIndex((c) => c.id === cycle.id) < 3

  // Os termos que ESTE ciclo estreia, mais o vocabulário do app, que não
  // estreia em ciclo nenhum e é o que falta para quem chega sem referente.
  //
  // A ligação é uma por ciclo, não uma por parágrafo: o mesmo termo sublinhado
  // três vezes na mesma tela vira ruído, e a estreia acontece uma vez só.
  const linkable = [...cycle.introducesTerms, ...allTerms.filter((t) => t.id.startsWith('app.')).map((t) => t.id)]
  const remaining = new Set(linkable)
  const termsPerParagraph = cycle.body.map((text) => {
    const here = findMarks(text, [...remaining]).map((m) => m.term.id)
    here.forEach((id) => remaining.delete(id))
    return here
  })

  return (
    <>
      <CycleShortcuts unit={unit} cycleId={cycle.id} />
      <div className="min-w-0 flex-grow overflow-y-auto px-4 py-6 pb-16 sm:px-7">
        <div className="mb-2.5 flex items-center gap-2">
          <span className={cn('lbl', TONE_TEXT[tone])}>{BAND_LABEL[cycle.band]}</span>
          {LAYER_LABEL[cycle.layer] && <span className="lbl text-cost">· {LAYER_LABEL[cycle.layer]}</span>}
          <span className="lbl ml-auto">{humanMinutes(cycleMinutes(unit, cycle.id))}</span>
          <ModeToggle />
        </div>

        <h1 className="m-0 mb-4 max-w-[820px] text-[30px] font-semibold leading-tight text-fg">{cycle.title}</h1>

        {terms.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-1.5">
            {terms.map((t) => (
              <TermCard key={t.id} term={t}>
                <Badge tone="neutral" className="cursor-help">{t.canonical}</Badge>
              </TermCard>
            ))}
            <span className="text-[11.5px] italic text-fg-4">termos novos deste ciclo</span>
          </div>
        )}

        <p className="m-0 mb-5 max-w-[820px] border-l-2 border-contract pl-4 text-[17px] leading-snug text-fg">
          {cycle.oneLine}
        </p>

        {mode === 'iniciante' && cycle.plainly && (
          <p className="m-0 mb-5 max-w-[820px] border border-rule-soft bg-panel-head px-4 py-3 text-[14px] leading-[1.75] text-fg-3">
            {cycle.plainly}
          </p>
        )}

        {mode === 'iniciante' && firstCycles && (
          <p className="m-0 mb-5 max-w-[820px] text-[13px] leading-relaxed text-fg-4">
            Errar aqui é o esperado: esta unidade tem {unit.misconceptions.length} armadilhas
            catalogadas, escritas antes de você chegar. O app não dá a resposta, dá a tarefa
            que produz a resposta.
          </p>
        )}

        <div className="flex max-w-[820px] flex-col gap-3.5">
          {cycle.body.map((p, i) => (
            <p key={i} className="m-0 text-[14.5px] leading-[1.75] text-fg-2"><Prose terms={termsPerParagraph[i]}>{p}</Prose></p>
          ))}
        </div>

        {cycle.figure && (
          <div className="mt-6 max-w-[820px]">
            <CycleFigure figure={cycle.figure} autoPlay={mode === 'iniciante'} />
          </div>
        )}

        {cycle.pseudocode && (
          <div className="mt-6 max-w-[820px]">
            <CodeBlock source={cycle.pseudocode} />
          </div>
        )}

        {/*
          Aberto no modo iniciante, recolhido no de revisão. Quem já julgou este
          conteúdo não quer o exemplo entre a prosa e o exercício. ADR-0027.
        */}
        <details
          open={mode === 'iniciante'}
          className="mt-6 max-w-[820px] border border-cost-rule bg-cost-bg"
        >
          <summary className="lbl cursor-pointer px-3.5 py-2 text-cost">Exemplo trabalhado</summary>
          <div className="flex flex-col gap-2 border-t border-cost-rule px-3.5 py-3">
            <span className="text-[13.5px] text-fg-2">{cycle.workedExample.problem}</span>
            <span className="text-[13.5px] italic text-fg-3">{cycle.workedExample.whatToNotice}</span>
          </div>
        </details>

        {/*
          O chamado fecha aqui, e só no último ciclo.
          A unidade abriu com um incidente concreto e passou por sete ciclos de
          técnica; sem voltar a ele, o aluno guarda a abertura e nunca recebe a
          resposta. As quatro perguntas são as mesmas em todas as unidades, de
          propósito: é o roteiro que ele deve levar embora. ADR-0027.
        */}
        {cycle.postmortem && (
          <div className="mt-8 max-w-[860px] border border-cost-rule bg-cost-bg">
            <div className="border-b border-cost-rule px-4 py-2">
              <span className="lbl text-cost">Postmortem, o chamado que abriu a unidade</span>
            </div>
            <div className="flex flex-col gap-3.5 px-4 py-4">
              <p className="m-0 text-[14.5px] leading-relaxed text-fg">{cycle.postmortem.incident}</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr] sm:gap-x-5 sm:gap-y-2.5">
                <span className="lbl whitespace-nowrap">qual armadilha</span>
                <span className="text-[13.5px] leading-relaxed text-fg-2">
                  {unit.misconceptions.find((m) => m.id === cycle.postmortem!.trapId)?.label}
                </span>

                <span className="lbl whitespace-nowrap">qual afirmação faltava</span>
                <span className="text-[13.5px] leading-relaxed text-fg-2">{cycle.postmortem.missingClaim}</span>

                <span className="lbl whitespace-nowrap">o que teria pego</span>
                <span className="text-[13.5px] leading-relaxed text-fg-2">{cycle.postmortem.whatWouldCatch}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 max-w-[860px]">
          {exercise.kind === 'trace'
            ? <TraceExercise unit={unit} exercise={exercise} />
            : exercise.kind === 'choice'
              ? <ChoiceExercise unit={unit} exerciseId={exercise.id} prompt={exercise.prompt} choices={exercise.choices} />
              : <BugExercise unit={unit} exercise={exercise} />}
        </div>

        {/*
          A sequência existia só no array. Sem isto a tela do ciclo terminava
          no botão de verificar e o aluno voltava ao mapa para achar o próximo
          à mão, e o mapa está ordenado por banda, não por leitura.
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

        <div className="mt-12 border-t border-rule-soft pt-6 xl:hidden">
          <CycleAside unit={unit} cycle={cycle} exercise={exercise} />
        </div>
      </div>

      <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-rule-soft bg-rail px-5 py-6 xl:block">
        <CycleAside unit={unit} cycle={cycle} exercise={exercise} />
      </aside>
    </>
  )
}

/**
 * A matriz prometia destravar ao fim do exercício e nunca destravava: o painel
 * era texto fixo. Ela é a recompensa declarada por não consultar a resposta
 * durante a tentativa, e uma recompensa que não chega ensina outra coisa.
 */
function TradeOffMatrix({ unit, exerciseId }: { unit: Unit; exerciseId: string }) {
  const [solved, setSolved] = useState(false)
  useEffect(() => {
    const sync = () => setSolved(Boolean(exerciseState(unit.id, exerciseId)?.solved))
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [unit.id, exerciseId])

  if (!solved) {
    return (
      <div className="border border-dashed border-rule px-4 py-3.5 opacity-70">
        <div className="lbl mb-1.5">Matriz de trade-off</div>
        <div className="text-[11.5px] leading-snug text-fg-4">
          Travada enquanto o exercício está aberto. Consultar a resposta durante a tentativa é o
          hábito que esta trilha desfaz.
        </div>
      </div>
    )
  }

  const rows = unit.kind === 'structure'
    ? unit.implementations.map((i) => ({ id: i.id, name: i.name, wrongWhen: i.wrongWhen }))
    : unit.techniques.map((t) => ({ id: t.id, name: t.name, wrongWhen: t.wrongWhen }))

  return (
    <div className="border border-rule bg-panel px-4 py-3.5">
      <div className="lbl mb-2.5 text-implementation">Matriz de trade-off</div>
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.id} className="flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-fg-2">{r.name}</span>
            {r.wrongWhen.map((w) => (
              <div key={w.scenario} className="text-[11.5px] leading-snug text-fg-4">
                <span className="text-fg-3">{w.scenario}</span> → {w.useInstead}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Legenda e convenções. Em tela larga acompanham a prosa numa coluna própria;
 * abaixo disso descem para o fim do conteúdo, porque escondê-las seria tirar
 * justamente a peça que o ADR-0013 criou para ser consultada durante a leitura.
 */
function CycleAside({ unit, cycle, exercise }: { unit: Unit; cycle: Cycle; exercise: Exercise }) {
  return (
    <>
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

        <TradeOffMatrix unit={unit} exerciseId={exercise.id} />
    </>
  )
}
