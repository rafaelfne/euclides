import type { TraceStep } from '../socratic'
import { hashReferenceGenerators } from './hash-table'
import { tracingReferenceGenerators } from './tracing'
import { asymptoticsReferenceGenerators } from './asymptotics'
import { linearReferenceGenerators } from './linear'
import { treesReferenceGenerators } from './trees'
import { graphsReferenceGenerators } from './graphs'
import { sortingReferenceGenerators } from './sorting'
import { preludeReferenceGenerators } from './prelude'

export type ReferenceGenerator = () => TraceStep[]

const registries: Array<Record<string, ReferenceGenerator>> = [
  preludeReferenceGenerators,
  tracingReferenceGenerators,
  asymptoticsReferenceGenerators,
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
