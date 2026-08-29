import type { Progress, Unit } from '@/content/schema'

/**
 * The bridge with Claude, and the reason `localStorage` was enough (ADR-0009).
 *
 * What it carries is the student's state, never the content's answers: how
 * many attempts, what was solved and how cleanly, which traps fired, and the
 * question each trap already asked on screen. It never carries an `escalation`
 * entry the student has not earned, and never a correct choice — principle 3
 * does not stop applying because the text left the app. `scripts/test-export.ts`
 * checks both.
 */

export interface GapLine {
  exerciseId: string
  prompt: string
  attempts: number
  solved: boolean
  solvedClean: boolean
  /** Plain-language verdict. Never a percentage — principle 7. */
  verdict: string
  misconceptions: Array<{ id: string; label: string; socraticQuestion: string; reviewCycle: string }>
  freeText?: string
}

export interface UnitGaps {
  unit: Unit
  lines: GapLine[]
  masteryBlockers: string[]
  dueForReview: string[]
}

const DAY_MS = 86_400_000

function verdictFor(attempts: number, solved: boolean, solvedClean: boolean): string {
  if (!solved) return `aberto depois de ${attempts} ${attempts === 1 ? 'tentativa' : 'tentativas'}`
  if (solvedClean) return 'resolvido na primeira tentativa, sem ativar armadilha'
  return `resolvido em ${attempts} tentativas — chegar lá não é o mesmo que dominar`
}

export function collectGaps(units: Unit[], progress: Progress, now: number): UnitGaps[] {
  const out: UnitGaps[] = []
  for (const unit of units) {
    const states = progress.units[unit.id]?.exercises ?? {}
    // Uma unidade que ninguém abriu não é lacuna, é unidade não começada. Sem
    // isto o painel abriria dizendo que tudo está em aberto, que é verdade e
    // não é informação.
    if (!unit.exercises.some((e) => states[e.id])) continue

    const lines: GapLine[] = []
    const dueForReview: string[] = []

    for (const exercise of unit.exercises) {
      const state = states[exercise.id]
      if (!state) continue

      const days = (now - new Date(state.lastVisited).getTime()) / DAY_MS
      if (state.solvedClean && days >= unit.mastery.revisitIntervalDays) dueForReview.push(exercise.id)
      if (state.solvedClean && !state.misconceptionsTriggered.length && !state.freeText) continue

      lines.push({
        exerciseId: exercise.id,
        prompt: exercise.prompt,
        attempts: state.attempts,
        solved: state.solved,
        solvedClean: state.solvedClean,
        verdict: verdictFor(state.attempts, state.solved, state.solvedClean),
        misconceptions: state.misconceptionsTriggered
          .map((id) => unit.misconceptions.find((m) => m.id === id))
          .filter((m): m is Unit['misconceptions'][number] => Boolean(m))
          .map((m) => ({
            id: m.id, label: m.label,
            socraticQuestion: m.socraticQuestion, reviewCycle: m.reviewCycle,
          })),
        freeText: state.freeText,
      })
    }

    const masteryBlockers = unit.mastery.requiresClean.filter((id) => !states[id]?.solvedClean)
    if (lines.length || masteryBlockers.length || dueForReview.length) {
      out.push({ unit, lines, masteryBlockers, dueForReview })
    }
  }
  return out
}

export function buildSessionExport(units: Unit[], progress: Progress, now: number): string {
  const gaps = collectGaps(units, progress, now)
  const md: string[] = [
    '# Sessão do Euclides',
    '',
    'Este arquivo descreve onde meu raciocínio quebrou, não o que é a resposta certa.',
    'Me corrija do jeito que a trilha corrige: aponte onde quebrou e faça a pergunta que',
    'leva à correção. Não me entregue o valor correto, mesmo se eu pedir.',
    '',
  ]

  if (!gaps.length) {
    md.push('Nenhuma lacuna registrada neste navegador — ou nenhum exercício foi tentado ainda.', '')
    return md.join('\n')
  }

  for (const { unit, lines, masteryBlockers, dueForReview } of gaps) {
    md.push(`## Unidade ${unit.number} — ${unit.title}`, '')
    md.push(`**Critério de domínio.** ${unit.mastery.statement}`, '')

    if (masteryBlockers.length) {
      md.push(`Ainda não resolvi na primeira tentativa: ${masteryBlockers.join(', ')}.`, '')
    } else {
      md.push('Os exercícios exigidos pelo critério saíram na primeira tentativa.', '')
    }
    if (dueForReview.length) {
      md.push(`Venceu o intervalo de revisita: ${dueForReview.join(', ')}.`, '')
    }

    for (const line of lines) {
      md.push(`### ${line.exerciseId}`, '')
      md.push(`> ${line.prompt}`, '')
      md.push(`Estado: ${line.verdict}.`, '')
      if (line.misconceptions.length) {
        md.push('Armadilhas que eu ativei:', '')
        for (const m of line.misconceptions) {
          md.push(`- **${m.label}** — a pergunta que o app me fez foi: “${m.socraticQuestion}”`)
          md.push(`  (o ciclo de revisão é ${m.reviewCycle})`)
        }
        md.push('')
      }
      if (line.freeText) {
        md.push('O que eu escrevi para mim mesmo:', '', `> ${line.freeText}`, '')
      }
    }
  }

  md.push('---', '')
  md.push('Comece perguntando qual das armadilhas acima eu ainda não sei explicar com',
    'minhas palavras, e trabalhe essa primeiro.', '')
  return md.join('\n')
}
