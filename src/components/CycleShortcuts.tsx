'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { Unit } from '@/content/schema'

/**
 * Os atalhos de teclado do ciclo.
 *
 * `j` e `k` andam pelos ciclos, `1` a `9` escolhem alternativa, `Enter`
 * verifica. Eles existem para o mesmo leitor do ⌘K: quem já sabe o que está
 * fazendo, e para quem o mouse é o gargalo.
 *
 * Nenhum dispara com um campo em foco, e nenhum é a única forma de fazer a
 * coisa: todo atalho tem um botão equivalente na tela, porque atalho é atalho e
 * não interface. Ver ADR-0026.
 */
const isTyping = () => {
  const el = document.activeElement
  return el instanceof HTMLInputElement
    || el instanceof HTMLTextAreaElement
    || (el instanceof HTMLElement && el.isContentEditable)
}

export function CycleShortcuts({ unit, cycleId }: { unit: Unit; cycleId: string }) {
  const router = useRouter()

  useEffect(() => {
    const at = unit.cycles.findIndex((c) => c.id === cycleId)

    const onKey = (e: KeyboardEvent) => {
      if (isTyping() || e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'j' && at < unit.cycles.length - 1) {
        router.push(`/units/${unit.id}/cycles/${unit.cycles[at + 1]!.id}`)
      }
      if (e.key === 'k' && at > 0) {
        router.push(`/units/${unit.id}/cycles/${unit.cycles[at - 1]!.id}`)
      }

      if (/^[1-9]$/.test(e.key)) {
        const buttons = document.querySelectorAll<HTMLButtonElement>('[data-choice]')
        buttons[Number(e.key) - 1]?.click()
      }

      if (e.key === 'Enter') {
        const verify = document.querySelector<HTMLButtonElement>('[data-verify]')
        if (verify) { e.preventDefault(); verify.click() }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router, unit, cycleId])

  return null
}
