import { toTypeScript, toTypeScriptOrNull, untranslated } from '../src/lib/transliterate'
import { units } from '../src/content/index'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) { failures++; console.log(`  FALHA ${name}${detail ? ' , ' + detail : ''}`) }
}

console.log('\n  transliteração: pseudocódigo para TypeScript\n')

/*
  O risco desta camada não é falhar alto, é falhar baixo: produzir algo que
  parece TypeScript e não é. As asserções abaixo são todas sobre isso.
*/
for (const u of units) {
  for (const c of u.cycles) {
    if (!c.pseudocode) continue
    const ts = toTypeScriptOrNull(c.pseudocode)

    if (c.pseudocodeIsProse) {
      check(`${c.id}: declarado prosa, não atravessa`, ts === null)
      continue
    }

    check(`${c.id}: atravessa inteiro`, ts !== null, untranslated(c.pseudocode).join(','))
    if (ts === null) continue

    const code = ts.split('\n').map((l) => l.split('//')[0]!).join('\n')

    check(
      `${c.id}: chaves equilibradas`,
      (code.match(/\{/g) ?? []).length === (code.match(/\}/g) ?? []).length,
      `${(code.match(/\{/g) ?? []).length} abre, ${(code.match(/\}/g) ?? []).length} fecha`,
    )

    check(
      `${c.id}: nenhum identificador acentuado`,
      !/[À-ÿ]/.test(code),
      (code.match(/[\wÀ-ÿ]*[À-ÿ][\wÀ-ÿ]*/g) ?? []).join(','),
    )

    // `=` do pseudocódigo é SEMPRE comparação. Um `=` solto dentro de um `if`
    // seria a convenção traduzida ao contrário, e é a que mais engana.
    for (const line of code.split('\n')) {
      if (!/^\s*(if|while)\s*\(/.test(line)) continue
      check(`${c.id}: comparação não virou atribuição`, !/(?<![!<>=])=(?!=)/.test(line), line.trim())
    }

    check(`${c.id}: nenhum operador matemático solto`, !/[←≠≤≥×−]/.test(code))
    check(`${c.id}: nenhum marcador vazado`, !code.includes('@ATRIB@'))
  }
}

// O `.push` num Set é o erro que a varredura de conjunto existe para impedir.
const bfs = units.find((u) => u.id === 'graphs')!.cycles.find((c) => c.id === 'graphs.c4')!
const ts = toTypeScript(bfs.pseudocode!)
check('graphs.c4: conjunto recebe add, não push', ts.includes('visited.add(') && !ts.includes('visited.push('), ts)
check('graphs.c4: fila recebe push e shift', ts.includes('queue.push(') && ts.includes('queue.shift()'))

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas passaram\n')
process.exit(failures ? 1 : 0)
