/**
 * The documents are outside the content gate, and they drifted first: a dead
 * path in the first instruction of an agent, a non-canonical term inside the
 * feedback example an agent is told to imitate.
 *
 * This checks only what is exact, that every repo path a document cites
 * exists. Terminology in prose stays with `/audit-unit`, because a checker
 * that cannot tell citation from use would delete the examples that teach the
 * distinction. See ADR-0011.
 */
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const roots = ['docs', '.claude', 'CLAUDE.md', 'README.md']
const skipDirs = new Set(['node_modules', '.next', 'out', '.git'])

const files: string[] = []
const collect = (p: string) => {
  const abs = join(root, p)
  if (!existsSync(abs)) return
  if (statSync(abs).isFile()) { if (abs.endsWith('.md')) files.push(abs); return }
  for (const entry of readdirSync(abs)) {
    if (skipDirs.has(entry)) continue
    collect(join(p, entry))
  }
}
roots.forEach(collect)

const PATH_LIKE = /`([^`\n]+)`/g
/**
 * A citation worth checking names a location, and a location has a directory.
 * A bare `index.ts` in prose is a name, not a path, and treating it as one
 * produced three false positives on the first run.
 */
const looksLikePath = (s: string) =>
  !s.includes(' ') && !s.startsWith('/') && !s.startsWith('@') && s.includes('/')

type Finding = { file: string; line: number; cited: string; why: string }
const findings: Finding[] = []

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    for (const m of line.matchAll(PATH_LIKE)) {
      const cited = m[1]!
      if (!looksLikePath(cited)) continue
      if (/[<>*$]/.test(cited)) continue
      const target = cited.replace(/:\d+$/, '').replace(/\/$/, '')
      const candidates = [
        resolve(dirname(file), target),
        join(root, target),
        join(root, 'src', target),
      ]
      if (candidates.some(existsSync)) continue
      findings.push({
        file: relative(root, file), line: i + 1, cited,
        why: 'caminho citado não existe',
      })
    }
  })
}

console.log('\n  checagem de documentos, caminhos citados\n')
console.log(`  ${files.length} documento(s) lido(s)`)
if (findings.length) {
  console.log('')
  for (const f of findings) console.log(`  FALHA ${f.file}:${f.line}, \`${f.cited}\`: ${f.why}`)
  console.log(`\n  ${findings.length} caminho(s) morto(s). Build interrompido.\n`)
  process.exit(1)
}
console.log('  nenhum caminho morto.\n')
