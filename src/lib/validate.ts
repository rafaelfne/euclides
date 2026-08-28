/**
 * The pedagogical compiler, as a callable module.
 *
 * It lives here rather than inside the script so that the gate itself can be
 * tested: `scripts/test-schema.ts` runs a fixture unit through `checkAll` and
 * asserts the checks accept a shape no unit in `src/content` uses yet.
 *
 * Every check is a principle from the project brief. There is no warning
 * level, because a warning is a rule nobody enforces.
 */
import {
  unit as unitSchema, MAX_NEW_TERMS_PER_CYCLE, BANDS_BY_KIND,
  type Unit, type Choice, type GlossaryTerm,
} from '../content/schema'
import { OVERLOADED_TERMS, PLANNED } from '../content/glossary'
import { vagueAbstractions, allowedVagueUses } from '../content/vocabulary'
import { referenceGenerators } from './reference'

export const CHECKS = [
  ['registro', 'registro: existe unidade registrada em src/content/index.ts'],
  ['schema', 'schema: toda unidade satisfaz o content model'],
  ['distractor', 'distractor: toda alternativa incorreta nomeia uma misconception existente'],
  ['órfã', 'órfã: toda misconception é exercitada por algum exercício'],
  ['socrática', 'socrática: toda pergunta termina em "?"'],
  ['carga', `carga: nenhum ciclo passa de ${MAX_NEW_TERMS_PER_CYCLE} termos novos`],
  ['exercício', 'exercício: todo ciclo tem exercício, e todo exercício fecha um ciclo'],
  ['domínio', 'domínio: o critério de domínio referencia exercícios que existem'],
  ['revisão', 'revisão: toda misconception aponta um ciclo de revisão que existe'],
  ['espinha', 'espinha: todo ciclo declara sua banda e a unidade abre pelo contrato'],
  ['custo', 'custo: toda implementação declara custo de toda operação do contrato'],
  ['cobertura', 'cobertura: toda parte do critério é produzida por alguma técnica'],
  ['vocabulário', 'vocabulário: nenhuma abstração vaga não registrada'],
  ['convenção', 'convenção: todo pseudocódigo respeita a folha de notação'],
  ['referência', 'referência: todo traço é gerado por implementação que roda'],
  ['glossário', 'glossário: ids únicos, introdução declarada dos dois lados'],
  ['sobrecarga', 'sobrecarga: todo termo sobrecarregado declara seus falsos amigos'],
] as const

export type CheckId = (typeof CHECKS)[number][0]
export interface Failure { check: CheckId; detail: string }

export function checkAll(units: Unit[], terms: GlossaryTerm[]): Failure[] {
  const failures: Failure[] = []
  const fail = (check: CheckId, detail: string) => failures.push({ check, detail })

  const allCycleIds = new Set(units.flatMap((u) => u.cycles.map((c) => c.id)))
  const termIds = new Set(terms.map((t) => t.id))

  // --- registro -------------------------------------------------------------
  if (!units.length) {
    fail('registro', 'nenhuma unidade registrada — o gate não tem o que ler')
  }

  // --- schema ---------------------------------------------------------------
  for (const u of units) {
    const parsed = unitSchema.safeParse(u)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        fail('schema', `${u.id}: ${issue.path.join('.')} — ${issue.message}`)
      }
    }
  }

  // --- distractors apontam misconceptions que existem -----------------------
  const choicesOf = (ex: Unit['exercises'][number]): Choice[] =>
    ex.kind === 'choice' ? ex.choices : ex.kind === 'bug' ? ex.consequences : []

  for (const u of units) {
    const known = new Set(u.misconceptions.map((m) => m.id))
    for (const ex of u.exercises) {
      for (const c of choicesOf(ex)) {
        if (!c.correct && !known.has(c.misconceptionId)) {
          fail('distractor', `${ex.id}: aponta "${c.misconceptionId}", que não existe`)
        }
      }
      if (ex.kind === 'trace') {
        for (const [step, mid] of Object.entries(ex.misconceptionByStep)) {
          if (!known.has(mid)) fail('distractor', `${ex.id} passo ${step}: "${mid}" não existe`)
        }
      }
      const correct = choicesOf(ex).filter((c) => c.correct)
      if (choicesOf(ex).length && correct.length !== 1) {
        fail('distractor', `${ex.id}: tem ${correct.length} alternativas corretas, deve ter exatamente 1`)
      }
    }
  }

  // --- nenhuma misconception órfã ------------------------------------------
  for (const u of units) {
    const used = new Set<string>()
    for (const ex of u.exercises) {
      for (const c of choicesOf(ex)) if (!c.correct) used.add(c.misconceptionId)
      if (ex.kind === 'trace') Object.values(ex.misconceptionByStep).forEach((m) => used.add(m))
    }
    for (const m of u.misconceptions) {
      if (!used.has(m.id)) fail('órfã', `${m.id} é declarada e nunca exercitada`)
    }
  }

  // --- pergunta socrática é pergunta ---------------------------------------
  for (const u of units) {
    for (const m of u.misconceptions) {
      if (!m.socraticQuestion.trim().endsWith('?')) {
        fail('socrática', `${m.id}: não termina em "?" — é explicação, não pergunta`)
      }
    }
  }

  // --- carga cognitiva ------------------------------------------------------
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

  // --- ciclo e exercício se fecham, 1 para 1 -------------------------------
  for (const u of units) {
    const ids = new Set(u.exercises.map((e) => e.id))
    const missing = u.cycles.filter((c) => !ids.has(c.exerciseId))
    if (missing.length) {
      fail('exercício', `ciclos sem exercício escrito: ${missing.map((c) => c.id).join(', ')}`)
    }
    const byExercise = new Map<string, string[]>()
    for (const c of u.cycles) byExercise.set(c.exerciseId, [...(byExercise.get(c.exerciseId) ?? []), c.id])
    for (const [exId, cycleIds] of byExercise) {
      if (cycleIds.length > 1) {
        fail('exercício', `"${exId}" fecha ${cycleIds.length} ciclos (${cycleIds.join(', ')}); deve fechar um`)
      }
    }
    for (const ex of u.exercises) {
      if (!byExercise.has(ex.id)) fail('exercício', `${ex.id} não é o fechamento de nenhum ciclo`)
    }
    for (const id of u.mastery.requiresClean) {
      if (!ids.has(id)) fail('domínio', `mastery.requiresClean cita "${id}", que não existe`)
    }
    for (const m of u.misconceptions) {
      if (!allCycleIds.has(m.reviewCycle)) {
        fail('revisão', `${m.id}: reviewCycle "${m.reviewCycle}" não é um ciclo existente`)
      }
    }
  }

  // --- a banda taxonômica de cada ciclo é coerente com o kind ---------------
  for (const u of units) {
    const bands: readonly string[] = BANDS_BY_KIND[u.kind]
    const [openingBand, middleBand] = bands
    const elaborable = new Set(
      u.kind === 'structure' ? u.implementations.map((i) => i.id) : u.techniques.map((t) => t.id),
    )
    for (const c of u.cycles) {
      if (!bands.includes(c.band)) {
        fail('espinha', `${c.id}: banda "${c.band}" não pertence a uma unidade "${u.kind}" (${bands.join(', ')})`)
        continue
      }
      if (c.band === middleBand && !c.elaborates) {
        fail('espinha', `${c.id}: banda "${c.band}" sem elaborates`)
      }
      if (c.elaborates && !elaborable.has(c.elaborates)) {
        fail('espinha', `${c.id}: elabora "${c.elaborates}", que não existe na unidade`)
      }
      if (c.band !== middleBand && c.elaborates) {
        fail('espinha', `${c.id}: banda "${c.band}" não deveria elaborar nada`)
      }
    }
    if (u.cycles[0]!.band !== openingBand) {
      fail('espinha', `${u.id}: o primeiro ciclo é "${u.cycles[0]!.band}", deveria ser "${openingBand}"`)
    }
  }

  // --- custo declarado para toda operação do contrato ----------------------
  for (const u of units) {
    if (u.kind !== 'structure') continue
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

  // --- o critério é inteiramente coberto pelas técnicas --------------------
  for (const u of units) {
    if (u.kind !== 'method') continue
    const partIds = new Set(u.criterion.parts.map((p) => p.id))
    for (const o of u.criterion.whenOmitted) {
      if (!partIds.has(o.partId)) {
        fail('cobertura', `${u.criterion.id}: whenOmitted cita a parte "${o.partId}", que não existe`)
      }
    }
    const produced = new Set<string>()
    for (const t of u.techniques) {
      if (t.derivesCriterion !== u.criterion.id) {
        fail('cobertura', `${t.id}: deriva "${t.derivesCriterion}", mas a unidade define "${u.criterion.id}"`)
      }
      for (const p of t.produces) {
        if (!partIds.has(p)) fail('cobertura', `${t.id}: produz "${p}", que não é parte do critério`)
        produced.add(p)
      }
    }
    for (const p of partIds) {
      if (!produced.has(p)) fail('cobertura', `${u.criterion.id}: a parte "${p}" não é produzida por técnica nenhuma`)
    }
  }

  // --- vocabulário ----------------------------------------------------------
  const canonicalForms = new Set(terms.map((t) => t.canonical.toLowerCase()))
  const authored: Array<[string, string, string]> = []
  const walk = (node: unknown, unitId: string, path: string) => {
    if (typeof node === 'string') { authored.push([unitId, path, node]); return }
    if (Array.isArray(node)) { node.forEach((v, i) => walk(v, unitId, `${path}[${i}]`)); return }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, unitId, `${path}.${k}`)
    }
  }
  units.forEach((u) => walk(u, u.id, u.id))

  const usedExceptions = new Set<VagueException>()
  type VagueException = (typeof allowedVagueUses)[number]

  for (const [unitId, path, text] of authored) {
    const lower = text.toLowerCase()
    for (const w of vagueAbstractions) {
      if (!lower.includes(w) || canonicalForms.has(w)) continue
      const licence = allowedVagueUses.find(
        (e) => e.unit === unitId && e.word === w && text.includes(e.quote),
      )
      if (licence) { usedExceptions.add(licence); continue }
      fail('vocabulário', `${path}: usa "${w}", que não é termo registrado`)
    }
  }
  for (const e of allowedVagueUses) {
    if (!usedExceptions.has(e)) {
      fail('vocabulário', `licença órfã para "${e.word}" em ${e.unit}: o trecho “${e.quote}” não existe mais`)
    }
  }

  // --- convenções de pseudocódigo ------------------------------------------
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

  // --- a referência do traço existe, roda, e pertence à unidade ------------
  for (const u of units) {
    for (const ex of u.exercises) {
      if (ex.kind !== 'trace') continue
      if (!ex.reference.startsWith(`${u.id}.`)) {
        fail('referência', `${ex.id}: gerador "${ex.reference}" não é prefixado por "${u.id}."`)
        continue
      }
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

  // --- glossário coerente ---------------------------------------------------
  const introducedBy = new Map<string, string>()
  for (const u of units) {
    for (const c of u.cycles) for (const t of c.introducesTerms) introducedBy.set(t, c.id)
  }
  const seen = new Set<string>()
  for (const t of terms) {
    if (seen.has(t.id)) fail('glossário', `id duplicado: ${t.id}`)
    seen.add(t.id)

    if (t.introducedIn === PLANNED) {
      if (!t.plannedIn) fail('glossário', `${t.id}: é "${PLANNED}" e não diz onde pretende nascer`)
      if (t.plannedIn && allCycleIds.has(t.plannedIn)) {
        fail('glossário', `${t.id}: o ciclo "${t.plannedIn}" já existe — troque "${PLANNED}" por introducedIn real`)
      }
      if (introducedBy.has(t.id)) {
        fail('glossário', `${t.id}: é "${PLANNED}" mas o ciclo ${introducedBy.get(t.id)} já o introduz`)
      }
      continue
    }

    if (t.plannedIn) fail('glossário', `${t.id}: tem plannedIn e já foi introduzido em ${t.introducedIn}`)
    if (!allCycleIds.has(t.introducedIn)) {
      fail('glossário', `${t.id}: introducedIn "${t.introducedIn}" não é um ciclo existente`)
      continue
    }
    const claimed = introducedBy.get(t.id)
    if (claimed !== t.introducedIn) {
      fail('glossário', claimed
        ? `${t.id}: diz nascer em ${t.introducedIn}, mas quem o declara é ${claimed}`
        : `${t.id}: diz nascer em ${t.introducedIn}, que não o lista em introducesTerms`)
    }
  }

  // --- termo sobrecarregado declara falsos amigos --------------------------
  for (const id of OVERLOADED_TERMS) {
    const term = terms.find((t) => t.id === id)
    if (!term) { fail('sobrecarga', `"${id}" está na lista de sobrecarregados e não existe no glossário`); continue }
    if (!term.falseFriends.length) fail('sobrecarga', `${id}: sobrecarregado e sem falsos amigos declarados`)
  }


  return failures
}
