/**
 * A rotação da figura de `trees.c3`, conferida contra as duas afirmações que
 * o ciclo faz sobre ela: a altura cai, e a travessia em ordem não muda.
 *
 * A figura declara só a sequência de chegada. Se a derivação errar, o desenho
 * erra junto e não há como perceber olhando: três nós desenhados errado ainda
 * parecem uma árvore. Por isso o teste confere a derivação, e não o SVG.
 */
import { build, heightOf, inorder, place, rebalanceOnce, ROTATION_LABEL } from '../src/lib/bst'
import { units } from '../src/content/index'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? `, ${detail}` : ''}`)
  if (!ok) failures++
}

// --- os quatro casos da AVL, um a um ---------------------------------------

const casos = [
  { nome: 'à direita, tudo à esquerda', keys: [3, 2, 1], kind: 'right', at: 3 },
  { nome: 'à esquerda, tudo à direita', keys: [1, 2, 3], kind: 'left', at: 1 },
  { nome: 'dupla esquerda-direita', keys: [3, 1, 2], kind: 'left-right', at: 3 },
  { nome: 'dupla direita-esquerda', keys: [1, 3, 2], kind: 'right-left', at: 1 },
] as const

for (const caso of casos) {
  const before = build(caso.keys)
  const { root: after, rotation } = rebalanceOnce(before)
  check(`${caso.nome} é reconhecida`, rotation?.kind === caso.kind, `veio ${rotation?.kind}`)
  check(`${caso.nome} pivota no nó certo`, rotation?.at === caso.at, `veio ${rotation?.at}`)
  check(`${caso.nome} baixa a altura`, heightOf(after) < heightOf(before),
    `${heightOf(before)} para ${heightOf(after)}`)
  check(`${caso.nome} preserva a travessia em ordem`,
    inorder(before).join(',') === inorder(after).join(','),
    `${inorder(before)} vira ${inorder(after)}`)
}

// --- o que NÃO deve disparar ----------------------------------------------

check('árvore já equilibrada não pede rotação',
  rebalanceOnce(build([2, 1, 3])).rotation === null)

check('árvore vazia não quebra', rebalanceOnce(null).rotation === null)

/*
  O ancestral desequilibrado mais baixo, e não a raiz.

  Inserir 10, 5, 15, 3, 7, 2, 1 deixa TRÊS nós desequilibrados ao mesmo tempo:
  3, 5 e a raiz 10. A AVL reequilibra o mais baixo, e é o que a figura precisa
  mostrar; rotacionar a raiz aqui daria outra árvore, ainda desequilibrada.
*/
{
  const arvore = build([10, 5, 15, 3, 7, 2, 1])
  const { rotation } = rebalanceOnce(arvore)
  check('reequilibra o ancestral mais baixo, não a raiz', rotation?.at === 3, `veio ${rotation?.at}`)
}

// --- a disposição não sobrepõe nós ----------------------------------------

{
  const nodes = place(build([5, 3, 8, 2, 4, 7, 9]))
  const posicoes = nodes.map((n) => `${n.x},${n.y}`)
  check('cada nó ocupa uma posição só', new Set(posicoes).size === posicoes.length)
}

// --- todo tipo de rotação tem rótulo --------------------------------------

check('os quatro tipos têm rótulo em pt-BR',
  Object.values(ROTATION_LABEL).every((l) => l.length > 0 && !/[a-z]-[a-z]/.test(l)))

// --- o conteúdo real ------------------------------------------------------

const comRotacao = units.flatMap((u) => u.cycles).filter((c) => c.figure?.kind === 'rotation')
check('existe figura de rotação no conteúdo', comRotacao.length > 0)

for (const c of comRotacao) {
  const f = c.figure as Extract<NonNullable<typeof c.figure>, { kind: 'rotation' }>
  const before = build(f.keys)
  const { root: after, rotation } = rebalanceOnce(before)
  check(`${c.id}: a sequência declarada desequilibra`, rotation !== null)
  check(`${c.id}: a altura cai`, heightOf(after) < heightOf(before))
  check(`${c.id}: a ordem fica`, inorder(before).join(',') === inorder(after).join(','))
}

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas passaram\n')
process.exit(failures ? 1 : 0)
