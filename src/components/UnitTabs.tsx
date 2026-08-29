'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Unit } from '@/content/schema'
import { cycleStatus, read, PROGRESS_EVENT, type CycleStatus } from '@/lib/progress'
import { cn } from '@/lib/utils'
import { BAND_TONE, TONE_TEXT } from './band-tokens'

/** Um ponto por estado. O aluno via c0…c8 sem saber o que já tinha feito. */
const DOT: Record<CycleStatus, string> = {
  pending: 'bg-fg-5/40',
  attempted: 'bg-implementation',
  clean: 'bg-contract',
  review: 'bg-cost',
}

/**
 * A barra de abas do ADR-0015. O mapa é sempre a primeira aba, e os ciclos
 * seguem na ordem de leitura — a mesma que a trilha "Por onde começar" usa,
 * porque a ordem de `unit.cycles` é a decisão editorial e não a taxonômica.
 */
export function UnitTabs({ unit, cycleId }: { unit: Unit; cycleId?: string }) {
  const [statuses, setStatuses] = useState<Record<string, CycleStatus>>({})
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

  return (
    <div className="hidden shrink-0 items-stretch overflow-x-auto border-b border-rule-soft bg-rail md:flex">
      <Link
        href={`/units/${unit.id}`}
        className={cn(
          'shrink-0 border-r border-rule-soft px-4 py-2.5 font-mono text-[11px] whitespace-nowrap',
          cycleId ? 'text-fg-4 hover:bg-panel-head hover:text-fg-2' : '-mb-px border-b border-b-shell bg-shell text-fg',
        )}
      >
        mapa
      </Link>
      {unit.cycles.map((c) => {
        const active = c.id === cycleId
        const short = c.id.split('.')[1]!
        const st = statuses[c.id] ?? 'pending'
        return (
          <Link
            key={c.id}
            href={`/units/${unit.id}/cycles/${c.id}`}
            title={`${c.title}${c.layer === 'deep-dive' ? ' (aprofundamento, opcional)' : ''}`}
            className={cn(
              'flex shrink-0 items-center gap-2 border-r border-rule-soft px-3.5 py-2.5 text-[11.5px] whitespace-nowrap',
              active
                ? '-mb-px border-b border-b-shell bg-shell text-fg'
                : 'text-fg-4 hover:bg-panel-head hover:text-fg-2',
            )}
          >
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT[st])} aria-hidden />
            <span className={cn('font-mono text-[10.5px]', active && TONE_TEXT[BAND_TONE[c.band]])}>{short}</span>
            <span className={cn('max-w-[190px] truncate', active ? 'text-fg' : 'text-fg-4')}>{c.title}</span>
          </Link>
        )
      })}
    </div>
  )
}
