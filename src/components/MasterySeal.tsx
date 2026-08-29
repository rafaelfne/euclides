'use client'

import type { Unit } from '@/content/schema'
import { useUnitState } from './UnitStateDot'
import { cn } from '@/lib/utils'

/**
 * O selo de domínio, com estética de aprovação de PR.
 *
 * A escolha da metáfora é o argumento: o selo não é um troféu, é o carimbo que
 * alguém dá quando leu o suficiente para se responsabilizar. É a coisa que a
 * trilha inteira está treinando, e é por isso que ele acende no critério e não
 * no volume. Ver ADR-0024.
 *
 * Ele não acende sozinho com o tempo, e não existe selo de participação: no
 * estado `nao-visitada` e `em-curso` o carimbo é um contorno vazio.
 */
export function MasterySeal({ unit, size = 'md' }: { unit: Unit; size?: 'sm' | 'md' }) {
  const state = useUnitState(unit)
  const lit = state === 'dominada' || state === 'consolidada'
  const sealed = state === 'consolidada'

  const px = size === 'sm' ? 34 : 52
  const label = sealed ? 'consolidada' : lit ? 'dominada' : 'ainda não'

  return (
    <span
      role="img"
      aria-label={`unidade ${unit.number}, ${label}`}
      title={`${unit.title}: ${label}`}
      className="inline-flex shrink-0"
    >
      <svg width={px} height={px} viewBox="0 0 100 100" fill="none" aria-hidden>
        {/* a borda do carimbo, serrilhada como um selo */}
        <circle
          cx="50" cy="50" r="42"
          stroke={lit ? 'var(--contract)' : 'var(--rule)'}
          strokeWidth={lit ? 4 : 2.5}
          strokeDasharray={lit ? undefined : '5 5'}
        />
        <circle
          cx="50" cy="50" r="34"
          stroke={lit ? 'var(--contract)' : 'var(--rule)'}
          strokeWidth="1.5"
          opacity={lit ? 0.7 : 0.4}
        />

        <text
          x="50" y="57"
          textAnchor="middle"
          fontFamily="var(--mono)"
          fontSize="26"
          fontWeight="600"
          fill={lit ? 'var(--contract)' : 'var(--fg-5)'}
        >
          {String(unit.number).padStart(2, '0')}
        </text>

        {/* a marca extra da consolidação: o segundo carimbo por cima */}
        {sealed && (
          <path
            d="M28 66 L44 80 L74 34"
            stroke="var(--cost)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.9"
          />
        )}
      </svg>
    </span>
  )
}

export function SealRow({ units }: { units: Unit[] }) {
  return (
    <div className={cn('flex flex-wrap gap-3')}>
      {units.map((u) => <MasterySeal key={u.id} unit={u} />)}
    </div>
  )
}
