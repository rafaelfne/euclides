/**
 * O traço de `sorting.e3` existe para um passo: o empate.
 *
 * Um aluno que toma o da direita quando as chaves empatam produz uma saída
 * ordenada, plausível e instável — que é exatamente o defeito do problema
 * motivador da unidade. As asserções abaixo garantem que o passo 3 é esse, e
 * que a devolutiva chega nele sem entregar o valor.
 */
import { mergeStepTrace } from '../src/lib/reference/sorting'
import { findDivergence, buildFeedback } from '../src/lib/socratic'
import { sortingUnit } from '../src/content/units/sorting'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

const trace = mergeStepTrace()
console.log('\n  intercalação de referência (E: 2a 5b 5c · D: 1d 5e 7f)\n')
console.log('  ' + ['passo', 'frente', 'lado', 'saiu', 'S até aqui'].join('\t'))
for (const s of trace) {
  console.log('  ' + [s.step, s.key, s.side, s.emitted, s.output].join('\t'))
}
console.log('')

check('a intercalação tem 6 passos', trace.length === 6, String(trace.length))
check('a saída final está ordenada por chave',
  trace[5]!.output === '1d 2a 5b 5c 5e 7f', trace[5]!.output)
check('o empate acontece no passo 3', trace[2]!.key === 'esq 5b · dir 5e', trace[2]!.key)
check('o empate vai para a esquerda — é onde mora a estabilidade',
  trace[2]!.side === 'esquerda' && trace[2]!.emitted === '5b', trace[2]!.side)
check('5b sai antes de 5e, preservando a ordem de chegada',
  trace[5]!.output.indexOf('5b') < trace[5]!.output.indexOf('5e'))

const cols = ['side', 'emitted', 'output']

// O aluno instável: mesma coleção, mesma ordem de chave, empate invertido.
const instavel = trace.map((s, i) =>
  i === 2 ? { ...s, side: 'direita', emitted: '5e', output: '1d 2a 5e' } : { ...s })
const d = findDivergence(instavel, trace, cols)
check('a divergência do desempate é localizada no passo 3', d.firstDivergentStep === 3, String(d.firstDivergentStep))

const mis = sortingUnit.misconceptions.find((m) => m.id === 'sorting.sort-e-estavel')
const rungs = [1, 2, 3].map((a) => buildFeedback(d, a, mis)!)
check('a escada chega na armadilha de estabilidade', rungs[2]!.misconceptionId === 'sorting.sort-e-estavel')
check('nenhum degrau entrega a saída correta',
  !rungs.some((r) => `${r.head} ${r.body}`.includes('5b 5c 5e')))
check('o degrau 3 é uma pergunta', rungs[2]!.head.trim().endsWith('?'), rungs[2]!.head)

const stop = buildFeedback(d, 3 + mis!.escalation.length, mis)!
check('a escalada acaba e vira encerramento', stop.exhausted === true)

check('o gerador não emite caractere que o aluno não digita numa coluna editável',
  trace.every((s) => ['esquerda', 'direita'].includes(s.side!) && !s.emitted!.includes('—')),
  trace.map((s) => s.side).join(','))

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas as checagens passaram\n')
process.exit(failures ? 1 : 0)
