'use client'

import type { Figure } from '@/content/schema'
import { GrowthFigure } from './GrowthFigure'
import { ShiftFigure } from './ShiftFigure'
import { TreeFigure } from './TreeFigure'
import { BucketsFigure } from './BucketsFigure'
import { TraversalFigure } from './TraversalFigure'
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
export function CycleFigure({ figure }: { figure: Figure }) {
  switch (figure.kind) {
    case 'growth': return <GrowthFigure figure={figure} />
    case 'shift': return <ShiftFigure figure={figure} />
    case 'tree': return <TreeFigure figure={figure} />
    case 'buckets': return <BucketsFigure figure={figure} />
    case 'traversal': return <TraversalFigure figure={figure} />
    case 'recursion': return <RecursionFigure figure={figure} />
    case 'growth-doubling': return <DoublingFigure figure={figure} />
    case 'stability': return <StabilityFigure figure={figure} />
  }
}
