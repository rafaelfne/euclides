import Link from 'next/link'
import { allUnits, extraUnits, trailUnits } from '@/content'
import { AppShell } from '@/components/AppShell'
import { Badge } from '@/components/ui/badge'
import { Mark } from '@/components/Mark'
import { ResumeCard } from '@/components/ResumeCard'
import { unitMinutes, humanMinutes } from '@/lib/duration'
import { UnitStateDot } from '@/components/UnitStateDot'
import { PlacementInvite } from '@/components/PlacementInvite'
import { RevisitQueue } from '@/components/RevisitQueue'
import { FirstVisitOnly } from '@/components/VisitState'

export default function Home() {
  const first = allUnits[0]!

  return (
    <AppShell>
      <div className="flex flex-grow flex-col gap-7 overflow-y-auto px-4 py-8 sm:px-7">
        <div className="flex max-w-[720px] flex-col gap-3">
          <div className="flex items-center gap-4">
            <Mark size={64} className="shrink-0 text-contract" />
            <h1 className="m-0 text-[34px] font-semibold leading-tight">Euclides</h1>
          </div>
          <p className="m-0 text-[17px] leading-snug text-fg">
            Olhe um código que você não escreveu, de um colega ou de uma IA, e diga o que ele faz,
            quanto custa e onde quebra, sem rodar.
          </p>
          <FirstVisitOnly>
            <p className="m-0 text-[15px] leading-relaxed text-fg-2">
              Uma resposta não se torna verdadeira porque foi escrita com confiança. Nos <em>Elementos</em>,
              Euclides construía a confiança por meio da demonstração, não da aparência. Esta trilha
              aplica o mesmo método ao código. Toda promessa precisa de um contrato, toda conclusão
              precisa de um caminho e toda afirmação de custo precisa de um regime. Assim, você pode
              julgá-lo sem executá-lo.
            </p>
          </FirstVisitOnly>
        </div>

        <RevisitQueue compact />
        <ResumeCard />
        <FirstVisitOnly>
          <div className="flex flex-col gap-4">
            <div className="flex max-w-[720px] flex-col gap-2">
              <span className="lbl">Comece aqui</span>
              <Link
                href={`/units/${first.id}`}
                className="flex flex-col gap-2 border border-contract-rule bg-contract-bg px-4 py-4 text-inherit hover:bg-panel-hover"
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[12px] text-contract">{String(first.number).padStart(2, '0')}</span>
                  <span className="text-[18px] font-semibold">{first.title}</span>
                  <span className="ml-auto"><UnitStateDot unit={first} withLabel /></span>
                </div>
                <span className="text-[13px] leading-snug text-fg-3">
                  {first.learningObjective}
                </span>
                <span className="font-mono text-[12px] text-contract">
                  abrir a unidade · {first.cycles.length} ciclos · {humanMinutes(unitMinutes(first))} →
                </span>
              </Link>
            </div>

            <Link
              href="/como-funciona"
              className="m-tap flex max-w-[720px] items-baseline gap-3 border border-rule bg-panel px-4 py-3 text-inherit hover:bg-panel-hover"
            >
              <span className="text-[14.5px] font-semibold text-fg">Primeira vez aqui?</span>
              <span className="text-[13px] text-fg-3">
                Como funciona, o que significa cada palavra, e por onde começar.
              </span>
              <span className="ml-auto font-mono text-[12px] text-contract">→</span>
            </Link>

            <PlacementInvite />
          </div>
        </FirstVisitOnly>

        {([
          ['A trilha', trailUnits, null],
          ['Além da trilha', extraUnits, 'Navegável, com exercícios e progresso, mas não conta para o nível.'],
        ] as const).map(([label, list, note]) => (
          <div key={label} className="flex flex-col gap-2">
            <span className="lbl">{label}</span>
            {note && <span className="text-[13px] text-fg-4">{note}</span>}
            <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 lg:grid-cols-2">
              {list.map((u) => (
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
                      <span className="ml-auto"><UnitStateDot unit={u} withLabel /></span>
                    </div>
                    <span className="text-[12.5px] leading-snug text-fg-3">{u.learningObjective}</span>
                    <div className="mt-auto flex gap-1.5 pt-1.5">
                      {/* Tipo de unidade em neutro: cor é de banda, e vermelho já diz implementação. */}
                      <Badge>
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
        ))}
      </div>
    </AppShell>
  )
}
