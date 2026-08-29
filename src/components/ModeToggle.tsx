'use client'

import { useEffect, useState } from 'react'
import type { Profile } from '@/content/schema'
import { readProfile, saveProfile, PROGRESS_EVENT } from '@/lib/progress'
import { cn } from '@/lib/utils'

/**
 * O alternador Iniciante / Revisão.
 *
 * O ADR-0019 tinha descartado este alternador, com o argumento de que as três
 * coisas do modo iniciante — a frase simples, o exemplo trabalhado, o diagrama
 * já rodado — tinham virado incondicionais, e um modo que só pode ESCONDER não
 * é um modo.
 *
 * A decisão foi revertida, e o argumento que a reverte é este: para quem já
 * julgou aquele conteúdo, o exemplo trabalhado aberto e o diagrama rodando são
 * ruído entre a prosa e o exercício. Esconder deixa de ser perda quando quem
 * escolhe é o leitor, e a frase de abertura, que é a peça de rampa que importa,
 * continua incondicional nos dois modos. ADR-0027.
 */
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
  ['iniciante', 'iniciante', 'exemplo aberto, diagrama roda uma vez'],
  ['revisao', 'revisão', 'tudo recolhido, nada roda sozinho'],
]

export function ModeToggle() {
  const mode = useMode()
  return (
    <span className="inline-flex items-center gap-1">
      {OPTIONS.map(([id, label, hint]) => (
        <button
          key={id}
          onClick={() => saveProfile({ mode: id })}
          title={hint}
          aria-pressed={mode === id}
          className={cn(
            'm-tap lbl cursor-pointer border px-2 py-1',
            mode === id
              ? 'border-contract-rule bg-contract-bg text-contract'
              : 'border-transparent text-fg-5 hover:text-fg-3',
          )}
        >
          {label}
        </button>
      ))}
    </span>
  )
}
