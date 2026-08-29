'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { units } from '@/content'
import { read, PROGRESS_EVENT } from '@/lib/progress'
import { stalePlacement, type StalePlacement } from '@/lib/level'

/**
 * A sondagem envelhecida, oferecida de novo — e só aqui.
 *
 * Ela não volta para a home. O convite da home some depois de respondido
 * porque repetir oferta é cobrança, e uma tarja reaparecendo na porta seria a
 * mesma cobrança com outro motivo. O perfil é a tela em que a pessoa foi olhar
 * para si; uma oferta que só existe onde alguém foi procurar não persegue
 * ninguém. Ver ADR-0022 e a fronteira do tom no ADR-0018.
 *
 * O texto é a afirmação verificável, não um elogio: diz qual unidade a
 * sondagem recomendou e o que mudou desde então. Sem isso seria "faça de novo",
 * que é cobrança sem motivo declarado.
 */
export function PlacementRevisit() {
  const [stale, setStale] = useState<StalePlacement | null>(null)

  useEffect(() => {
    const sync = () => setStale(stalePlacement(units, read(), Date.now()))
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [])

  if (!stale) return null

  const titleOf = (id: string) => units.find((u) => u.id === id)?.title ?? id

  return (
    <Link
      href="/sondagem"
      className="m-tap flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-rule bg-panel px-3.5 py-3 text-inherit hover:bg-panel-hover"
    >
      <span className="text-[13px] text-fg-2">
        {stale.suggestedMastered
          ? `A sondagem recomendou começar por ${titleOf(stale.suggested)}, e essa unidade já está dominada.`
          : `A sondagem deu ${stale.clearedThen} ${stale.clearedThen === 1 ? 'unidade vencida' : 'unidades vencidas'}, e hoje ${stale.masteredNow} estão dominadas.`}
      </span>
      <span className="text-[13px] text-fg-4">A recomendação dela é do dia em que foi feita.</span>
      <span className="ml-auto shrink-0 font-mono text-[12px] text-contract">refazer →</span>
    </Link>
  )
}
