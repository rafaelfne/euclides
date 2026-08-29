import { units } from '../src/content/index'
import { tokenizeJavaScript } from '../src/lib/javascript'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? ` , ${detail}` : ''}`)
  if (!ok) failures++
}

console.log('\n  realce do JavaScript\n')

const kindOf = (src: string, text: string) =>
  tokenizeJavaScript(src).find((t) => t.text === text)?.kind

/*
  O que o realce afirma, e o que ele não pode confundir. Metade do catálogo de
  armadilhas mora na diferença entre atribuir e comparar, e entre `<` e `<=`.
*/
check('=== é convenção, não texto comum', kindOf('a === b', '===') === 'convention')
check('= é convenção, não texto comum', kindOf('let a = 1', '=') === 'convention')
check('=== não é fatiado em = e ==', tokenizeJavaScript('a === b').some((t) => t.text === '==='))
check('!== não é fatiado', tokenizeJavaScript('a !== b').some((t) => t.text === '!=='))
check('<= não vira < seguido de =', tokenizeJavaScript('i <= n').some((t) => t.text === '<='))
check('&& é convenção, porque curto-circuita', kindOf('a && b', '&&') === 'convention')

check('cada operador declara o que significa',
  tokenizeJavaScript('a === b && c <= d')
    .filter((t) => t.kind === 'convention')
    .every((t) => Boolean(t.declares)))

check('== e === declaram coisas diferentes',
  tokenizeJavaScript('a == b').find((t) => t.text === '==')!.declares
  !== tokenizeJavaScript('a === b').find((t) => t.text === '===')!.declares)

check('palavra de controle é controle', kindOf('while (x) {}', 'while') === 'control')
check('sentinela é sentinela', kindOf('x === null', 'null') === 'sentinel')
check('número é número', kindOf('let i = 0', '0') === 'number')
// Tokens vizinhos do mesmo tipo são fundidos, então `itens.length` sai num nó
// só. É menos DOM e não muda o que a cor afirma.
check('identificador comum é plain', kindOf('itens.length', 'itens.length') === 'plain')
check('tokens vizinhos do mesmo tipo são fundidos',
  tokenizeJavaScript('itens.length').filter((t) => t.kind === 'plain').length === 1)

// Comentário é prosa e não pode ser tokenizado por dentro: um `=` dentro de um
// comentário não é uma atribuição.
const comentado = tokenizeJavaScript('// devolve a === b')
check('comentário sai inteiro, num token só',
  comentado.length === 1 && comentado[0]!.kind === 'comment', JSON.stringify(comentado))

const str = tokenizeJavaScript("const s = 'a === b'")
check('string não é tokenizada por dentro',
  str.some((t) => t.text === "'a === b'"), JSON.stringify(str.map((t) => t.text)))

/*
  A garantia que importa para a tela: o realce não pode PERDER nem INVENTAR
  caractere. Um bloco de código que perde um caractere no meio do caminho é um
  exercício de caça ao defeito com um defeito a mais.
*/
for (const u of units) {
  for (const ex of u.exercises) {
    if (ex.kind !== 'bug') continue
    for (const [i, line] of ex.code.split('\n').entries()) {
      const back = tokenizeJavaScript(line).map((t) => t.text).join('')
      check(`${ex.id} linha ${i + 1}: o realce devolve a linha intacta`, back === line, back)
    }
  }
}

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas passaram\n')
process.exit(failures ? 1 : 0)
