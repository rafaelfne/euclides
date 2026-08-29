import { allTerms } from '@/content/glossary'
import type { GlossaryTerm } from '@/content/schema'

/**
 * Acha, num parágrafo, a PRIMEIRA ocorrência de cada termo que o ciclo estreia.
 *
 * O glossário estava pronto e não estava ligado a nada: o aluno encontrava
 * "chaining" na prosa e a definição morava a duas telas de distância. ADR-0019.
 *
 * Só a primeira ocorrência vira link, e só os termos que ESTE ciclo estreia
 * mais o vocabulário do app. Ligar toda ocorrência de todo termo transformaria
 * a prosa num campo minado de azul, a ligação existe para a estreia, que é o
 * único momento em que o aluno não tem referente.
 */
export interface Mark { start: number; end: number; term: GlossaryTerm }

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function findMarks(text: string, termIds: string[]): Mark[] {
  const marks: Mark[] = []
  for (const id of termIds) {
    const term = allTerms.find((t) => t.id === id)
    if (!term) continue
    const forms = [term.canonical, ...term.alsoKnownAs].sort((a, b) => b.length - a.length)
    for (const form of forms) {
      const re = new RegExp(`(?<![\\p{L}])${escape(form)}(?![\\p{L}])`, 'iu')
      const m = re.exec(text)
      if (!m) continue
      const start = m.index
      const end = start + m[0].length
      if (marks.some((k) => start < k.end && end > k.start)) continue
      marks.push({ start, end, term })
      break
    }
  }
  return marks.sort((a, b) => a.start - b.start)
}
