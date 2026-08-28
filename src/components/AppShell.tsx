import type { ReactNode } from 'react'
import { Rail } from './Rail'

/**
 * Rail e abas ficam parados; a rolagem pertence ao conteúdo. Cada tela decide
 * quantas regiões de rolagem tem — a do ciclo tem duas, porque a barra lateral
 * de símbolos precisa acompanhar a prosa em vez de sair da tela com ela.
 */
export function AppShell({ unitId, tabs, children }: { unitId?: string; tabs?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Rail unitId={unitId} />
      <main className="flex min-w-0 flex-grow flex-col">
        {tabs}
        <div className="flex min-h-0 flex-grow overflow-hidden">{children}</div>
      </main>
    </div>
  )
}
