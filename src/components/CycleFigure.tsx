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
import dynamic from 'next/dynamic'

/*
  React Flow entra por `dynamic` sem SSR: ele mede o container para o `fitView`,
  e o export estático não tem container para medir. O peso também fica fora do
  bundle de quem abre um ciclo sem árvore de recursão. ADR-0025.
*/
const RecursionFigure = dynamic(
  () => import('./RecursionFigure').then((m) => m.RecursionFigure),
  { ssr: false, loading: () => <div className="h-[300px] border border-rule bg-panel" /> },
)

/**
 * Despacho por `kind`, exaustivo: um tipo de figura novo não compila até ter
 * renderizador. É a mesma regra dos mapas de banda, o enum nunca chega à tela
 * sem alguém ter dito o que ele desenha.
 */
export function CycleFigure({ figure, autoPlay = false }: { figure: Figure; autoPlay?: boolean }) {
  switch (figure.kind) {
    case 'growth': return <GrowthFigure figure={figure} />
    case 'shift': return <ShiftFigure figure={figure} autoPlay={autoPlay} />
    case 'tree': return <TreeFigure figure={figure} autoPlay={autoPlay} />
    case 'rotation': return <RotationFigure figure={figure} />
    case 'buckets': return <BucketsFigure figure={figure} autoPlay={autoPlay} />
    case 'traversal': return <TraversalFigure figure={figure} autoPlay={autoPlay} />
    case 'visited': return <VisitedFigure figure={figure} autoPlay={autoPlay} />
    case 'recursion': return <RecursionFigure figure={figure} autoPlay={autoPlay} />
    case 'growth-doubling': return <DoublingFigure figure={figure} autoPlay={autoPlay} />
    case 'stability': return <StabilityFigure figure={figure} />
  }
}
