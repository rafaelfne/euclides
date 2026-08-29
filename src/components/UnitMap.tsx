'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BANDS_BY_KIND, type Cycle, type Unit } from '@/content/schema'
import { cycleStatus, read, PROGRESS_EVENT, type CycleStatus } from '@/lib/progress'
import { cn } from '@/lib/utils'
import { humanMinutes, unitMinutes } from '@/lib/duration'
import { UnitStateDot } from './UnitStateDot'
import { MasterySeal } from './MasterySeal'
import { CycleNode } from './CycleNode'
import { Badge } from './ui/badge'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'
import { BAND_LABEL, BAND_TONE, TONE_TEXT } from './band-tokens'

/**
 * As duas espinhas renderizam como um mapa só de propósito: mesmas três bandas,
 * mesmas formas, substantivos diferentes. Ver uma unidade de análise assintótica
 * disposta como a de hash é o ponto do ADR-0012, não um atalho de renderização.
 */
interface SpineView {
  openingTitle: string
  openingCaption: string
  promises: Array<{ key: string; lead: string; detail: string }>
  openingFooter: string
  middle: Array<{ id: string; name: string; summary: string }>
  consequenceTitle: string
  consequenceBody: string
}

function describeSpine(unit: Unit): SpineView {
  if (unit.kind === 'structure') {
    return {
      openingTitle: unit.adt.name,
      openingCaption: 'o que você pode chamar, e nada além disto',
      promises: unit.adt.operations.map((op) => ({ key: op.name, lead: op.signature, detail: op.guarantee })),
      openingFooter: `${unit.adt.answers} Não responde: ${unit.adt.cannotAnswer.join('; ').toLowerCase()}.`,
      middle: unit.implementations.map((i) => ({ id: i.id, name: i.name, summary: i.summary })),
      consequenceTitle: 'Consequência, nunca promessa',
      consequenceBody: 'O custo pertence à implementação. Tudo que o contrato não promete é onde a estrutura falha.',
    }
  }
  return {
    openingTitle: unit.criterion.name,
    openingCaption: unit.criterion.produces,
    promises: unit.criterion.parts.map((p) => ({ key: p.id, lead: p.name, detail: p.guarantee })),
    openingFooter: `Sem uma das partes o julgamento ainda soa certo: ${unit.criterion.whenOmitted
      .map((o) => `“${o.reads}”`).join('; ')}.`,
    middle: unit.techniques.map((t) => ({ id: t.id, name: t.name, summary: t.summary })),
    consequenceTitle: 'Onde o julgamento quebra',
    consequenceBody: 'A falha pertence à técnica. Toda parte que o critério exige e a técnica não produz é onde o julgamento passa por completo sem ser.',
  }
}

export function UnitMap({ unit }: { unit: Unit }) {
  const [statuses, setStatuses] = useState<Record<string, CycleStatus>>({})

  // Lido depois da montagem: o export estático serve o mesmo HTML para todos, e
  // o progresso pertence a um navegador.
  useEffect(() => {
    const sync = () => {
      const p = read()
      const next: Record<string, CycleStatus> = {}
      for (const c of unit.cycles) {
        next[c.id] = cycleStatus(p, unit.id, c.exerciseId, unit.mastery.revisitIntervalDays)
      }
      setStatuses(next)
    }
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [unit])

  const spine = describeSpine(unit)
  const [openingBand, middleBand, consequenceBand] = BANDS_BY_KIND[unit.kind]

  const inBand = (band: Cycle['band'], elaborates?: string) =>
    unit.cycles.filter((c) => c.band === band && (!elaborates || c.elaborates === elaborates))

  const nodes = (band: Cycle['band'], elaborates?: string) => (
    <div className="flex gap-2.5">
      {inBand(band, elaborates).map((c) => (
        <Link key={c.id} href={`/units/${unit.id}/cycles/${c.id}`} className="text-inherit hover:opacity-80">
          <CycleNode band={band} status={statuses[c.id] ?? 'pending'} label={c.id.split('.')[1]!} />
        </Link>
      ))}
    </div>
  )

  const bandHeader = (band: Cycle['band'], meta: string) => {
    const tone = BAND_TONE[band]
    return (
      <PanelHeader>
        <CycleNode band={band} status="clean" label="" size={11} />
        <PanelTitle className={TONE_TEXT[tone]}>{BAND_LABEL[band]}</PanelTitle>
        <PanelMeta>{meta}</PanelMeta>
      </PanelHeader>
    )
  }

  const countLabel = (n: number) => `${n} ${n === 1 ? 'ciclo' : 'ciclos'}`

  return (
    <div className="flex flex-grow flex-col gap-5 overflow-y-auto px-4 py-6 sm:px-7">
      <div className="flex items-start gap-4">
        <p className="m-0 max-w-[720px] text-[14.5px] leading-relaxed text-fg-2">{unit.motivatingProblem}</p>
        <MasterySeal unit={unit} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-3">
          <span className="lbl">Por onde começar</span>
          <span className="ml-auto flex items-baseline gap-3">
            <UnitStateDot unit={unit} withLabel />
            {/* A estimativa é derivada do que a unidade tem; ver src/lib/duration.ts. */}
            <span className="font-mono text-[12px] text-fg-4">{humanMinutes(unitMinutes(unit))}</span>
          </span>
        </div>
        <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {unit.cycles.map((c, i) => {
            const st = statuses[c.id] ?? 'pending'
            const optional = c.layer === 'deep-dive'
            return (
              <li key={c.id}>
                <Link
                  href={`/units/${unit.id}/cycles/${c.id}`}
                  className={cn(
                    'flex items-baseline gap-2 border px-2.5 py-1.5 text-[12px] text-fg-2 hover:bg-panel-hover hover:text-fg',
                    optional ? 'border-cost-rule bg-cost-bg text-cost' : 'border-rule bg-panel',
                    st === 'clean' || st === 'review' ? 'border-l-2 border-l-contract' : '',
                  )}
                >
                  <span className={cn('font-mono text-[12px]', optional ? 'opacity-70' : 'text-fg-5')}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{c.title}</span>
                  {optional && <span className="lbl text-[8.5px] text-cost">opcional</span>}
                </Link>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="flex flex-col gap-2.5">
        <Panel>
          {bandHeader(openingBand, countLabel(inBand(openingBand).length))}
          <PanelBody className="flex flex-col items-start gap-4 lg:flex-row lg:gap-6">
            <div className="flex flex-grow flex-col gap-2.5">
              <div className="flex items-baseline gap-3">
                <span className="text-[17px] font-semibold">{spine.openingTitle}</span>
                <span className="text-[12px] italic text-fg-3">{spine.openingCaption}</span>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 md:grid-cols-2">
                {spine.promises.map((p) => (
                  <div key={p.key} className="flex items-baseline gap-2.5">
                    <span className="shrink-0 font-mono text-[11.5px] text-contract">{p.lead}</span>
                    <span className="text-[12.5px] text-fg-2">{p.detail}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-contract-rule pt-2.5 text-[12.5px] leading-relaxed text-fg-2">
                {spine.openingFooter}
              </div>
            </div>
            {nodes(openingBand)}
          </PanelBody>
        </Panel>

        <Panel>
          {bandHeader(
            middleBand,
            `${spine.middle.length} ${unit.kind === 'structure' ? 'candidatas' : 'técnicas'} · ${countLabel(inBand(middleBand).length)}`,
          )}
          <PanelBody className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
            {spine.middle.map((m, i) => (
              <div key={m.id} className={cn('flex flex-col gap-2', i % 2 === 1 && 'md:border-l md:border-rule-soft md:pl-4')}>
                <span className="text-[15px] font-semibold">{m.name}</span>
                <span className="min-h-[38px] text-[12.5px] leading-relaxed text-fg-2">{m.summary}</span>
                {nodes(middleBand, m.id)}
              </div>
            ))}
          </PanelBody>
        </Panel>

        <Panel>
          {bandHeader(consequenceBand, countLabel(inBand(consequenceBand).length))}
          <PanelBody className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex flex-grow flex-col gap-1.5">
              <span className="text-[15px] font-semibold">{spine.consequenceTitle}</span>
              <span className="max-w-[560px] text-[12.5px] leading-relaxed text-fg-2">{spine.consequenceBody}</span>
            </div>
            {nodes(consequenceBand)}
          </PanelBody>
        </Panel>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <span className="lbl">Critério de domínio</span>
        <Badge tone="neutral">{unit.mastery.requiresClean.join(' · ')} sem armadilha</Badge>
      </div>
    </div>
  )
}
