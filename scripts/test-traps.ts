import { units } from '../src/content/index'
import { trapBook, dueRevisits, REVISIT_STEPS } from '../src/lib/traps'
import type { Progress } from '../src/content/schema'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? ` , ${detail}` : ''}`)
  if (!ok) failures++
}

console.log('\n  bestiário e fila de revisitas\n')

const NOW = Date.parse('2026-08-29T12:00:00.000Z')
const DAY = 86_400_000
const ago = (d: number) => new Date(NOW - d * DAY).toISOString()

const tracing = units.find((u) => u.id === 'tracing')!
const trap = tracing.misconceptions[0]!.id
const exId = tracing.cycles[0]!.exerciseId

const cell = (o: Partial<{
  solved: boolean; solvedClean: boolean; traps: string[]
  revisits: Array<{ at: string; clean: boolean }>; days: number
}>) => ({
  attempts: 1,
  solved: o.solved ?? true,
  solvedClean: o.solvedClean ?? false,
  misconceptionsTriggered: o.traps ?? [],
  revisits: o.revisits,
  lastVisited: ago(o.days ?? 0),
})

const p = (c: ReturnType<typeof cell>): Progress =>
  ({ schemaVersion: 2, units: { tracing: { exercises: { [exId]: c } } } })

const stateOf = (prog: Progress) =>
  trapBook(units, prog).find((e) => e.misconception.id === trap)!.state

check('sem progresso, toda armadilha é não encontrada',
  trapBook(units, { schemaVersion: 2, units: {} }).every((e) => e.state === 'nao-encontrada'))

check('o bestiário lista o catálogo inteiro',
  trapBook(units, { schemaVersion: 2, units: {} }).length
  === units.flatMap((u) => u.misconceptions).length)

check('ativar marca como ativada', stateOf(p(cell({ traps: [trap] }))) === 'ativada')

/*
  O teste que dá sentido ao bestiário: ler a explicação não desarma nada. A
  única transição de ativada para desarmada passa por uma volta limpa.
*/
check('revisita suja NÃO desarma',
  stateOf(p(cell({ traps: [trap], revisits: [{ at: ago(1), clean: false }] }))) === 'ativada')
check('revisita limpa desarma',
  stateOf(p(cell({ traps: [trap], revisits: [{ at: ago(1), clean: true }] }))) === 'desarmada')

// --- fila ------------------------------------------------------------------

const due = (c: ReturnType<typeof cell>) => dueRevisits(units, p(c), NOW)

check('o que nunca saiu limpo não entra na fila',
  due(cell({ solved: false, solvedClean: false, days: 90 })).length === 0)

check('limpo e dentro do primeiro intervalo não vence',
  due(cell({ solvedClean: true, days: REVISIT_STEPS[0] - 1 })).length === 0)

check('limpo e passado o primeiro intervalo vence',
  due(cell({ solvedClean: true, days: REVISIT_STEPS[0] })).length === 1)

// O degrau sobe por volta honrada, nunca por dia decorrido: com uma volta
// limpa registrada, o próximo vencimento é o segundo intervalo.
const umaHonrada = cell({
  solvedClean: true, days: REVISIT_STEPS[0] + 1,
  revisits: [{ at: ago(REVISIT_STEPS[0] + 1), clean: true }],
})
check('uma volta honrada sobe o degrau e adia o vencimento', due(umaHonrada).length === 0)
check('passado o segundo intervalo, vence de novo no degrau 2',
  due({ ...umaHonrada, lastVisited: ago(REVISIT_STEPS[1]) })[0]?.step === 1)

check('esperar muito não pula degrau',
  due(cell({ solvedClean: true, days: 365 }))[0]?.step === 0)

check('o degrau nunca passa do último',
  due({
    ...cell({ solvedClean: true, days: 365 }),
    revisits: Array.from({ length: 9 }, () => ({ at: ago(40), clean: true })),
  })[0]?.step === REVISIT_STEPS.length - 1)

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas passaram\n')
process.exit(failures ? 1 : 0)
