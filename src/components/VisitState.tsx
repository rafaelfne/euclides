'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { read, readProfile, PROGRESS_EVENT } from '@/lib/progress'

/*
  A tela inicial tem dois leitores, e eles precisam de coisas opostas.

  Quem chega pela primeira vez precisa de uma porta só. Quem volta precisa ver
  primeiro as revisitas do dia e onde parou, e a porta de entrada vira ruído.
  Antes a home mostrava as cinco chamadas para os dois, no mesmo peso, e quem
  voltava encontrava "Primeira vez aqui?" acima da própria revisita vencida.

  "Já começou" é ter perfil salvo ou alguma unidade aberta. Até montar, nenhum
  dos dois lados aparece: o estado mora no navegador, e chutar daria um
  piscar do lado errado.
*/

function useStarted(): boolean | null {
  const [started, setStarted] = useState<boolean | null>(null)
  useEffect(() => {
    const sync = () => setStarted(Boolean(readProfile()) || Object.keys(read().units).length > 0)
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [])
  return started
}

export function FirstVisitOnly({ children }: { children: ReactNode }) {
  const started = useStarted()
  return started === false ? <>{children}</> : null
}
