import Link from 'next/link'
import { unitById } from '@/content'
import { Logo } from './Logo'

/**
 * O rail some abaixo de `lg`. Sem esta barra o aluno em tela estreita ficava
 * sem caminho de volta para a trilha, a home era alcançável só pelo botão do
 * navegador.
 *
 * A faixa não vive aqui: ela fica na barra do `AppShell`, que existe em toda
 * largura. Uma tentativa de pôr as duas coisas nesta linha truncou o título da
 * unidade para "04 · Tab...", e esse título é a única volta para o mapa em
 * tela estreita, porque as abas de ciclo somem abaixo de `md`.
 */
export function MobileBar({ unitId }: { unitId?: string }) {
  const unit = unitId ? unitById(unitId) : undefined
  return (
    <nav className="flex shrink-0 items-center gap-3 border-b border-rule-soft bg-rail px-4 py-2.5 lg:hidden">
      <Link href="/" title="Euclides" aria-label="Euclides" className="flex shrink-0 items-center">
        <Logo size={28} />
      </Link>
      {unit && (
        <Link href={`/units/${unit.id}`} className="lbl truncate text-fg-3">
          {String(unit.number).padStart(2, '0')} · {unit.title}
        </Link>
      )}
      <div className="ml-auto flex shrink-0 gap-3">
        <Link href="/traps" className="lbl">Armadilhas</Link>
        <Link href="/gaps" className="lbl">Lacunas</Link>
      </div>
    </nav>
  )
}
