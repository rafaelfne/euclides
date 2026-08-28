import type { ReactNode } from 'react'
import { Rail } from './Rail'

export function AppShell({ unitId, tabs, children }: { unitId?: string; tabs?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Rail unitId={unitId} />
      <main className="flex min-w-0 flex-grow flex-col">
        {tabs}
        {children}
      </main>
    </div>
  )
}
