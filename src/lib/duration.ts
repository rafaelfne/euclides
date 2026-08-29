import type { Unit } from '@/content/schema'

/**
 * A estimativa de duração, DERIVADA.
 *
 * Um campo `durationMinutes` no conteúdo seria um número que o autor chuta uma
 * vez e nunca revisa, e que passa a mentir no primeiro ciclo acrescentado. Aqui
 * ele sai do que a unidade de fato tem, então acompanha sozinho. É a mesma
 * regra da figura e da nota de acolhimento: ADR-0017 e ADR-0018.
 *
 * Os pesos abaixo são as únicas constantes, e são declaradas em vez de
 * embutidas numa fórmula: `estimate` não sabe somar nada que não esteja aqui.
 * Eles vêm do tempo de leitura em voz alta (cerca de 130 palavras por minuto,
 * arredondado para baixo porque prosa técnica relê) e do tempo observado para
 * preencher uma tabela de traço à mão.
 */
export const MINUTES = {
  perHundredWords: 1,
  perFigure: 1,
  perPseudocodeBlock: 1,
  perWorkedExample: 1,
  choiceExercise: 2,
  bugExercise: 4,
  traceExercise: 8,
} as const

const words = (s: string) => s.trim().split(/\s+/).length

export function cycleMinutes(unit: Unit, cycleId: string): number {
  const c = unit.cycles.find((x) => x.id === cycleId)
  if (!c) return 0
  const prose = words(c.oneLine) + c.body.reduce((n, p) => n + words(p), 0)
  let m = (prose / 100) * MINUTES.perHundredWords
  if (c.figure) m += MINUTES.perFigure
  if (c.pseudocode) m += MINUTES.perPseudocodeBlock
  m += MINUTES.perWorkedExample

  const ex = unit.exercises.find((e) => e.id === c.exerciseId)
  if (ex?.kind === 'trace') m += MINUTES.traceExercise
  else if (ex?.kind === 'bug') m += MINUTES.bugExercise
  else m += MINUTES.choiceExercise

  return m
}

export function unitMinutes(unit: Unit): number {
  return unit.cycles.reduce((n, c) => n + cycleMinutes(unit, c.id), 0)
}

/** "cerca de 40 min", "cerca de 1 h 20". Nunca um intervalo falso de precisão. */
export function humanMinutes(total: number): string {
  const m = Math.round(total / 5) * 5
  if (m < 60) return `cerca de ${m} min`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest ? `cerca de ${h} h ${rest}` : `cerca de ${h} h`
}
