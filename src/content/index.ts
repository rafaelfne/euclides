import type { Unit } from './schema'
import { hashUnit } from './units/hash'
import { sortingUnit } from './units/sorting'

export const units: Unit[] = [hashUnit, sortingUnit]
export const unitById = (id: string) => units.find((u) => u.id === id)
export const cycleById = (u: Unit, id: string) => u.cycles.find((c) => c.id === id)
export const exerciseById = (u: Unit, id: string) => u.exercises.find((e) => e.id === id)
export const misconceptionById = (u: Unit, id: string) => u.misconceptions.find((m) => m.id === id)
