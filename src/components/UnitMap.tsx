'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Unit } from '@/content/schema'
import { cycleStatus, read, type CycleStatus } from '@/lib/progress'
import { CycleNode } from './CycleNode'

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

  const inBand = (band: string, implId?: string) =>
    unit.cycles.filter((c) => c.band === band && (!implId || c.implementationId === implId))

  const nodes = (band: 'contract' | 'implementation' | 'cost', implId?: string) => (
    <div style={{ display: 'flex', gap: 14 }}>
      {inBand(band, implId).map((c) => (
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
      <header className="masthead">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <Link href="/" className="display" style={{ fontSize: 30, fontWeight: 700, color: 'var(--ink)' }}>Euclides</Link>
          <span className="lbl" style={{ color: 'var(--ink-3)' }}>Unidade {unit.number} · {unit.title}</span>
        </div>
      </header>

      <div style={{ padding: '30px 48px 60px' }}>
        <p style={{ maxWidth: 780, fontSize: 15.5, color: 'var(--ink-2)', marginTop: 0, marginBottom: 34 }}>
          {unit.motivatingProblem}
        </p>

        <Band label="Contrato" color="var(--blue)">
          <div style={{ border: '1.5px solid var(--blue)', background: 'var(--blue-bg)', padding: '17px 20px', display: 'flex', gap: 26, alignItems: 'flex-start' }}>
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 13 }}>
                <span style={{ fontSize: 21, fontWeight: 600 }}>{unit.adt.name}</span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                  o que você pode chamar — e nada além disto
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px 30px', marginBottom: 14 }}>
                {unit.adt.operations.map((op) => (
                  <div key={op.name} style={{ display: 'flex', gap: 11, alignItems: 'baseline' }}>
                    <span className="mono" style={{ fontSize: 12.5, color: 'var(--blue)', flexShrink: 0 }}>{op.signature}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{op.guarantee}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #C6D2E6', paddingTop: 11, fontSize: 13.5, maxWidth: 640 }}>
                {unit.adt.answers} Não responde: {unit.adt.cannotAnswer.join('; ').toLowerCase()}.
              </div>
            </div>
            {nodes('contract')}
          </div>
        </Band>

        <Connector />

        <Band label="Implementações" color="var(--red)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20 }}>
            {unit.implementations.map((impl) => (
              <div key={impl.id} style={{ border: '1.5px solid var(--red)', background: 'var(--red-bg)', padding: '15px 18px' }}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{impl.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 12, minHeight: 36 }}>{impl.summary}</div>
                {nodes('implementation', impl.id)}
              </div>
            ))}
          </div>
        </Band>

        <Connector />

        <Band label="Custo" color="var(--ochre-ink)">
          <div style={{ border: '1.5px solid var(--ochre)', background: 'var(--ochre-bg)', padding: '17px 20px', display: 'flex', gap: 26, alignItems: 'center' }}>
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 5 }}>Consequência, nunca promessa</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 560 }}>
                O custo pertence à implementação. Tudo que o contrato não promete é onde a estrutura falha.
              </div>
            </div>
            {nodes('cost')}
          </div>
        </Band>
      </div>
    </main>
  )
}
