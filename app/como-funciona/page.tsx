import { AppShell } from '@/components/AppShell'
import { HowItWorks } from '@/components/HowItWorks'

export const metadata = { title: 'Como funciona — Euclides' }

export default function Page() {
  return (
    <AppShell>
      <div className="flex-grow overflow-y-auto px-4 py-8 sm:px-7">
        <HowItWorks />
      </div>
    </AppShell>
  )
}
