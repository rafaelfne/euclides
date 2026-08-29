import type { ReactNode } from 'react'
import Link from 'next/link'
import { findMarks } from '@/lib/glossary-link'

/**
 * A única marcação permitida na prosa autorada: `**assim**` vira ênfase.
 *
 * Ela existe porque a ênfase faz trabalho real em algumas frases, "o custo
 * por nível **não cresce**" perde a força sem ela. E existe declarada porque
 * antes disso os asteriscos apareciam literais na tela: a prosa era renderizada
 * como texto puro, e ninguém tinha declarado que não era markdown.
 *
 * A checagem `ênfase` reprova asterisco desemparelhado. Nenhuma outra marcação
 * é interpretada, de propósito: conteúdo com sintaxe é conteúdo com pegadinha.
 *
 * `terms` liga a estreia de um termo ao glossário. A ligação é achada por
 * varredura sobre a prosa, nunca escrita pelo autor: um marcador na string
 * chegaria ao aluno na primeira tela que esquecesse de removê-lo.
 */
export function Prose({ children, terms = [] }: { children: string; terms?: string[] }): ReactNode {
  const parts = children.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-semibold text-fg">{part}</strong>
      : <Linked key={i} text={part} terms={terms} />,
  )
}

function Linked({ text, terms }: { text: string; terms: string[] }): ReactNode {
  const marks = terms.length ? findMarks(text, terms) : []
  if (!marks.length) return text

  const out: ReactNode[] = []
  let at = 0
  marks.forEach((m, i) => {
    if (m.start > at) out.push(text.slice(at, m.start))
    out.push(
      <Link
        key={`t${i}`}
        href={`/glossary#${m.term.id}`}
        title={`${m.term.definition}, ${m.term.isNot[0] ?? ''}`}
        className="text-fg-2 underline decoration-contract-rule decoration-dotted underline-offset-[3px] hover:text-contract"
      >
        {text.slice(m.start, m.end)}
      </Link>,
    )
    at = m.end
  })
  if (at < text.length) out.push(text.slice(at))
  return out
}
