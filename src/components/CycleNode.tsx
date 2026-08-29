'use client'

import type { Cycle } from '@/content/schema'
import type { CycleStatus } from '@/lib/progress'
import { BAND_TONE, type BandTone } from './band-tokens'

/**
 * Shape carries the taxonomic band, fill carries progress. Two channels, so a
 * glance answers both "what kind of thing is this" and "where am I", which a
 * numbered list in a column answers for neither.
 *
 * A forma codifica a POSIÇÃO na espinha, não o substantivo: a banda de abertura
 * é quadrado nas duas espinhas do ADR-0012, a do meio é triângulo, a da
 * consequência é círculo.
 */
const SHAPE_BY_TONE: Record<BandTone, 'square' | 'triangle' | 'circle'> = {
  contract: 'square',
  implementation: 'triangle',
  cost: 'circle',
}

const COLOR_BY_TONE: Record<BandTone, string> = {
  contract: '#7EA6E0',
  implementation: '#E08279',
  cost: '#D6A44C',
}

const FILL: Record<CycleStatus, { fill: number; ring: number }> = {
  pending: { fill: 0, ring: 0 },
  attempted: { fill: 0.35, ring: 0 },
  clean: { fill: 1, ring: 0 },
  review: { fill: 1, ring: 1 },
}

export function CycleNode({
  band, status, label, size = 30,
}: {
  band: Cycle['band']
  status: CycleStatus
  label: string
  size?: number
}) {
  const tone = BAND_TONE[band]
  const color = COLOR_BY_TONE[tone]
  const { fill, ring } = FILL[status]
  const shape = SHAPE_BY_TONE[tone]
  return (
    <span className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden>
        {shape === 'square' && (
          <>
            <rect x="4" y="4" width="26" height="26" fill={color} fillOpacity={fill} stroke={color} strokeWidth="1.5" />
            {ring > 0 && <rect x="1" y="1" width="32" height="32" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" />}
          </>
        )}
        {shape === 'triangle' && (
          <>
            <polygon points="17,4 31,29 3,29" fill={color} fillOpacity={fill} stroke={color} strokeWidth="1.5" />
            {ring > 0 && <polygon points="17,0.5 33.5,31 0.5,31" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" />}
          </>
        )}
        {shape === 'circle' && (
          <>
            <circle cx="17" cy="17" r="13" fill={color} fillOpacity={fill} stroke={color} strokeWidth="1.5" />
            {ring > 0 && <circle cx="17" cy="17" r="16" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" />}
          </>
        )}
      </svg>
      <span className="font-mono text-[9px] text-fg-5">{label}</span>
    </span>
  )
}
