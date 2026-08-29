import type { Figure } from '@/content/schema'
import { GrowthFigure } from './GrowthFigure'
import { ShiftFigure } from './ShiftFigure'

/**
 * Despacho por `kind`, exaustivo: um tipo de figura novo não compila até ter
 * renderizador. É a mesma regra dos mapas de banda — o enum nunca chega à tela
 * sem alguém ter dito o que ele desenha.
 */
export function CycleFigure({ figure }: { figure: Figure }) {
  switch (figure.kind) {
    case 'growth': return <GrowthFigure figure={figure} />
    case 'shift': return <ShiftFigure figure={figure} />
  }
}
