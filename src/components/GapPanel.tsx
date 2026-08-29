'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Progress, Unit } from '@/content/schema'
import { read } from '@/lib/progress'
import { buildSessionExport, collectGaps, type UnitGaps } from '@/lib/session-export'
import { Button } from './ui/button'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'

export function GapPanel({ units }: { units: Unit[] }) {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [copied, setCopied] = useState(false)
  // Levar o nome para fora deste navegador é escolha por vez, e a caixa nasce
  // desmarcada. ADR-0021.
  const [withName, setWithName] = useState(false)

  useEffect(() => { setProgress(read()) }, [])

  if (!progress) {
    return <p className="text-[14px] text-fg-3">Lendo o progresso deste navegador…</p>
  }

  const gaps = collectGaps(units, progress, Date.now())
  const markdown = buildSessionExport(units, progress, Date.now(), withName)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <div className="mb-7 flex items-center gap-3.5">
        <Button onClick={copy}>Copiar sessão</Button>
        <span className="text-[12.5px] italic text-fg-4">
          {copied
            ? 'copiado, cole no seu projeto do Claude'
            : 'markdown com suas lacunas, sem nenhuma resposta dentro'}
        </span>

        {progress.profile?.name && (
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-[12.5px] text-fg-3">
            <input
              type="checkbox"
              checked={withName}
              onChange={(e) => setWithName(e.target.checked)}
              className="accent-[var(--contract)]"
            />
            incluir meu nome
          </label>
        )}
      </div>

      {!gaps.length && (
        <p className="max-w-[640px] text-[14.5px] leading-relaxed text-fg-2">
          Nenhuma lacuna registrada neste navegador. Ou nada foi tentado ainda, ou tudo saiu na
          primeira tentativa, e só a segunda hipótese conta.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {gaps.map((g) => <UnitGapBlock key={g.unit.id} gaps={g} />)}
      </div>

      <details className="mt-8 max-w-[860px] border border-rule bg-panel">
        <summary className="lbl cursor-pointer px-3.5 py-2 hover:text-fg-2">
          Ver o markdown antes de copiar
        </summary>
        <pre className="m-0 max-h-[420px] overflow-auto border-t border-rule bg-[#101218] px-4 py-3.5 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-fg-3">
          {markdown}
        </pre>
      </details>
    </>
  )
}

function UnitGapBlock({ gaps }: { gaps: UnitGaps }) {
  const { unit, lines, masteryBlockers, dueForReview } = gaps
  return (
    <Panel className="max-w-[860px]">
      <PanelHeader>
        <PanelTitle className="text-fg-2">{unit.title}</PanelTitle>
        <PanelMeta>Unidade {String(unit.number).padStart(2, '0')}</PanelMeta>
      </PanelHeader>
      <PanelBody className="flex flex-col gap-3.5">
        <p className="m-0 text-[13px] leading-relaxed text-fg-3">{unit.mastery.statement}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
          {masteryBlockers.length ? (
            <span className="text-implementation">
              Falta resolver na primeira tentativa: {masteryBlockers.join(', ')}.
            </span>
          ) : (
            <span className="text-contract">
              Os exercícios exigidos pelo critério saíram na primeira tentativa.
            </span>
          )}
          {dueForReview.length > 0 && (
            <span className="text-cost">Venceu a revisita: {dueForReview.join(', ')}.</span>
          )}
        </div>

        {lines.map((line) => (
          <div key={line.exerciseId} className="border-l-2 border-rule pl-4">
            <div className="mb-1 flex items-baseline gap-3">
              <span className="font-mono text-[11.5px] text-fg-4">{line.exerciseId}</span>
              <span className="text-[13px] text-fg-2">{line.verdict}</span>
            </div>
            {line.misconceptions.map((m) => (
              <div key={m.id} className="mt-1.5 text-[13px] leading-relaxed text-fg-3">
                <span className="font-semibold text-fg-2">{m.label}</span>, “{m.socraticQuestion}”{' '}
                <Link href={`/units/${unit.id}/cycles/${m.reviewCycle}`} className="text-contract">
                  rever {m.reviewCycle.split('.')[1]}
                </Link>
              </div>
            ))}
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}
