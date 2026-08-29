/**
 * Syntax highlighting for the track's pseudocode.
 *
 * No off-the-shelf highlighter knows `função`, `←`, `mod` or `NÃO_ENCONTRADO`,
 * so this one is written from scratch, and that turns out to be the point.
 * Colouring here is SEMANTIC, not decorative: tokens are coloured by the role
 * they play in reasoning, not by lexical category.
 *
 * The `convention` class carries the weight. Assignment, comparison, `mod` and
 * `|A|` are exactly the notation a student silently mis-reads, a `=` taken for
 * assignment, a `mod` taken for a language's `%`. Giving them their own colour,
 * tied to the declared conventions panel, is Euclid's rule in the syntax
 * itself: nothing assumed that is not declared.
 */

export type TokenKind =
  | 'control'     // função, se, então, para cada, enquanto, retorne
  | 'convention'  // ← = ≠ ≤ mod |…|, the declared notation
  | 'sentinel'    // NULO, NÃO_ENCONTRADO, contract values, not variables
  | 'number'
  | 'comment'
  | 'plain'

export interface Token {
  text: string
  kind: TokenKind
  /** Set on `convention` tokens: the declared meaning, for the inline tooltip. */
  declares?: string
}

/** Longest first, `para cada` must win over `para`. */
const CONTROL_PHRASES = ['para cada', 'senão se']

const CONTROL_WORDS = new Set([
  'função', 'procedimento', 'se', 'então', 'senão', 'enquanto', 'faça',
  'para', 'cada', 'em', 'retorne', 'e', 'ou', 'não', 'de', 'até',
])

const SENTINELS = new Set(['NULO', 'NÃO_ENCONTRADO', 'VERDADEIRO', 'FALSO', 'VAZIO'])

/** Every entry here must also exist in the declared conventions sheet. */
export const CONVENTION_MEANINGS: Record<string, string> = {
  '←': 'atribuição, nunca comparação',
  '=': 'comparação de igualdade, nunca atribuição',
  '≠': 'diferente de',
  '≤': 'menor ou igual',
  '≥': 'maior ou igual',
  '<': 'menor que',
  '>': 'maior que',
  '|': 'tamanho, vale para coleção e para chave',
  'mod': 'resto da divisão, a operação matemática, não o operador de uma linguagem',
  '×': 'multiplicação',
}

const OPERATOR_CHARS = new Set(Object.keys(CONVENTION_MEANINGS).filter((k) => k.length === 1))
const IDENT_START = /[A-Za-zÀ-ÿ_]/
const IDENT_REST = /[A-Za-zÀ-ÿ0-9_]/
const DIGIT = /[0-9]/

export function tokenize(source: string): Token[] {
  const out: Token[] = []
  let i = 0
  let pending = ''

  const flush = () => {
    if (pending) { out.push({ text: pending, kind: 'plain' }); pending = '' }
  }
  const push = (text: string, kind: TokenKind, declares?: string) => {
    flush()
    out.push(declares ? { text, kind, declares } : { text, kind })
  }

  while (i < source.length) {
    const rest = source.slice(i)

    // comentário até o fim da linha
    if (rest.startsWith('//')) {
      const end = rest.indexOf('\n')
      const text = end === -1 ? rest : rest.slice(0, end)
      push(text, 'comment')
      i += text.length
      continue
    }

    // frases de controle com mais de uma palavra
    const phrase = CONTROL_PHRASES.find(
      (p) => rest.toLowerCase().startsWith(p) && !IDENT_REST.test(rest[p.length] ?? ' '),
    )
    if (phrase) {
      push(rest.slice(0, phrase.length), 'control')
      i += phrase.length
      continue
    }

    const ch = source[i]!

    // identificador ou palavra-chave
    if (IDENT_START.test(ch)) {
      let j = i
      while (j < source.length && IDENT_REST.test(source[j]!)) j++
      const word = source.slice(i, j)
      if (SENTINELS.has(word) || (word.length > 1 && word === word.toUpperCase() && /[A-ZÀ-Ú]/.test(word))) {
        push(word, 'sentinel')
      } else if (word.toLowerCase() === 'mod') {
        push(word, 'convention', CONVENTION_MEANINGS['mod'])
      } else if (CONTROL_WORDS.has(word.toLowerCase())) {
        push(word, 'control')
      } else {
        pending += word
      }
      i = j
      continue
    }

    // número
    if (DIGIT.test(ch)) {
      let j = i
      while (j < source.length && /[0-9.]/.test(source[j]!)) j++
      push(source.slice(i, j), 'number')
      i = j
      continue
    }

    // operador da convenção
    if (OPERATOR_CHARS.has(ch)) {
      push(ch, 'convention', CONVENTION_MEANINGS[ch])
      i++
      continue
    }

    pending += ch
    i++
  }
  flush()
  return out
}

/** Byrne's three primaries, adjusted for legibility on the ink ground. */
export const TOKEN_COLORS: Record<TokenKind, string> = {
  control: '#EDE7DA',
  convention: '#8FB2E8',
  sentinel: '#E3B664',
  number: '#E39288',
  comment: '#948877',
  plain: '#C9C0B0',
}

export const TOKEN_WEIGHT: Record<TokenKind, number> = {
  control: 500, convention: 500, sentinel: 500, number: 400, comment: 400, plain: 400,
}
