/**
 * The gate. The checks live in `src/lib/validate.ts` so they can be tested;
 * this script is the reporter.
 *
 * The report is DERIVED from `CHECKS`: a check prints `ok` when nothing filed
 * a failure under its id, and `FALHA` otherwise. Nothing is counted by hand,
 * so an `ok` line cannot contradict a failure in the same run. See ADR-0011.
 */
import { CHECKS, checkAll } from '../src/lib/validate'
import { units } from '../src/content/index'
import { allTerms } from '../src/content/glossary'

const failures = checkAll(units, allTerms)
const failedIds = new Set(failures.map((f) => f.check))

console.log('\n  validador pedagógico — Euclides\n')
for (const [id, label] of CHECKS) {
  console.log(`  ${failedIds.has(id) ? 'FALHA' : 'ok   '} ${label}`)
}
if (failures.length) {
  console.log('')
  for (const f of failures) console.log(`  FALHA [${f.check}] ${f.detail}`)
  console.log(`\n  ${failures.length} violação(ões) em ${failedIds.size} de ${CHECKS.length} checagens. Build interrompido.\n`)
  process.exit(1)
}
console.log(`\n  ${CHECKS.length} checagens, nenhuma violação.\n`)
