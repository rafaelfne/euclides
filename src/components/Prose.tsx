import type { ReactNode } from 'react'

/**
 * A única marcação permitida na prosa autorada: `**assim**` vira ênfase.
 *
 * Ela existe porque a ênfase faz trabalho real em algumas frases — "o custo
 * por nível **não cresce**" perde a força sem ela. E existe declarada porque
 * antes disso os asteriscos apareciam literais na tela: a prosa era renderizada
 * como texto puro, e ninguém tinha declarado que não era markdown.
 *
 * A checagem `ênfase` reprova asterisco desemparelhado. Nenhuma outra marcação
 * é interpretada, de propósito: conteúdo com sintaxe é conteúdo com pegadinha.
 */
export function Prose({ children }: { children: string }): ReactNode {
  const parts = children.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold text-fg">{part}</strong> : part,
  )
}
