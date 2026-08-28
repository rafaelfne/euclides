import { notFound } from 'next/navigation'
import { units, unitById, cycleById, exerciseById } from '@/content'
import { AppShell } from '@/components/AppShell'
import { UnitTabs } from '@/components/UnitTabs'
import { CycleScreen } from '@/components/CycleScreen'

export function generateStaticParams() {
  return units.flatMap((u) => u.cycles.map((c) => ({ unit: u.id, cycle: c.id })))
}

export default async function CyclePage({
  params,
}: {
  params: Promise<{ unit: string; cycle: string }>
}) {
  const { unit: unitId, cycle: cycleId } = await params
  const unit = unitById(unitId)
  const cycle = unit && cycleById(unit, cycleId)
  if (!unit || !cycle) notFound()
  const exercise = exerciseById(unit, cycle.exerciseId)
  if (!exercise) notFound()
  return (
    <AppShell unitId={unit.id} tabs={<UnitTabs unit={unit} cycleId={cycle.id} />}>
      <CycleScreen unit={unit} cycle={cycle} exercise={exercise} />
    </AppShell>
  )
}
