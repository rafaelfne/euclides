import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const here = new URL('.', import.meta.url).pathname
const suites = readdirSync(here)
  .filter((f) => /^test-.+\.ts$/.test(f) && f !== 'test-all.ts')
  .sort()

if (!suites.length) {
  console.error('\n  nenhuma suíte encontrada em scripts/test-*.ts\n')
  process.exit(1)
}

let failed = 0
for (const suite of suites) {
  const result = spawnSync('npx', ['tsx', join(here, suite)], { stdio: 'inherit' })
  if (result.status !== 0) failed++
}

console.log(`\n  ${suites.length} suíte(s): ${suites.join(', ')}`)
if (failed) {
  console.log(`  ${failed} reprovada(s).\n`)
  process.exit(1)
}
console.log('  todas passaram.\n')
