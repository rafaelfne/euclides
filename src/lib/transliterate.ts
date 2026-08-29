import { languageBoundary } from '@/content/conventions'

/**
 * Pseudocódigo em pt-BR para TypeScript, por transliteração MECÂNICA.
 *
 * Isto não é uma segunda versão do conteúdo, e a distinção decide tudo. Se o
 * autor escrevesse a versão em TypeScript à mão, seriam duas fontes que
 * divergem na primeira correção, e o pseudocódigo deixaria de ser canônico,
 * que é o princípio 1 do projeto. Aqui existe uma fonte só; a outra forma é
 * derivada dela na hora, com um dicionário declarado.
 *
 * Por isso o dicionário é fechado e a checagem `tradução` reprova qualquer
 * palavra que sobre sem correspondente. Uma tradução parcial é pior que
 * nenhuma: ela produz código que parece TypeScript e não é.
 */

/** Marcador da atribuição, trocado por `=` no fim. Ver `OPERATORS`. */
const ASSIGN = '@ATRIB@'

/** Palavras de controle. Toda entrada aqui é consumida pelo tradutor. */
const CONTROL: Array<[RegExp, string]> = [
  [/\bfunção\s+(\w+)\(([^)]*)\)/g, 'function $1($2) {'],
  [/\bprocedimento\s+(\w+)\(([^)]*)\)/g, 'function $1($2) {'],
  [/\bpara\s+cada\s+(\w+)\s+de\s+(.+?)\s+até\s+(.+?)\s+faça\b/g, `for (let $1 ${ASSIGN} $2; $1 <= $3; $1++) {`],
  [/\bpara\s+(\w+)\s+de\s+(.+?)\s+até\s+(.+?)\s+faça\b/g, `for (let $1 ${ASSIGN} $2; $1 <= $3; $1++) {`],
  [/\bpara\s+cada\s+\((.+?)\)\s+em\s+(.+?)\s+faça\b/g, 'for (const [$1] of $2) {'],
  [/\bpara\s+cada\s+(.+?)\s+em\s+(.+?)\s+faça\b/g, 'for (const $1 of $2) {'],
  [/\benquanto\s+(.+?)\s+faça\b/g, 'while ($1) {'],
  [/\bsenão\s+se\s+(.+?)\s+então\b/g, '} else if ($1) {'],
  [/\bse\s+(.+?)\s+então\s+(.+)$/gm, 'if ($1) $2'],
  [/\bse\s+(.+?)\s+então\b/g, 'if ($1) {'],
  [/\bsenão\b/g, '} else {'],
  [/\bretorne\b/g, 'return'],
]

/**
 * Os idiomas do pseudocódigo autorado.
 *
 * O pseudocódigo desta trilha é deliberadamente próximo da prosa, `anexar v em
 * visitados` em vez de `visitados.push(v)`, porque o leitor alvo ainda não lê
 * sintaxe fluentemente. Isso é o princípio 1 funcionando, e é o que torna a
 * transliteração um dicionário de EXPRESSÕES, não só de palavras.
 *
 * A lista é fechada. O que não está aqui sobra em português, a checagem
 * `tradução` acusa, e a tela não oferece a versão em TypeScript.
 */
const IDIOMS: Array<[RegExp, string]> = [
  [/\banexar\s+(.+?)\s+em\s+([\w.[\]]+)/g, '$2.push($1)'],
  [/\bsequência\s+vazia\b/g, '[]'],
  [/\bsequência\s+com\s+(.+)$/gm, '[$1]'],
  [/\bconjunto\s+com\s+(.+)$/gm, 'new Set([$1])'],
  [/\bretirar\s+primeiro\s+de\s+(\w+)/g, '$1.shift()'],
  [/\bretirar\s+último\s+de\s+(\w+)/g, '$1.pop()'],
  [/\bnovo\s+nó\s+com\s+(.+)$/gm, 'newNode($1)'],
  [/([\w.]+)\s+não\s+está\s+em\s+([\w.]+)/g, '!$2.has($1)'],
  [/([\w.]+)\s+está\s+em\s+([\w.]+)/g, '$2.has($1)'],
  [/([\w.]+)\s+não\s+vazia\b/g, '$1.length > 0'],
  [/([\w.]+)\s+não\s+vazio\b/g, '$1.length > 0'],
  [/([\w.]+)\s+é\s+vazia\b/g, '$1 === null'],
  [/([\w.]+)\s+é\s+vazio\b/g, '$1 === null'],
]

const OPERATORS: Array<[RegExp, string]> = [
  // A atribuição vira um marcador primeiro, para que `=`, que em pseudocódigo
  // é SEMPRE comparação, possa virar `===` sem atropelá-la. É a convenção mais
  // mal lida da folha, e traduzi-la errado ensinaria o oposto.
  [/\s*←\s*/g, ` ${ASSIGN} `],
  [/(?<![!<>=])=(?!=)/g, '==='],
  [/\s+mod\s+/g, ' % '],
  [/≠/g, '!=='],
  [/≤/g, '<='],
  [/≥/g, '>='],
  [/×/g, ' * '],
  [/−/g, '-'],
  [/\|([A-Za-zÀ-ÿ_][\w.]*)\|/g, '$1.length'],
  [/\bNÃO_ENCONTRADO\b/g, 'undefined'],
  [/\bNULO\b/g, 'null'],
  [/\bVERDADEIRO\b/g, 'true'],
  [/\bFALSO\b/g, 'false'],
  [/\bVAZIO\b/g, '[]'],
  [/\s+e\s+/g, ' && '],
  [/\s+ou\s+/g, ' || '],
  [new RegExp(ASSIGN, 'g'), '='],
]

/**
 * Identificadores do domínio. A fronteira de idioma declara que o pseudocódigo
 * é pt-BR e o código executável é inglês; este mapa é essa fronteira, escrita.
 */
export const IDENTIFIERS: Record<string, string> = {
  inserir: 'insert', remover: 'remove', buscar: 'find', obter: 'get', contém: 'has',
  tamanho: 'size', anexar: 'push', empilhar: 'push', desempilhar: 'pop',
  enfileirar: 'enqueue', desenfileirar: 'dequeue', trocar: 'swap',
  intercalar: 'merge', particionar: 'partition', ordenar: 'sort',
  largura: 'bfs', profundidade: 'dfs', percorrer: 'traverse',
  tabela: 'table', chave: 'key', valor: 'value', lista: 'list', fila: 'queue',
  pilha: 'stack', bloco: 'block', nó: 'node', raiz: 'root', vizinhos: 'neighbours',
  visitados: 'visited', origem: 'origin', atual: 'current', total: 'total',
  esquerda: 'left', direita: 'right', pivô: 'pivot', menor: 'min', maior: 'max',
  posição: 'position', índice: 'index', indice: 'index',
  capacidade: 'capacity', altura: 'height', pai: 'parent',
  filho: 'child', vazia: 'empty', vazio: 'empty', sequência: 'sequence',
  comparar: 'compare', achar: 'find', descartar: 'discard', dobrar: 'grow',
  primeiro: 'first', último: 'last', resto: 'rest', novo: 'fresh', par: 'entry',
}

/** Toda palavra de controle do pseudocódigo. A checagem confere esta lista. */
export const CONTROL_WORDS_PT = [
  'função', 'procedimento', 'se', 'então', 'senão', 'enquanto', 'faça',
  'para', 'cada', 'retorne',
]

/**
 * A versão em TypeScript, ou `null` quando ela não é derivável.
 *
 * `null` acontece de verdade: `sorting.c3` tem passos escritos em prosa
 * ("mover o que restou de E para o fim de S"), e traduzir prosa exigiria
 * inventar código que o autor não escreveu. A tela diz isso em vez de mostrar
 * uma tradução pela metade: meia tradução produz algo que parece TypeScript e
 * não é, que é pior que não oferecer nada.
 */
export function toTypeScriptOrNull(source: string): string | null {
  return untranslated(source).length ? null : toTypeScript(source)
}

export function toTypeScript(source: string): string {
  const lines = source.split('\n')
  const out: string[] = []
  const indentOf = (l: string) => l.length - l.trimStart().length

  /*
    Quem é conjunto neste bloco.

    `anexar v em visitados` vira `visited.add(v)` quando visitados nasceu de
    `conjunto com …`, e `queue.push(v)` quando nasceu de `sequência com …`.
    Sem isso a tradução produzia `.push` num Set: código que parece certo e não
    roda, que é exatamente o que a tela existe para o aluno aprender a
    detectar. A varredura é local ao bloco e não tenta ser mais que isso.
  */
  const sets = new Set<string>()
  for (const l of lines) {
    const m = /(\w+)\s*←\s*conjunto\s+com/.exec(l)
    if (m) sets.add(IDENTIFIERS[m[1]!] ?? m[1]!)
  }

  let open = 0
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!
    if (!raw.trim()) { out.push(''); continue }

    const [code, ...restComment] = raw.split('//')
    let line = code!
    for (const [re, to] of CONTROL) line = line.replace(re, to)
    for (const [re, to] of IDIOMS) line = line.replace(re, to)
    for (const [re, to] of OPERATORS) line = line.replace(re, to)
    line = line.replace(/[A-Za-zÀ-ÿ_][\wÀ-ÿ]*/g, (w) => IDENTIFIERS[w] ?? w)
    for (const name of sets) {
      line = line.replace(new RegExp(`\\b${name}\\.push\\(`, 'g'), `${name}.add(`)
    }

    const nextIndent = i + 1 < lines.length && lines[i + 1]!.trim() ? indentOf(lines[i + 1]!) : 0
    const here = indentOf(raw)
    // `senão` já fecha o bloco anterior; fechar de novo pela indentação
    // produziria uma chave a mais.
    const nextIsElse = /^\s*senão\b/.test(lines[i + 1] ?? '')

    const text = line.trimEnd()
    if (text.trimStart().startsWith('} else')) open = Math.max(0, open - 1)
    if (text.endsWith('{')) open++
    out.push(' '.repeat(here) + text.trim() + (restComment.length ? '  //' + restComment.join('//') : ''))

    // Fecha os blocos que a indentação do pseudocódigo abria implicitamente.
    let closes = 0
    while (open > 0 && nextIndent < here && !nextIsElse && closes < 4) {
      const level = Math.max(0, here - 4 * (closes + 1))
      if (nextIndent > level) break
      out.push(' '.repeat(level) + '}')
      open--; closes++
    }
  }
  while (open > 0) { out.push('}'); open-- }

  return out.join('\n')
}

/**
 * O que sobrou em português depois de traduzir, ignorando comentário.
 *
 * Comentário é prosa e continua em pt-BR de propósito: ele explica o porquê, e
 * o porquê é conteúdo. Só o código precisa atravessar a fronteira de idioma.
 */
const RESIDUE = /\b(é|não|com|de|em|para|sequência|conjunto|vazia|vazio|retirar|anexar|mover|primeiro|último|restou|está|ou)\b/gi

export function untranslated(source: string): string[] {
  const code = toTypeScript(source)
    .split('\n')
    .map((l) => l.split('//')[0]!)
    .join('\n')
  const words = new Set<string>()
  for (const m of code.matchAll(RESIDUE)) words.add(m[0]!.toLowerCase())
  for (const w of CONTROL_WORDS_PT) {
    if (new RegExp(`\\b${w}\\b`, 'i').test(code)) words.add(w)
  }
  return [...words]
}

export const BOUNDARY = languageBoundary
