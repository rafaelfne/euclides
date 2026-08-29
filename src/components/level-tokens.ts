import type { BandId } from '@/lib/level'

/**
 * A pill de cada faixa, exaustiva por tipo, deriva 4 do CLAUDE.md. Uma faixa
 * nova não compila até ganhar seu passo na rampa.
 */
export const BAND_PILL: Record<BandId, string> = {
  'code-reader': 'border-band-1/35 bg-band-1-bg text-band-1',
  'code-tracer': 'border-band-2/35 bg-band-2-bg text-band-2',
  'complexity-analyst': 'border-band-3/35 bg-band-3-bg text-band-3',
  'code-reviewer': 'border-band-4/35 bg-band-4-bg text-band-4',
  'design-reviewer': 'border-band-5/35 bg-band-5-bg text-band-5',
}
