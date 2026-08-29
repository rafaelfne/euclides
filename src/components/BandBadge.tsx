'use client'

import { useEffect, useState } from 'react'
import { units } from '@/content'
import { read, PROGRESS_EVENT } from '@/lib/progress'
import { level, type Level } from '@/lib/level'

/**
 * A faixa, sempre com a regra ao lado.
 *
 * Nome sem regra é um número disfarçado: o aluno vê "Analista" e não sabe o
 * que fez para chegar nem o que falta para sair. A regra da faixa alcançada e
 * o que falta para a próxima aparecem juntos, e é isso que impede a faixa de
 * virar placar. Ver ADR-0022.
 */
export function BandBadge({ compact = false }: { compact?: boolean }) {
  const [lv, setLv] = useState<Level | null>(null)

  useEffect(() => {
    const sync = () => setLv(level(units, read(), Date.now()))
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [])

  if (!lv) return null

  const titleOf = (id: string) => units.find((u) => u.id === id)?.title ?? id
  const missing = lv.next?.missing.map((m) => (m.startsWith('mais ') ? `${m} unidades` : titleOf(m)))

  if (compact) {
    return (
      <span className="lbl" title={lv.band.rule}>
        Faixa · {lv.band.name}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2.5">
        <span className="lbl">Faixa</span>
        <span className="text-[17px] font-semibold text-fg">{lv.band.name}</span>
        <span className="text-[12.5px] text-fg-4">{lv.band.rule}</span>
      </div>
      {lv.next && (
        <span className="text-[12.5px] text-fg-3">
          falta para {lv.next.band.name}: {missing!.join(', ')}
        </span>
      )}
    </div>
  )
}
