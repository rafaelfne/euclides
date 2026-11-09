import type { TraceStep } from '../socratic'

/**
 * Reference implementation. It exists to GENERATE the correct trace.
 *
 * Sem balanceamento de propósito: o traço mostra o caminho e a altura, e é a
 * partir dessas duas colunas que o aluno constrói sozinho a sequência que
 * degenera a árvore. Uma implementação balanceada esconderia exatamente o que
 * a unidade quer expor.
 */

type Node = { key: number; left: Node | null; right: Node | null }

const SEQUENCE = [50, 30, 70, 20, 40, 35]

const heightOf = (n: Node | null): number => (n ? 1 + Math.max(heightOf(n.left), heightOf(n.right)) : -1)

/** The trace for `trees.e1`: inserir 50, 30, 70, 20, 40 e 35 numa árvore de busca vazia. */
export function bstInsertTrace(): TraceStep[] {
  let root: Node | null = null
  const steps: TraceStep[] = []

  for (const key of SEQUENCE) {
    let comparisons = 0
    let parent: Node | null = null
    let side = ''

    let current = root
    let existing: Node | null = null
    while (current) {
      comparisons += 1
      parent = current
      if (key < current.key) { side = 'esquerda'; current = current.left }
      else if (key > current.key) { side = 'direita'; current = current.right }
      else { existing = current; break }
    }

    // Chave igual não desce para lado nenhum: o contrato substitui o valor, e a
    // invariante "toda da direita é maior" continua estrita. Este traço não tem
    // chave repetida nem coluna para valor, então o ramo existe para o gerador
    // obedecer ao mesmo pseudocódigo, não para produzir linha.
    if (existing) throw new Error(`trees.e1: chave ${key} repetida, o traço não tem como mostrar a substituição`)

    const node: Node = { key, left: null, right: null }
    if (!parent) root = node
    else if (side === 'esquerda') parent.left = node
    else parent.right = node

    steps.push({
      step: String(steps.length + 1),
      key: String(key),
      comparisons: String(comparisons),
      parent: parent ? String(parent.key) : 'raiz',
      side: parent ? side : 'raiz',
      height: String(heightOf(root)),
    })
  }
  return steps
}

export const treesReferenceGenerators: Record<string, () => TraceStep[]> = {
  'trees.bst-insert-trace': bstInsertTrace,
}
