'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Unit } from '@/content/schema'
import { read, PROGRESS_EVENT } from '@/lib/progress'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'

/**
 * O caderno de armadilhas: todas as frases que soam certas, num lugar só.
 *
 * Elas já existiam indexadas por unidade, cada uma com rótulo, pergunta
 * socrática e ciclo de revisão — o que faltava era a vista. Marcar as que o
 * aluno já ativou transforma a lista num caderno dele, e não num índice.
 */
export function TrapBook({ units }: { units: Unit[] }) {
  const [triggered, setTriggered] = useState<Set<string>>(new Set())
  const [onlyMine, setOnlyMine] = useState(false)

  useEffect(() => {
    const sync = () => {
      const p = read()
      const ids = new Set<string>()
      for (const u of Object.values(p.units)) {
        for (const ex of Object.values(u.exercises)) {
          ex.misconceptionsTriggered.forEach((m) => ids.add(m))
        }
      }
      setTriggered(ids)
    }
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [])

  const total = units.reduce((n, u) => n + u.misconceptions.length, 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <span className="text-[13px] text-fg-3">
          {total} armadilhas catalogadas · {triggered.size} você já ativou
        </span>
        <button
          onClick={() => setOnlyMine((v) => !v)}
          className={cn(
            'border px-3 py-1 font-mono text-[10.5px] tracking-[0.16em] uppercase',
            onlyMine ? 'border-implementation-rule bg-implementation-bg text-implementation' : 'border-rule bg-panel text-fg-3 hover:text-fg',
          )}
        >
          {onlyMine ? 'mostrando só as minhas' : 'só as que eu ativei'}
        </button>
      </div>

      {units.map((unit) => {
        const rows = unit.misconceptions.filter((m) => !onlyMine || triggered.has(m.id))
        if (!rows.length) return null
        return (
          <Panel key={unit.id} className="max-w-[900px]">
            <PanelHeader>
              <PanelTitle className="text-fg-2">{unit.title}</PanelTitle>
              <PanelMeta>Unidade {String(unit.number).padStart(2, '0')}</PanelMeta>
            </PanelHeader>
            <PanelBody className="flex flex-col gap-3.5">
              {rows.map((m) => {
                const mine = triggered.has(m.id)
                return (
                  <div
                    key={m.id}
                    className={cn('border-l-2 pl-4', mine ? 'border-implementation' : 'border-rule')}
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[13.5px] font-semibold text-fg">{m.label}</span>
                      {mine && <Badge tone="implementation">você ativou</Badge>}
                    </div>
                    <div className="mt-1 text-[13px] leading-relaxed text-fg-2">
                      “{m.socraticQuestion}”
                    </div>
                    <Link
                      href={`/units/${unit.id}/cycles/${m.reviewCycle}`}
                      className="mt-1 inline-block font-mono text-[10.5px] text-contract"
                    >
                      desfaz em {m.reviewCycle}
                    </Link>
                  </div>
                )
              })}
            </PanelBody>
          </Panel>
        )
      })}

      {onlyMine && triggered.size === 0 && (
        <p className="max-w-[640px] text-[14px] leading-relaxed text-fg-2">
          Nenhuma armadilha ativada ainda neste navegador. Isso não quer dizer que você não as
          tem — quer dizer que você ainda não encontrou o exercício que as ativa.
        </p>
      )}
    </div>
  )
}
