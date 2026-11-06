import type { Unit } from '@/content/schema'

/*
  O rótulo de tela de um ciclo, derivado da posição dele na unidade.

  Id é código (`hash.c5`, `tracing.e2`); a tela mostra o número que a lista de
  ciclos mostra e o título. A tela de lacunas e a fila de revisitas imprimiam
  o id cru, que é a deriva 4 do CLAUDE.md com outro nome.
*/

export const cycleNumber = (unit: Unit, cycleId: string): string => {
  const at = unit.cycles.findIndex((c) => c.id === cycleId)
  return at < 0 ? '' : String(at + 1).padStart(2, '0')
}

/** O ciclo que fecha um exercício, com número e título, ou null se nenhum fecha. */
export const cycleOfExercise = (unit: Unit, exerciseId: string) => {
  const at = unit.cycles.findIndex((c) => c.exerciseId === exerciseId)
  if (at < 0) return null
  const cycle = unit.cycles[at]!
  return { id: cycle.id, number: String(at + 1).padStart(2, '0'), title: cycle.title }
}
