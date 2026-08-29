'use client'

import { useEffect, useState } from 'react'
import { units } from '@/content'
import { read, PROGRESS_EVENT } from '@/lib/progress'
import { level, type Level } from '@/lib/level'
import { BAND_PILL } from './level-tokens'
import { cn } from '@/lib/utils'

/**
 * A faixa, sempre com a regra ao lado.
 *
 * Nome sem regra é um número disfarçado: o aluno vê "code reviewer" e não sabe
 * o que fez para chegar nem o que falta para sair. A regra da faixa alcançada e
 * o que falta para a próxima aparecem juntos, e é isso que impede a faixa de
 * virar placar. Ver ADR-0022.
 *
 * A cor da pill é o passo da faixa na rampa, e não uma quinta cor semântica:
 * ver a nota da rampa em `app/globals.css`.
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

  const pill = (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5',
        'font-sans text-[12px] leading-normal font-medium whitespace-nowrap',
        BAND_PILL[lv.band.id],
      )}
    >
      {lv.band.name}
    </span>
  )

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-2"
        title={`Faixa: ${lv.band.name}, ${lv.band.rule}`}
      >
        <span className="lbl">Faixa</span>
        {pill}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="lbl">Faixa</span>
        {pill}
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
