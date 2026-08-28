'use client'

import type { Cycle } from '@/content/schema'
import type { CycleStatus } from '@/lib/progress'

/**
 * Position on the spine, not the noun: the opening band is a square in both
 * kinds, the middle a triangle, the consequence a circle. A student who
 * learned the map on one unit reads the other without relearning it.
 */
const SHAPE_BY_BAND: Record<Cycle['band'], 'square' | 'triangle' | 'circle'> = {
  contract: 'square', implementation: 'triangle', cost: 'circle',
  criterion: 'square', technique: 'triangle', failure: 'circle',
}
const COLOR_BY_BAND: Record<Cycle['band'], string> = {
  contract: '#1F4E9C', implementation: '#C1352B', cost: '#A9761C',
  criterion: '#1F4E9C', technique: '#C1352B', failure: '#A9761C',
}

const FILL: Record<CycleStatus, { fill: number; ring: number }> = {
  pending: { fill: 0, ring: 0 },
  attempted: { fill: 0.35, ring: 0 },
  clean: { fill: 1, ring: 0 },
  review: { fill: 1, ring: 1 },
}

/**
 * Shape carries the taxonomic band, fill carries progress. Two channels, so a
 * glance answers both "what kind of thing is this" and "where am I" — which a
 * numbered list in a column answers for neither.
 */
export function CycleNode({
  band, status, label, size = 34,
}: {
  band: Cycle['band']
  status: CycleStatus
  label: string
  size?: number
}) {
  const color = COLOR_BY_BAND[band]
  const { fill, ring } = FILL[status]
  const shape = SHAPE_BY_BAND[band]
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden>
        {shape === 'square' && (
          <>
            <rect x="4" y="4" width="26" height="26" fill={color} fillOpacity={fill} stroke={color} strokeWidth="1.5" />
            <rect x="0.75" y="0.75" width="32.5" height="32.5" fill="none" stroke={color} strokeWidth="1.5" strokeOpacity={ring} strokeDasharray="3 3" />
          </>
        )}
        {shape === 'triangle' && (
          <>
            <polygon points="17,4 31,29 3,29" fill={color} fillOpacity={fill} stroke={color} strokeWidth="1.5" />
            <polygon points="17,0.5 33.5,30 0.5,30" fill="none" stroke={color} strokeWidth="1.5" strokeOpacity={ring} strokeDasharray="3 3" />
          </>
        )}
        {shape === 'circle' && (
          <>
            <circle cx="17" cy="17" r="13" fill={color} fillOpacity={fill} stroke={color} strokeWidth="1.5" />
            <circle cx="17" cy="17" r="16.25" fill="none" stroke={color} strokeWidth="1.5" strokeOpacity={ring} strokeDasharray="3 3" />
          </>
        )}
      </svg>
      <span className="lbl" style={{ fontSize: 10, color }}>{label}</span>
    </span>
  )
}
