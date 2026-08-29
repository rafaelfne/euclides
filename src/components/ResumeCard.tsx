'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { units } from '@/content'
import { resumePoint, readProfile, PROGRESS_EVENT, type Resume } from '@/lib/progress'

/**
 * O cartão de retomada.
 *
 * Ele não aparece na primeira visita, e isso é o ponto: sem progresso não há o
 * que retomar, e um cartão dizendo "comece pelo começo" seria ruído em cima da
 * trilha que já está logo abaixo.
 */
export function ResumeCard() {
  const [resume, setResume] = useState<Resume | null>(null)
  const [name, setName] = useState<string | undefined>()

  useEffect(() => {
    const sync = () => { setResume(resumePoint(units)); setName(readProfile()?.name) }
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [])

  if (!resume) return null

  return (
    <Link
      href={`/units/${resume.unitId}/cycles/${resume.cycleId}`}
      className="m-tap flex max-w-[720px] flex-col gap-1 border border-cost-rule bg-cost-bg px-4 py-3.5 text-inherit hover:bg-panel-hover"
    >
      <div className="flex items-baseline gap-3">
        {/* O nome aparece aqui e em mais dois lugares, e em nenhuma outra tela.
            Cumprimentar a cada visita é ruído, não acolhimento. ADR-0021. */}
        <span className="lbl text-cost">
          {name ? `${name}, continue de onde parou` : 'Continuar de onde parou'}
        </span>
        <span className="font-mono text-[12px] text-fg-4">
          {resume.daysAgo === 0 ? 'hoje' : resume.daysAgo === 1 ? 'ontem' : `há ${resume.daysAgo} dias`}
        </span>
      </div>
      <span className="text-[15px] font-semibold text-fg">{resume.cycleTitle}</span>
      <span className="text-[12.5px] text-fg-3">{resume.unitTitle}</span>
    </Link>
  )
}
