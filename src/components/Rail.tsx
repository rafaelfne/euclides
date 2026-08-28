import Link from 'next/link'
import { units } from '@/content'
import { cn } from '@/lib/utils'

/**
 * A trilha inteira sempre visível. O ADR-0014 resolveu a ordem dentro de uma
 * unidade; entre unidades o aluno ainda voltava à home para achar a próxima.
 */
export function Rail({ unitId }: { unitId?: string }) {
  return (
    <nav className="flex w-[212px] shrink-0 flex-col border-r border-rule-soft bg-rail">
      <Link href="/" className="border-b border-rule-soft px-4 py-3.5 text-[17px] font-semibold text-fg hover:text-fg">
        Euclides
      </Link>

      <div className="flex flex-col gap-px py-3">
        <span className="lbl px-4 pb-2">Trilha</span>
        {units.map((u) => {
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
              <span className={cn('font-mono text-[10.5px]', active ? 'text-contract' : 'text-fg-5')}>
                {String(u.number).padStart(2, '0')}
              </span>
              <span className="leading-snug">{u.title}</span>
            </Link>
          )
        })}
      </div>

      <Link
        href="/gaps"
        className="mt-auto border-t border-rule-soft px-4 py-3 lbl hover:bg-panel-head hover:text-fg-2"
      >
        Lacunas
      </Link>
    </nav>
  )
}
