import { CONTROL_WORDS_PT, IDENTIFIERS } from './transliterate'

/**
 * Pseudocódigo em pt-BR para Python, pelo mesmo princípio do tradutor de
 * TypeScript: uma fonte só, a outra forma derivada na hora por dicionário
 * declarado, e nenhuma tradução pela metade. ADR-0032.
 *
 * Existe porque a unidade 09 trata de redes neurais, e o código que o aluno
 * vai encontrar nesse mundo é Python: o micrograd, o PyTorch, os notebooks.
 * É a regra do glossário aplicada à linguagem: a forma canônica é a que o
 * aluno encontra fora daqui.
 *
 * Python cai melhor no pseudocódigo do que TypeScript por um motivo
 * estrutural: o bloco já é marcado pela indentação nos dois, então não há
 * chave para fechar, e a atribuição não pede declaração.
 */

const ASSIGN = '@ATRIB@'

/** `para i de 0 até X − 1` é o `range(X)` do Python, sem o +1 de volta. */
function rangeOf(from: string, to: string): string {
  const exclusive = /^(.+?)\s*−\s*1$/.exec(to.trim())
  const stop = exclusive ? exclusive[1]! : `${to.trim()} + 1`
  return from.trim() === '0' ? `range(${stop})` : `range(${from.trim()}, ${stop})`
}

const CONTROL: Array<[RegExp, string | ((...m: string[]) => string)]> = [
  [/\bfunção\s+(\w+)\(([^)]*)\)/g, 'def $1($2):'],
  [/\bprocedimento\s+(\w+)\(([^)]*)\)/g, 'def $1($2):'],
  [/\bpara\s+(?:cada\s+)?(\w+)\s+de\s+(.+?)\s+até\s+(.+?)\s+faça\b/g,
    (_m, v, a, b) => `for ${v} in ${rangeOf(a!, b!)}:`],
  [/\bpara\s+cada\s+\((.+?)\)\s+em\s+(.+?)\s+faça\b/g, 'for $1 in $2:'],
  [/\bpara\s+cada\s+(.+?)\s+em\s+(.+?)\s+faça\b/g, 'for $1 in $2:'],
  [/\benquanto\s+(.+?)\s+faça\b/g, 'while $1:'],
  [/\bsenão\s+se\s+(.+?)\s+então\b/g, 'elif $1:'],
  [/\bse\s+(.+?)\s+então\s+(.+)$/gm, 'if $1: $2'],
  [/\bse\s+(.+?)\s+então\b/g, 'if $1:'],
  [/\bsenão\b/g, 'else:'],
  [/\bretorne\b/g, 'return'],
]

const IDIOMS: Array<[RegExp, string]> = [
  [/\banexar\s+(.+?)\s+em\s+([\w.[\]]+)/g, '$2.append($1)'],
  [/\bsequência\s+vazia\b/g, '[]'],
  [/\bsequência\s+com\s+(.+)$/gm, '[$1]'],
  [/\bconjunto\s+com\s+(.+)$/gm, '{$1}'],
  [/\bretirar\s+primeiro\s+de\s+(\w+)/g, '$1.pop(0)'],
  [/\bretirar\s+último\s+de\s+(\w+)/g, '$1.pop()'],
  [/\bnovo\s+nó\s+com\s+(.+)$/gm, 'Node($1)'],
  [/([\w.]+)\s+não\s+está\s+em\s+([\w.]+)/g, '$1 not in $2'],
  [/([\w.]+)\s+está\s+em\s+([\w.]+)/g, '$1 in $2'],
  [/([\w.]+)\s+não\s+vazia\b/g, 'len($1) > 0'],
  [/([\w.]+)\s+não\s+vazio\b/g, 'len($1) > 0'],
  [/([\w.]+)\s+é\s+vazia\b/g, '$1 is None'],
  [/([\w.]+)\s+é\s+vazio\b/g, '$1 is None'],
]

const OPERATORS: Array<[RegExp, string]> = [
  [/\s*←\s*/g, ` ${ASSIGN} `],
  [/(?<![!<>=])=(?!=)/g, '=='],
  [/\s+mod\s+/g, ' % '],
  [/≠/g, '!='],
  [/≤/g, '<='],
  [/≥/g, '>='],
  [/\s*×\s*/g, ' * '],
  [/−/g, '-'],
  [/\|([A-Za-zÀ-ÿ_][\w.]*)\|/g, 'len($1)'],
  [/\bNÃO_ENCONTRADO\b/g, 'None'],
  [/\bNULO\b/g, 'None'],
  [/\bVERDADEIRO\b/g, 'True'],
  [/\bFALSO\b/g, 'False'],
  [/\bVAZIO\b/g, '[]'],
  [/\s+e\s+/g, ' and '],
  [/\s+ou\s+/g, ' or '],
  [new RegExp(ASSIGN, 'g'), '='],
]

/**
 * Onde o nome do TypeScript não serve em Python. `soma` vira `sum` lá, e em
 * Python isso esconde a função embutida `sum`: um leitor de Python estranha.
 */
const PYTHON_OVERRIDES: Record<string, string> = {
  soma: 'weighted_sum',
}

/** camelCase do dicionário compartilhado para o snake_case do Python. */
function pythonName(word: string): string {
  const mapped = PYTHON_OVERRIDES[word] ?? IDENTIFIERS[word] ?? word
  if (mapped === 'Math.tanh') return 'math.tanh'
  return mapped.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
}

export function toPython(source: string): string {
  const sets = new Set<string>()
  for (const l of source.split('\n')) {
    const m = /(\w+)\s*←\s*conjunto\s+com/.exec(l)
    if (m) sets.add(pythonName(m[1]!))
  }

  const out = source.split('\n').map((raw) => {
    if (!raw.trim()) return ''
    const indent = raw.length - raw.trimStart().length
    const [code, ...comment] = raw.split('//')
    let line = code!
    for (const [re, to] of CONTROL) line = line.replace(re, to as never)
    for (const [re, to] of IDIOMS) line = line.replace(re, to)
    for (const [re, to] of OPERATORS) line = line.replace(re, to)
    line = line.replace(/[A-Za-zÀ-ÿ_][\wÀ-ÿ]*/g, (w) =>
      /^(def|for|in|range|len|while|if|elif|else|return|and|or|not|is|None|True|False)$/.test(w) ? w : pythonName(w))
    for (const name of sets) {
      line = line.replace(new RegExp(`\\b${name}\\.append\\(`, 'g'), `${name}.add(`)
    }
    const text = line.trim()
    return ' '.repeat(indent) + text + (comment.length ? '  #' + comment.join('//') : '')
  })

  const body = out.join('\n')
  return /\bmath\./.test(body) ? `import math\n\n${body}` : body
}

const RESIDUE = /\b(é|não|com|de|em|para|sequência|conjunto|vazia|vazio|retirar|anexar|mover|primeiro|último|restou|está|ou)\b/gi

/** O que sobrou em português no código, ignorando comentário. */
export function untranslatedPython(source: string): string[] {
  const code = toPython(source)
    .split('\n')
    .map((l) => l.split('#')[0]!)
    .join('\n')
  const words = new Set<string>()
  for (const m of code.matchAll(RESIDUE)) words.add(m[0]!.toLowerCase())
  for (const w of CONTROL_WORDS_PT) {
    if (new RegExp(`(^|[^\\wÀ-ÿ])${w}($|[^\\wÀ-ÿ])`, 'i').test(code)) words.add(w)
  }
  return [...words]
}

export function toPythonOrNull(source: string): string | null {
  return untranslatedPython(source).length ? null : toPython(source)
}
