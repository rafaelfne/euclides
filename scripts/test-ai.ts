/**
 * A unidade `ai`, conferida pelo lado da referência e pelo lado do exercício.
 *
 * Quatro perguntas:
 *   1. o gabarito do carrinho é o que a conta dá, e a ordem respeita a
 *      invariante da passada para trás;
 *   2. as duas técnicas da unidade concordam: o gradient que a passada para
 *      trás escreve é o que se mede empurrando cada número um pouco;
 *   3. todo número que um exercício afirma sai de uma conta feita aqui, e não
 *      de quem digitou o enunciado;
 *   4. a unidade real cumpre o que nenhuma checagem do validador cobre.
 *
 * A unidade fica fora de `units` (spec, decisão 7) e dentro de `allUnits`, que
 * é o que o validador lê.
 */
import {
  backward, backwardOrder, backwardTrace, cartBackwardTrace, cartGraph, CART_INPUTS,
  forward, numericGradient, ptNumber, type Graph,
} from '../src/lib/reference/ai'
import { referenceGenerators } from '../src/lib/reference'
import { aiExercises } from '../src/content/units/ai/exercises'
import { aiUnit } from '../src/content/units/ai'
import { allUnits, units } from '../src/content/index'
import { toPythonOrNull, untranslatedPython } from '../src/lib/transliterate-python'
import type { Exercise } from '../src/content/schema'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? `, ${detail}` : ''}`)
  if (!ok) failures++
}
const close = (a: number, b: number, tol = 1e-4) => Math.abs(a - b) < tol

// ---------------------------------------------------------------------------
// 1. O carrinho
// ---------------------------------------------------------------------------

const trace = cartBackwardTrace()
console.log('\n  carrinho: total = (preço × quantidade + frete) × fator, com 4, 5, 6 e 3\n')
console.log('  ' + ['ordem', 'nó', 'valor', 'impacto local', 'gradient'].join('\t'))
for (const s of trace) console.log('  ' + [s.step, s.key, s.value, s.local, s.grad].join('\t'))
console.log('')

check('o gerador está registrado com id prefixado pela unidade',
  referenceGenerators['ai.cart-backward-trace'] === cartBackwardTrace)

const row = (key: string) => trace.find((s) => s.key === key)!
check('a passada para frente dá subtotal 20, base 26 e total 78',
  row('subtotal').value === '20' && row('base').value === '26' && row('total').value === '78')
check('o total começa com gradient 1 e impacto local 1, a convenção declarada',
  row('total').grad === '1' && row('total').local === '1')
check('fator vale 3 e tem gradient 26; base vale 26 e tem gradient 3',
  row('fator').value === '3' && row('fator').grad === '26' && row('base').value === '26' && row('base').grad === '3')
check('frete e subtotal: impacto local 1, gradient 3',
  ['frete', 'subtotal'].every((k) => row(k).local === '1' && row(k).grad === '3'))
check('preço: impacto local 5 (a quantidade), gradient 15',
  row('preço').local === '5' && row('preço').grad === '15')
check('quantidade: impacto local 4 (o preço), gradient 12',
  row('quantidade').local === '4' && row('quantidade').grad === '12')

check('a ordem é a topológica invertida, total primeiro',
  trace.map((s) => s.key).join(' ') === 'total fator base frete subtotal quantidade preço',
  trace.map((s) => s.key).join(' '))

const order = backwardOrder(cartGraph, 'total')
check('todo nó aparece depois de todos os nós que usam o valor dele',
  cartGraph.every((n) => n.inputs.every((i) => order.indexOf(n.name) < order.indexOf(i))))

const editable = ['value', 'local', 'grad'] as const
check('toda célula editável é um inteiro que o aluno digita, sem travessão nem símbolo',
  trace.every((s) => editable.every((c) => /^\d+$/.test(s[c]!))),
  trace.map((s) => editable.map((c) => s[c]).join('/')).join(' '))

check('impacto local e gradient diferem a partir do passo 4, onde mora a armadilha',
  trace.slice(0, 3).every((s) => s.local === s.grad) && trace[3]!.local !== trace[3]!.grad)

// ---------------------------------------------------------------------------
// 2. As duas técnicas concordam
// ---------------------------------------------------------------------------

const values = forward(cartGraph, CART_INPUTS)
const { grad } = backward(cartGraph, values, 'total')
for (const name of Object.keys(CART_INPUTS)) {
  const measured = numericGradient(cartGraph, CART_INPUTS, 'total', name, 1e-6)
  check(`gradient numérico de ${name} (${measured.toFixed(4)}) bate com o da passada para trás (${grad[name]})`,
    close(measured, grad[name]!))
}

// O nó usado duas vezes: é aqui que o += importa.
const square: Graph = [
  { name: 'a', op: 'input', inputs: [] },
  { name: 'y', op: 'mul', inputs: ['a', 'a'] },
]
const sv = forward(square, { a: 3 })
const summed = backward(square, sv, 'y').grad.a!
const overwritten = backward(square, sv, 'y', { overwrite: true }).grad.a!
const measuredSquare = numericGradient(square, { a: 3 }, 'y', 'a', 1e-6)
check('y = a × a com a = 3: somando, a recebe 6, e o empurrão mede 6',
  summed === 6 && close(measuredSquare, 6), `${summed} / ${measuredSquare}`)
check('y = a × a: escrevendo com =, a recebe 3, e a armadilha grad-sobrescrito é real',
  overwritten === 3, String(overwritten))
check('a pergunta socrática de grad-sobrescrito confere: a de 3 para 3,01 muda y em 6,01 por unidade',
  close(((3.01 * 3.01) - 9) / 0.01, 6.01))

const overwrittenCart = backward(cartGraph, values, 'total', { overwrite: true }).grad
check('no carrinho, = e += dão o mesmo gradient: nenhum nó é usado duas vezes, e o defeito passa',
  Object.keys(grad).every((k) => grad[k] === overwrittenCart[k]))

let refused = false
try { backwardTrace(square, { a: 3 }, 'y') } catch { refused = true }
check('o gerador de linhas recusa nó usado duas vezes, em vez de escolher um nó de cima', refused)

// O mecanismo de c7: sem zerar, a segunda passada parte do que a primeira deixou.
const round2 = backward(cartGraph, values, 'total', { carry: grad }).grad
check('sem zerar, a segunda passada dobra o gradient de toda entrada (o mecanismo de ai.c7)',
  Object.keys(CART_INPUTS).every((k) => round2[k] === 2 * grad[k]!))

/*
  O laço de treino, em três ordens, sobre o loss de c6 e c7: (w − 10)², com o
  peso em 14 e learning rate 0,1. O loss é um grafo de verdade, d × d com d
  usado duas vezes, para o gradient sair da mesma passada para trás que gera o
  gabarito, e não de uma fórmula escrita aqui.

    zerar, backward, passo   o laço certo
    backward, zerar, passo   ai.e7: o passo lê o gradient já zerado
    backward, passo          ai.c7: nada zera, e as rodadas se somam
*/
const lossGraph: Graph = [
  { name: 'w', op: 'input', inputs: [] },
  { name: 'menosDez', op: 'input', inputs: [] },
  { name: 'd', op: 'add', inputs: ['w', 'menosDez'] },
  { name: 'loss', op: 'mul', inputs: ['d', 'd'] },
]
type LoopOrder = 'zero-backward-step' | 'backward-zero-step' | 'never-zero'
const train = (order: LoopOrder, rounds: number, w0 = 14, lr = 0.1) => {
  let w = w0, acc = 0
  const weights: number[] = [], losses: number[] = [], computed: number[] = []
  for (let r = 0; r < rounds; r++) {
    if (order === 'zero-backward-step') acc = 0
    const v = forward(lossGraph, { w, menosDez: -10 })
    computed.push(backward(lossGraph, v, 'loss').grad.w!)
    acc = backward(lossGraph, v, 'loss', { carry: { w: acc } }).grad.w!
    if (order === 'backward-zero-step') acc = 0
    w -= lr * acc
    weights.push(w)
    losses.push(forward(lossGraph, { w, menosDez: -10 }).loss!)
  }
  return { weights, losses, computed }
}

const lossAt = (w: number) => forward(lossGraph, { w, menosDez: -10 }).loss!
check('o grafo do loss confere: em 14 vale 16, e o gradient do peso no loss é 8 (c6)',
  lossAt(14) === 16 && backward(lossGraph, forward(lossGraph, { w: 14, menosDez: -10 }), 'loss').grad.w === 8)

const right = train('zero-backward-step', 10)
check('zerando antes de backward, o loss cai a cada rodada',
  right.losses.every((l, i) => l < (i ? right.losses[i - 1]! : 16)), right.losses.map(ptNumber).join(' '))

const e7Loop = train('backward-zero-step', 10)
check('ai.e7: com zeroGrad entre backward e o passo, o peso fica em 14 e o loss em 16 por dez rodadas',
  e7Loop.weights.every((w) => w === 14) && e7Loop.losses.every((l) => l === 16),
  e7Loop.weights.join(' '))

const c7Loop = train('never-zero', 5)
check('ai.c7: sem zerar, os pesos são 13,2, 11,76, 9,968 e 8,18, e os acumulados 8, 14,4, 17,92, 17,856',
  [13.2, 11.76, 9.968, 8.1824].every((w, i) => close(c7Loop.weights[i]!, w))
    && [8, 6.4, 3.52, -0.064].every((g, i) => close(c7Loop.computed[i]!, g)),
  c7Loop.weights.map(ptNumber).join(' '))
check('ai.c7: depois do passo da rodada 5 o loss é 10,5, acima dos 10,24 da rodada 1',
  ptNumber(Number(c7Loop.losses[4]!.toFixed(1))) === '10,5' && close(c7Loop.losses[0]!, 10.24)
    && c7Loop.losses[4]! > c7Loop.losses[0]!, ptNumber(c7Loop.losses[4]!))

// ---------------------------------------------------------------------------
// 3. Os números dos exercícios
// ---------------------------------------------------------------------------

const byId = (id: string) => aiExercises.find((e) => e.id === id)!
const allText = (e: Exercise): string => {
  if (e.kind === 'trace') return e.prompt
  const cs = e.kind === 'choice' ? e.choices : e.consequences
  return [e.prompt, ...cs.map((c) => c.text), ...cs.map((c) => (c.correct ? c.why : ''))].join(' ')
}
const correctText = (e: Exercise) => {
  const cs = e.kind === 'choice' ? e.choices : e.kind === 'bug' ? e.consequences : []
  return cs.find((c) => c.correct)!.text
}
const says = (e: Exercise, n: number) => allText(e).includes(ptNumber(n))

// e0: p = 0,5 × v + 3 × n − 4, compra de 600 reais (v = 6), país novo (n = 1)
const e0 = 0.5 * 6 + 3 * 1 - 4
check(`ai.e0: a pontuação é ${ptNumber(e0)}, e é o que a correta afirma`,
  correctText(byId('ai.e0')).includes(ptNumber(e0)))
check('ai.e0: sem o bias a soma daria 6, o número do distrator',
  says(byId('ai.e0'), 0.5 * 6 + 3 * 1))

// e1: os valores de tanh do enunciado, com três casas
check('ai.e1: tanh(0,2) ≈ 0,197 e tanh(0,3) ≈ 0,291',
  says(byId('ai.e1'), Number(Math.tanh(0.2).toFixed(3))) && says(byId('ai.e1'), Number(Math.tanh(0.3).toFixed(3))))
check('ai.e1: o if seco devolve o mesmo para 0,2 e 0,3, a tanh não',
  Math.sign(0.2) === Math.sign(0.3) && Math.tanh(0.3) - Math.tanh(0.2) > 0.05)

// e2: prazos reais 2 e 4; A previu 5 e 1; B previu 3 e 5
const real = [2, 4], A = [5, 1], B = [3, 5]
const sq = (p: number[]) => p.reduce((s, x, i) => s + (x - real[i]!) ** 2, 0)
const signed = (p: number[]) => p.reduce((s, x, i) => s + (x - real[i]!), 0)
check(`ai.e2: loss de A ${sq(A)}, de B ${sq(B)}, e a soma com sinal de A dá ${signed(A)}`,
  sq(A) === 18 && sq(B) === 2 && signed(A) === 0
    && correctText(byId('ai.e2')).includes('2') && correctText(byId('ai.e2')).includes('18'))

// e3: p = w1·x1 + w2·x2 + b, empurrão de 0,1 em cada
const p3 = (w1: number, w2: number, b: number) => w1 * 1 + w2 * 10 + b
const base3 = p3(4, 0.5, 2)
const moved = { w1: p3(4.1, 0.5, 2), w2: p3(4, 0.6, 2), b: p3(4, 0.5, 2.1) }
check(`ai.e3: p = ${ptNumber(base3)}; empurrando 0,1, w1 leva a ${ptNumber(moved.w1)}, w2 a ${ptNumber(moved.w2)}, b a ${ptNumber(moved.b)}`,
  base3 === 11 && close(moved.w2, 12) && close(moved.w1, 11.1) && close(moved.b, 11.1)
    && correctText(byId('ai.e3')).startsWith('w2') && says(byId('ai.e3'), Number(moved.w2.toFixed(6))))

// e4: tarifa = km × 2; total = tarifa × 1,5; km = 8
const ride: Graph = [
  { name: 'km', op: 'input', inputs: [] },
  { name: 'dois', op: 'input', inputs: [] },
  { name: 'pico', op: 'input', inputs: [] },
  { name: 'tarifa', op: 'mul', inputs: ['km', 'dois'] },
  { name: 'total', op: 'mul', inputs: ['tarifa', 'pico'] },
]
const rideIn = { km: 8, dois: 2, pico: 1.5 }
const rideV = forward(ride, rideIn)
const rideG = backward(ride, rideV, 'total').grad.km!
check(`ai.e4: tarifa ${rideV.tarifa}, total ${rideV.total}, e 1 km a mais sobe o total em ${rideG}`,
  rideV.tarifa === 16 && rideV.total === 24 && close(rideG, 3)
    && close(numericGradient(ride, rideIn, 'total', 'km'), 3)
    && forward(ride, { ...rideIn, km: 9 }).total === 27
    && correctText(byId('ai.e4')).startsWith('3 reais'))

// e6: loss = (w − 3)², w = 5, gradient 4
const loss6 = (w: number) => (w - 3) ** 2
const grad6 = (w: number) => (loss6(w + 1e-6) - loss6(w)) / 1e-6
const step = (w: number, lr: number) => w - lr * 4
check('ai.e6: em w = 5 o loss é 4 e o gradient medido é 4', loss6(5) === 4 && close(grad6(5), 4, 1e-3))
check('ai.e6: com 0,1, w vai a 4,6 e o loss a 2,56', close(step(5, 0.1), 4.6) && close(loss6(step(5, 0.1)), 2.56))
check('ai.e6: com 1,5, w vai a −1 e o loss a 16, o que a correta afirma',
  step(5, 1.5) === -1 && loss6(-1) === 16 && correctText(byId('ai.e6')).includes('−1') && correctText(byId('ai.e6')).includes('16'))
check('ai.e6: com o sinal trocado, w iria a 11 e o loss a 64', 5 + 1.5 * 4 === 11 && loss6(11) === 64)
check('ai.e6: com 0,5, w para em 3, e por isso esse distrator existe', step(5, 0.5) === 3)

// e7: o código e o enunciado
const e7 = byId('ai.e7')
if (e7.kind === 'bug') {
  const lines = e7.code.split('\n')
  const at = (needle: string) => lines.findIndex((l) => l.includes(needle)) + 1
  check('ai.e7: a linha defeituosa é zero_grad, entre backward e a linha que muda o peso',
    e7.faultyLines.length === 1 && lines[e7.faultyLines[0]! - 1]!.includes('zero_grad')
      && at('backward') < e7.faultyLines[0]! && e7.faultyLines[0]! < at('p.data'))
  check('ai.e7: o diff marca a função inteira, e não aponta a linha defeituosa',
    (e7.addedLines ?? []).length === lines.length)
  check('ai.e7: o enunciado não descreve o defeito',
    !/zer|antes|depois|fora|backward/i.test(e7.prompt), e7.prompt)
  check('ai.e7: a correta afirma o que o laço simulado mostra, peso parado e loss igual',
    /Nenhum peso muda/.test(correctText(e7)) && /loss fica igual/.test(correctText(e7)))
}

/*
  e8: o problema motivador, a estimativa de prazo. A rota tem distância 5 (500
  km em centenas), a base é 1 dia e fica fixa, e o ajuste noturno mexe só no
  peso da distância. O postmortem de c8 diz que o passo passou do ponto e não
  diz qual era o ponto; o exercício cobra o ponto. A previsão é um grafo
  distância × peso + base, e o loss outro, para o gradient sair da passada
  para trás.
*/
const distancia = 5, baseDias = 1, real8 = 4
const routeGraph: Graph = [
  { name: 'distancia', op: 'input', inputs: [] },
  { name: 'peso', op: 'input', inputs: [] },
  { name: 'base', op: 'input', inputs: [] },
  { name: 'menosReal', op: 'input', inputs: [] },
  { name: 'produto', op: 'mul', inputs: ['distancia', 'peso'] },
  { name: 'prazo', op: 'add', inputs: ['produto', 'base'] },
  { name: 'd', op: 'add', inputs: ['prazo', 'menosReal'] },
  { name: 'loss', op: 'mul', inputs: ['d', 'd'] },
]
const routeIn = (dist: number, peso: number, base: number, realDias: number) =>
  ({ distancia: dist, peso, base, menosReal: -realDias })
const route = (dist: number, peso: number, base: number, realDias: number) => {
  const v = forward(routeGraph, routeIn(dist, peso, base, realDias))
  const g = backward(routeGraph, v, 'loss').grad
  return { prazo: v.prazo!, loss: v.loss!, gradInLoss: g.peso! }
}
const night = (peso: number) => route(distancia, peso, baseDias, real8)
const e8 = byId('ai.e8')

check('ai.e8: com peso 0,4 a rota prevê 3 dias e o loss é 1; com 1,0 prevê 6 e o loss é 4',
  close(night(0.4).prazo, 3) && close(night(0.4).loss, 1) && close(night(1).prazo, 6) && close(night(1).loss, 4))
check('ai.e8: o enunciado traz distância 5, base 1 e real 4',
  /distância 5/.test(e8.prompt) && /base é 1 dia/.test(e8.prompt) && /levou 4 dias/.test(e8.prompt))
check('ai.e8: o peso que zera o loss é 0,6, e é o que a correta afirma',
  close((real8 - baseDias) / distancia, 0.6) && close(night(0.6).loss, 0) && correctText(e8).startsWith('0,6'))
check('ai.e8: na previsão o gradient do peso é 5, a distância, e 0,1 no peso soma meio dia',
  close(numericGradient(routeGraph, routeIn(distancia, 0.4, baseDias, real8), 'prazo', 'peso'), 5)
    && close(night(0.5).prazo - night(0.4).prazo, 0.5))
check('ai.e8: no loss o gradient do peso em 0,4 é 5 × 2 × (3 − 4) = −10, negativo, e subir era o lado certo',
  close(night(0.4).gradInLoss, -10)
    && close(numericGradient(routeGraph, routeIn(distancia, 0.4, baseDias, real8), 'loss', 'peso'), -10, 1e-3))
check('ai.e8: learning rate 0,06 leva o peso a 1,0; learning rate 0,02 o levaria a 0,6',
  close(0.4 - 0.06 * night(0.4).gradInLoss, 1) && close(0.4 - 0.02 * night(0.4).gradInLoss, 0.6))
check('ai.e8: os distratores conferem: 1,0 é onde o ajuste parou, 0,2 é o passo certo com sinal trocado, 5 é a distância',
  close(0.4 + 0.02 * night(0.4).gradInLoss, 0.2) && close(night(0.2).loss, 4) && close(night(5).loss, 484)
    && ['1,0', '0,2', '5'].every((n) => e8.kind === 'choice' && e8.choices.some((c) => !c.correct && c.text.startsWith(n))))
check('o chamado: com peso 1,0, toda rota de 500 km ou mais prevê pelo menos o dobro de com 0,4',
  [5, 6, 8, 10, 20, 50].every((dist) => route(dist, 1, baseDias, 0).prazo >= 2 * route(dist, 0.4, baseDias, 0).prazo - 1e-9))
check('o chamado: o problema motivador mostra a conta antes da pergunta',
  aiUnit.motivatingProblem.indexOf('5 × 0,4 + 1 = 3') >= 0
    && aiUnit.motivatingProblem.indexOf('5 × 1,0 + 1 = 6') > aiUnit.motivatingProblem.indexOf('5 × 0,4 + 1 = 3')
    && aiUnit.motivatingProblem.indexOf('5 × 1,0 + 1 = 6') < aiUnit.motivatingProblem.indexOf('?'))

/*
  O peso que zera o loss, 0,6, não aparece em nada que o aluno lê antes de
  ai.e8: o problema motivador, todo ciclo (o postmortem de c8 a tela mostra
  antes do exercício) e todo exercício anterior, inclusive o `why` revelado.
  O passo daquela noite também mede 0,6, e por isso a prosa escreve "de 0,4
  para 1,0" e nunca o tamanho do passo.
*/
const answer8 = /(?<![\d,])0,6(?!\d)/
const before8 = [
  aiUnit.motivatingProblem,
  JSON.stringify(aiUnit.cycles),
  ...aiExercises.slice(0, aiExercises.indexOf(e8)).map(allText),
]
check('ai.e8: nenhum texto lido antes do exercício diz o peso que zera o loss, 0,6',
  before8.every((t) => !answer8.test(t)), before8.filter((t) => answer8.test(t)).map((t) => t.slice(0, 60)).join(' | '))

const e8Lengths = e8.kind === 'choice' ? e8.choices.map((c) => ({ correct: !!c.correct, n: c.text.length })) : []
const e8Right = e8Lengths.find((c) => c.correct)!.n
check('ai.e8: a correta não é a mais longa nem a mais curta',
  e8Lengths.some((c) => !c.correct && c.n > e8Right) && e8Lengths.some((c) => !c.correct && c.n < e8Right),
  e8Lengths.map((c) => `${c.correct ? '*' : ''}${c.n}`).join(' '))

/*
  c8: o exemplo trabalhado, outra rota com números próprios. Outro centro de
  distribuição, base 2; rota de 1.000 km, distância 10; peso 0,5; real 11.
  Nenhum dos números de partida é do chamado (5, 0,4, 1, 4, 0,6).
*/
const c8 = aiUnit.cycles.find((c) => c.id === 'ai.c8')!
const ex8 = route(10, 0.5, 2, 11)
check('ai.c8: rota de distância 10, base 2, peso 0,5, real 11: prevê 7, loss 16, gradient no loss −80',
  close(ex8.prazo, 7) && close(ex8.loss, 16) && close(ex8.gradInLoss, -80)
    && close(numericGradient(routeGraph, routeIn(10, 0.5, 2, 11), 'prazo', 'peso'), 10)
    && c8.workedExample.problem.includes('−80') && c8.workedExample.problem.includes('= 16'))
check('ai.c8: 0,85 prevê 10,5 e deixa o loss em 0,25; 1,5 prevê 17 e o leva a 36, mais longe do real que 7',
  close(route(10, 0.85, 2, 11).prazo, 10.5) && close(route(10, 0.85, 2, 11).loss, 0.25)
    && close(route(10, 1.5, 2, 11).prazo, 17) && close(route(10, 1.5, 2, 11).loss, 36)
    && Math.abs(17 - 11) > Math.abs(7 - 11)
    && ['10,5', '0,25', '17 dias', '36'].every((n) => c8.workedExample.problem.includes(n)))
check('ai.c8: o exemplo não reusa os números de partida do chamado',
  ![10, 0.5, 2, 11].some((n) => [distancia, 0.4, baseDias, real8, 0.6].includes(n)))
check('ai.c8: o corpo refaz a conta do chamado: loss 1 antes, 4 depois, gradient −10 no loss',
  ['(3 − 4)² = 1', '(6 − 4)² = 4', '5 × 2 × (3 − 4) = −10'].every((t) => c8.body.join(' ').includes(t)))
check('ai.c8: o título fala do peso, não do fator',
  /peso que saltou/.test(c8.title) && !/fator/.test(c8.title))

// ---------------------------------------------------------------------------
// 4. A unidade real
// ---------------------------------------------------------------------------

/*
  Até o index.ts existir, esta seção passava exercícios e catálogo por
  `checkAll` dentro de uma unidade de andaime. Agora o validador lê a unidade
  real em `allUnits`, e o andaime só repetiria o que `npm run validate` já
  confere. O que fica aqui é o que o validador NÃO confere.
*/
const authored = JSON.stringify(aiUnit)
check('nenhum texto da unidade usa a palavra "derivada" nem notação de cálculo', !/derivada|∂/i.test(authored))
check('nenhum texto da unidade usa travessão', !authored.includes('—'))
check('um exercício por ciclo: ai.e0 a ai.e8, nesta ordem',
  aiExercises.map((e) => e.id).join(' ') === Array.from({ length: 9 }, (_, i) => `ai.e${i}`).join(' ')
    && aiUnit.cycles.map((c) => c.exerciseId).join(' ') === aiExercises.map((e) => e.id).join(' '))

check('a unidade está em allUnits e fora de units, como a pré-trilha (spec, decisão 7)',
  allUnits.includes(aiUnit) && !units.includes(aiUnit))

/*
  `equilíbrio` reprova a correta mais longa e não olha a mais curta. Nesta
  unidade a primeira versão tinha a correta como a MAIS CURTA em 7 dos 8
  exercícios de alternativa: escolher a menor acertava quase tudo sem ler, que
  é o mesmo defeito pelo outro lado. A guarda fica aqui, local, até alguém
  decidir se ela vira checagem.
*/
const withChoices = aiExercises.filter((e) => e.kind !== 'trace')
const shortestIsCorrect = withChoices.filter((e) => {
  const cs = e.kind === 'choice' ? e.choices : e.kind === 'bug' ? e.consequences : []
  const right = cs.find((c) => c.correct)!.text.length
  return cs.every((c) => c.correct || c.text.length > right)
})
check('a correta não é a mais curta em mais de 2 exercícios de alternativa',
  shortestIsCorrect.length <= 2, shortestIsCorrect.map((e) => e.id).join(', '))

// A tela do traço mostra o pseudocódigo do ciclo, e o enunciado o do exercício.
const owner = aiUnit.cycles.find((c) => c.exerciseId === 'ai.e5')!
const e5 = byId('ai.e5')
check('c5 mostra o mesmo pseudocódigo e a mesma invariante que ai.e5',
  e5.kind === 'trace' && owner.pseudocode === e5.pseudocode && owner.invariant === e5.invariant)

/*
  `vazamento` confere nomes de nó na ordem do traço, e não confere número solto,
  porque número solto aparece em toda prosa. Aqui ele confere, porque nesta
  unidade os números do gabarito são o gabarito: a prosa de c0 até c5, lida
  antes do traço, não usa nenhum número que o gerador emite, tirando o 1, que é
  a convenção do total e aparece em qualquer conta.
*/
const cells = new Set(trace.flatMap((s) => editable.map((c) => s[c]!)).filter((v) => v !== '1'))
const beforeTrace = aiUnit.cycles.slice(0, aiUnit.cycles.indexOf(owner) + 1)
for (const c of beforeTrace) {
  const prose = [c.oneLine, c.plainly ?? '', ...c.body, c.workedExample.problem, c.workedExample.whatToNotice].join(' ')
  const hits = (prose.match(/(?<![\d,.])\d+(?![\d,.]*\d)/g) ?? []).filter((n) => cells.has(n))
  check(`${c.id}: a prosa não usa número do gabarito de ai.e5`, !hits.length, hits.join(', '))
}

// O custo não tem exercício: a comparação mora na prosa de c3 e de c5, e some sem aviso.
// c3 fala em execuções da conta inteira, porque "passada" só estreia em c5.
for (const [id, word] of [['ai.c3', /execuções/], ['ai.c5', /2 passadas/]] as const) {
  const body = aiUnit.cycles.find((c) => c.id === id)!.body.join(' ')
  check(`${id}: a prosa compara uma execução por peso, mais uma, com duas passadas`,
    body.includes('1.000.001') && word.test(body))
}

// A unidade deriva Python (ADR-0032). Cada bloco atravessa inteiro, sem
// identificador acentuado, e o resultado é Python que o próprio Python aceita:
// sem chave, sem `let`, sem `===`, e com `import math` quando usa tanh.
check('ai: a unidade declara Python como linguagem executável', aiUnit.runnable === 'python')
for (const c of aiUnit.cycles) {
  if (!c.pseudocode) continue
  const py = toPythonOrNull(c.pseudocode)
  check(`${c.id}: o pseudocódigo atravessa inteiro para Python, sem identificador acentuado`,
    py !== null && !/[À-ÿ]/.test(py), py ?? untranslatedPython(c.pseudocode).join(', '))
  check(`${c.id}: o Python derivado não carrega sintaxe de TypeScript`,
    py !== null && !/[{};]|\blet\b|===|Math\./.test(py), py ?? '')
  check(`${c.id}: todo def e todo for terminam em dois-pontos`,
    py !== null && py.split('\n').filter((l) => /^\s*(def|for|while|if|elif|else)\b/.test(l)).every((l) => l.trimEnd().endsWith(':') || /:\s+\S/.test(l)), py ?? '')
  if (py && py.includes('math.')) check(`${c.id}: importa math quando usa math.tanh`, py.startsWith('import math'))
}
check('ai.c0: "para i de 0 até |entradas| − 1" vira range(len(inputs)), sem +1 de volta',
  (toPythonOrNull(aiUnit.cycles.find((c) => c.id === 'ai.c0')!.pseudocode!) ?? '').includes('for i in range(len(inputs)):'))
check('ai.e7: o exercício de defeito está em Python', byId('ai.e7').kind === 'bug' && (byId('ai.e7') as { language: string }).language === 'python')

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas as checagens passaram\n')
process.exit(failures ? 1 : 0)
