/**
 * Um traço por unidade que tem traço, e a mesma pergunta para todos: o passo
 * marcado é mesmo onde a armadilha mora?
 *
 * A checagem `referência` garante que o gerador roda e que as colunas existem.
 * O que ela não sabe é se o passo apontado em `misconceptionByStep` é o passo
 * interessante — e um traço cujo passo marcado é trivial passa no gate sendo
 * conteúdo morto.
 */
import { countEvenTrace } from '../src/lib/reference/tracing'
import { removeFirstTrace } from '../src/lib/reference/linear'
import { bstInsertTrace } from '../src/lib/reference/trees'
import { bfsTrace } from '../src/lib/reference/graphs'
import { units } from '../src/content/index'
import { findDivergence, buildFeedback } from '../src/lib/socratic'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

console.log('\n  traços de referência das unidades\n')

const traceExercises = units.flatMap((u) =>
  u.exercises.filter((e) => e.kind === 'trace').map((e) => ({ unit: u, exercise: e as Extract<typeof e, { kind: 'trace' }> })))

check('toda unidade com traço marca ao menos um passo com armadilha',
  traceExercises.every(({ exercise }) => Object.keys(exercise.misconceptionByStep).length > 0),
  traceExercises.filter(({ exercise }) => !Object.keys(exercise.misconceptionByStep).length).map((t) => t.exercise.id).join(','))

check('nenhum passo marcado é o primeiro',
  traceExercises.every(({ exercise }) => !Object.keys(exercise.misconceptionByStep).includes('1')),
  traceExercises.filter(({ exercise }) => Object.keys(exercise.misconceptionByStep).includes('1')).map((t) => t.exercise.id).join(','))

const t1 = countEvenTrace()
check('tracing: o laço faz 4 rodadas para 7 elementos — o passo não é um',
  t1.length === 4, `${t1.length} rodadas`)
check('tracing: o passo marcado é onde i pula de 2 para 4',
  t1[1]!.read === '3' && t1[1]!.next === '4', `${t1[1]!.read}/${t1[1]!.next}`)

const t2 = removeFirstTrace()
check('linear: remover a posição 0 custa 4 escritas para 5 elementos',
  t2.length === 4, `${t2.length} escritas`)
check('linear: o bloco mantém o último valor duplicado ao fim',
  t2[3]!.content === '20 30 40 50 50', t2[3]!.content)

const t3 = bstInsertTrace()
check('trees: a altura cresce até 3 na sexta inserção',
  t3[5]!.height === '3', t3[5]!.height)
check('trees: a primeira inserção faz zero comparações e é raiz',
  t3[0]!.comparisons === '0' && t3[0]!.parent === 'raiz')

const t4 = bfsTrace()
check('graphs: a busca em largura termina — o ciclo A→B→C→A não a prende',
  t4.length === 5, `${t4.length} retiradas`)
check('graphs: o passo marcado é onde C acha A já visitado e nada entra',
  t4[3]!.key.endsWith('C') && t4[3]!.added === 'nenhum', `${t4[3]!.key} / ${t4[3]!.added}`)
check('graphs: todo vértice sai da fila exatamente uma vez',
  new Set(t4.map((s) => s.key)).size === t4.length)

for (const { unit, exercise } of traceExercises) {
  const gen = { tracing: countEvenTrace, linear: removeFirstTrace, trees: bstInsertTrace, graphs: bfsTrace }[unit.id]
  if (!gen) continue
  const reference = gen()
  const marked = Number(Object.keys(exercise.misconceptionByStep)[0])
  const editable = exercise.columns.map((c) => c.key).filter((k) => k !== 'step' && k !== 'key')
  const wrong = reference.map((s, i) => (i === marked - 1 ? { ...s, [editable[0]!]: 'zzz' } : { ...s }))
  const d = findDivergence(wrong, reference, editable)
  check(`${exercise.id}: divergir no passo marcado leva à armadilha certa`,
    d.firstDivergentStep === marked
      && buildFeedback(d, 3, unit.misconceptions.find((m) => m.id === exercise.misconceptionByStep[String(marked)]))!.misconceptionId
        === exercise.misconceptionByStep[String(marked)],
    `divergiu em ${d.firstDivergentStep}, esperado ${marked}`)
}

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas as checagens passaram\n')
process.exit(failures ? 1 : 0)
