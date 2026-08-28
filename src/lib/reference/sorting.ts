import type { TraceStep } from '../socratic'

/**
 * Reference implementation. It exists to GENERATE the correct trace, so the
 * app never stores an answer key an author typed by hand.
 *
 * Elements are written `<chave><etiqueta>`: the key is what the comparator
 * sees, the letter is where the element came from. The letter is the whole
 * point — with equal keys, only it reveals which side the merge took, and
 * that is where stability lives.
 */

type Item = { key: number; tag: string }

const parse = (s: string): Item => ({ key: Number(s.slice(0, -1)), tag: s.slice(-1) })
const show = (i: Item) => `${i.key}${i.tag}`
const showAll = (items: Item[]) => (items.length ? items.map(show).join(' ') : 'vazio')

const LEFT = ['2a', '5b', '5c'].map(parse)
const RIGHT = ['1d', '5e', '7f'].map(parse)

/**
 * The trace for `sorting.e3`: one merge of two already sorted halves.
 *
 * The tie at step 3 is the exercise. Both heads have key 5; a stable merge
 * takes the LEFT one, and a student who takes the right one produces a trace
 * that is sorted, plausible, and not stable — which is exactly the bug the
 * motivating problem describes.
 */
export function mergeStepTrace(): TraceStep[] {
  const left = [...LEFT]
  const right = [...RIGHT]
  const output: Item[] = []
  const steps: TraceStep[] = []

  while (left.length || right.length) {
    const head = (items: Item[]) => (items.length ? show(items[0]!) : '—')
    const candidates = `esq ${head(left)} · dir ${head(right)}`

    // Empate vai para a esquerda: é a linha que decide a estabilidade.
    const takeLeft = left.length > 0 && (right.length === 0 || left[0]!.key <= right[0]!.key)
    const taken = takeLeft ? left.shift()! : right.shift()!
    output.push(taken)

    steps.push({
      step: String(steps.length + 1),
      key: candidates,
      side: takeLeft ? 'esquerda' : 'direita',
      emitted: show(taken),
      output: showAll(output),
    })
  }
  return steps
}

export const sortingReferenceGenerators: Record<string, () => TraceStep[]> = {
  'sorting.merge-step-trace': mergeStepTrace,
}
