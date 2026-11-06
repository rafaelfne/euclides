/**
 * A unidade `ai`, conferida pelo lado da referência e pelo lado do exercício.
 *
 * Três perguntas:
 *   1. o gabarito do carrinho é o que a conta dá, e a ordem respeita a
 *      invariante da passada para trás;
 *   2. as duas técnicas da unidade concordam: o gradient que a passada para
 *      trás escreve é o que se mede empurrando cada número um pouco;
 *   3. todo número que um exercício afirma sai de uma conta feita aqui, e não
 *      de quem digitou o enunciado.
 *
 * A unidade fica fora de `units` (spec, decisão 7) e, enquanto o `index.ts` dela
 * não existe, o validador não lê os exercícios. Por isso a última parte passa
 * o catálogo e os exercícios por `checkAll` dentro de uma unidade de andaime,
 * olhando só as checagens que dizem respeito a exercício. O andaime não é
 * conteúdo: os ciclos dele não têm prosa, e é por isso que `vazamento` aqui não
 * prova nada sobre a prosa real, que o validador confere quando ela existir.
 */
import {
  backward, backwardOrder, backwardTrace, cartBackwardTrace, cartGraph, CART_INPUTS,
  forward, numericGradient, ptNumber, type Graph,
} from '../src/lib/reference/ai'
import { referenceGenerators } from '../src/lib/reference'
import { aiExercises, aiMisconceptions } from '../src/content/units/ai/exercises'
import { checkAll, type CheckId } from '../src/lib/validate'
import { allTerms } from '../src/content/glossary'
import type { Exercise, Unit } from '../src/content/schema'

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
console.log('  ' + ['passo', 'nó', 'valor', 'impacto local', 'gradient'].join('\t'))
for (const s of trace) console.log('  ' + [s.step, s.key, s.value, s.local, s.grad].join('\t'))
console.log('')

check('o gerador está registrado com id prefixado pela unidade',
  referenceGenerators['ai.cart-backward-trace'] === cartBackwardTrace)

const row = (key: string) => trace.find((s) => s.key === key)!
check('a passada para frente dá subtotal 20, soma 26 e total 78',
  row('subtotal').value === '20' && row('soma').value === '26' && row('total').value === '78')
check('o total começa com gradient 1 e impacto local 1, a convenção declarada',
  row('total').grad === '1' && row('total').local === '1')
check('fator vale 3 e tem gradient 26; soma vale 26 e tem gradient 3',
  row('fator').value === '3' && row('fator').grad === '26' && row('soma').value === '26' && row('soma').grad === '3')
check('frete e subtotal: impacto local 1, gradient 3',
  ['frete', 'subtotal'].every((k) => row(k).local === '1' && row(k).grad === '3'))
check('preço: impacto local 5 (a quantidade), gradient 15',
  row('preço').local === '5' && row('preço').grad === '15')
check('quantidade: impacto local 4 (o preço), gradient 12',
  row('quantidade').local === '4' && row('quantidade').grad === '12')

check('a ordem é a topológica invertida, total primeiro',
  trace.map((s) => s.key).join(' ') === 'total fator soma frete subtotal quantidade preço',
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

// Sem zerar entre rodadas: a segunda passada parte do que a primeira deixou.
const round2 = backward(cartGraph, values, 'total', { carry: grad }).grad
check('sem zerar, a segunda passada dobra o gradient de toda entrada (ai.e7)',
  Object.keys(CART_INPUTS).every((k) => round2[k] === 2 * grad[k]!))

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

// e8: o problema motivador, 3 itens de 10 com frete 5
const pedido = 3 * 10 + 5
const alvo = 77
check(`ai.e8: o pedido soma ${pedido}; com fator 2 dá ${pedido * 2}, com 2,6 dá ${ptNumber(pedido * 2.6)}`,
  pedido === 35 && pedido * 2 === 70 && close(pedido * 2.6, 91))
check('ai.e8: o fator que dá 77 é 2,2, e o loss vai de 49 para 196',
  close(alvo / pedido, 2.2) && (70 - alvo) ** 2 === 49 && close((pedido * 2.6 - alvo) ** 2, 196)
    && says(byId('ai.e8'), 2.2) && says(byId('ai.e8'), 49) && says(byId('ai.e8'), 196))
check('ai.e8: o gradient do total em relação ao fator é a soma, 35, e 0,1 no fator move 3,5',
  close(numericGradient(
    [{ name: 's', op: 'input', inputs: [] }, { name: 'f', op: 'input', inputs: [] }, { name: 't', op: 'mul', inputs: ['s', 'f'] }],
    { s: 35, f: 2 }, 't', 'f'), 35) && says(byId('ai.e8'), 3.5))
check('ai.e8: subir o fator era a direção certa, o gradient do loss é negativo em 2',
  2 * (pedido * 2 - alvo) * pedido < 0)

// ---------------------------------------------------------------------------
// 4. As checagens de exercício, num andaime de unidade
// ---------------------------------------------------------------------------

const authored = JSON.stringify({ aiExercises, aiMisconceptions })
check('nenhum texto usa a palavra "derivada" nem notação de cálculo', !/derivada|∂/i.test(authored))
check('nenhum texto usa travessão', !authored.includes('—'))
check('um exercício por ciclo: ai.e0 a ai.e8, nesta ordem',
  aiExercises.map((e) => e.id).join(' ') === Array.from({ length: 9 }, (_, i) => `ai.e${i}`).join(' '))

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

const bands = ['criterion', 'technique', 'criterion', 'technique', 'technique', 'technique', 'technique', 'failure', 'failure'] as const
const scaffold: Unit = {
  kind: 'method', id: 'ai', number: 9, title: 'andaime', learningObjective: 'andaime',
  prerequisites: ['andaime'], motivatingProblem: 'andaime',
  symbols: [{ symbol: 'w', means: 'um peso do neurônio' }],
  criterion: {
    id: 'adjust', name: 'andaime', produces: 'andaime',
    parts: [
      { id: 'output', name: 'saída', guarantee: 'andaime' },
      { id: 'loss', name: 'loss', guarantee: 'andaime' },
      { id: 'gradient', name: 'gradient', guarantee: 'andaime' },
      { id: 'step', name: 'passo', guarantee: 'andaime' },
    ],
    whenOmitted: [{ partId: 'loss', reads: 'andaime' }],
  },
  techniques: ['numeric-gradient', 'backpropagation'].map((id) => ({
    id, name: id, derivesCriterion: 'adjust', summary: 'andaime',
    produces: ['output', 'loss', 'gradient', 'step'],
    wrongWhen: [{ scenario: 'andaime', useInstead: 'andaime' }],
    everydayAnchor: 'andaime', invariant: 'andaime',
  })),
  cycles: bands.map((band, i) => ({
    id: `ai.c${i}`, title: 'andaime', layer: 'essential' as const, band,
    ...(band === 'technique' ? { elaborates: 'backpropagation' } : {}),
    introducesTerms: [], oneLine: 'Andaime 1.', body: ['andaime 1'],
    workedExample: { problem: 'andaime', whatToNotice: 'andaime' },
    ...(i === 8 ? { postmortem: { incident: 'andaime', trapId: 'ai.passo-maior-converge-antes', missingClaim: 'andaime', whatWouldCatch: 'andaime' } } : {}),
    exerciseId: `ai.e${i}`,
  })),
  exercises: aiExercises,
  misconceptions: aiMisconceptions,
  mastery: { statement: 'andaime', requiresClean: ['ai.e5'], revisitIntervalDays: 7 },
}

const exerciseChecks: CheckId[] = [
  'schema', 'distractor', 'equilíbrio', 'órfã', 'socrática', 'exercício', 'domínio', 'desfaz',
  'vocabulário', 'ênfase', 'convenção', 'referência', 'formato', 'realce', 'incidente',
]
const found = checkAll([scaffold], allTerms).filter((f) => exerciseChecks.includes(f.check))
for (const id of exerciseChecks) {
  const mine = found.filter((f) => f.check === id)
  check(`andaime: ${id}`, !mine.length, mine.map((f) => f.detail).join(' | '))
}

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas as checagens passaram\n')
process.exit(failures ? 1 : 0)
