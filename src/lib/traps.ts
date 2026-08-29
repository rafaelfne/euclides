import type { Progress, Unit, Misconception } from '@/content/schema'

/**
 * Os três estados de uma armadilha.
 *
 * `desarmada` exige a volta limpa, e é a diferença que separa este caderno de
 * uma lista de leitura: ler o porquê é consumo, resolver de novo depois do
 * intervalo é prática deliberada. Ver ADR-0023 e ADR-0024.
 */
export type TrapState = 'nao-encontrada' | 'ativada' | 'desarmada'

export const TRAP_STATE_LABEL: Record<TrapState, string> = {
  'nao-encontrada': 'não encontrada',
  ativada: 'ativada',
  desarmada: 'desarmada',
}

export const TRAP_STATE_RULE: Record<TrapState, string> = {
  'nao-encontrada': 'você ainda não caiu nesta',
  ativada: 'você caiu nesta, e ela ainda não saiu limpa numa revisita',
  desarmada: 'ativada uma vez, e resolvida de novo sem tropeçar depois do intervalo',
}

export interface TrapEntry {
  unit: Unit
  misconception: Misconception
  state: TrapState
  /** Quando ela foi ativada pela última vez, para o destaque que decai. */
  lastTriggered?: string
}

export function trapBook(units: Unit[], p: Progress): TrapEntry[] {
  const out: TrapEntry[] = []

  for (const unit of units) {
    const states = p.units[unit.id]?.exercises ?? {}

    for (const misconception of unit.misconceptions) {
      let state: TrapState = 'nao-encontrada'
      let lastTriggered: string | undefined

      for (const st of Object.values(states)) {
        if (!st.misconceptionsTriggered.includes(misconception.id)) continue
        state = 'ativada'
        if (!lastTriggered || st.lastVisited > lastTriggered) lastTriggered = st.lastVisited
        if ((st.revisits ?? []).some((r) => r.clean)) { state = 'desarmada'; break }
      }

      out.push({ unit, misconception, state, lastTriggered })
    }
  }

  return out
}

// ---------------------------------------------------------------------------
// Repetição espaçada
// ---------------------------------------------------------------------------

/**
 * A fila de revisitas, com intervalos crescentes.
 *
 * Ela conta VOLTAS HONRADAS, nunca dias abertos: um exercício sobe de degrau
 * quando volta limpo, e volta ao primeiro degrau quando volta sujo. Abrir o app
 * todo dia não move nada. Ver ADR-0024.
 */
export const REVISIT_STEPS = [3, 10, 30] as const

export interface Due {
  unit: Unit
  exerciseId: string
  cycleId: string
  cycleTitle: string
  /** Qual degrau da escada de intervalos: 0, 1 ou 2. */
  step: number
  daysOverdue: number
}

const DAY = 86_400_000

export function dueRevisits(units: Unit[], p: Progress, now: number): Due[] {
  const out: Due[] = []

  for (const unit of units) {
    const states = p.units[unit.id]?.exercises ?? {}

    for (const [exerciseId, st] of Object.entries(states)) {
      // Só entra na fila o que já saiu limpo alguma vez: revisitar o que nunca
      // foi resolvido não é revisita, é o exercício ainda em aberto.
      const honored = (st.revisits ?? []).filter((r) => r.clean).length
      if (!st.solvedClean && honored === 0) continue

      const step = Math.min(honored, REVISIT_STEPS.length - 1)
      const wait = REVISIT_STEPS[step]!
      const days = (now - new Date(st.lastVisited).getTime()) / DAY
      if (days < wait) continue

      const cycle = unit.cycles.find((c) => c.exerciseId === exerciseId)
      if (!cycle) continue

      out.push({
        unit,
        exerciseId,
        cycleId: cycle.id,
        cycleTitle: cycle.title,
        step,
        daysOverdue: Math.floor(days - wait),
      })
    }
  }

  return out.sort((a, b) => b.daysOverdue - a.daysOverdue)
}
