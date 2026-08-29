/**
 * Um traço por unidade que tem traço, e a mesma pergunta para todos: o passo
 * marcado é mesmo onde a armadilha mora?
 *
 * A checagem `referência` garante que o gerador roda e que as colunas existem.
 * O que ela não sabe é se o passo apontado em `misconceptionByStep` é o passo
 * interessante, e um traço cujo passo marcado é trivial passa no gate sendo
 * conteúdo morto.
 */
import { countEvenTrace } from '../src/lib/reference/tracing'
import { recursionTreeTrace } from '../src/lib/reference/asymptotics'
import { removeFirstTrace } from '../src/lib/reference/linear'
import { bstInsertTrace } from '../src/lib/reference/trees'
import { bfsTrace, dfsTrace } from '../src/lib/reference/graphs'
import { chainingInsertTrace } from '../src/lib/reference/hash-table'
import { bfsOrder, dfsOrder } from '../src/lib/traversal'
import { units } from '../src/content/index'
import { findDivergence, buildFeedback } from '../src/lib/socratic'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? `, ${detail}` : ''}`)
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
check('tracing: o laço faz 4 rodadas para 7 elementos, o passo não é um',
  t1.length === 4, `${t1.length} rodadas`)
check('tracing: o passo marcado é onde i pula de 2 para 4',
  t1[1]!.read === '3' && t1[1]!.next === '4', `${t1[1]!.read}/${t1[1]!.next}`)

const t0 = recursionTreeTrace()
check('asymptotics: a árvore de n = 8 tem 4 níveis, log n + 1, não n',
  t0.length === 4, `${t0.length} níveis`)
check('asymptotics: o custo por nível não cresce',
  new Set(t0.map((s) => s.levelCost)).size === 1, t0.map((s) => s.levelCost).join(','))
check('asymptotics: as chamadas dobram e o tamanho cai pela metade',
  t0.map((s) => s.calls).join(',') === '1,2,4,8' && t0.map((s) => s.size).join(',') === '8,4,2,1')
check('asymptotics: o total é o custo de um nível vezes o número de níveis',
  Number(t0[3]!.accumulated) === Number(t0[0]!.levelCost) * t0.length, t0[3]!.accumulated!)

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
check('graphs: a busca em largura termina, o ciclo A→B→C→A não a prende',
  t4.length === 5, `${t4.length} retiradas`)
check('graphs: o passo marcado é onde C acha A já visitado e nada entra',
  t4[3]!.key.endsWith('C') && t4[3]!.added === 'nenhum', `${t4[3]!.key} / ${t4[3]!.added}`)
check('graphs: todo vértice sai da fila exatamente uma vez',
  new Set(t4.map((s) => s.key)).size === t4.length)

for (const { unit, exercise } of traceExercises) {
  const gen = { tracing: countEvenTrace, asymptotics: recursionTreeTrace, linear: removeFirstTrace, trees: bstInsertTrace, graphs: bfsTrace }[unit.id]
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

/*
  A figura e o gabarito derivam do mesmo fato e são escritos em lugares
  diferentes. Nada impede o autor de declarar um bloco na figura e outro no
  gerador, e aí o desenho ensina uma coisa e o exercício cobra outra, sem que
  checagem nenhuma perceba. Ver ADR-0017.
*/
for (const u of units) {
  for (const c of u.cycles) {
    if (c.figure?.kind !== 'shift') continue
    const exercise = u.exercises.find((e) => e.id === c.exerciseId)
    if (exercise?.kind !== 'trace') continue
    const gen = { linear: removeFirstTrace }[u.id]
    if (!gen) continue
    const reference = gen()
    const writes = c.figure.values.length - 1 - c.figure.removeAt
    check(`${c.id}: a figura e o gabarito contam as mesmas escritas`,
      reference.length === writes, `figura ${writes}, gabarito ${reference.length}`)
    check(`${c.id}: a figura e o gabarito terminam com o mesmo bloco`,
      reference[reference.length - 1]!.content === (() => {
        const w = [...c.figure!.values]
        for (let j = c.figure!.removeAt; j < w.length - 1; j++) w[j] = w[j + 1]!
        return w.join(' ')
      })(),
      reference[reference.length - 1]!.content!)
  }
}

for (const u of units) {
  for (const c of u.cycles) {
    if (c.figure?.kind !== 'tree' || u.id !== 'trees') continue
    const fromGenerator = bstInsertTrace()
    const same = c.figure.sequences.find(
      (seq) => seq.keys.join(',') === fromGenerator.map((s) => s.key).join(','),
    )
    check(`${c.id}: uma das sequências da figura é a do gerador de referência`, Boolean(same),
      c.figure.sequences.map((s) => s.keys.join(' ')).join(' | '))
    if (same) {
      const height = (() => {
        type N = { k: number; l: N | null; r: N | null }
        let root: N | null = null
        const ins = (n: N | null, k: number): N =>
          !n ? { k, l: null, r: null } : (k < n.k ? (n.l = ins(n.l, k)) : (n.r = ins(n.r, k)), n)
        for (const k of same.keys) root = ins(root, k)
        const h = (n: N | null): number => (n ? 1 + Math.max(h(n.l), h(n.r)) : -1)
        return h(root)
      })()
      check(`${c.id}: a altura da figura bate com a do gabarito`,
        String(height) === fromGenerator[fromGenerator.length - 1]!.height,
        `figura ${height}, gabarito ${fromGenerator[fromGenerator.length - 1]!.height}`)
    }
  }
}

for (const u of units) {
  for (const c of u.cycles) {
    if (c.figure?.kind !== 'buckets' || u.id !== 'hash') continue
    const figure = c.figure
    const drawn = Array.from({ length: figure.m }, (_, i) => figure.keys.filter((k) => k % figure.m === i))
      .map((b, i) => (b.length ? `${i}:[${b.join(',')}]` : null))
      .filter(Boolean)
      .join(' ')
    const reached = chainingInsertTrace().find((s) => s.content === drawn)
    check(`${c.id}: a tabela desenhada é um estado que o gabarito de fato atinge`,
      Boolean(reached), `figura ${drawn}`)
  }
}

/*
  A figura de percurso deriva das arestas declaradas no conteúdo; o gabarito
  deriva de uma constante em src/lib/reference. São dois caminhos de código e
  duas fontes de dado, e é por isso que a asserção vale alguma coisa.
*/
for (const u of units) {
  for (const c of u.cycles) {
    if (c.figure?.kind !== 'traversal' || u.id !== 'graphs') continue
    const figure = c.figure
    const popped = (steps: ReturnType<typeof bfsTrace>) =>
      steps.map((s) => s.key!.split(': ')[1]).join(' ')
    check(`${c.id}: a ordem em largura da figura é a do gabarito de graphs.e4`,
      bfsOrder(figure.edges, figure.origin).join(' ') === popped(bfsTrace()),
      `figura ${bfsOrder(figure.edges, figure.origin).join(' ')}, gabarito ${popped(bfsTrace())}`)
    check(`${c.id}: a ordem em profundidade da figura é a do gabarito de graphs.e8`,
      dfsOrder(figure.edges, figure.origin).join(' ') === popped(dfsTrace()),
      `figura ${dfsOrder(figure.edges, figure.origin).join(' ')}, gabarito ${popped(dfsTrace())}`)
  }
}

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas as checagens passaram\n')
process.exit(failures ? 1 : 0)
