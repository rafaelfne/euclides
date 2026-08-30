'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { units } from '@/content'
import { read, PROGRESS_EVENT } from '@/lib/progress'
import { dueRevisits, upcomingRevisit, REVISIT_STEPS, type Due, type Upcoming } from '@/lib/traps'

/**
 * A fila de revisitas.
 *
 * Ela conta VOLTAS HONRADAS, nunca dias abertos: um exercício sobe de degrau
 * quando volta limpo, e volta ao primeiro degrau quando volta sujo. Abrir o app
 * todo dia não move nada, e é essa diferença que separa isto de uma sequência
 * de login. Ver ADR-0024.
 */
export function RevisitQueue({ compact = false }: { compact?: boolean }) {
  const [due, setDue] = useState<Due[]>([])
  const [upcoming, setUpcoming] = useState<Upcoming | null>(null)

  useEffect(() => {
    const sync = () => {
      const progress = read()
      const now = Date.now()
      setDue(dueRevisits(units, progress, now))
      setUpcoming(upcomingRevisit(units, progress, now))
    }
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [])

  if (!due.length) {
    return compact ? null : (
      <p className="max-w-[640px] text-[14px] leading-relaxed text-fg-2">
        Nenhuma revisita venceu. A fila enche sozinha: {REVISIT_STEPS.join(', ')} dias depois de cada
        volta limpa, e um exercício só entra depois de ter saído limpo alguma vez.
        {upcoming && <> Próxima: {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(upcoming.at)} · {upcoming.cycleTitle}.</>}
      </p>
    )
  }

  if (compact) {
    return (
      <Link
        href="/revisitas"
        className="m-tap flex max-w-[720px] items-baseline gap-3 border border-cost-rule bg-cost-bg px-4 py-3 text-inherit hover:bg-panel-hover"
      >
        <span className="lbl text-cost">Hoje</span>
        <span className="text-[14.5px] font-semibold text-fg">
          {due.length} {due.length === 1 ? 'revisita' : 'revisitas'}
        </span>
        <span className="text-[13px] text-fg-3">vencidas, e revisitar não é recomeçar</span>
        <span className="ml-auto font-mono text-[12px] text-cost">→</span>
      </Link>
    )
  }

  return (
    <div className="flex max-w-[820px] flex-col gap-2">
      {due.map((d) => (
        <Link
          key={d.exerciseId}
          href={`/units/${d.unit.id}/cycles/${d.cycleId}`}
          className="m-tap flex flex-wrap items-baseline gap-3 border border-rule bg-panel px-4 py-3 text-inherit hover:bg-panel-hover"
        >
          <span className="font-mono text-[12px] text-fg-5">{d.cycleId}</span>
          <span className="text-[14.5px] text-fg">{d.cycleTitle}</span>
          <span className="text-[12.5px] text-fg-4">{d.unit.title}</span>
          <span className="ml-auto font-mono text-[12px] text-cost">
            degrau {d.step + 1} de {REVISIT_STEPS.length}
            {d.daysOverdue > 0 && ` · ${d.daysOverdue} d atrasada`}
          </span>
        </Link>
      ))}
    </div>
  )
}
