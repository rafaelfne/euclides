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

export const units: Unit[] = [
  tracingUnit, asymptoticsUnit, linearUnit, hashUnit, treesUnit, graphsUnit,
  sortingUnit, synthesisUnit,
]
export const allUnits: Unit[] = [preludeUnit, ...units]
export const unitById = (id: string) => allUnits.find((u) => u.id === id)
export const cycleById = (u: Unit, id: string) => u.cycles.find((c) => c.id === id)
export const exerciseById = (u: Unit, id: string) => u.exercises.find((e) => e.id === id)
export const misconceptionById = (u: Unit, id: string) => u.misconceptions.find((m) => m.id === id)
