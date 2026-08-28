import { tokenize } from '../src/lib/pseudocode'

const src = `função buscar(T, chave)
    i ← h(chave) mod T.m
    para cada (k, v) em T.bucket[i] faça
        se k = chave então retorne v    // primeira ocorrência vence
    retorne NÃO_ENCONTRADO`

const toks = tokenize(src)
const byKind = new Map<string, string[]>()
for (const t of toks) {
  if (t.kind === 'plain' && !t.text.trim()) continue
  const arr = byKind.get(t.kind) ?? []
  if (!arr.includes(t.text.trim()) && t.text.trim()) arr.push(t.text.trim())
  byKind.set(t.kind, arr)
}
for (const [k, v] of [...byKind].sort()) {
  console.log(`${k.padEnd(11)} ${v.join(' · ')}`)
}
const rebuilt = toks.map((t) => t.text).join('')
console.log(`\n${rebuilt === src ? 'PASSOU' : 'FALHA'}: tokenização é lossless (reconstrói o original)`)
const conv = toks.filter((t) => t.kind === 'convention')
const semDecl = conv.filter((t) => !t.declares)
console.log(`${semDecl.length === 0 ? 'PASSOU' : 'FALHA'}: toda convenção carrega seu significado declarado (${conv.length} tokens)`)
const naoEnc = toks.find((t) => t.text === 'NÃO_ENCONTRADO')
console.log(`${naoEnc?.kind === 'sentinel' ? 'PASSOU' : 'FALHA'}: NÃO_ENCONTRADO é sentinela, não a palavra de controle "não"`)
