/**
 * The export leaves the app, so principle 3 has to survive the trip.
 *
 * The load-bearing assertions are the negative ones: no `escalation` entry the
 * student has not earned, and no correct choice text. A leak here would not
 * break a screen, it would quietly hand over the answers the whole engine was
 * built to withhold.
 */
import type { Progress } from '../src/content/schema'
import { units } from '../src/content/index'
import { hashUnit } from '../src/content/units/hash'
import { buildSessionExport, collectGaps } from '../src/lib/session-export'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? `, ${detail}` : ''}`)
  if (!ok) failures++
}

const NOW = Date.parse('2026-08-28T12:00:00.000Z')
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString()

const progress: Progress = {
  schemaVersion: 1,
  units: {
    hash: {
      exercises: {
        'hash.e1': {
          attempts: 4, solved: true, solvedClean: false,
          misconceptionsTriggered: ['hash.rehash-copia-buckets'],
          lastVisited: daysAgo(0),
        },
        'hash.e3': {
          attempts: 2, solved: false, solvedClean: false,
          misconceptionsTriggered: ['hash.duplicata-inofensiva'],
          freeText: 'acho que n conta duplicata mas não sei dizer o efeito',
          lastVisited: daysAgo(1),
        },
        'hash.e0': {
          attempts: 1, solved: true, solvedClean: true,
          misconceptionsTriggered: [], lastVisited: daysAgo(0),
        },
        'hash.e5': {
          attempts: 1, solved: true, solvedClean: true,
          misconceptionsTriggered: [], lastVisited: daysAgo(30),
        },
      },
    },
  },
}

const gaps = collectGaps(units, progress, NOW)
check('uma unidade com lacuna aparece', gaps.length === 1 && gaps[0]!.unit.id === 'hash')

const hash = gaps[0]!
check('exercício limpo e sem armadilha não vira lacuna',
  !hash.lines.some((l) => l.exerciseId === 'hash.e0'), hash.lines.map((l) => l.exerciseId).join(','))
check('exercício limpo mas vencido entra só na revisita',
  hash.dueForReview.join(',') === 'hash.e5' && !hash.lines.some((l) => l.exerciseId === 'hash.e5'))
check('o critério de domínio aponta o que falta',
  hash.masteryBlockers.join(',') === 'hash.e1,hash.e3', hash.masteryBlockers.join(','))
check('resolver em quatro tentativas não conta como domínio',
  hash.lines.find((l) => l.exerciseId === 'hash.e1')!.verdict.includes('não é o mesmo que dominar'))

const md = buildSessionExport(units, progress, NOW)

check('o export não traz percentual nenhum', !/\d+\s?%/.test(md))
check('o export instrui a não entregar a resposta',
  md.includes('Não me entregue o valor correto'))
check('o export carrega a pergunta socrática da armadilha ativada',
  md.includes('Reescreva a invariante de posição trocando m por 2m'))
check('o export carrega a autoexplicação', md.includes('não sei dizer o efeito'))
check('armadilha não ativada fica de fora',
  !md.includes('Escreva “os vinte mais antigos”'))

const escalations = hashUnit.misconceptions.flatMap((m) => m.escalation)
const leakedEscalation = escalations.filter((e) => md.includes(e))
check('nenhuma entrada de escalation vaza no export', leakedEscalation.length === 0,
  leakedEscalation.join(' | ').slice(0, 120))

const correctTexts = hashUnit.exercises.flatMap((ex) => {
  const choices = ex.kind === 'choice' ? ex.choices : ex.kind === 'bug' ? ex.consequences : []
  return choices.filter((c) => c.correct).map((c) => c.text)
})
const leakedAnswers = correctTexts.filter((t) => md.includes(t))
check('nenhuma alternativa correta vaza no export', leakedAnswers.length === 0,
  leakedAnswers.join(' | ').slice(0, 120))
check('o traço de referência não vaza no export', !md.includes('3:[3,11]'))

const emptyMd = buildSessionExport(units, { schemaVersion: 1, units: {} }, NOW)
check('progresso vazio gera export honesto, não vazio',
  emptyMd.includes('Nenhuma lacuna registrada') && emptyMd.startsWith('# Sessão do Euclides'))

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas as checagens passaram\n')
process.exit(failures ? 1 : 0)
