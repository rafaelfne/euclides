'use client'

import { useEffect, useState } from 'react'
import type { Unit } from '@/content/schema'
import { read, PROGRESS_EVENT } from '@/lib/progress'
import { unitState, UNIT_STATE_LABEL, UNIT_STATE_RULE, type UnitState } from '@/lib/level'
import { cn } from '@/lib/utils'

/**
 * O estado de uma unidade, com a regra junto.
 *
 * A regra vai no `title` e no texto quando há espaço, sempre: um marcador que
 * o aluno não sabe ler é decoração, e um estado sem a condição ao lado convida
 * a supor que ele sobe sozinho com o tempo. Ver ADR-0022.
 */
const TONE: Record<UnitState, string> = {
  'nao-visitada': 'bg-fg-5/40',
  'em-curso': 'bg-implementation',
  dominada: 'bg-contract',
  consolidada: 'bg-cost',
}

export function useUnitState(unit: Unit): UnitState {
  const [state, setState] = useState<UnitState>('nao-visitada')
  useEffect(() => {
    const sync = () => setState(unitState(unit, read(), Date.now()))
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [unit])
  return state
}

export function UnitStateDot({ unit, withLabel = false }: { unit: Unit; withLabel?: boolean }) {
  const state = useUnitState(unit)
  return (
    <span className="inline-flex items-center gap-1.5" title={UNIT_STATE_RULE[state]}>
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', TONE[state])} aria-hidden />
      {withLabel && <span className="lbl">{UNIT_STATE_LABEL[state]}</span>}
      <span className="sr-only">{UNIT_STATE_LABEL[state]}, {UNIT_STATE_RULE[state]}</span>
    </span>
  )
}
