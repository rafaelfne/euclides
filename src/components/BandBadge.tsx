'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { units } from '@/content'
import { read, PROGRESS_EVENT } from '@/lib/progress'
import { BANDS, level, type Level } from '@/lib/level'
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
      title={`${lv.band.rule}. Exige ${lv.band.requires}.`}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5',
        'font-sans text-[12px] leading-normal font-medium whitespace-nowrap',
        BAND_PILL[lv.band.id],
      )}
    >
      {lv.band.name}
    </span>
  )

  // No cabeçalho a faixa é um link para o perfil, onde estão a regra e o que
  // falta. Uma pill com borda parecia botão e não fazia nada.
  if (compact) {
    return (
      <Link
        href="/perfil"
        title={`${lv.band.rule}. Exige ${lv.band.requires}.`}
        className="m-tap inline-flex items-center gap-1.5 text-[13px] whitespace-nowrap text-fg-3 hover:text-fg"
      >
        Nível: <span className="text-contract underline decoration-contract/40 underline-offset-[3px]">{lv.band.name}</span>
      </Link>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-2.5">
        {pill}
        <span className="text-[12.5px] text-fg-2">{lv.band.rule}</span>
      </div>
      <span className="text-[12.5px] text-fg-4">exige {lv.band.requires}</span>
      {lv.next && (
        <span className="text-[12.5px] text-fg-3">
          falta para {lv.next.band.name}: {missing!.join(', ')}
        </span>
      )}
      <ol className="m-0 mt-3 flex list-none flex-col border border-rule p-0" aria-label="As cinco faixas">
        {BANDS.map((b, i) => (
          <li
            key={b.id}
            aria-current={b.id === lv.band.id ? 'step' : undefined}
            className={cn(
              'grid grid-cols-[28px_minmax(0,180px)_1fr] items-baseline gap-3 border-b border-rule-soft px-3 py-2 last:border-b-0',
              b.id === lv.band.id && 'bg-panel-head',
            )}
          >
            <span className="font-mono text-[12px] text-fg-4">{i + 1}</span>
            <span className={cn('font-mono text-[13px]', b.id === lv.band.id ? 'text-fg' : 'text-fg-3')}>
              {b.name}{b.id === lv.band.id && <span className="font-sans text-[12px] text-fg-4"> · você</span>}
            </span>
            <span className="text-[12.5px] text-fg-3">{b.requires}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
