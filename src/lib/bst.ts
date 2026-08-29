/**
 * A árvore de busca das figuras, e a rotação que a reequilibra.
 *
 * Duas figuras constroem árvore a partir de uma sequência de chaves, e as duas
 * precisam medir altura e dispor os nós do mesmo jeito. Com a construção
 * duplicada em cada componente, uma correção numa cairia fora da outra, e as
 * duas figuras passariam a afirmar coisas diferentes sobre a mesma estrutura.
 *
 * A rotação vive aqui pelo mesmo motivo do ADR-0017: o conteúdo declara a
 * sequência de chegada, e o desequilíbrio, a rotação escolhida e as duas
 * travessias saem daqui. Trocar uma chave no conteúdo move o desenho sozinho,
 * e o desenho não tem como discordar do dado.
 */
export type BstNode = { key: number; left: BstNode | null; right: BstNode | null }

export function insert(root: BstNode | null, key: number): BstNode {
  if (!root) return { key, left: null, right: null }
  if (key < root.key) return { ...root, left: insert(root.left, key) }
  if (key > root.key) return { ...root, right: insert(root.right, key) }
  return root
}

export function build(keys: readonly number[]): BstNode | null {
  let root: BstNode | null = null
  for (const k of keys) root = insert(root, k)
  return root
}

export const heightOf = (n: BstNode | null): number =>
  n ? 1 + Math.max(heightOf(n.left), heightOf(n.right)) : -1

export function inorder(n: BstNode | null): number[] {
  if (!n) return []
  return [...inorder(n.left), n.key, ...inorder(n.right)]
}

export type Placed = { key: number; x: number; y: number; parent: { x: number; y: number } | null }

/**
 * Coluna pela ordem simétrica, linha pela profundidade, a disposição clássica,
 * e a única em que a árvore degenerada fica visivelmente diagonal.
 */
export function place(root: BstNode | null): Placed[] {
  const column = new Map<number, number>()
  let next = 0
  const walk = (n: BstNode | null) => {
    if (!n) return
    walk(n.left)
    column.set(n.key, next++)
    walk(n.right)
  }
  walk(root)

  const nodes: Placed[] = []
  const visit = (n: BstNode | null, depth: number, parent: BstNode | null) => {
    if (!n) return
    nodes.push({
      key: n.key,
      x: column.get(n.key)!,
      y: depth,
      parent: parent ? { x: column.get(parent.key)!, y: depth - 1 } : null,
    })
    visit(n.left, depth + 1, n)
    visit(n.right, depth + 1, n)
  }
  visit(root, 0, null)
  return nodes
}

export type RotationKind = 'right' | 'left' | 'left-right' | 'right-left'

/** Rótulo exaustivo por tipo: uma rotação nova não compila até ser nomeada. */
export const ROTATION_LABEL: Record<RotationKind, string> = {
  right: 'rotação à direita',
  left: 'rotação à esquerda',
  'left-right': 'rotação dupla, esquerda e depois direita',
  'right-left': 'rotação dupla, direita e depois esquerda',
}

export interface Rotation {
  /** A chave do nó desequilibrado, o que a rotação toma como pivô. */
  at: number
  kind: RotationKind
}

const rotateRight = (n: BstNode): BstNode => {
  const l = n.left!
  return { ...l, right: { ...n, left: l.right } }
}

const rotateLeft = (n: BstNode): BstNode => {
  const r = n.right!
  return { ...r, left: { ...n, right: r.left } }
}

const balance = (n: BstNode) => heightOf(n.left) - heightOf(n.right)

/**
 * A primeira rotação que a árvore pede, de baixo para cima.
 *
 * É a ordem que a AVL usa: quem reequilibra é o ancestral desequilibrado mais
 * baixo, e não a raiz. `null` quando a árvore já satisfaz a invariante, e a
 * checagem `figura` reprova conteúdo que caia nesse caso — uma figura de
 * rotação sobre árvore equilibrada não mostra rotação nenhuma.
 */
export function rebalanceOnce(root: BstNode | null): { root: BstNode | null; rotation: Rotation | null } {
  const fix = (n: BstNode | null): { node: BstNode | null; rotation: Rotation | null } => {
    if (!n) return { node: n, rotation: null }

    const l = fix(n.left)
    if (l.rotation) return { node: { ...n, left: l.node }, rotation: l.rotation }

    const r = fix(n.right)
    if (r.rotation) return { node: { ...n, right: r.node }, rotation: r.rotation }

    const bf = balance(n)
    if (bf > 1) {
      if (balance(n.left!) < 0) {
        return { node: rotateRight({ ...n, left: rotateLeft(n.left!) }), rotation: { at: n.key, kind: 'left-right' } }
      }
      return { node: rotateRight(n), rotation: { at: n.key, kind: 'right' } }
    }
    if (bf < -1) {
      if (balance(n.right!) > 0) {
        return { node: rotateLeft({ ...n, right: rotateRight(n.right!) }), rotation: { at: n.key, kind: 'right-left' } }
      }
      return { node: rotateLeft(n), rotation: { at: n.key, kind: 'left' } }
    }
    return { node: n, rotation: null }
  }

  const { node, rotation } = fix(root)
  return { root: node, rotation }
}
