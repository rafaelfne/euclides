'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BANDS_BY_KIND, type Cycle, type Unit } from '@/content/schema'
import { cycleStatus, read, type CycleStatus } from '@/lib/progress'
import { CycleNode } from './CycleNode'


/**
 * The two spines render as one map on purpose: same three bands, same shapes,
 * different nouns. Seeing an asymptotic-analysis unit laid out like the hash
 * unit is the point of ADR-0012, not a rendering shortcut.
 */
interface SpineView {
  openingLabel: string
  openingTitle: string
  openingCaption: string
  promises: Array<{ key: string; lead: string; detail: string }>
  openingFooter: string
  middleLabel: string
  middle: Array<{ id: string; name: string; summary: string }>
  consequenceLabel: string
  consequenceTitle: string
  consequenceBody: string
}

function describeSpine(unit: Unit): SpineView {
  if (unit.kind === 'structure') {
    return {
      openingLabel: 'Contrato',
      openingTitle: unit.adt.name,
      openingCaption: 'o que você pode chamar — e nada além disto',
      promises: unit.adt.operations.map((op) => ({ key: op.name, lead: op.signature, detail: op.guarantee })),
      openingFooter: `${unit.adt.answers} Não responde: ${unit.adt.cannotAnswer.join('; ').toLowerCase()}.`,
      middleLabel: 'Implementações',
      middle: unit.implementations.map((i) => ({ id: i.id, name: i.name, summary: i.summary })),
      consequenceLabel: 'Custo',
      consequenceTitle: 'Consequência, nunca promessa',
      consequenceBody: 'O custo pertence à implementação. Tudo que o contrato não promete é onde a estrutura falha.',
    }
  }
  return {
    openingLabel: 'Critério',
    openingTitle: unit.criterion.name,
    openingCaption: unit.criterion.produces,
    promises: unit.criterion.parts.map((p) => ({ key: p.id, lead: p.name, detail: p.guarantee })),
    openingFooter: `Sem uma das partes o julgamento ainda soa certo: ${unit.criterion.whenOmitted
      .map((o) => `“${o.reads}”`).join('; ')}.`,
    middleLabel: 'Técnicas',
    middle: unit.techniques.map((t) => ({ id: t.id, name: t.name, summary: t.summary })),
    consequenceLabel: 'Falha',
    consequenceTitle: 'Onde o julgamento quebra',
    consequenceBody: 'A falha pertence à técnica. Toda parte que o critério exige e a técnica não produz é onde o julgamento passa por completo sem ser.',
  }
}

export function UnitMap({ unit }: { unit: Unit }) {
  const [statuses, setStatuses] = useState<Record<string, CycleStatus>>({})

  // Read after mount: static export means the HTML is identical for everyone,
  // and progress belongs to one browser.
  useEffect(() => {
    const p = read()
    const next: Record<string, CycleStatus> = {}
    for (const c of unit.cycles) {
      next[c.id] = cycleStatus(p, unit.id, c.exerciseId, unit.mastery.revisitIntervalDays)
    }
    setStatuses(next)
  }, [unit])

  const spine = describeSpine(unit)
  const [openingBand, middleBand, consequenceBand] = BANDS_BY_KIND[unit.kind]

  const inBand = (band: Cycle['band'], elaborates?: string) =>
    unit.cycles.filter((c) => c.band === band && (!elaborates || c.elaborates === elaborates))

  const nodes = (band: Cycle['band'], elaborates?: string) => (
    <div style={{ display: 'flex', gap: 14 }}>
      {inBand(band, elaborates).map((c) => (
        <Link key={c.id} href={`/units/${unit.id}/cycles/${c.id}`} style={{ color: 'inherit' }}>
          <CycleNode band={band} status={statuses[c.id] ?? 'pending'} label={c.id.split('.')[1]!} />
        </Link>
      ))}
    </div>
  )

  const Band = ({ label, color, children }: { label: string; color: string; children: React.ReactNode }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '132px 1fr', gap: 22, alignItems: 'start' }}>
      <div className="lbl" style={{ color, paddingTop: 16, textAlign: 'right' }}>{label}</div>
      {children}
    </div>
  )

  const Connector = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '132px 1fr', gap: 22 }}>
      <div />
      <div style={{ height: 30, paddingLeft: 40 }}>
        <div style={{ width: 1.5, height: 30, background: 'var(--rule)' }} />
      </div>
    </div>
  )

  return (
    <main className="shell">
      <header className="masthead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <Link href="/" className="display" style={{ fontSize: 30, fontWeight: 700, color: 'var(--ink)' }}>Euclides</Link>
          <span className="lbl" style={{ color: 'var(--ink-3)' }}>Unidade {unit.number} · {unit.title}</span>
        </div>
        <Link href="/gaps" className="lbl" style={{ color: 'var(--ink-3)' }}>Lacunas →</Link>
      </header>

      <div style={{ padding: '30px 48px 60px' }}>
        <p style={{ maxWidth: 780, fontSize: 15.5, color: 'var(--ink-2)', marginTop: 0, marginBottom: 34 }}>
          {unit.motivatingProblem}
        </p>

        {/*
          As bandas dizem onde cada ciclo VIVE na taxonomia; elas não são o
          caminho. Lidas na ordem da tela, elas levavam ao rehash antes do load
          factor — e o ciclo do rehash abre falando de α. A trilha abaixo é a
          ordem de leitura, que é outra informação e precisa de outro lugar.
        */}
        <div style={{ marginBottom: 36 }}>
          <div className="lbl" style={{ color: 'var(--ink-3)', marginBottom: 12 }}>Por onde começar</div>
          <ol style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 10px', listStyle: 'none', margin: 0, padding: 0 }}>
            {unit.cycles.map((c, i) => {
              const st = statuses[c.id] ?? 'pending'
              const opcional = c.layer === 'deep-dive'
              return (
                <li key={c.id}>
                  <Link
                    href={`/units/${unit.id}/cycles/${c.id}`}
                    style={{
                      display: 'flex', alignItems: 'baseline', gap: 8, color: 'inherit',
                      border: `1px solid ${opcional ? 'var(--ochre)' : 'var(--rule)'}`,
                      background: st === 'clean' || st === 'review' ? 'var(--paper-3)' : 'var(--paper)',
                      borderStyle: opcional ? 'dashed' : 'solid',
                      padding: '7px 12px',
                    }}
                  >
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{i + 1}</span>
                    <span style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{c.title}</span>
                    {opcional && (
                      <span className="lbl" style={{ fontSize: 9, color: 'var(--ochre-ink)' }}>opcional</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>

        <Band label={spine.openingLabel} color="var(--blue)">
          <div style={{ border: '1.5px solid var(--blue)', background: 'var(--blue-bg)', padding: '17px 20px', display: 'flex', gap: 26, alignItems: 'flex-start' }}>
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 13 }}>
                <span style={{ fontSize: 21, fontWeight: 600 }}>{spine.openingTitle}</span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                  {spine.openingCaption}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px 30px', marginBottom: 14 }}>
                {spine.promises.map((p) => (
                  <div key={p.key} style={{ display: 'flex', gap: 11, alignItems: 'baseline' }}>
                    <span className="mono" style={{ fontSize: 12.5, color: 'var(--blue)', flexShrink: 0 }}>{p.lead}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{p.detail}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #C6D2E6', paddingTop: 11, fontSize: 13.5, maxWidth: 640 }}>
                {spine.openingFooter}
              </div>
            </div>
            {nodes(openingBand)}
          </div>
        </Band>

        <Connector />

        <Band label={spine.middleLabel} color="var(--red)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20 }}>
            {spine.middle.map((m) => (
              <div key={m.id} style={{ border: '1.5px solid var(--red)', background: 'var(--red-bg)', padding: '15px 18px' }}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{m.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 12, minHeight: 36 }}>{m.summary}</div>
                {nodes(middleBand, m.id)}
              </div>
            ))}
          </div>
        </Band>

        <Connector />

        <Band label={spine.consequenceLabel} color="var(--ochre-ink)">
          <div style={{ border: '1.5px solid var(--ochre)', background: 'var(--ochre-bg)', padding: '17px 20px', display: 'flex', gap: 26, alignItems: 'center' }}>
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 5 }}>{spine.consequenceTitle}</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 560 }}>
                {spine.consequenceBody}
              </div>
            </div>
            {nodes(consequenceBand)}
          </div>
        </Band>
      </div>
    </main>
  )
}
