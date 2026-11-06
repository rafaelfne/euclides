import Link from 'next/link'
import { allUnits, extraUnits, trailUnits } from '@/content'
import { cn } from '@/lib/utils'
import { UnitStateDot } from './UnitStateDot'
import { Logo } from './Logo'
import { ProfileAvatar } from './ProfileAvatar'

/**
 * A trilha inteira sempre visível. O ADR-0014 resolveu a ordem dentro de uma
 * unidade; entre unidades o aluno ainda voltava à home para achar a próxima.
 */
export function Rail({ unitId }: { unitId?: string }) {
  const renderUnit = (u: (typeof allUnits)[number]) => {
    const active = u.id === unitId
    return (
      <Link
        key={u.id}
        href={`/units/${u.id}`}
        className={cn(
          'flex items-baseline gap-2.5 border-l-[3px] px-4 py-1.5 text-[12.5px]',
          active
            ? 'border-contract bg-panel-head pl-[13px] text-fg'
            : 'border-transparent text-fg-3 hover:bg-panel-head hover:text-fg-2',
        )}
      >
        <span className={cn('font-mono text-[12px]', active ? 'text-contract' : 'text-fg-5')}>
          {String(u.number).padStart(2, '0')}
        </span>
        <span className="min-w-0 leading-snug">{u.title}</span>
        <span className="ml-auto shrink-0 pt-1"><UnitStateDot unit={u} /></span>
      </Link>
    )
  }

  return (
    <nav className="hidden h-screen w-[212px] shrink-0 flex-col overflow-y-auto border-r border-rule-soft bg-rail lg:flex">
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-rule-soft bg-rail px-4 py-2.5">
        <Link href="/" title="Euclides" aria-label="Euclides" className="m-tap flex shrink-0 items-center">
          <Logo size={56} />
        </Link>
        <ProfileAvatar />
      </div>

      <div className="flex flex-col gap-px py-3">
        <span className="lbl px-4 pb-2">Trilha</span>
        {trailUnits.map(renderUnit)}
        <span className="lbl px-4 pt-4 pb-2">Além da trilha</span>
        {extraUnits.map(renderUnit)}
      </div>

      <div className="mt-auto flex flex-col border-t border-rule-soft pb-9">
        <Link href="/como-funciona" className="lbl m-tap px-4 py-2.5 hover:bg-panel-head hover:text-fg-2">Como funciona</Link>
        <Link href="/traps" className="lbl m-tap px-4 py-2.5 hover:bg-panel-head hover:text-fg-2">Armadilhas</Link>
        <Link href="/glossary" className="lbl m-tap px-4 py-2.5 hover:bg-panel-head hover:text-fg-2">Glossário</Link>
        <Link href="/revisitas" className="lbl m-tap px-4 py-2.5 hover:bg-panel-head hover:text-fg-2">Revisitas</Link>
        <Link href="/gaps" className="lbl m-tap px-4 py-2.5 hover:bg-panel-head hover:text-fg-2">Lacunas</Link>
      </div>
    </nav>
  )
}
