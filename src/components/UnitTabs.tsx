'use client'

import Link from 'next/link'
import type { Unit } from '@/content/schema'
import { cn } from '@/lib/utils'
import { BAND_TONE, TONE_TEXT } from './band-tokens'

/**
 * A barra de abas do ADR-0015. O mapa é sempre a primeira aba, e os ciclos
 * seguem na ordem de leitura — a mesma que a trilha "Por onde começar" usa,
 * porque a ordem de `unit.cycles` é a decisão editorial e não a taxonômica.
 */
export function UnitTabs({ unit, cycleId }: { unit: Unit; cycleId?: string }) {
  return (
    <div className="flex items-stretch overflow-x-auto border-b border-rule-soft bg-rail">
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
        return (
          <Link
            key={c.id}
            href={`/units/${unit.id}/cycles/${c.id}`}
            title={c.title}
            className={cn(
              'flex shrink-0 items-center gap-2 border-r border-rule-soft px-4 py-2.5 font-mono text-[11px] whitespace-nowrap',
              active
                ? '-mb-px border-b border-b-shell bg-shell text-fg'
                : 'text-fg-4 hover:bg-panel-head hover:text-fg-2',
            )}
          >
            <span className={cn(active && TONE_TEXT[BAND_TONE[c.band]])}>{short}</span>
            {active && <span className="text-fg-3">{c.title}</span>}
          </Link>
        )
      })}
    </div>
  )
}
