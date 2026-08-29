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
  unit as unitSchema, MAX_NEW_TERMS_PER_CYCLE, MAX_ONE_LINE_WORDS, BANDS_BY_KIND,
  type Unit, type Choice, type GlossaryTerm,
} from '../content/schema'
import { OVERLOADED_TERMS, PLANNED, APP } from '../content/glossary'
import { vagueAbstractions, allowedVagueUses, forwardCitations } from '../content/vocabulary'
import { referenceGenerators } from './reference'
import { bfsOrder, dfsOrder, vertices } from './traversal'
import { untranslated } from './transliterate'
import { probes } from '../content/placement'

export const CHECKS = [
  ['registro', 'registro: existe unidade registrada em src/content/index.ts'],
  ['schema', 'schema: toda unidade satisfaz o content model'],
  ['distractor', 'distractor: toda alternativa incorreta nomeia uma misconception existente'],
  ['equilíbrio', 'equilíbrio: a alternativa correta não se denuncia pelo comprimento'],
  ['órfã', 'órfã: toda misconception é exercitada por algum exercício'],
  ['socrática', 'socrática: toda pergunta termina em "?"'],
  ['carga', `carga: nenhum ciclo passa de ${MAX_NEW_TERMS_PER_CYCLE} termos novos`],
  ['exercício', 'exercício: todo ciclo tem exercício, e todo exercício fecha um ciclo'],
  ['domínio', 'domínio: o critério de domínio referencia exercícios que existem'],
  ['revisão', 'revisão: toda misconception aponta um ciclo de revisão que existe'],
  ['espinha', 'espinha: todo ciclo declara sua banda e a unidade abre pelo contrato'],
  ['exemplo', 'exemplo: toda implementação ou técnica estreia com exemplo trabalhado'],
  ['síntese', `síntese: todo ciclo abre com uma frase de no máximo ${MAX_ONE_LINE_WORDS} palavras`],
  ['instância', 'instância: os dois primeiros parágrafos do ciclo trazem um número real'],
  ['figura', 'figura: toda figura declara curvas distintas e uma faixa que cabe no eixo'],
  ['custo', 'custo: toda implementação declara custo de toda operação do contrato'],
  ['cobertura', 'cobertura: toda parte do critério é produzida por alguma técnica'],
  ['vocabulário', 'vocabulário: nenhuma abstração vaga não registrada'],
  ['ênfase', 'ênfase: asterisco de ênfase sempre emparelhado, e só na prosa do ciclo'],
  ['convenção', 'convenção: todo pseudocódigo respeita a folha de notação'],
  ['referência', 'referência: todo traço é gerado por implementação que roda'],
  ['formato', 'formato: toda coluna editável de traço declara como se escreve a resposta'],
  ['tradução', 'tradução: o pseudocódigo ou atravessa inteiro para TypeScript, ou é declarado prosa'],
  ['glossário', 'glossário: ids únicos, introdução declarada dos dois lados'],
  ['sobrecarga', 'sobrecarga: todo termo sobrecarregado declara seus falsos amigos'],
  ['estreia', 'estreia: nenhum termo aparece na prosa antes do ciclo que o estreia'],
  ['sondagem', 'sondagem: toda sonda aponta um exercício de escolha que existe na unidade dela'],
  ['chamado', 'chamado: toda unidade fecha, no último ciclo, o incidente que abriu'],
] as const

/** Colunas que o exercício já entrega preenchidas; ver `GIVEN` em TraceExercise. */
const GIVEN_COLUMNS = new Set(['step', 'key'])

export type CheckId = (typeof CHECKS)[number][0]
export interface Failure { check: CheckId; detail: string }

export function checkAll(units: Unit[], terms: GlossaryTerm[]): Failure[] {
  const failures: Failure[] = []
  const fail = (check: CheckId, detail: string) => failures.push({ check, detail })

  const allCycleIds = new Set(units.flatMap((u) => u.cycles.map((c) => c.id)))
  const termIds = new Set(terms.map((t) => t.id))

  // --- registro -------------------------------------------------------------
  if (!units.length) {
    fail('registro', 'nenhuma unidade registrada, o gate não tem o que ler')
  }

  /*
    --- schema ---------------------------------------------------------------

    As checagens seguintes leem campo direto, sem guarda, porque o schema já
    garantiu que ele existe. Uma unidade que NÃO passa aqui é retirada do resto
    da rodada: sem isso, um campo obrigatório recém-declarado derrubava o
    validador com TypeError em vez de reprovar com o nome do campo, e um gate
    que quebra não é um gate. Aconteceu duas vezes; ADR-0019.
  */
  let schemaBroke = false
  for (const u of units) {
    const parsed = unitSchema.safeParse(u)
    if (parsed.success) continue
    schemaBroke = true
    for (const issue of parsed.error.issues) {
      fail('schema', `${u.id}: ${issue.path.join('.')}, ${issue.message}`)
    }
  }
  // Sem isto, um campo obrigatório recém-declarado produzia 100 violações de
  // glossário que não existem, as outras checagens leem o dado supondo o
  // schema, e o relatório delas com o schema quebrado é ruído que esconde a
  // causa. Conserte o schema, rode de novo, veja o resto.
  if (schemaBroke) {
    fail('schema', 'as outras checagens não rodaram: elas pressupõem o schema')
    return failures
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

      // A justificativa da correta mora em `why` justamente para não inflar o
      // texto dela: quando morava no texto, a correta era a mais longa em 93%
      // dos exercícios e dava para acertar tudo pelo comprimento.
      const all = choicesOf(ex)
      const right = all.find((c) => c.correct)
      if (right) {
        const longest = Math.max(...all.map((c) => c.text.length))
        if (right.text.length === longest && all.length > 1) {
          fail('equilíbrio', `${ex.id}: a alternativa correta é a mais longa (${right.text.length} contra ${all.filter((c) => !c.correct).map((c) => c.text.length).join(', ')})`)
        }
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
        fail('socrática', `${m.id}: não termina em "?", é explicação, não pergunta`)
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

    // Uma figura afirma alguma coisa, e é a única peça do conteúdo que afirma
    // por desenho. Ver ADR-0017.
    for (const c of u.cycles) {
      const f = c.figure
      if (!f) continue
      if (f.kind === 'growth') {
        const labels = f.curves.map((x) => x.label)
        if (new Set(labels).size !== labels.length) {
          fail('figura', `${c.id}: duas curvas com o mesmo rótulo (${labels.join(', ')})`)
        }
        if (f.highlight) {
          if (f.highlight.from >= f.highlight.to) {
            fail('figura', `${c.id}: a faixa destacada começa depois de terminar`)
          }
          if (f.highlight.to > f.xMax) {
            fail('figura', `${c.id}: a faixa destacada (até ${f.highlight.to}) sai do eixo (até ${f.xMax})`)
          }
        }
      }
      if (f.kind === 'tree') {
        const sets = f.sequences.map((seq) => [...seq.keys].sort((a, b) => a - b).join(','))
        if (new Set(sets).size !== 1) {
          fail('figura', `${c.id}: as duas sequências não têm as mesmas chaves, a figura mostraria o efeito das chaves, não o da ordem`)
        }
        for (const seq of f.sequences) {
          if (new Set(seq.keys).size !== seq.keys.length) {
            fail('figura', `${c.id}: a sequência "${seq.label}" repete uma chave, e a árvore de busca não guarda duplicata`)
          }
        }
      }
      if (f.kind === 'buckets') {
        if (new Set(f.keys).size !== f.keys.length) {
          fail('figura', `${c.id}: a figura repete uma chave, e a tabela guarda uma entrada por chave`)
        }
        const occupied = new Set(f.keys.map((k) => k % f.m))
        if (occupied.size === f.keys.length) {
          fail('figura', `${c.id}: nenhuma das ${f.keys.length} chaves colide com m = ${f.m}, e a figura existe para mostrar a colisão`)
        }
        if (f.searchFor !== undefined && !f.keys.includes(f.searchFor)) {
          fail('figura', `${c.id}: a busca anotada procura ${f.searchFor}, que não está na tabela`)
        }
      }

      if (f.kind === 'recursion') {
        // Se as chamadas não multiplicam mais rápido do que o tamanho cai, o
        // custo por nível cresce, e a figura afirma o contrário do que o ciclo
        // ensina. É a única forma de a árvore de recursão mentir.
        if (f.branches > f.divisor) {
          fail('figura', `${c.id}: com ${f.branches} chamadas e divisor ${f.divisor}, o custo por nível CRESCE, e a figura afirma que ele fica igual`)
        }
        if (f.n % f.divisor !== 0) {
          fail('figura', `${c.id}: n = ${f.n} não é divisível por ${f.divisor}, e os níveis sairiam fracionários`)
        }
      }

      if (f.kind === 'growth-doubling') {
        // Sem pelo menos duas dobras não há o que ver: uma cópia isolada não
        // mostra a média estabilizando, que é a afirmação do ciclo.
        let cap = f.initialCapacity
        let doublings = 0
        for (let n = 0; n < f.insertions; n++) {
          if (n === cap) { cap *= 2; doublings++ }
        }
        if (doublings < 2) {
          fail('figura', `${c.id}: só ${doublings} dobra em ${f.insertions} inserções, e a média não chega a estabilizar`)
        }
      }

      if (f.kind === 'stability') {
        // Sem empate, os dois algoritmos devolvem a mesma coisa e a figura
        // ilustra o oposto do que o ciclo afirma.
        const values = f.items.map((i) => i.value)
        if (new Set(values).size === values.length) {
          fail('figura', `${c.id}: nenhum valor se repete, e sem empate a estabilidade não aparece`)
        }
        const tags = f.items.map((i) => i.tag)
        if (new Set(tags).size !== tags.length) {
          fail('figura', `${c.id}: duas etiquetas iguais, e é a etiqueta que guarda a ordem de chegada`)
        }
      }

      if (f.kind === 'traversal') {
        const known = vertices(f.edges)
        if (!known.includes(f.origin)) {
          fail('figura', `${c.id}: a origem ${f.origin} não aparece em nenhuma aresta`)
        } else {
          const largura = bfsOrder(f.edges, f.origin)
          const profundidade = dfsOrder(f.edges, f.origin)
          const unreached = known.filter((v) => !largura.includes(v))
          if (unreached.length) {
            fail('figura', `${c.id}: ${unreached.join(', ')} não é alcançável a partir de ${f.origin}, e a figura desenharia um vértice que nenhum dos dois percursos visita`)
          }
          if (largura.join(' ') === profundidade.join(' ')) {
            fail('figura', `${c.id}: os dois percursos dão a mesma ordem (${largura.join(' ')}), e a figura existe para mostrar que eles diferem`)
          }
        }
      }

      if (f.kind === 'shift') {
        if (f.removeAt >= f.values.length) {
          fail('figura', `${c.id}: remove a posição ${f.removeAt} de um bloco com ${f.values.length}`)
        }
        if (f.removeAt === f.values.length - 1) {
          fail('figura', `${c.id}: remover a última posição não desloca nada, e a figura existe para mostrar o deslocamento`)
        }
      }
    }

    /*
      A rampa de entrada, cobrada em vez de recomendada.

      `síntese` limita a frase de abertura: acima do teto ela vira mais um
      parágrafo, e o ciclo já tem parágrafos.

      `instância` é a regra que ataca 44 dos 62 ciclos com um movimento só, 
      nenhum ciclo publica sem um número real nos dois primeiros parágrafos.
      Categoria sem caso é economia de tempo para quem já tem referente, e
      palavra sem referente para quem não tem. Ver ADR-0019.
    */
    for (const c of u.cycles) {
      const words = c.oneLine.trim().split(/\s+/).length
      if (words > MAX_ONE_LINE_WORDS) {
        fail('síntese', `${c.id}: a frase de abertura tem ${words} palavras (teto ${MAX_ONE_LINE_WORDS})`)
      }
      if (!/[.!?]$/.test(c.oneLine.trim())) {
        fail('síntese', `${c.id}: a frase de abertura não termina em ponto`)
      }
      const opening = c.body.slice(0, 2).join(' ')
      if (!/\d/.test(opening)) {
        fail('instância', `${c.id}: nenhum número real nos dois primeiros parágrafos`)
      }
    }

    /*
      A versão em TypeScript é DERIVADA do pseudocódigo, nunca escrita ao lado
      dele: duas fontes divergem na primeira correção, e o pseudocódigo deixaria
      de ser canônico, que é o princípio 1.

      Esta checagem não reprova o resíduo: ela EXIGE que o resíduo seja
      declarado. Um bloco com passo em prosa ("mover o que restou de E para o
      fim de S") não é traduzível sem inventar código, e a tela não oferece a
      alternância nele. O que a checagem impede é o resíduo silencioso, o bloco
      que quase traduz e entrega algo que parece TypeScript e não é.
    */
    for (const c of u.cycles) {
      if (!c.pseudocode) continue
      const left = untranslated(c.pseudocode)
      if (left.length && !c.pseudocodeIsProse) {
        fail('tradução', `${c.id}: sobra em português (${left.join(', ')}) e o ciclo não declara pseudocodeIsProse`)
      }
      if (!left.length && c.pseudocodeIsProse) {
        fail('tradução', `${c.id}: declara pseudocodeIsProse e atravessa inteiro, remova a declaração`)
      }
    }

    // O ciclo em que uma implementação ou técnica APARECE pela primeira vez é
    // onde o exemplo trabalhado rende: depois dele o aluno já tem referente, e
    // antes dele a definição é taxonomia sem chão. Ver ADR-0016.
    const debuted = new Set<string>()
    for (const c of u.cycles) {
      if (!c.elaborates || debuted.has(c.elaborates)) continue
      debuted.add(c.elaborates)
      if (!c.workedExample) {
        fail('exemplo', `${c.id}: estreia "${c.elaborates}" e não traz exemplo trabalhado`)
      }
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
    // A prosa do ciclo aceita `**assim**` e mais nada. Fora dela, asterisco é
  // literal, e um asterisco solto na tela já apareceu como `**não cresce**`.
  const cycleBodies = new Set(units.flatMap((u) => u.cycles.flatMap((c) => c.body)))
  for (const [path, text] of authored) {
    const marks = (text.match(/\*\*/g) ?? []).length
    if (marks === 0) continue
    if (!cycleBodies.has(text)) {
      fail('ênfase', `${path}: usa ** fora da prosa do ciclo, onde ele não é interpretado`)
    } else if (marks % 2 !== 0) {
      fail('ênfase', `${path}: tem ${marks} marcas de ênfase, uma delas não fecha`)
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
    [/\breturn\b/, 'use `retorne`, pseudocódigo é pt-BR'],
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

      // ADR-0013: coluna dada não precisa de formato; coluna que o aluno
      // preenche, sim, e o formato não pode ser um valor que o gabarito emite,
      // senão o placeholder entrega um passo da resposta.
      const emitted = new Set(steps.flatMap((step) => Object.values(step)))
      for (const col of ex.columns) {
        if (GIVEN_COLUMNS.has(col.key)) continue
        if (!col.placeholder) {
          fail('formato', `${ex.id}: coluna "${col.key}" é preenchida pelo aluno e não declara placeholder`)
          continue
        }
        if (emitted.has(col.placeholder)) {
          fail('formato', `${ex.id}: o placeholder de "${col.key}" é "${col.placeholder}", que o gabarito emite, declare o formato, não o valor`)
        }
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

    if (t.introducedIn === APP) {
      // Termo do produto, não da matéria: ele nasce na primeira tela, e nenhum
      // ciclo pode reivindicá-lo em introducesTerms.
      if (introducedBy.has(t.id)) {
        fail('glossário', `${t.id}: é vocabulário do app e ${introducedBy.get(t.id)} o reivindica`)
      }
      continue
    }

    if (t.introducedIn === PLANNED) {
      if (!t.plannedIn) fail('glossário', `${t.id}: é "${PLANNED}" e não diz onde pretende nascer`)
      if (t.plannedIn && allCycleIds.has(t.plannedIn)) {
        fail('glossário', `${t.id}: o ciclo "${t.plannedIn}" já existe, troque "${PLANNED}" por introducedIn real`)
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

  /*
    --- estreia -------------------------------------------------------------

    Nasceu de uma deriva real: `pior caso`, `caso médio` e `amortizado` eram
    vocabulário de trabalho da unidade 02 e declaravam nascer na unidade 04,
    duas unidades depois de o aluno já estar usando os três. A checagem
    `glossário` não pegava, porque ela confere se os dois lados concordam sobre
    ONDE o termo nasce, e não se ele foi usado antes disso.

    Citar para a frente continua permitido, e é deliberado na trilha: citar é o
    oposto de assumir. Mas a citação fica declarada em `forwardCitations`, com
    razão, do mesmo jeito que uma abstração vaga.
  */
  const readingOrder = new Map<string, number>()
  units.flatMap((u) => u.cycles).forEach((c, i) => readingOrder.set(c.id, i))

  const licensed = new Set(forwardCitations.map((f) => `${f.cycle}|${f.term}`))
  const used = new Set<string>()

  for (const t of terms) {
    const born = readingOrder.get(t.introducedIn)
    if (born === undefined) continue
    const re = new RegExp(`(?<![\\p{L}])${escapeRegExp(t.canonical)}(?![\\p{L}])`, 'iu')
    for (const u of units) {
      for (const c of u.cycles) {
        const at = readingOrder.get(c.id)!
        if (at >= born) continue
        if (!re.test(`${c.oneLine} ${c.body.join(' ')}`)) continue
        const key = `${c.id}|${t.id}`
        used.add(key)
        if (!licensed.has(key)) {
          fail('estreia', `${c.id} usa "${t.canonical}", que estreia depois em ${t.introducedIn}, e a citação não está declarada`)
        }
      }
    }
  }

  // Licença órfã é licença que ninguém confere. Some com ela.
  for (const f of forwardCitations) {
    if (!used.has(`${f.cycle}|${f.term}`)) {
      fail('estreia', `citação declarada em ${f.cycle} para "${f.term}" não acontece mais, remova a licença`)
    }
  }

  /*
    --- chamado -------------------------------------------------------------

    Toda unidade abre com um incidente concreto em `motivatingProblem`, e sem
    isto ela terminava sem voltar a ele. Uma história pela metade é pior que
    nenhuma: o aluno guarda a abertura e nunca recebe a resposta.

    A checagem confere os dois lados. O postmortem no meio da unidade seria
    fechar o chamado antes de ter as ferramentas para fechá-lo. ADR-0027.
  */
  for (const u of units) {
    const last = u.cycles[u.cycles.length - 1]
    for (const c of u.cycles) {
      const isLast = c.id === last?.id
      if (isLast && !c.postmortem) {
        fail('chamado', `${u.id}: o último ciclo (${c.id}) não fecha o incidente da abertura`)
      }
      if (!isLast && c.postmortem) {
        fail('chamado', `${c.id}: só o último ciclo da unidade fecha o chamado`)
      }
      if (c.postmortem && !u.misconceptions.some((m) => m.id === c.postmortem!.trapId)) {
        fail('chamado', `${c.id}: o postmortem aponta "${c.postmortem.trapId}", que não está no catálogo da unidade`)
      }
    }
  }

  /*
    --- sondagem ------------------------------------------------------------

    A sondagem promete quatro minutos e reaproveita exercícios que já existem.
    As duas coisas quebram em silêncio: um id renomeado deixa a sonda apontando
    para o nada, e um exercício que vira `trace` estoura o tempo sem que nada
    avise. Ver ADR-0022.
  */
  for (const probe of probes) {
    const u = units.find((x) => x.id === probe.unitId)
    if (!u) {
      fail('sondagem', `${probe.unitId}: a sonda aponta uma unidade que não existe`)
      continue
    }
    const ex = u.exercises.find((e) => e.id === probe.exerciseId)
    if (!ex) {
      fail('sondagem', `${probe.unitId}: a sonda aponta "${probe.exerciseId}", que não existe na unidade`)
      continue
    }
    if (ex.kind !== 'choice') {
      fail('sondagem', `${probe.exerciseId} é "${ex.kind}", e a sondagem só cabe em quatro minutos com escolha`)
    }
  }

  const sondadas = new Set(probes.map((p) => p.unitId))
  if (sondadas.size !== probes.length) {
    fail('sondagem', 'duas sondas na mesma unidade: a sondagem é uma por unidade')
  }

  return failures
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
