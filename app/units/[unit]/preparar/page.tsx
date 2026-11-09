import { notFound } from 'next/navigation'
import { unitById } from '@/content'
import { setupFor, setupGuides } from '@/content/setup'
import { AppShell } from '@/components/AppShell'
import { UnitTabs } from '@/components/UnitTabs'
import { MachineSetup } from '@/components/MachineSetup'

export const dynamicParams = false

export function generateStaticParams() {
  return setupGuides.map((g) => ({ unit: g.unitId }))
}

export const metadata = { title: 'Preparar a máquina, Euclides' }

export default async function SetupPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit: unitId } = await params
  const unit = unitById(unitId)
  const guide = setupFor(unitId)
  if (!unit || !guide) notFound()
  return (
    <AppShell unitId={unit.id} tabs={<UnitTabs unit={unit} />}>
      <div className="flex-grow overflow-y-auto px-4 py-6 sm:px-7">
        <MachineSetup guide={guide} />
      </div>
    </AppShell>
  )
}
