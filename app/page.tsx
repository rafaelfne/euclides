import Link from 'next/link'
import { units } from '@/content'
import { AppShell } from '@/components/AppShell'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col gap-7 px-7 py-8">
        <div className="flex max-w-[720px] flex-col gap-3">
          <h1 className="m-0 text-[34px] font-semibold leading-tight">Euclides</h1>
          <p className="m-0 text-[15px] leading-relaxed text-fg-2">
            Fundamentos para julgar código sem executá-lo. Nos <em>Elementos</em>, nada é assumido
            que não esteja declarado — aqui também não: toda complexidade vem com regime e
            hipóteses, todo termo vem com o que ele não é.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="lbl">Primeiro módulo</span>
          <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0">
            {units.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/units/${u.id}`}
                  className="flex h-full flex-col gap-1.5 border border-rule bg-panel px-4 py-3.5 text-inherit hover:bg-panel-hover"
                >
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-[10.5px] text-fg-5">
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
                    <Badge>{u.exercises.length} exercícios</Badge>
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
