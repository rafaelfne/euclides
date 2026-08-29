/**
 * Embaralhamento determinístico por semente.
 *
 * A ordem autorada das alternativas era um vazamento: a correta estava na
 * primeira posição em 100% dos 54 exercícios. Um aluno descobre isso em dez
 * minutos e passa a acertar tudo sem ler nada, o que zera o sinal do painel
 * de lacunas, que é o coração do produto.
 *
 * Determinístico por dois motivos: o HTML é gerado no build e precisa bater
 * com o cliente, e a ordem não pode mudar a cada recarga, senão o aluno
 * sorteia até cair numa disposição que ele reconhece.
 */
function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = [...items]
  let state = hash(seed) || 1
  for (let i = out.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const j = state % (i + 1)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}
