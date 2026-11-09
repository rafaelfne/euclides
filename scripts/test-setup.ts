/**
 * A página de preparo da máquina, conferida.
 *
 * Três perguntas:
 *   1. todo número que o código da página afirma sai da referência, e não de
 *      quem digitou o teste;
 *   2. nenhum bloco entrega gabarito: o teste do carrinho vai com `...`, e o
 *      passo dele só vem depois do exercício;
 *   3. toda referência a ciclo ou exercício existe, e o texto segue as regras
 *      da trilha (sem travessão, sem aspas curvas).
 */
import { setupGuides } from '../src/content/setup'
import { allUnits } from '../src/content/index'
import { backward, cartGraph, CART_INPUTS, forward, type Graph } from '../src/lib/reference/ai'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? `, ${detail}` : ''}`)
  if (!ok) failures++
}

console.log('\n  preparo da máquina\n')

const ai = setupGuides.find((g) => g.unitId === 'ai')!
const files = ai.steps.flatMap((s) => s.blocks.filter((b) => b.kind === 'file').map((b) => ({ step: s, source: b.source })))
const all = files.map((f) => f.source).join('\n')

// 1. Os números do teste vêm da referência.
const neuron: Graph = [
  { name: 'w', op: 'input', inputs: [] },
  { name: 'x', op: 'input', inputs: [] },
  { name: 'b', op: 'input', inputs: [] },
  { name: 'wx', op: 'mul', inputs: ['w', 'x'] },
  { name: 'y', op: 'add', inputs: ['wx', 'b'] },
]
const nIn = { w: 2, x: 7, b: 9 }
const nVal = forward(neuron, nIn)
const nGrad = backward(neuron, nVal, 'y').grad
check('o neurônio do teste usa as entradas do exemplo de ai.c5',
  all.includes('w, x, b = Value(2), Value(7), Value(9)'))
check('y.data é o que a passada para frente dá',
  all.includes(`assert y.data == ${nVal.y}`), `referência ${nVal.y}`)
check('os gradients de w, x e b são os da passada para trás',
  all.includes(`(w.grad, x.grad, b.grad) == (${nGrad.w}, ${nGrad.x}, ${nGrad.b})`),
  `referência ${nGrad.w}, ${nGrad.x}, ${nGrad.b}`)

const square: Graph = [
  { name: 'a', op: 'input', inputs: [] },
  { name: 'y', op: 'mul', inputs: ['a', 'a'] },
]
const sGrad = backward(square, forward(square, { a: 8 }), 'y').grad
check('o a × a com a = 8 dá o gradient que a referência soma',
  all.includes('a = Value(8)') && all.includes(`assert a.grad == ${sGrad.a}`), `referência ${sGrad.a}`)

const cycleText = allUnits.find((u) => u.id === 'ai')!.cycles.find((c) => c.id === 'ai.c5')!.workedExample.problem
check('os números do neurônio estão na prosa de ai.c5, então o teste não antecipa nada',
  ['w = 2', 'x = 7', 'b = 9', '23', 'a = 8'].every((n) => cycleText.includes(n)))

// 2. Nada de gabarito.
const cartValues = forward(cartGraph, CART_INPUTS)
const cartGrad = backward(cartGraph, cartValues, 'total').grad
const cartStep = ai.steps.find((s) => s.blocks.some((b) => b.kind === 'file' && b.source.includes('test_cart')))!
const cartSource = cartStep.blocks.map((b) => b.source).join('\n')
check('o teste do carrinho usa as entradas de ai.e5',
  cartSource.includes(`Value(${CART_INPUTS['preço']}), Value(${CART_INPUTS.quantidade})`) &&
    cartSource.includes(`Value(${CART_INPUTS.frete}), Value(${CART_INPUTS.fator})`))
check('as quatro asserções do carrinho estão em branco',
  (cartSource.match(/\.grad == \.\.\.$/gm) ?? []).length === 4)
const leaked = Object.entries(cartGrad)
  .filter(([k]) => ['preço', 'quantidade', 'frete', 'fator'].includes(k))
  .filter(([, g]) => new RegExp(`== ${g}\\b`).test(cartSource))
check('nenhum gradient do carrinho aparece no bloco dele', leaked.length === 0, leaked.map(([k]) => k).join(', '))
check('o passo do carrinho declara que vem depois de ai.e5', cartStep.after === 'ai.e5')
const cartIndex = ai.steps.indexOf(cartStep)
check('o passo do carrinho é o último com código, depois do micrograd escrito',
  ai.steps.slice(cartIndex + 1).every((s) => s.blocks.length === 0) &&
    ai.steps.findIndex((s) => s.build) < cartIndex)

// 3. Referências e texto.
for (const guide of setupGuides) {
  const unit = allUnits.find((u) => u.id === guide.unitId)
  check(`${guide.unitId}: a unidade existe`, Boolean(unit))
  if (!unit) continue
  const cycleIds = new Set(unit.cycles.map((c) => c.id))
  const refs = guide.steps.flatMap((s) => [...(s.cycles ?? []), ...(s.build ?? []).map((b) => b.cycle)])
  const missing = refs.filter((r) => !cycleIds.has(r))
  check(`${guide.unitId}: todo ciclo citado existe`, missing.length === 0, missing.join(', '))
  const afters = guide.steps.map((s) => s.after).filter((a): a is string => Boolean(a))
  const orphan = afters.filter((a) => !unit.cycles.some((c) => c.exerciseId === a))
  check(`${guide.unitId}: todo exercício citado pertence a um ciclo`, orphan.length === 0, orphan.join(', '))

  const prose = [guide.title, guide.summary, ...guide.lede, guide.next.text,
    ...guide.steps.flatMap((s) => [s.title, s.why, s.doneWhen, ...(s.build ?? []).map((b) => b.text)])]
  const dash = prose.filter((p) => p.includes('—'))
  check(`${guide.unitId}: nenhum travessão`, dash.length === 0, dash[0])
  const curly = prose.filter((p) => /[“”‘’]/.test(p))
  check(`${guide.unitId}: nenhuma aspa curva`, curly.length === 0, curly[0])
  const ticks = prose.filter((p) => (p.match(/`/g) ?? []).length % 2)
  check(`${guide.unitId}: toda crase fecha`, ticks.length === 0, ticks[0])
  check(`${guide.unitId}: o link do fim é https`, guide.next.href.startsWith('https://'))
}

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  tudo certo\n')
process.exit(failures ? 1 : 0)
