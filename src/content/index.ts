import type { Unit } from './schema'
import { preludeUnit } from './units/prelude'
import { tracingUnit } from './units/tracing'
import { asymptoticsUnit } from './units/asymptotics'
import { linearUnit } from './units/linear'
import { hashUnit } from './units/hash'
import { treesUnit } from './units/trees'
import { graphsUnit } from './units/graphs'
import { sortingUnit } from './units/sorting'
import { synthesisUnit } from './units/synthesis'
import { aiUnit } from './units/ai'

export const units: Unit[] = [
  tracingUnit, asymptoticsUnit, linearUnit, hashUnit, treesUnit, graphsUnit,
  sortingUnit, synthesisUnit,
]
/*
  A pré-trilha e a unidade 09 ficam fora de `units`: nenhuma das duas conta para
  nivelamento, faixas nem contadores. A 09 sai daqui para `units` quando tiver
  armadilhas observadas em alunos, não só propostas (spec ai, decisão 7).
*/
/** A trilha que a tela chama de trilha: a pré-trilha e as curriculares, em ordem. */
export const trailUnits: Unit[] = [preludeUnit, ...units]
/** Navegáveis, com exercício e progresso, mas fora da trilha e do nível. */
export const extraUnits: Unit[] = [aiUnit]
export const allUnits: Unit[] = [...trailUnits, ...extraUnits]
export const unitById = (id: string) => allUnits.find((u) => u.id === id)
export const cycleById = (u: Unit, id: string) => u.cycles.find((c) => c.id === id)
export const exerciseById = (u: Unit, id: string) => u.exercises.find((e) => e.id === id)
export const misconceptionById = (u: Unit, id: string) => u.misconceptions.find((m) => m.id === id)
