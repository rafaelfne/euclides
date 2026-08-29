import Link from 'next/link'
import { unitById } from '@/content'

/**
 * O rail some abaixo de `lg`. Sem esta barra o aluno em tela estreita ficava
 * sem caminho de volta para a trilha — a home era alcançável só pelo botão do
 * navegador.
 */
export function MobileBar({ unitId }: { unitId?: string }) {
  const unit = unitId ? unitById(unitId) : undefined
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-rule-soft bg-rail px-4 py-2.5 lg:hidden">
      <Link href="/" className="text-[15px] font-semibold text-fg">Euclides</Link>
      {unit && (
        <Link href={`/units/${unit.id}`} className="lbl truncate text-fg-3">
          {String(unit.number).padStart(2, '0')} · {unit.title}
        </Link>
      )}
      <div className="ml-auto flex shrink-0 gap-3">
        <Link href="/traps" className="lbl">Armadilhas</Link>
        <Link href="/gaps" className="lbl">Lacunas</Link>
      </div>
    </div>
  )
}
