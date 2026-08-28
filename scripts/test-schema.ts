/**
 * Proof that the method spine is expressible — ADR-0012.
 *
 * The fixture below is NOT content and NOT a spec. It is the smallest unit
 * that exercises the `method` shape end to end, and it exists so the decision
 * is checked by the build instead of asserted in a document. The real unit of
 * asymptotic analysis waits for a spec, like every other one.
 */
import { unit as unitSchema, type MethodUnit, type Unit } from '../src/content/schema'
import { CHECKS, checkAll } from '../src/lib/validate'
import { hashUnit } from '../src/content/units/hash'
import { allTerms } from '../src/content/glossary'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

const fixture: Unit = {
  kind: 'method',
  id: 'fixture',
  number: 99,
  title: 'Fixture — unidade de método',
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
      body: ['A afirmação incompleta é a que passa na revisão. Comece pelo que ela omite.'],
      exerciseId: 'fixture.e0' },
    { id: 'fixture.c1', title: 'Contagem de operações', layer: 'essential',
      band: 'technique', elaborates: 'counting', introducesTerms: [],
      body: ['Somar o que cada laço executa responde três das quatro partes, e cala sobre a quarta.'],
      exerciseId: 'fixture.e1' },
    { id: 'fixture.c2', title: 'Recorrência', layer: 'essential',
      band: 'technique', elaborates: 'recurrence', introducesTerms: [],
      body: ['Quando o procedimento chama a si mesmo, a conta direta não fecha e a relação fecha.'],
      exerciseId: 'fixture.e2' },
    { id: 'fixture.c3', title: 'Onde o julgamento quebra', layer: 'essential',
      band: 'failure', introducesTerms: [],
      body: ['Volte à lista de omissões do primeiro ciclo: cada uma é uma afirmação que soa certa.'],
      exerciseId: 'fixture.e3' },
  ],

  exercises: [
    { kind: 'choice', id: 'fixture.e0',
      prompt: '“Essa busca é O(1).” O que falta para a frase sobreviver a uma revisão?',
      choices: [
        { correct: true, text: 'O regime, a amortização, as hipóteses e o que n conta' },
        { correct: false, text: 'Nada: O(1) já é a informação inteira', misconceptionId: 'fixture.sem-qualificar' },
        { correct: false, text: 'Só o regime; as outras três são detalhe de quem gosta de teoria', misconceptionId: 'fixture.sem-qualificar' },
      ] },
    { kind: 'choice', id: 'fixture.e1',
      prompt: 'Dois laços aninhados sobre a mesma coleção. Qual parte a contagem direta não decide sozinha?',
      choices: [
        { correct: true, text: 'A amortização — ela só aparece quando alguma operação redistribui custo ao longo da sequência' },
        { correct: false, text: 'O limite, que precisa de recorrência em qualquer caso', misconceptionId: 'fixture.tecnica-unica' },
        { correct: false, text: 'Nenhuma: a contagem responde as quatro', misconceptionId: 'fixture.tecnica-unica' },
      ] },
    { kind: 'choice', id: 'fixture.e2',
      prompt: 'Você escreveu a relação e ela não termina. O que faltou?',
      choices: [
        { correct: true, text: 'O caso base — sem ele a relação não descreve procedimento que pare' },
        { correct: false, text: 'A relação está certa; recorrência simplesmente não serve aqui', misconceptionId: 'fixture.tecnica-unica' },
      ] },
    { kind: 'choice', id: 'fixture.e3',
      prompt: 'Qual das frases abaixo omite a unidade de medida?',
      choices: [
        { correct: true, text: '“Comparar duas strings é O(1)”' },
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

const failuresOnFixture = checkAll([hashUnit, fixture], allTerms)
check('a unidade de método passa nas mesmas checagens que a de estrutura',
  failuresOnFixture.length === 0,
  failuresOnFixture.map((f) => `[${f.check}] ${f.detail}`).join(' | '))

check('as duas espinhas convivem no mesmo registro',
  [hashUnit.kind, fixture.kind].join(',') === 'structure,method')

const wrongBand = { ...fixture, cycles: [{ ...fixture.cycles[0]!, band: 'contract' as const }, ...fixture.cycles.slice(1)] }
const bandFailures = checkAll([wrongBand], allTerms).filter((f) => f.check === 'espinha')
check('banda de estrutura numa unidade de método reprova', bandFailures.length > 0,
  'nenhuma falha de espinha')

const uncovered = {
  ...fixture,
  techniques: (fixture as MethodUnit).techniques.map((t) => ({ ...t, produces: ['bound'] })),
}
const coverFailures = checkAll([uncovered], allTerms).filter((f) => f.check === 'cobertura')
check('parte do critério que nenhuma técnica produz reprova', coverFailures.length === 3,
  `${coverFailures.length} falha(s) de cobertura`)

const badPart = {
  ...fixture,
  criterion: { ...(fixture as MethodUnit).criterion, whenOmitted: [{ partId: 'nao-existe', reads: 'x' }] },
}
check('whenOmitted apontando parte inexistente reprova',
  checkAll([badPart], allTerms).some((f) => f.check === 'cobertura'))

check('a lista de checagens é a mesma para os dois kinds', CHECKS.length > 0)

console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas as checagens passaram\n')
process.exit(failures ? 1 : 0)
