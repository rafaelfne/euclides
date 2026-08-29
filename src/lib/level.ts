import type { Progress, Unit } from '@/content/schema'

/**
 * Os quatro estados de uma unidade, e a faixa que sai deles.
 *
 * Tudo aqui é DERIVADO do progresso que já existe. Não há campo novo, não há
 * pontuação e não há percentual: um percentual de conclusão mediria quanto foi
 * visitado, e visitar não é a coisa que este app afirma medir.
 *
 * O teste do princípio 2 vale para cada estado: `dominada` exige resolver na
 * PRIMEIRA tentativa os exercícios do critério, então quem acertou na quarta
 * continua em curso. Nenhum estado sobe por insistência, por tempo de tela ou
 * por leitura. Ver ADR-0022.
 */
export type UnitState = 'nao-visitada' | 'em-curso' | 'dominada' | 'consolidada'

export const UNIT_STATE_LABEL: Record<UnitState, string> = {
  'nao-visitada': 'não visitada',
  'em-curso': 'em curso',
  dominada: 'dominada',
  consolidada: 'consolidada',
}

/** O que falta para sair deste estado, em uma linha, sempre visível. */
export const UNIT_STATE_RULE: Record<UnitState, string> = {
  'nao-visitada': 'nenhum exercício tentado ainda',
  'em-curso': 'falta resolver na primeira tentativa os exercícios do critério',
  dominada: 'os exercícios do critério saíram na primeira tentativa',
  consolidada: 'a revisita foi honrada depois do intervalo',
}

const MS_PER_DAY = 86_400_000

export function unitState(unit: Unit, p: Progress, now: number): UnitState {
  const exercises = p.units[unit.id]?.exercises ?? {}
  if (!Object.keys(exercises).length) return 'nao-visitada'

  const criterion = unit.mastery.requiresClean.map((id) => exercises[id])
  if (!criterion.every((st) => st?.solvedClean)) return 'em-curso'

  /*
    Consolidada é dominada mais tempo mais uma volta limpa.

    O intervalo sozinho não consolida nada: esperar não é estudar, e um estado
    que sobe pelo relógio é a gamificação que o princípio 2 proíbe. O que
    consolida é ter voltado DEPOIS do intervalo e resolvido de novo sem ativar
    armadilha, e é `attempts` acima do mínimo com `solvedClean` intacto que
    registra isso.
  */
  const consolidated = criterion.every((st) => {
    if (!st) return false
    const days = (now - new Date(st.lastVisited).getTime()) / MS_PER_DAY
    return st.attempts > 1 && days < unit.mastery.revisitIntervalDays
  })

  return consolidated ? 'consolidada' : 'dominada'
}

// ---------------------------------------------------------------------------
// A faixa
// ---------------------------------------------------------------------------

/**
 * A faixa nomeia QUEM a pessoa já consegue ser, em inglês.
 *
 * "nível 3" não diz nada e convida a subir por subir. A escada anterior era em
 * português e dois dos cinco nomes não existiam: "traçador" em pt-BR é um
 * instrumento de marcação e "árbitro" é de esporte. Em inglês o mesmo formato
 * custa menos, porque `-er` e `-ist` são produtivos: "code tracer" se lê sem
 * esforço mesmo não sendo cargo de ninguém, e "traçador" não se lê.
 *
 * O inglês aqui segue a regra do glossário e não a exceção dela, a mesma que
 * põe `bucket` e `open addressing` na tela: a forma canônica é a que o aluno
 * encontra no mundo. O ADR-0007 governa prosa autorada, não termo canônico.
 *
 * "big-O analyst" foi descartado: o glossário já registra `big O` como apelido
 * de `notação O`, e uma palavra pertence a uma coisa só. ADR-0029.
 *
 * A regra de cada faixa aparece ao lado do nome, sempre, para que ninguém
 * precise adivinhar o que falta.
 */
export type BandId =
  | 'code-reader'
  | 'code-tracer'
  | 'complexity-analyst'
  | 'code-reviewer'
  | 'design-reviewer'

export interface Band {
  id: BandId
  name: string
  /**
   * O que a pessoa já consegue fazer, e não quais unidades ela completou.
   *
   * As duas coisas estavam na mesma frase, e a frase dizia só a segunda:
   * "metade das unidades dominadas" é um checklist de progresso, e o ADR-0022
   * afirmava que a faixa nomeia uma capacidade. O nome carregava a capacidade
   * sozinho, que é o número disfarçado que este ADR existe para impedir.
   *
   * Cada regra sai do `learningObjective` das unidades que a faixa exige.
   * `scripts/test-level.ts` confere que as cinco declaram as duas frases e que
   * elas não são a mesma.
   */
  rule: string
  /** O que a faixa exige. É o checklist, e ele continua visível ao lado. */
  requires: string
  /** Devolve as unidades que ainda faltam para alcançar esta faixa. */
  missing: (state: (unitId: string) => UnitState, units: Unit[]) => string[]
}

const dominated = (s: UnitState) => s === 'dominada' || s === 'consolidada'

export const BANDS: Band[] = [
  {
    id: 'code-reader',
    name: 'code reader',
    rule: 'nenhuma capacidade verificada ainda; a faixa só sobe com exercício resolvido na primeira tentativa',
    requires: 'nada, é onde todo mundo começa',
    missing: () => [],
  },
  {
    id: 'code-tracer',
    name: 'code tracer',
    rule: 'dizer o que um trecho de código faz, quantas vezes o laço dele roda e o que ele devolve nas entradas de fronteira, sem executar',
    requires: 'a unidade 01 dominada',
    missing: (state) => (dominated(state('tracing')) ? [] : ['tracing']),
  },
  {
    id: 'complexity-analyst',
    name: 'complexity analyst',
    rule: 'escrever uma afirmação de custo com as partes que a tornam verificável, e construir a entrada em que cada parte omitida inverteria a conclusão',
    requires: 'as unidades 01 e 02 dominadas',
    missing: (state) => ['tracing', 'asymptotics'].filter((id) => !dominated(state(id))),
  },
  {
    id: 'code-reviewer',
    name: 'code reviewer',
    rule: 'diante de uma estrutura em código que nunca viu, dizer qual implementação o custo observado denuncia e prever quando ela degrada',
    requires: 'metade das unidades dominadas, incluindo tabelas hash e ordenação',
    missing: (state, units) => {
      const obrigatorias = ['hash', 'sorting'].filter((id) => !dominated(state(id)))
      const total = units.filter((u) => dominated(state(u.id))).length
      // Quando faltam obrigatórias, elas próprias respondem o que falta; senão,
      // o que falta é quantidade, e a tela diz quantas.
      return obrigatorias.length ? obrigatorias
        : total >= Math.ceil(units.length / 2) ? []
          : [`mais ${Math.ceil(units.length / 2) - total}`]
    },
  },
  {
    id: 'design-reviewer',
    name: 'design reviewer',
    rule: 'diante de um requisito em português, sem estrutura sugerida, produzir a justificativa de escolha inteira e dizer em que cenário ela é a errada',
    requires: 'as oito unidades dominadas, com a síntese consolidada',
    missing: (state, units) => {
      const faltam = units.filter((u) => !dominated(state(u.id))).map((u) => u.id)
      if (faltam.length) return faltam
      return state('synthesis') === 'consolidada' ? [] : ['synthesis consolidada']
    },
  },
]

export interface Level {
  band: Band
  /** A próxima faixa e o que falta para ela. `null` na última. */
  next: { band: Band; missing: string[] } | null
}

export function level(units: Unit[], p: Progress, now: number): Level {
  const cache = new Map<string, UnitState>()
  const state = (unitId: string): UnitState => {
    if (!cache.has(unitId)) {
      const u = units.find((x) => x.id === unitId)
      cache.set(unitId, u ? unitState(u, p, now) : 'nao-visitada')
    }
    return cache.get(unitId)!
  }

  let reached = BANDS[0]!
  for (const b of BANDS) {
    if (!b.missing(state, units).length) reached = b
    else break
  }

  const at = BANDS.indexOf(reached)
  const next = BANDS[at + 1]
  return {
    band: reached,
    next: next ? { band: next, missing: next.missing(state, units) } : null,
  }
}
