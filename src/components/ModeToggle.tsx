'use client'

import { useEffect, useState } from 'react'
import type { Profile } from '@/content/schema'
import { readProfile, saveProfile, PROGRESS_EVENT } from '@/lib/progress'
import { cn } from '@/lib/utils'

export function useMode(): Profile['mode'] {
  const [mode, setMode] = useState<Profile['mode']>('revisao')
  useEffect(() => {
    const sync = () => setMode(readProfile()?.mode ?? 'revisao')
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [])
  return mode
}

const OPTIONS: Array<[Profile['mode'], string, string]> = [
  ['iniciante', 'guiado', 'mostra contexto, abre o exemplo e percorre a figura'],
  ['revisao', 'conciso', 'mostra o núcleo e mantém o exemplo recolhido'],
]

export function ModeToggle() {
  const mode = useMode()
  return (
    <span className="inline-flex items-stretch overflow-hidden rounded-full border border-rule bg-panel-head">
      <span className="lbl flex items-center border-r border-rule px-3 text-fg-4">Modo</span>
      {OPTIONS.map(([id, label, hint]) => (
        <button
          key={id}
          onClick={() => saveProfile({ mode: id })}
          title={hint}
          aria-pressed={mode === id}
          className={cn(
            'm-tap lbl cursor-pointer border-0 px-3 py-1.5',
            mode === id
              ? 'bg-contract-bg text-contract'
              : 'bg-transparent text-fg-5 hover:bg-panel-hover hover:text-fg-3',
          )}
        >
          {label}
        </button>
      ))}
    </span>
  )
}
