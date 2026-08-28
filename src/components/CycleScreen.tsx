'use client'

import Link from 'next/link'
import type { Cycle, Exercise, Unit } from '@/content/schema'
import { glossary, crossUnitGlossary } from '@/content/glossary'
import { conventions } from '@/content/conventions'
import { Pseudocode } from './Pseudocode'
import { ChoiceExercise } from './ChoiceExercise'
import { TraceExercise } from './TraceExercise'

const allTerms = [...glossary, ...crossUnitGlossary]

/**
 * Enum values are code and code is English; labels are content and content is
 * pt-BR. This map is the boundary, and it exists because rendering `band`
 * directly put "BANDA · IMPLEMENTATION" on screen — the same drift, one layer
 * lower. Exhaustive by type: a new band fails the build until it is named here.
 */
const BAND_LABEL: Record<Cycle['band'], string> = {
  contract: 'Contrato',
  implementation: 'Implementação',
  cost: 'Custo',
}

/**
 * The cycle is the unit of navigation, not the page: prose, worked example and
 * exercise live in one scroll. Splitting the exercise onto its own screen is an
 * invitation to skip it — and the exercise is the product.
 */
export function CycleScreen({ unit, cycle, exercise }: { unit: Unit; cycle: Cycle; exercise: Exercise }) {
  const index = unit.cycles.findIndex((c) => c.id === cycle.id)
  const terms = cycle.introducesTerms
    .map((id) => allTerms.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))

  return (
    <main className="shell">
      <header className="masthead">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <Link href="/" className="display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>Euclides</Link>
          <Link href={`/units/${unit.id}`} className="lbl" style={{ color: 'var(--ink-4)' }}>
            Unidade {unit.number} › {cycle.id.split('.')[1]}
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          {unit.cycles.map((c, i) => (
            <span key={c.id} style={{ width: 22, height: 4, background: 'var(--ink)', opacity: i < index ? 1 : i === index ? 0.55 : 0.16 }} />
          ))}
        </div>
      </header>

      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ flexGrow: 1, padding: '34px 44px 60px 48px', minWidth: 0 }}>
          <div className="lbl" style={{ color: cycle.layer === 'deep-dive' ? 'var(--ochre-ink)' : 'var(--red)', marginBottom: 10 }}>
            {cycle.layer === 'deep-dive' ? 'Aprofundamento' : BAND_LABEL[cycle.band]}
          </div>
          <h1 className="display" style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.15, margin: '0 0 16px' }}>
            {cycle.title}
          </h1>

          {terms.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              {terms.map((t) => (
                <span
                  key={t.id}
                  className="mono"
                  title={`${t.definition}\n\nNão é: ${t.isNot.join('; ')}`}
                  style={{ fontSize: 11.5, border: '1px solid var(--blue)', color: 'var(--blue)', padding: '4px 10px', background: 'var(--blue-bg)', cursor: 'help' }}
                >
                  {t.canonical}
                </span>
              ))}
              <span style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic' }}>
                termos novos deste ciclo
              </span>
            </div>
          )}

          {cycle.body.map((p, i) => (
            <p key={i} style={{ fontSize: 15.5, lineHeight: 1.62, color: '#2A2520', maxWidth: 760 }}>{p}</p>
          ))}

          {cycle.pseudocode && (
            <div style={{ maxWidth: 760, margin: '22px 0' }}>
              <Pseudocode source={cycle.pseudocode} />
            </div>
          )}

          {cycle.workedExample && (
            <div style={{ borderLeft: '3px solid var(--ochre)', padding: '2px 0 2px 20px', margin: '26px 0 30px', maxWidth: 760 }}>
              <div className="lbl" style={{ color: 'var(--ochre-ink)', marginBottom: 8 }}>Exemplo trabalhado</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-2)' }}>
                {cycle.workedExample.problem}
              </div>
              <div style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-2)', marginTop: 8, fontStyle: 'italic' }}>
                {cycle.workedExample.whatToNotice}
              </div>
            </div>
          )}

          {exercise.kind === 'trace'
            ? <TraceExercise unit={unit} exercise={exercise} />
            : exercise.kind === 'choice'
              ? <ChoiceExercise unit={unit} exerciseId={exercise.id} prompt={exercise.prompt} choices={exercise.choices} />
              : <ChoiceExercise unit={unit} exerciseId={exercise.id} prompt={exercise.prompt} choices={exercise.consequences} />}
        </div>

        <aside style={{ width: 320, flexShrink: 0, borderLeft: '1px solid var(--rule)', padding: '34px 30px', alignSelf: 'stretch' }}>
          {cycle.invariant && (
            <div style={{ border: '1.5px solid var(--blue)', background: 'var(--blue-bg)', padding: '15px 17px', marginBottom: 26 }}>
              <div className="lbl" style={{ color: 'var(--blue)', marginBottom: 9 }}>A invariante deste ciclo</div>
              <div className="mono" style={{ fontSize: 12.5, lineHeight: 1.65 }}>{cycle.invariant}</div>
            </div>
          )}

          <div className="lbl" style={{ marginBottom: 11 }}>Convenções</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 26 }}>
            {conventions.map((c) => (
              <div key={c.rule} style={{ display: 'flex', gap: 11, alignItems: 'baseline' }} title={c.why}>
                <span className="mono" style={{ fontSize: 12, minWidth: 76 }}>{c.notation}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{c.rule}</span>
              </div>
            ))}
          </div>

          <div style={{ border: '1px dashed var(--rule)', background: 'var(--paper-2)', padding: '15px 17px', opacity: 0.75 }}>
            <div className="lbl" style={{ color: 'var(--ink-3)', marginBottom: 8 }}>Matriz de trade-off</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>
              Travada enquanto o exercício está aberto. Consultar a resposta durante a tentativa é o
              hábito que esta trilha desfaz.
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
