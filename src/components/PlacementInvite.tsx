'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { read, PROGRESS_EVENT } from '@/lib/progress'

/**
 * O convite para a sondagem, e ele some depois de feita.
 *
 * Oferecido, nunca obrigatório, e some quando `placement` existe: repetir o
 * convite a quem já respondeu transforma oferta em cobrança. Ver ADR-0022.
 */
export function PlacementInvite() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const sync = () => setShow(!read().placement)
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [])

  if (!show) return null

  return (
    <Link
      href="/sondagem"
      className="m-tap flex max-w-[720px] flex-wrap items-baseline gap-3 border border-rule bg-panel px-4 py-3 text-inherit hover:bg-panel-hover"
    >
      <span className="text-[14.5px] font-semibold text-fg">Não sabe por onde começar?</span>
      <span className="text-[13px] text-fg-3">
        Seis perguntas, uma por unidade. Não tem nota e não bloqueia nada.
      </span>
      <span className="ml-auto font-mono text-[12px] text-contract">→</span>
    </Link>
  )
}
