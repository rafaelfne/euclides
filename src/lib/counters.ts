import type { Progress, Unit } from '@/content/schema'

/**
 * Os três contadores honestos, e o índice atrás deles.
 *
 * O teste do princípio 2 vale para cada um: **ele ainda distingue quem acertou
 * de primeira de quem acertou na quarta?** Nenhum destes sobe por insistência,
 * por tempo de tela ou por leitura, e é por isso que são três e não trinta.
 *
 * O que ficou deliberadamente de fora: exercícios feitos, ciclos visitados,
 * dias seguidos, tempo total. Todos sobem sozinhos e nenhum diz nada sobre
 * julgar código. Ver ADR-0023.
 */
export interface Counters {
  /** Resolvidos na primeira tentativa sobre tentados. Nunca sobe por repetição. */
  firstTry: { clean: number; attempted: number }
  /** Armadilhas ativadas que depois saíram limpas numa revisita. */
  disarmed: { count: number; total: number }
  /** Voltas depois do intervalo que saíram limpas. */
  honoredRevisits: number
}

export function counters(units: Unit[], p: Progress): Counters {
  let clean = 0
  let attempted = 0
  let honored = 0

  const triggered = new Set<string>()
  const disarmed = new Set<string>()

  for (const u of units) {
    const states = p.units[u.id]?.exercises ?? {}
    for (const [, st] of Object.entries(states)) {
      attempted += 1
      if (st.solvedClean) clean += 1

      const cleanRevisits = (st.revisits ?? []).filter((r) => r.clean).length
      honored += cleanRevisits

      for (const m of st.misconceptionsTriggered) {
        triggered.add(m)
        /*
          Desarmar exige a volta limpa, não a explicação lida.

          Uma armadilha sai de ativada quando o MESMO exercício que a ativou foi
          resolvido de novo, limpo, numa revisita. Ler o porquê não desarma
          nada, e é essa diferença que separa este contador de um contador de
          páginas lidas.
        */
        if (cleanRevisits > 0) disarmed.add(m)
      }
    }
  }

  return {
    firstTry: { clean, attempted },
    disarmed: { count: disarmed.size, total: units.flatMap((u) => u.misconceptions).length },
    honoredRevisits: honored,
  }
}

// ---------------------------------------------------------------------------
// Índice de julgamento
// ---------------------------------------------------------------------------

/**
 * A fórmula, como dado, porque a tela a mostra ao lado do número.
 *
 * Um índice sem fórmula visível é uma pontuação: o aluno vê subir e desce sem
 * saber o que mexeu, e passa a perseguir o número. Com a fórmula na tela ele
 * persegue o comportamento que a fórmula descreve, e o comportamento é o
 * produto. É a mesma regra da faixa no ADR-0022.
 *
 * Desligado por padrão, e é decisão: quem não quiser um número não precisa ver
 * nenhum.
 */
export const JUDGMENT_FORMULA = [
  { when: 'resolvido de primeira, sem ativar armadilha', worth: '1' },
  { when: 'resolvido de primeira, com armadilha ativada antes', worth: '0,5' },
  { when: 'resolvido depois da primeira tentativa', worth: '0' },
  { when: 'revisita honrada', worth: 'multiplica a unidade por 1,2' },
  { when: 'revisita falhada', worth: 'devolve a unidade para em curso, e desconta' },
] as const

export interface Judgment {
  value: number
  max: number
  byUnit: Array<{ unitId: string; value: number; max: number; multiplier: number }>
}

export function judgment(units: Unit[], p: Progress): Judgment {
  const byUnit = units.map((u) => {
    const states = p.units[u.id]?.exercises ?? {}
    let value = 0

    for (const [, st] of Object.entries(states)) {
      if (st.solvedClean) value += 1
      else if (st.solved && st.attempts === 1) value += 0.5
    }

    const revisits = Object.values(states).flatMap((st) => st.revisits ?? [])
    const honored = revisits.filter((r) => r.clean).length
    const failed = revisits.length - honored
    const multiplier = honored > 0 && failed === 0 ? 1.2 : 1

    return {
      unitId: u.id,
      value: Math.max(0, value * multiplier - failed),
      max: u.exercises.length,
      multiplier,
    }
  })

  return {
    value: byUnit.reduce((n, u) => n + u.value, 0),
    max: byUnit.reduce((n, u) => n + u.max, 0),
    byUnit,
  }
}
