import { AppShell } from '@/components/AppShell'
import { Placement } from '@/components/Placement'

export const metadata = { title: 'Sondagem, Euclides' }

export default function Page() {
  return (
    <AppShell>
      <div className="flex-grow overflow-y-auto px-4 py-8 sm:px-7">
        <Placement />
      </div>
    </AppShell>
  )
}
