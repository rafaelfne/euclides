import type { Token, TokenKind } from './pseudocode'

/**
 * Realce para o JavaScript dos exercícios de caça ao defeito.
 *
 * Escrito à mão, e pelo mesmo motivo do tokenizador de pseudocódigo: **o
 * colorido aqui é semântico, não decorativo.** Um realçador de prateleira
 * pinta por categoria léxica e trata `=` e `===` como o mesmo tom de operador.
 * Neste app eles não são a mesma coisa: metade das armadilhas do catálogo mora
 * exatamente na diferença entre atribuir e comparar, entre `<` e `<=`, entre
 * curto-circuito e avaliação completa.
 *
 * Por isso `convention` recebe os operadores que o aluno lê errado, com a
 * mesma cor que a folha de notação usa no pseudocódigo. O aluno vê o mesmo
 * azul nos dois lugares, e a ponte entre a notação e a linguagem real é a cor.
 *
 * Sem dependência: são 90 linhas contra ~90 KB de um Prism ou Shiki, para oito
 * blocos de JavaScript. O ADR-0025 já pagou peso uma vez. Ver ADR-0028.
 */

/** Palavras que decidem o fluxo, e é o fluxo que a unidade 01 ensina a ler. */
const CONTROL = new Set([
  'function', 'return', 'if', 'else', 'while', 'for', 'do', 'break', 'continue',
  'let', 'const', 'var', 'class', 'new', 'this', 'typeof', 'in', 'of',
  'switch', 'case', 'default', 'throw', 'try', 'catch', 'finally', 'await', 'async',
])

const SENTINEL = new Set(['null', 'undefined', 'true', 'false', 'NaN', 'Infinity'])

/**
 * Os operadores que a folha de notação declara, e o que cada um significa.
 *
 * É a mesma tabela do pseudocódigo, atravessada para a linguagem: o `←` de lá
 * é o `=` daqui, e o `=` de lá é o `===` daqui. Um aluno que leu a folha
 * reconhece a cor antes de reconhecer o símbolo.
 *
 * Mais longos primeiro: `===` tem de vencer `==`, que tem de vencer `=`.
 */
const OPERATORS: Array<[string, string]> = [
  ['===', 'comparação estrita, sem conversão de tipo'],
  ['!==', 'diferente, sem conversão de tipo'],
  ['==', 'comparação COM conversão de tipo, e é a que surpreende'],
  ['!=', 'diferente, com conversão de tipo'],
  ['<=', 'menor ou igual, e a fronteira mora aqui'],
  ['>=', 'maior ou igual, e a fronteira mora aqui'],
  ['&&', 'e, com curto-circuito: o lado direito nem sempre é avaliado'],
  ['||', 'ou, com curto-circuito: o lado direito nem sempre é avaliado'],
  ['=>', 'função anônima'],
  ['++', 'incremento'],
  ['--', 'decremento'],
  ['=', 'atribuição, nunca comparação'],
  ['<', 'menor que'],
  ['>', 'maior que'],
  ['%', 'resto da divisão'],
  ['!', 'negação'],
]

const IDENT_START = /[A-Za-z_$]/
const IDENT_REST = /[A-Za-z0-9_$]/
const DIGIT = /[0-9]/

export function tokenizeJavaScript(source: string): Token[] {
  const out: Token[] = []
  const push = (text: string, kind: TokenKind, declares?: string) => {
    const last = out[out.length - 1]
    if (last && last.kind === kind && !declares && !last.declares) last.text += text
    else out.push(declares ? { text, kind, declares } : { text, kind })
  }

  let i = 0
  while (i < source.length) {
    const rest = source.slice(i)

    // comentário de linha, e ele vai até o fim da linha
    if (rest.startsWith('//')) {
      const end = source.indexOf('\n', i)
      const stop = end === -1 ? source.length : end
      push(source.slice(i, stop), 'comment')
      i = stop
      continue
    }

    const ch = source[i]!

    // string, nas três aspas que o JavaScript aceita
    if (ch === "'" || ch === '"' || ch === '`') {
      let j = i + 1
      while (j < source.length && source[j] !== ch) {
        if (source[j] === '\\') j++
        j++
      }
      push(source.slice(i, Math.min(j + 1, source.length)), 'sentinel')
      i = j + 1
      continue
    }

    if (DIGIT.test(ch)) {
      let j = i
      while (j < source.length && /[0-9._]/.test(source[j]!)) j++
      push(source.slice(i, j), 'number')
      i = j
      continue
    }

    if (IDENT_START.test(ch)) {
      let j = i
      while (j < source.length && IDENT_REST.test(source[j]!)) j++
      const word = source.slice(i, j)
      push(word, CONTROL.has(word) ? 'control' : SENTINEL.has(word) ? 'sentinel' : 'plain')
      i = j
      continue
    }

    const op = OPERATORS.find(([sym]) => rest.startsWith(sym))
    if (op) {
      push(op[0], 'convention', op[1])
      i += op[0].length
      continue
    }

    push(ch, 'plain')
    i += 1
  }

  return out
}
