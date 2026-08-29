import Link from 'next/link'
import { units } from '@/content'
import { AppShell } from '@/components/AppShell'
import { Badge } from '@/components/ui/badge'
import { Mark } from '@/components/Mark'
import { ResumeCard } from '@/components/ResumeCard'
import { unitMinutes, humanMinutes } from '@/lib/duration'

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-grow flex-col gap-7 overflow-y-auto px-4 py-8 sm:px-7">
        <div className="flex max-w-[720px] flex-col gap-3">
          <div className="flex items-center gap-4">
            <Mark size={64} className="shrink-0 text-contract" />
            <h1 className="m-0 text-[34px] font-semibold leading-tight">Euclides</h1>
          </div>
          <p className="m-0 text-[15px] leading-relaxed text-fg-2">
            Fundamentos para julgar código sem executá-lo. Nos <em>Elementos</em>, nada é assumido
            que não esteja declarado, aqui também não: toda complexidade vem com regime e
            hipóteses, todo termo vem com o que ele não é.
          </p>
        </div>

        <Link
          href="/como-funciona"
          className="m-tap flex max-w-[720px] items-baseline gap-3 border border-contract-rule bg-contract-bg px-4 py-3 text-inherit hover:bg-panel-hover"
        >
          <span className="text-[14.5px] font-semibold text-fg">Primeira vez aqui?</span>
          <span className="text-[13px] text-fg-3">
            Como funciona, o que significa cada palavra, e por onde começar.
          </span>
          <span className="ml-auto font-mono text-[12px] text-contract">→</span>
        </Link>

        <ResumeCard />

        <div className="flex flex-col gap-2">
          <span className="lbl">Primeiro módulo</span>
          <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 lg:grid-cols-2">
            {units.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/units/${u.id}`}
                  className="flex h-full flex-col gap-1.5 border border-rule bg-panel px-4 py-3.5 text-inherit hover:bg-panel-hover"
                >
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-[12px] text-fg-5">
                      {String(u.number).padStart(2, '0')}
                    </span>
                    <span className="text-[17px] font-semibold">{u.title}</span>
                  </div>
                  <span className="text-[12.5px] leading-snug text-fg-3">{u.learningObjective}</span>
                  <div className="mt-auto flex gap-1.5 pt-1.5">
                    <Badge tone={u.kind === 'structure' ? 'implementation' : 'contract'}>
                      {u.kind === 'structure' ? 'estrutura' : 'método'}
                    </Badge>
                    <Badge>{u.cycles.length} ciclos</Badge>
                    <Badge>{humanMinutes(unitMinutes(u))}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  )
}
