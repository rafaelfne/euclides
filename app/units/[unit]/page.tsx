import { notFound } from 'next/navigation'
import { units, unitById } from '@/content'
import { AppShell } from '@/components/AppShell'
import { UnitTabs } from '@/components/UnitTabs'
import { UnitMap } from '@/components/UnitMap'

export function generateStaticParams() {
  return units.map((u) => ({ unit: u.id }))
}

export default async function UnitPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit: unitId } = await params
  const unit = unitById(unitId)
  if (!unit) notFound()
  return (
    <AppShell unitId={unit.id} tabs={<UnitTabs unit={unit} />}>
      <UnitMap unit={unit} />
    </AppShell>
  )
}
