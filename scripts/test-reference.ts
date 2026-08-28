import { chainingInsertTrace } from '../src/lib/reference/hash-table'
import { findDivergence, buildFeedback } from '../src/lib/socratic'
import { hashUnit } from '../src/content/units/hash'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

const trace = chainingInsertTrace()
console.log('\n  traço de referência (m=4, LIMITE=0,75, inserindo 3 7 11 4 8)\n')
console.log('  ' + ['passo', 'chave', 'rehash', 'n', 'm', 'α', 'conteúdo'].join('\t'))
for (const s of trace) {
  console.log('  ' + [s.step, s.key, s.rehash, s.n, s.m, s.alpha, s.content].join('\t'))
}
console.log('')

check('o traço tem 5 passos', trace.length === 5)
check('o rehash dispara no passo 4, não no 8', trace[3]!.rehash === 'sim' && trace[4]!.rehash === 'não')
check('depois do rehash, 3 e 11 seguem juntos e 7 se separa',
  trace[3]!.content.includes('3:[3,11]') && trace[3]!.content.includes('7:[7]'),
  trace[3]!.content)
check('α cai de 0,750 para 0,500 no rehash',
  trace[2]!.alpha === '0,750' && trace[3]!.alpha === '0,500')

// o motor socrático localiza a divergência sem revelar o valor
const cols = ['rehash', 'n', 'm', 'alpha', 'content']
const wrong = trace.map((s, i) => (i === 3 ? { ...s, content: '3:[3,7,11] 4:[4]' } : { ...s }))
const d = findDivergence(wrong, trace, cols)
check('a divergência é localizada no passo 4', d.firstDivergentStep === 4, String(d.firstDivergentStep))
check('o campo divergente é "content"', d.divergentField === 'content', String(d.divergentField))

const mis = hashUnit.misconceptions.find((m) => m.id === 'hash.rehash-copia-buckets')
const rungs = [1, 2, 3].map((a) => buildFeedback(d, a, mis)!)
check('o motor tem exatamente três degraus', rungs.map((r) => r.rung).join(',') === '1,2,3')
check('o degrau 1 diz onde quebrou sem dizer o campo', !rungs[0]!.head.includes('conteúdo') && rungs[0]!.head.includes('passo 4'))
check('nenhum degrau contém a resposta correta',
  !rungs.some((r) => `${r.head} ${r.body}`.includes('3:[3,11]')))
check('o degrau 3 é uma pergunta', rungs[2]!.head.trim().endsWith('?'), rungs[2]!.head)

const semZeroFinal = trace.map((s) => ({ ...s, alpha: s.alpha!.replace(/0$/, '') }))
const dNum = findDivergence(semZeroFinal, trace, cols)
check('0,75 conta como 0,750 — número compara por valor, não por escrita',
  dNum.firstDivergentStep === null, String(dNum.firstDivergentStep))

check('o gerador não emite caractere que o aluno não digita',
  trace.every((s) => s.rehash === 'sim' || s.rehash === 'não'),
  trace.map((s) => s.rehash).join(','))

const right = findDivergence(trace, trace, cols)
check('um traço correto não gera devolutiva', right.firstDivergentStep === null && buildFeedback(right, 1, mis) === null)

const lastEscalation = 2 + mis!.escalation.length
const stop = buildFeedback(d, lastEscalation + 1, mis)!
check('a escalada acaba e vira encerramento', stop.exhausted === true, `rung ${stop.rung}, exhausted ${stop.exhausted}`)
check('o encerramento manda voltar amanhã, sem dar a resposta',
  stop.body.includes('amanhã') && !`${stop.head} ${stop.body}`.includes('3:[3,11]'))
check('nenhuma devolutiva vem com corpo vazio',
  [1, 2, 3, 4, 5, 6, 12].every((a) => (buildFeedback(d, a, mis)!.body ?? '').length > 0))

const short = findDivergence(trace.slice(0, 2), trace, cols)
check('traço curto diverge no primeiro passo ausente', short.firstDivergentStep === 3 && short.divergentField === null)
const shortRungs = [1, 2, 3].map((a) => buildFeedback(short, a, mis)!)
check('traço curto não pula o degrau 2', shortRungs.map((r) => r.rung).join(',') === '1,2,3')
check('o degrau 2 do traço curto tem corpo', shortRungs[1]!.body.length > 0)
check('o degrau 2 do traço curto não nomeia coluna nenhuma',
  !shortRungs[1]!.head.includes('coluna'), shortRungs[1]!.head)

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas as checagens passaram\n')
process.exit(failures ? 1 : 0)
