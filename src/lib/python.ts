import type { Token, TokenKind } from './pseudocode'

/**
 * Realce para o Python da unidade 09, nos mesmos termos do de JavaScript.
 *
 * O colorido é semântico: `=` atribui e `==` compara, e os dois levam a cor de
 * convenção com a explicação no `declares`, como no pseudocódigo. Python não
 * tem `===`, então a ponte é mais curta: o `←` de lá é o `=` daqui, e o `=` de
 * lá é o `==` daqui. Sem dependência, pelo mesmo motivo do ADR-0028.
 */

const CONTROL = new Set([
  'def', 'return', 'if', 'elif', 'else', 'while', 'for', 'in', 'break', 'continue',
  'and', 'or', 'not', 'is', 'class', 'import', 'from', 'as', 'with', 'lambda',
  'pass', 'yield', 'try', 'except', 'finally', 'raise',
])

const SENTINEL = new Set(['None', 'True', 'False'])

/** Mais longos primeiro: `==` tem de vencer `=`. */
const OPERATORS: Array<[string, string]> = [
  ['==', 'comparação'],
  ['!=', 'diferente'],
  ['<=', 'menor ou igual, e a fronteira mora aqui'],
  ['>=', 'maior ou igual, e a fronteira mora aqui'],
  ['+=', 'soma ao que já estava lá, não substitui'],
  ['-=', 'subtrai do que já estava lá'],
  ['**', 'potência'],
  ['//', 'divisão inteira'],
  ['=', 'atribuição, nunca comparação'],
  ['<', 'menor que'],
  ['>', 'maior que'],
  ['%', 'resto da divisão'],
]

const IDENT_START = /[A-Za-z_]/
const IDENT_REST = /[A-Za-z0-9_]/
const DIGIT = /[0-9]/

export function tokenizePython(source: string): Token[] {
  const out: Token[] = []
  const push = (text: string, kind: TokenKind, declares?: string) => {
    const last = out[out.length - 1]
    if (last && last.kind === kind && !declares && !last.declares) last.text += text
    else out.push(declares ? { text, kind, declares } : { text, kind })
  }

  let i = 0
  while (i < source.length) {
    const ch = source[i]!

    // comentário até o fim da linha
    if (ch === '#') {
      const end = source.indexOf('\n', i)
      const stop = end === -1 ? source.length : end
      push(source.slice(i, stop), 'comment')
      i = stop
      continue
    }

    if (ch === "'" || ch === '"') {
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

    const rest = source.slice(i)
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
