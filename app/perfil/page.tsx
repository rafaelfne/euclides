import { AppShell } from '@/components/AppShell'
import { ProfileScreen } from '@/components/ProfileScreen'

export const metadata = { title: 'Perfil, Euclides' }

export default function Page() {
  return (
    <AppShell>
      <div className="flex-grow overflow-y-auto px-4 py-8 sm:px-7">
        <ProfileScreen />
      </div>
    </AppShell>
  )
}
