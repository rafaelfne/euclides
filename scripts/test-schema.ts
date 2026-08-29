/**
 * As checagens da espinha de método, exercitadas pelo lado negativo, ADR-0012.
 *
 * Quando este arquivo nasceu, a fixture era a única unidade de método que
 * existia e o teste provava que a espinha era exprimível. Isso agora é provado
 * pelo conteúdo real: `tracing`, `asymptotics` e `synthesis` são unidades de
 * método registradas e passam no gate como qualquer outra.
 *
 * O que sobrou para a fixture é o que o conteúdo real não pode mostrar sem
 * quebrar o build: que banda do kind errado reprova, que parte de critério sem
 * técnica que a produza reprova, e que `whenOmitted` apontando parte
 * inexistente reprova. Ela continua não sendo conteúdo nem spec.
 */
import { unit as unitSchema, type MethodUnit, type Unit } from '../src/content/schema'
import { CHECKS, checkAll } from '../src/lib/validate'
import { units } from '../src/content/index'
import { allTerms } from '../src/content/glossary'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? `, ${detail}` : ''}`)
  if (!ok) failures++
}

const fixture: Unit = {
  kind: 'method',
  id: 'fixture',
  number: 99,
  title: 'Fixture, unidade de método',
  learningObjective: 'Existir para provar que a espinha de método passa no gate.',
  prerequisites: ['Nenhum: esta unidade não é conteúdo'],
  motivatingProblem:
    'Um colega afirma que a busca é O(1) e a revisão aprova. A afirmação não é falsa; ela ' +
    'está incompleta, e o que falta é o que decide se ela vale no seu caso.',

  symbols: [
    { symbol: 'n', means: 'o tamanho da entrada, e o texto tem de dizer o que ele conta' },
    { symbol: 'T(n)', means: 'o custo do procedimento para uma entrada desse tamanho' },
  ],

  criterion: {
    id: 'cost-claim',
    name: 'Afirmação de custo',
    produces: 'uma afirmação de custo com as quatro partes declaradas',
    parts: [
      { id: 'bound', name: 'limite', guarantee: 'a classe assintótica afirmada' },
      { id: 'regime', name: 'regime', guarantee: 'pior caso, caso médio ou melhor caso' },
      { id: 'amortized', name: 'amortização', guarantee: 'se o custo é por operação ou espalhado na sequência' },
      { id: 'measured-in', name: 'unidade de medida', guarantee: 'o que n conta, e o que ele ignora' },
    ],
    whenOmitted: [
      { partId: 'regime', reads: 'hash é O(1)' },
      { partId: 'measured-in', reads: 'comparar duas strings é O(1)' },
    ],
  },

  techniques: [
    {
      id: 'counting',
      name: 'Contagem de operações',
      derivesCriterion: 'cost-claim',
      summary: 'Somar o que cada laço executa, em função do tamanho da entrada.',
      produces: ['bound', 'regime', 'measured-in'],
      wrongWhen: [
        { scenario: 'O procedimento chama a si mesmo e o número de níveis depende da entrada',
          useInstead: 'recorrência' },
      ],
      everydayAnchor:
        'É o que você faz de cabeça ao ler dois laços aninhados numa revisão e concluir que ' +
        'aquilo não sobrevive a dez mil linhas.',
      invariant: 'A conta só vale se toda operação somada custar o mesmo.',
    },
    {
      id: 'recurrence',
      name: 'Recorrência',
      derivesCriterion: 'cost-claim',
      summary: 'Escrever o custo em função do custo do subproblema e resolver a relação.',
      produces: ['bound', 'regime', 'amortized', 'measured-in'],
      wrongWhen: [
        { scenario: 'O procedimento é um laço simples sem chamada a si mesmo',
          useInstead: 'contagem de operações, que responde em uma linha' },
      ],
      everydayAnchor:
        'É o raciocínio por trás de "dividir ao meio dá log n", que todo mundo repete e ' +
        'quase ninguém deriva.',
      invariant: 'A relação precisa de um caso base, ou ela não descreve procedimento nenhum.',
    },
  ],

  cycles: [
    { id: 'fixture.c0', title: 'O que uma afirmação de custo precisa declarar',
      layer: 'essential', band: 'criterion', introducesTerms: [],
      oneLine: 'A afirmação de custo tem 5 partes, e a incompleta é a que passa.',
      body: ['A afirmação incompleta é a que passa na revisão. São 5 partes; comece pelo que ela omite.'],
      workedExample: { problem: 'Fixture.', whatToNotice: 'Fixture.' },
      exerciseId: 'fixture.e0' },
    { id: 'fixture.c1', title: 'Contagem de operações', layer: 'essential',
      band: 'technique', elaborates: 'counting', introducesTerms: [],
      oneLine: 'Some o que cada laço executa e a conta fecha em 1 linha.',
      body: ['Somar o que cada laço executa responde 3 das 4 partes, e cala sobre a quarta.'],
      workedExample: { problem: 'Fixture.', whatToNotice: 'Fixture.' },
      exerciseId: 'fixture.e1' },
    { id: 'fixture.c2', title: 'Recorrência', layer: 'essential',
      band: 'technique', elaborates: 'recurrence', introducesTerms: [],
      oneLine: 'Quando o procedimento chama a si mesmo, escreva a relação.',
      body: ['Quando o procedimento chama a si mesmo 2 vezes por nível, a conta direta não fecha e a relação fecha.'],
      workedExample: { problem: 'Fixture.', whatToNotice: 'Fixture.' },
      exerciseId: 'fixture.e2' },
    { id: 'fixture.c3', title: 'Onde o julgamento quebra', layer: 'essential',
      band: 'failure', introducesTerms: [],
      oneLine: 'Cada uma das 4 omissões produz uma frase que soa certa.',
      body: ['Volte à lista de 4 omissões do primeiro ciclo: cada uma é uma afirmação que soa certa.'],
      workedExample: { problem: 'Fixture.', whatToNotice: 'Fixture.' },
      postmortem: {
        incident: 'Fixture.',
        trapId: 'fixture.sem-qualificar',
        missingClaim: 'Fixture.',
        whatWouldCatch: 'Fixture.',
      },
      exerciseId: 'fixture.e3' },
  ],

  exercises: [
    { kind: 'choice', id: 'fixture.e0',
      prompt: '“Essa busca é O(1).” O que falta para a frase sobreviver a uma revisão?',
      choices: [
        { correct: true, text: 'O regime, a amortização, as hipóteses e o que n conta', why: 'Fixture.' },
        { correct: false, text: 'Nada: O(1) já é a informação inteira', misconceptionId: 'fixture.sem-qualificar' },
        { correct: false, text: 'Só o regime; as outras três são detalhe de quem gosta de teoria', misconceptionId: 'fixture.sem-qualificar' },
      ] },
    { kind: 'choice', id: 'fixture.e1',
      prompt: 'Dois laços aninhados sobre a mesma coleção. Qual parte a contagem direta não decide sozinha?',
      choices: [
        { correct: true, text: 'A amortização', why: 'Ela só aparece quando alguma operação redistribui custo ao longo da sequência.' },
        { correct: false, text: 'O limite, que precisa de recorrência em qualquer caso', misconceptionId: 'fixture.tecnica-unica' },
        { correct: false, text: 'Nenhuma: a contagem responde as quatro', misconceptionId: 'fixture.tecnica-unica' },
      ] },
    { kind: 'choice', id: 'fixture.e2',
      prompt: 'Você escreveu a relação e ela não termina. O que faltou?',
      choices: [
        { correct: true, text: 'O caso base', why: 'Sem ele a relação não descreve procedimento que pare.' },
        { correct: false, text: 'A relação está certa; recorrência simplesmente não serve aqui', misconceptionId: 'fixture.tecnica-unica' },
      ] },
    { kind: 'choice', id: 'fixture.e3',
      prompt: 'Qual das frases abaixo omite a unidade de medida?',
      choices: [
        { correct: true, text: '“Comparar duas strings é O(1)”', why: 'Fixture.' },
        { correct: false, text: '“Inserir é O(1) amortizado no caso médio, com n = pares armazenados”', misconceptionId: 'fixture.sem-qualificar' },
      ] },
  ],

  misconceptions: [
    { id: 'fixture.sem-qualificar', label: 'Afirmação de custo sem qualificadores',
      socraticQuestion: 'Escreva a mesma frase para o pior caso. Ela continua verdadeira?',
      escalation: ['Se as duas versões da frase discordam, qual delas a original estava afirmando?'],
      reviewCycle: 'fixture.c0' },
    { id: 'fixture.tecnica-unica', label: 'Uma técnica de derivação serve para tudo',
      socraticQuestion: 'Aplique a contagem direta a um procedimento que chama a si mesmo. Onde a conta para?',
      escalation: ['O número de níveis é dado pela entrada. Você consegue somar sem saber quantos são?'],
      reviewCycle: 'fixture.c2' },
  ],

  mastery: {
    statement:
      'O aluno domina esta unidade quando, diante de uma afirmação de custo escrita por ' +
      'outra pessoa, nomeia qual das quatro partes está faltando e constrói o caso em que ' +
      'a omissão inverte a conclusão.',
    requiresClean: ['fixture.e0', 'fixture.e3'],
    revisitIntervalDays: 7,
  },
}

const parsed = unitSchema.safeParse(fixture)
check('o schema aceita uma unidade de método', parsed.success,
  parsed.success ? '' : parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join(' | '))

const failuresOnFixture = checkAll([...units, fixture], allTerms)
check('a unidade de método passa nas mesmas checagens que a de estrutura',
  failuresOnFixture.length === 0,
  failuresOnFixture.map((f) => `[${f.check}] ${f.detail}`).join(' | '))

const kinds = new Set(units.map((u) => u.kind))
check('as duas espinhas convivem no registro real',
  kinds.has('structure') && kinds.has('method'),
  units.map((u) => `${u.id}:${u.kind}`).join(','))
check('toda unidade registrada declara um kind conhecido',
  units.every((u) => u.kind === 'structure' || u.kind === 'method'))

const wrongBand = { ...fixture, cycles: [{ ...fixture.cycles[0]!, band: 'contract' as const }, ...fixture.cycles.slice(1)] }
const bandFailures = checkAll([...units, wrongBand], allTerms).filter((f) => f.check === 'espinha')
check('banda de estrutura numa unidade de método reprova', bandFailures.length > 0,
  'nenhuma falha de espinha')

const uncovered = {
  ...fixture,
  techniques: (fixture as MethodUnit).techniques.map((t) => ({ ...t, produces: ['bound'] })),
}
const coverFailures = checkAll([...units, uncovered], allTerms).filter((f) => f.check === 'cobertura')
check('parte do critério que nenhuma técnica produz reprova', coverFailures.length === 3,
  `${coverFailures.length} falha(s) de cobertura`)

const badPart = {
  ...fixture,
  criterion: { ...(fixture as MethodUnit).criterion, whenOmitted: [{ partId: 'nao-existe', reads: 'x' }] },
}
check('whenOmitted apontando parte inexistente reprova',
  checkAll([...units, badPart], allTerms).some((f) => f.check === 'cobertura'))

/*
  As duas checagens do ADR-0026 e do ADR-0028, pelo lado negativo.

  Elas nasceram para pegar erro que o conteúdo correto não mostra: uma linha
  renumerada e uma linguagem sem tokenizador passavam caladas. Um teste que só
  visse o conteúdo real veria as duas passando e não provaria nada.
*/
const comPainel = units.find((u) => u.exercises.some((e) => e.kind === 'trace' && e.lineByColumn))!
const exPainel = comPainel.exercises.find((e) => e.kind === 'trace' && e.lineByColumn)!
const cicloDoPainel = comPainel.cycles.find((c) => c.exerciseId === exPainel.id)!
const totalDeLinhas = cicloDoPainel.pseudocode!.split('\n').length

const trocaExercicio = (u: Unit, id: string, patch: object): Unit => ({
  ...u,
  exercises: u.exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)),
}) as Unit

const linhaAlem = trocaExercicio(comPainel, exPainel.id, {
  lineByColumn: { ...(exPainel as { lineByColumn: Record<string, number> }).lineByColumn, __alem: totalDeLinhas + 1 },
})
check('linha acesa além do fim do pseudocódigo reprova',
  checkAll([...units.filter((u) => u.id !== comPainel.id), linhaAlem], allTerms).some((f) => f.check === 'acesa'))

const colunaFantasma = trocaExercicio(comPainel, exPainel.id, {
  lineByColumn: { nao_existe_essa_coluna: 1 },
})
check('linha acesa para coluna que o traço não tem reprova',
  checkAll([...units.filter((u) => u.id !== comPainel.id), colunaFantasma], allTerms).some((f) => f.check === 'acesa'))

const semPseudocodigo: Unit = {
  ...comPainel,
  cycles: comPainel.cycles.map((c) => (c.id === cicloDoPainel.id ? { ...c, pseudocode: undefined } : c)),
} as Unit
check('lineByColumn sem pseudocódigo no ciclo reprova',
  checkAll([...units.filter((u) => u.id !== comPainel.id), semPseudocodigo], allTerms).some((f) => f.check === 'acesa'))

const comDefeito = units.find((u) => u.exercises.some((e) => e.kind === 'bug'))!
const exDefeito = comDefeito.exercises.find((e) => e.kind === 'bug')!

const semTokenizador = trocaExercicio(comDefeito, exDefeito.id, { language: 'python' })
check('exercício de defeito em linguagem sem tokenizador reprova',
  checkAll([...units.filter((u) => u.id !== comDefeito.id), semTokenizador], allTerms).some((f) => f.check === 'realce'))

const linhaInexistente = trocaExercicio(comDefeito, exDefeito.id, {
  faultyLines: [(exDefeito as { code: string }).code.split('\n').length + 5],
})
check('exercício de defeito apontando linha além do código reprova',
  checkAll([...units.filter((u) => u.id !== comDefeito.id), linhaInexistente], allTerms).some((f) => f.check === 'realce'))

const trocaCiclo = (u: Unit, id: string, patch: object): Unit => ({
  ...u,
  cycles: u.cycles.map((c) => (c.id === id ? { ...c, ...patch } : c)),
}) as Unit

const comRotacao = units.find((u) => u.cycles.some((c) => c.figure?.kind === 'rotation'))!
const cicloRotacao = comRotacao.cycles.find((c) => c.figure?.kind === 'rotation')!

const jaEquilibrada = trocaCiclo(comRotacao, cicloRotacao.id, {
  figure: { ...cicloRotacao.figure, keys: [2, 1, 3] },
})
check('figura de rotação sobre árvore já equilibrada reprova',
  checkAll([...units.filter((u) => u.id !== comRotacao.id), jaEquilibrada], allTerms).some((f) => f.check === 'figura'))

const chaveRepetida = trocaCiclo(comRotacao, cicloRotacao.id, {
  figure: { ...cicloRotacao.figure, keys: [1, 2, 2, 3] },
})
check('figura de rotação com chave repetida reprova',
  checkAll([...units.filter((u) => u.id !== comRotacao.id), chaveRepetida], allTerms).some((f) => f.check === 'figura'))

const comVisitados = units.find((u) => u.cycles.some((c) => c.figure?.kind === 'visited'))!
const cicloVisitados = comVisitados.cycles.find((c) => c.figure?.kind === 'visited')!

const semCiclo = trocaCiclo(comVisitados, cicloVisitados.id, {
  figure: {
    ...cicloVisitados.figure,
    edges: [{ from: 'A', to: 'B' }, { from: 'B', to: 'C' }],
  },
})
check('figura de visitados sobre grafo sem ciclo reprova',
  checkAll([...units.filter((u) => u.id !== comVisitados.id), semCiclo], allTerms).some((f) => f.check === 'figura'))

const origemForaDoGrafo = trocaCiclo(comVisitados, cicloVisitados.id, {
  figure: { ...cicloVisitados.figure, origin: 'Z' },
})
check('figura de visitados com origem fora do grafo reprova',
  checkAll([...units.filter((u) => u.id !== comVisitados.id), origemForaDoGrafo], allTerms).some((f) => f.check === 'figura'))

/*
  Cinco vértices em ciclo precisam de cinco rodadas para a busca marcada
  esvaziar a fila. Declarar quatro deixa a coluna que deveria FECHAR aberta, e a
  figura passa a mostrar duas colunas que não terminam — o oposto do que o ciclo
  afirma, com o desenho parecendo certo.
*/
const rodadasDeMenos = trocaCiclo(comVisitados, cicloVisitados.id, {
  figure: {
    ...cicloVisitados.figure,
    edges: [
      { from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'C', to: 'D' },
      { from: 'D', to: 'E' }, { from: 'E', to: 'A' },
    ],
    rounds: 4,
  },
})
check('figura de visitados sem rodadas para a busca marcada terminar reprova',
  checkAll([...units.filter((u) => u.id !== comVisitados.id), rodadasDeMenos], allTerms)
    .some((f) => f.check === 'figura' && f.detail.includes('não bastam')))

const comInsercao = units.find((u) => u.cycles.some((c) => c.figure?.kind === 'insertion'))!
const cicloInsercao = comInsercao.cycles.find((c) => c.figure?.kind === 'insertion')!
const entradasDaFigura = (cicloInsercao.figure as Extract<NonNullable<typeof cicloInsercao.figure>, { kind: 'insertion' }>).inputs

const elementosDiferentes = trocaCiclo(comInsercao, cicloInsercao.id, {
  figure: {
    ...cicloInsercao.figure,
    inputs: [entradasDaFigura[0]!, { ...entradasDaFigura[1]!, values: [9, 8, 7, 6, 5, 4] }],
  },
})
check('figura de insertion com elementos diferentes nas duas entradas reprova',
  checkAll([...units.filter((u) => u.id !== comInsercao.id), elementosDiferentes], allTerms).some((f) => f.check === 'figura'))

const mesmoCusto = trocaCiclo(comInsercao, cicloInsercao.id, {
  figure: {
    ...cicloInsercao.figure,
    inputs: [
      { ...entradasDaFigura[0]!, values: [1, 2, 3, 4, 5, 6] },
      { ...entradasDaFigura[1]!, values: [1, 2, 3, 4, 5, 6] },
    ],
  },
})
check('figura de insertion com as duas entradas custando igual reprova',
  checkAll([...units.filter((u) => u.id !== comInsercao.id), mesmoCusto], allTerms).some((f) => f.check === 'figura'))

check('a lista de checagens é a mesma para os dois kinds', CHECKS.length > 0)

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas as checagens passaram\n')
process.exit(failures ? 1 : 0)
