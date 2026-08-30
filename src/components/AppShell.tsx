import type { ReactNode } from 'react'
import { Rail } from './Rail'
import { CommandPalette, CommandPaletteButton } from './CommandPalette'
import { MobileBar } from './MobileBar'
import { BandBadge } from './BandBadge'

/**
 * Rail e abas ficam parados; a rolagem pertence ao conteúdo. Cada tela decide
 * quantas regiões de rolagem tem, a do ciclo tem duas, porque a barra lateral
 * de símbolos precisa acompanhar a prosa em vez de sair da tela com ela.
 *
 * A faixa mora nesta barra, e não na trilha, porque esta barra existe em toda
 * tela e a das abas some abaixo de `md`. As abas rolam na horizontal quando
 * são muitas; a faixa fica presa à direita e não entra na rolagem.
 */
export function AppShell({ unitId, tabs, children }: { unitId?: string; tabs?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Rail unitId={unitId} />
      <main className="flex min-w-0 flex-grow flex-col">
        <MobileBar unitId={unitId} />
        <div className="flex shrink-0 items-stretch border-b border-rule-soft bg-rail">
          {tabs}
          <div className="ml-auto flex shrink-0 items-center gap-3 py-2 pr-4 pl-4">
            <CommandPaletteButton />
            <BandBadge compact />
          </div>
        </div>
        <div className="flex min-h-0 flex-grow overflow-hidden">{children}</div>
      </main>
      <CommandPalette />
    </div>
  )
}
