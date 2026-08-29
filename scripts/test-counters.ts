import { units } from '../src/content/index'
import { counters, judgment } from '../src/lib/counters'
import type { Progress } from '../src/content/schema'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? ` , ${detail}` : ''}`)
  if (!ok) failures++
}

console.log('\n  contadores e índice de julgamento\n')

const cell = (o: Partial<{
  attempts: number; solved: boolean; solvedClean: boolean
  traps: string[]; revisits: Array<{ at: string; clean: boolean }>
}>) => ({
  attempts: o.attempts ?? 1,
  solved: o.solved ?? true,
  solvedClean: o.solvedClean ?? false,
  misconceptionsTriggered: o.traps ?? [],
  revisits: o.revisits,
  lastVisited: '2026-08-01T00:00:00.000Z',
})

const p = (ex: Record<string, ReturnType<typeof cell>>): Progress =>
  ({ schemaVersion: 2, units: { tracing: { exercises: ex } } })

const trap = units.find((u) => u.id === 'tracing')!.misconceptions[0]!.id
const clean = [{ at: '2026-08-20T00:00:00.000Z', clean: true }]
const dirty = [{ at: '2026-08-20T00:00:00.000Z', clean: false }]

/*
  O teste do princípio 2, primeiro e para cada contador: quem insistiu não pode
  alcançar quem acertou de primeira. Se qualquer um destes cair, a mecânica
  virou pontuação por volume.
*/
const insistiu = p({ 'tracing.e0': cell({ attempts: 7, solvedClean: false }) })
const primeira = p({ 'tracing.e0': cell({ attempts: 1, solvedClean: true }) })

check('de primeira não sobe com sete tentativas',
  counters(units, insistiu).firstTry.clean === 0)
check('de primeira sobe com uma', counters(units, primeira).firstTry.clean === 1)
check('tentados conta os dois igual',
  counters(units, insistiu).firstTry.attempted === counters(units, primeira).firstTry.attempted)

check('índice: sete tentativas valem 0', judgment(units, insistiu).value === 0)
check('índice: de primeira e limpo vale 1', judgment(units, primeira).value === 1)

const primeiraComArmadilha = p({ 'tracing.e0': cell({ attempts: 1, solvedClean: false, traps: [trap] }) })
check('índice: de primeira com armadilha vale 0,5',
  judgment(units, primeiraComArmadilha).value === 0.5)

// --- desarmar exige a volta limpa ------------------------------------------

const ativada = p({ 'tracing.e0': cell({ traps: [trap] }) })
check('armadilha ativada e nunca revisitada não está desarmada',
  counters(units, ativada).disarmed.count === 0)

const revisitadaSuja = p({ 'tracing.e0': cell({ traps: [trap], revisits: dirty }) })
check('revisita que saiu suja não desarma',
  counters(units, revisitadaSuja).disarmed.count === 0)

const revisitadaLimpa = p({ 'tracing.e0': cell({ traps: [trap], revisits: clean }) })
check('revisita limpa desarma', counters(units, revisitadaLimpa).disarmed.count === 1)

check('o total de armadilhas é o catálogo inteiro',
  counters(units, ativada).disarmed.total === units.flatMap((u) => u.misconceptions).length)

// --- revisitas honradas ----------------------------------------------------

check('revisita suja não conta como honrada',
  counters(units, revisitadaSuja).honoredRevisits === 0)
check('revisita limpa conta', counters(units, revisitadaLimpa).honoredRevisits === 1)

// --- multiplicador ---------------------------------------------------------

const comHonra = p({ 'tracing.e0': cell({ solvedClean: true, revisits: clean }) })
check('revisita honrada multiplica a unidade por 1,2',
  Math.abs(judgment(units, comHonra).byUnit.find((u) => u.unitId === 'tracing')!.value - 1.2) < 1e-9)

const comFalha = p({ 'tracing.e0': cell({ solvedClean: true, revisits: dirty }) })
check('revisita falhada desconta e não multiplica',
  judgment(units, comFalha).byUnit.find((u) => u.unitId === 'tracing')!.value === 0)

check('o índice nunca fica negativo', judgment(units, comFalha).value >= 0)

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas passaram\n')
process.exit(failures ? 1 : 0)
