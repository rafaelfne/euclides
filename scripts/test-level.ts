import { units } from '../src/content/index'
import { probes } from '../src/content/placement'
import { level, unitState, BANDS } from '../src/lib/level'
import type { Progress } from '../src/content/schema'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? ` , ${detail}` : ''}`)
  if (!ok) failures++
}

console.log('\n  estados de unidade e faixa\n')

const NOW = Date.parse('2026-08-29T12:00:00.000Z')
const DAY = 86_400_000
const at = (days: number) => new Date(NOW - days * DAY).toISOString()

const cell = (o: Partial<{ attempts: number; solved: boolean; solvedClean: boolean; days: number }>) => ({
  attempts: o.attempts ?? 1,
  solved: o.solved ?? true,
  solvedClean: o.solvedClean ?? true,
  misconceptionsTriggered: [] as string[],
  lastVisited: at(o.days ?? 0),
})

const build = (per: Record<string, Record<string, ReturnType<typeof cell>>>): Progress => ({
  schemaVersion: 2,
  units: Object.fromEntries(Object.entries(per).map(([u, ex]) => [u, { exercises: ex }])),
})

const tracing = units.find((u) => u.id === 'tracing')!
const [t1, t2] = tracing.mastery.requiresClean as [string, string]

check('sem exercício nenhum é não visitada',
  unitState(tracing, build({}), NOW) === 'nao-visitada')

check('um exercício tentado já é em curso',
  unitState(tracing, build({ tracing: { [t1]: cell({ solved: false, solvedClean: false }) } }), NOW) === 'em-curso')

/*
  O teste do princípio 2: quem acertou na quarta não pode chegar onde chega
  quem acertou na primeira. Se este check cair, a mecânica inteira desandou.
*/
check('resolver sem ser de primeira NÃO domina',
  unitState(tracing, build({
    tracing: { [t1]: cell({ attempts: 4, solvedClean: false }), [t2]: cell({ attempts: 4, solvedClean: false }) },
  }), NOW) === 'em-curso')

check('metade do critério limpo ainda é em curso',
  unitState(tracing, build({
    tracing: { [t1]: cell({}), [t2]: cell({ solvedClean: false }) },
  }), NOW) === 'em-curso')

check('o critério inteiro de primeira domina',
  unitState(tracing, build({ tracing: { [t1]: cell({}), [t2]: cell({}) } }), NOW) === 'dominada')

// Esperar não estuda: só a volta limpa depois do intervalo consolida.
check('dominar e esperar não consolida',
  unitState(tracing, build({
    tracing: { [t1]: cell({ days: 30 }), [t2]: cell({ days: 30 }) },
  }), NOW) === 'dominada')

check('voltar depois do intervalo e sair limpo consolida',
  unitState(tracing, build({
    tracing: { [t1]: cell({ attempts: 2, days: 0 }), [t2]: cell({ attempts: 2, days: 0 }) },
  }), NOW) === 'consolidada')

// --- faixa -----------------------------------------------------------------

const domina = (ids: string[]) => build(Object.fromEntries(ids.map((id) => {
  const u = units.find((x) => x.id === id)!
  return [id, Object.fromEntries(u.mastery.requiresClean.map((e) => [e, cell({})]))]
})))

check('sem nada é Leitor', level(units, build({}), NOW).band.id === 'leitor')
check('unidade 01 dominada é Traçador', level(units, domina(['tracing']), NOW).band.id === 'tracador')
check('01 e 02 é Analista', level(units, domina(['tracing', 'asymptotics']), NOW).band.id === 'analista')

// Quatro unidades sem hash e sem ordenação não é Revisor: a faixa nomeia uma
// capacidade, e essas duas são o que ela afirma.
check('quatro unidades sem hash e sem ordenação não é Revisor',
  level(units, domina(['tracing', 'asymptotics', 'linear', 'trees']), NOW).band.id === 'analista')

check('quatro incluindo hash e ordenação é Revisor',
  level(units, domina(['tracing', 'asymptotics', 'hash', 'sorting']), NOW).band.id === 'revisor')

const todas = level(units, domina(units.map((u) => u.id)), NOW)
check('as oito dominadas ainda não é Árbitro, falta consolidar a síntese',
  todas.band.id === 'revisor' && todas.next?.band.id === 'arbitro')
check('o que falta é nomeado', Boolean(todas.next?.missing.length))

check('a faixa alcançada sempre traz a regra', BANDS.every((b) => b.rule.length > 0))

// --- sondagem --------------------------------------------------------------

check('há uma sonda por unidade das seis primeiras',
  probes.length === 6 && probes.every((p, i) => p.unitId === units[i]!.id))
check('toda sonda descreve a capacidade que ela sonda',
  probes.every((p) => p.whatItProbes.length > 10))

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas passaram\n')
process.exit(failures ? 1 : 0)
