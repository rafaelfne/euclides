import type { TraceStep } from '../socratic'
import { hashReferenceGenerators } from './hash-table'
import { tracingReferenceGenerators } from './tracing'
import { linearReferenceGenerators } from './linear'
import { treesReferenceGenerators } from './trees'
import { graphsReferenceGenerators } from './graphs'
import { sortingReferenceGenerators } from './sorting'

export type ReferenceGenerator = () => TraceStep[]

const registries: Array<Record<string, ReferenceGenerator>> = [
  tracingReferenceGenerators,
  linearReferenceGenerators,
  hashReferenceGenerators,
  treesReferenceGenerators,
  graphsReferenceGenerators,
  sortingReferenceGenerators,
]

function merge(): Record<string, ReferenceGenerator> {
  const merged: Record<string, ReferenceGenerator> = {}
  for (const registry of registries) {
    for (const [id, generator] of Object.entries(registry)) {
      if (merged[id]) throw new Error(`gerador de referência duplicado: "${id}"`)
      merged[id] = generator
    }
  }
  return merged
}

export const referenceGenerators = merge()
