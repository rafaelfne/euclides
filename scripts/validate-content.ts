/**
 * The pedagogical compiler.
 *
 * Choosing a static engine meant giving up an LLM's runtime judgement. This
 * script is what replaces it — and it is the better trade: a rule checked once
 * at build is more reliable than a rule re-derived on every response.
 *
 * Every check below is a principle from the project brief. A violation fails
 * the build; there is no warning level, because a warning is a rule nobody
 * enforces.
 */
import { unit as unitSchema, MAX_NEW_TERMS_PER_CYCLE, type Unit } from '../src/content/schema'
import { hashUnit } from '../src/content/units/hash'
import { glossary, crossUnitGlossary } from '../src/content/glossary'
import { vagueAbstractions, VOCAB_ESCAPE } from '../src/content/vocabulary'
import { referenceGenerators } from '../src/lib/reference/hash-table'

type Failure = { check: string; detail: string }
const failures: Failure[] = []
const passes: string[] = []

const fail = (check: string, detail: string) => failures.push({ check, detail })
const pass = (check: string) => passes.push(check)

const units: Unit[] = [hashUnit]
const allTerms = [...glossary, ...crossUnitGlossary]
const termIds = new Set(allTerms.map((t) => t.id))

// --- 1. o schema ---------------------------------------------------------
for (const u of units) {
  const parsed = unitSchema.safeParse(u)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      fail('schema', `${u.id}: ${issue.path.join('.')} — ${issue.message}`)
    }
  }
}
if (!failures.length) pass('schema: toda unidade satisfaz o content model')

// --- 2. distractors apontam misconceptions que existem -------------------
for (const u of units) {
  const known = new Set(u.misconceptions.map((m) => m.id))
  for (const ex of u.exercises) {
    const choices = ex.kind === 'choice' ? ex.choices : ex.kind === 'bug' ? ex.consequences : []
    for (const c of choices) {
      if (!c.correct && !known.has(c.misconceptionId)) {
        fail('distractor', `${ex.id}: aponta "${c.misconceptionId}", que não existe`)
      }
    }
    if (ex.kind === 'trace') {
      for (const [step, mid] of Object.entries(ex.misconceptionByStep)) {
        if (!known.has(mid)) fail('distractor', `${ex.id} passo ${step}: "${mid}" não existe`)
      }
    }
    const correct = choices.filter((c) => c.correct)
    if (choices.length && correct.length !== 1) {
      fail('distractor', `${ex.id}: tem ${correct.length} alternativas corretas, deve ter exatamente 1`)
    }
  }
}
pass('distractor: toda alternativa incorreta nomeia uma misconception existente')

// --- 3. nenhuma misconception órfã --------------------------------------
for (const u of units) {
  const used = new Set<string>()
  for (const ex of u.exercises) {
    const choices = ex.kind === 'choice' ? ex.choices : ex.kind === 'bug' ? ex.consequences : []
    for (const c of choices) if (!c.correct) used.add(c.misconceptionId)
    if (ex.kind === 'trace') Object.values(ex.misconceptionByStep).forEach((m) => used.add(m))
  }
  for (const m of u.misconceptions) {
    if (!used.has(m.id)) fail('órfã', `${m.id} é declarada e nunca exercitada`)
  }
}
pass('órfã: toda misconception é exercitada por algum exercício')

// --- 4. pergunta socrática é pergunta ------------------------------------
for (const u of units) {
  for (const m of u.misconceptions) {
    if (!m.socraticQuestion.trim().endsWith('?')) {
      fail('socrática', `${m.id}: não termina em "?" — é explicação, não pergunta`)
    }
  }
}
pass('socrática: toda pergunta termina em "?"')

// --- 5. carga cognitiva --------------------------------------------------
for (const u of units) {
  for (const c of u.cycles) {
    if (c.introducesTerms.length > MAX_NEW_TERMS_PER_CYCLE) {
      fail('carga', `${c.id}: ${c.introducesTerms.length} termos novos, teto é ${MAX_NEW_TERMS_PER_CYCLE}`)
    }
    for (const t of c.introducesTerms) {
      if (!termIds.has(t)) fail('carga', `${c.id}: introduz "${t}", que não está no glossário`)
    }
  }
}
pass(`carga: nenhum ciclo passa de ${MAX_NEW_TERMS_PER_CYCLE} termos novos`)

// --- 6. todo ciclo termina em exercício ----------------------------------
for (const u of units) {
  const ids = new Set(u.exercises.map((e) => e.id))
  const missing = u.cycles.filter((c) => !ids.has(c.exerciseId))
  if (missing.length) {
    fail('exercício', `ciclos sem exercício escrito: ${missing.map((c) => c.id).join(', ')}`)
  }
  for (const id of u.mastery.requiresClean) {
    if (!ids.has(id)) fail('domínio', `mastery.requiresClean cita "${id}", que não existe`)
  }
}

// --- 6b. a banda taxonômica de cada ciclo é coerente ---------------------
for (const u of units) {
  const implIds = new Set(u.implementations.map((i) => i.id))
  for (const c of u.cycles) {
    if (c.band === 'implementation' && !c.implementationId) {
      fail('espinha', `${c.id}: banda "implementation" sem implementationId`)
    }
    if (c.implementationId && !implIds.has(c.implementationId)) {
      fail('espinha', `${c.id}: aponta implementação "${c.implementationId}", que não existe`)
    }
    if (c.band !== 'implementation' && c.implementationId) {
      fail('espinha', `${c.id}: banda "${c.band}" não deveria apontar implementação`)
    }
  }
  if (!u.cycles.some((c) => c.band === 'contract')) {
    fail('espinha', `${u.id}: nenhum ciclo abre pelo contrato — princípio 5 exige o problema antes da estrutura`)
  }
  if (u.cycles[0]!.band !== 'contract') {
    fail('espinha', `${u.id}: o primeiro ciclo é "${u.cycles[0]!.band}", deveria ser o contrato`)
  }
}
pass('espinha: todo ciclo declara sua banda e a unidade abre pelo contrato')

// --- 7. custo declarado para toda operação do contrato -------------------
for (const u of units) {
  const ops = u.adt.operations.map((o) => o.name)
  for (const impl of u.implementations) {
    for (const op of ops) {
      if (!impl.cost[op]) fail('custo', `${impl.id}: não declara custo de "${op}"`)
    }
    for (const key of Object.keys(impl.cost)) {
      if (!ops.includes(key)) fail('custo', `${impl.id}: declara custo de "${key}", que não é operação do contrato`)
    }
    if (impl.implementsAdt !== u.adt.id) {
      fail('custo', `${impl.id}: implementa "${impl.implementsAdt}", mas a unidade define "${u.adt.id}"`)
    }
  }
}
pass('custo: toda implementação declara custo de toda operação do contrato')

// --- 8. vocabulário ------------------------------------------------------
const canonicalForms = new Set(allTerms.map((t) => t.canonical.toLowerCase()))
const authored: Array<[string, string]> = []
const walk = (node: unknown, path: string) => {
  if (typeof node === 'string') { authored.push([path, node]); return }
  if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${path}[${i}]`)); return }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`)
  }
}
units.forEach((u) => walk(u, u.id))
for (const [path, text] of authored) {
  if (text.includes(VOCAB_ESCAPE)) continue
  const lower = text.toLowerCase()
  for (const w of vagueAbstractions) {
    if (lower.includes(w) && !canonicalForms.has(w)) {
      fail('vocabulário', `${path}: usa "${w}", que não é termo registrado`)
    }
  }
}
pass('vocabulário: nenhuma abstração vaga não registrada')

// --- 9. convenções de pseudocódigo ---------------------------------------
const forbidden: Array<[RegExp, string]> = [
  [/[^<>!=]==[^=]/, 'use `=` para comparação, não `==`'],
  [/(^|[^a-zA-Z])%($|[^a-zA-Z])/, 'use `mod`, não `%`'],
  [/\breturn\b/, 'use `retorne` — pseudocódigo é pt-BR'],
  [/\b(for|while|if)\b/, 'use `para cada` / `enquanto` / `se`'],
  [/\b(null|nil|None)\b/, 'use `NULO`'],
  [/[{};]\s*$/m, 'blocos por indentação, sem delimitadores'],
]
for (const u of units) {
  const blocks: Array<[string, string]> = []
  u.cycles.forEach((c) => { if (c.pseudocode) blocks.push([c.id, c.pseudocode]) })
  u.exercises.forEach((e) => { if (e.kind === 'trace') blocks.push([e.id, e.pseudocode]) })
  for (const [id, code] of blocks) {
    for (const [re, msg] of forbidden) {
      if (re.test(code)) fail('convenção', `${id}: ${msg}`)
    }
  }
}
pass('convenção: todo pseudocódigo respeita a folha de notação')

// --- 10. a referência do traço existe e roda -----------------------------
for (const u of units) {
  for (const ex of u.exercises) {
    if (ex.kind !== 'trace') continue
    const gen = referenceGenerators[ex.reference]
    if (!gen) { fail('referência', `${ex.id}: gerador "${ex.reference}" não registrado`); continue }
    const steps = gen()
    if (steps.length < 2) { fail('referência', `${ex.id}: gerador produz ${steps.length} passo(s)`); continue }
    for (const col of ex.columns) {
      if (!(col.key in steps[0]!)) fail('referência', `${ex.id}: coluna "${col.key}" ausente no traço gerado`)
    }
    for (const step of Object.keys(ex.misconceptionByStep)) {
      if (Number(step) > steps.length) fail('referência', `${ex.id}: misconception no passo ${step}, traço tem ${steps.length}`)
    }
  }
}
pass('referência: todo traço é gerado por implementação que roda')

// --- 11. glossário coerente ----------------------------------------------
const cycleIds = new Set(units.flatMap((u) => u.cycles.map((c) => c.id)))
const seen = new Set<string>()
for (const t of allTerms) {
  if (seen.has(t.id)) fail('glossário', `id duplicado: ${t.id}`)
  seen.add(t.id)
  const known = cycleIds.has(t.introducedIn) || !t.introducedIn.startsWith('hash.')
  if (!known) fail('glossário', `${t.id}: introducedIn "${t.introducedIn}" não é um ciclo existente`)
}
pass('glossário: ids únicos e pontos de introdução válidos')

// --- relatório -----------------------------------------------------------
console.log('\n  validador pedagógico — Euclides\n')
for (const p of passes) console.log(`  ok    ${p}`)
if (failures.length) {
  console.log('')
  for (const f of failures) console.log(`  FALHA [${f.check}] ${f.detail}`)
  console.log(`\n  ${failures.length} violação(ões). Build interrompido.\n`)
  process.exit(1)
}
console.log(`\n  ${passes.length} checagens, nenhuma violação.\n`)
