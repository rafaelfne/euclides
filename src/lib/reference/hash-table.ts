import type { TraceStep } from '../socratic'

/**
 * Reference implementation. It exists to GENERATE the correct trace, so the
 * app never stores an answer key an author typed by hand, the answer is
 * computed, which is why the exercise cannot drift from the pseudocode.
 */

const LOAD_LIMIT = 0.75
const h = (k: number) => k

type Bucket = Array<[number, string]>

function resize(table: { m: number; buckets: Bucket[] }, newM: number) {
  const pairs = table.buckets.flat()
  table.m = newM
  table.buckets = Array.from({ length: newM }, (): Bucket => [])
  // REINSERTS. Copying buckets would break the position invariant for every
  // pair at once, and only partially, which is what makes that bug survive
  // manual testing.
  for (const [k, v] of pairs) table.buckets[h(k) % table.m]!.push([k, v])
}

const render = (buckets: Bucket[]) =>
  buckets
    .map((b, i) => (b.length ? `${i}:[${b.map((p) => p[0]).join(',')}]` : null))
    .filter(Boolean)
    .join(' ') || '—'

/**
 * Chaining insertion, one step per key. Parameterised so a figure can be
 * checked against the same implementation without reusing the exercise's
 * keys: a figure that draws a state of `hash.e1` hands the student its answer.
 */
export function chainingInsert(keys: number[], m: number): TraceStep[] {
  const table = { m, n: 0, buckets: Array.from({ length: m }, (): Bucket => []) }
  const steps: TraceStep[] = []
  for (const key of keys) {
    let resized = false
    if ((table.n + 1) / table.m > LOAD_LIMIT) { resize(table, table.m * 2); resized = true }
    const i = h(key) % table.m
    const existing = table.buckets[i]!.find((p) => p[0] === key)
    if (existing) { existing[1] = `v${key}` } else { table.buckets[i]!.push([key, `v${key}`]); table.n++ }
    steps.push({
      step: String(steps.length + 1),
      key: String(key),
      rehash: resized ? 'sim' : 'não',
      n: String(table.n),
      m: String(table.m),
      alpha: (table.n / table.m).toFixed(3).replace('.', ','),
      content: render(table.buckets),
    })
  }
  return steps
}

/** The trace for exercise `hash.e1`: m=4, h(k)=k, insert 3,7,11,4,8. */
export const chainingInsertTrace = (): TraceStep[] => chainingInsert([3, 7, 11, 4, 8], 4)

/** Registry the content references by name, so content stays data. Ids are
 * prefixed by unit so two units cannot silently claim the same generator. */
export const hashReferenceGenerators: Record<string, () => TraceStep[]> = {
  'hash.chaining-insert-trace': chainingInsertTrace,
}
