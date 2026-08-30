'use client'

import type { Figure } from '@/content/schema'
import { GrowthFigure } from './GrowthFigure'
import { ShiftFigure } from './ShiftFigure'
import { TreeFigure } from './TreeFigure'
import { RotationFigure } from './RotationFigure'
import { BucketsFigure } from './BucketsFigure'
import { TraversalFigure } from './TraversalFigure'
import { VisitedFigure } from './VisitedFigure'
import { DoublingFigure } from './DoublingFigure'
import { StabilityFigure } from './StabilityFigure'
import { InsertionFigure } from './InsertionFigure'
import { RecursionFigure } from './RecursionFigure'
import { BucketComparisonFigure } from './BucketComparisonFigure'
import { ExecutionTraceFigure } from './ExecutionTraceFigure'
import { LruCompositionFigure } from './LruCompositionFigure'
import { LinkedListRemovalFigure } from './LinkedListRemovalFigure'
import { GraphRepresentationsFigure } from './GraphRepresentationsFigure'
import { HashAddressFigure } from './HashAddressFigure'
import { MergeStructureFigure, QuicksortPartitionFigure } from './SortingFigures'

export function CycleFigure({ figure, autoPlay = false }: { figure: Figure; autoPlay?: boolean }) {
  switch (figure.kind) {
    case 'execution-trace': return <ExecutionTraceFigure figure={figure} />
    case 'lru-composition': return <LruCompositionFigure figure={figure} />
    case 'linked-list-removal': return <LinkedListRemovalFigure figure={figure} />
    case 'graph-representations': return <GraphRepresentationsFigure figure={figure} />
    case 'hash-address': return <HashAddressFigure figure={figure} />
    case 'merge-structure': return <MergeStructureFigure figure={figure} />
    case 'quicksort-partition': return <QuicksortPartitionFigure figure={figure} />
    case 'growth': return <GrowthFigure figure={figure} />
    case 'shift': return <ShiftFigure figure={figure} autoPlay={autoPlay} />
    case 'tree': return <TreeFigure figure={figure} autoPlay={autoPlay} />
    case 'rotation': return <RotationFigure figure={figure} />
    case 'buckets': return <BucketsFigure figure={figure} autoPlay={autoPlay} />
    case 'bucket-comparison': return <BucketComparisonFigure figure={figure} />
    case 'traversal': return <TraversalFigure figure={figure} autoPlay={autoPlay} />
    case 'visited': return <VisitedFigure figure={figure} autoPlay={autoPlay} />
    case 'recursion': return <RecursionFigure figure={figure} autoPlay={autoPlay} />
    case 'growth-doubling': return <DoublingFigure figure={figure} autoPlay={autoPlay} />
    case 'stability': return <StabilityFigure figure={figure} />
    case 'insertion': return <InsertionFigure figure={figure} autoPlay={autoPlay} />
  }
}
