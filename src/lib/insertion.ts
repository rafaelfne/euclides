/**
 * Insertion sort rodada a rodada, para a figura de `sorting.c2`.
 *
 * O que o ciclo afirma não é "insertion sort é O(n²)": é que **o mesmo código**
 * custa O(n) numa coleção quase ordenada e O(n²) numa invertida, e que nenhuma
 * linha dele detecta a diferença. Uma figura que mostrasse só o algoritmo
 * ordenando não afirma isso; precisa de duas entradas e do contador de
 * deslocamentos ao lado.
 *
 * Por isso a saída registra `shifts` por rodada e não só o vetor: o laço
 * interno é onde mora o custo, e é ele que se quer ver quase não rodando.
 */
export interface InsertionRound {
  /** O índice do elemento sendo encaixado nesta rodada. */
  i: number
  /** O valor que saiu para abrir espaço. */
  taken: number
  /** Quantas vezes o laço interno correu nesta rodada. */
  shifts: number
  /** Onde o valor encaixou. Por posição, e não por valor: com repetidos, o
   *  realce escolhido por valor acende a caixa errada. */
  placedAt: number
  /** O vetor no fim da rodada. */
  values: number[]
  /** Onde a parte ordenada termina no fim da rodada. */
  sortedUpTo: number
}

export function insertionRounds(input: readonly number[]): InsertionRound[] {
  const a = [...input]
  const rounds: InsertionRound[] = []

  for (let i = 1; i < a.length; i++) {
    const x = a[i]!
    let j = i - 1
    let shifts = 0
    while (j >= 0 && a[j]! > x) {
      a[j + 1] = a[j]!
      j -= 1
      shifts += 1
    }
    a[j + 1] = x
    rounds.push({ i, taken: x, shifts, placedAt: j + 1, values: [...a], sortedUpTo: i })
  }

  return rounds
}

export const totalShifts = (rounds: InsertionRound[]) =>
  rounds.reduce((sum, r) => sum + r.shifts, 0)
