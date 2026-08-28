import type { Unit } from '../../schema'
import { tracingExercises, tracingMisconceptions } from './exercises'

export const tracingUnit: Unit = {
  kind: 'method',
  id: 'tracing',
  number: 1,
  title: 'Lógica e teste de mesa',
  learningObjective:
    'Dizer o que um trecho de código faz, quantas vezes o laço dele roda e o que ele devolve ' +
    'nas entradas de fronteira — sem executar, e sabendo dizer de onde cada afirmação veio.',
  prerequisites: [
    'Ler uma atribuição, uma condição e um laço em qualquer linguagem',
    'Saber o que é um índice e o que é o tamanho de uma coleção',
  ],
  motivatingProblem:
    'Um pull request de trinta linhas, gerado por IA, que passa nos testes existentes. A ' +
    'pergunta do revisor não é "compila?" — é "o que isto faz quando a lista tem um elemento ' +
    'só, e o que faz quando ela está vazia?". Rodar responde a primeira pergunta e não ' +
    'responde a segunda: em revisão não há execução. Como se sabe o que um laço faz sem rodá-lo?',

  symbols: [
    { symbol: 'A', means: 'a coleção que o código percorre' },
    { symbol: '|A|', means: 'quantos elementos a coleção tem' },
    { symbol: 'A[i]', means: 'o elemento que está na posição i' },
    { symbol: 'i', means: 'a posição que o laço está examinando' },
    { symbol: 'total', means: 'o valor que vai sendo acumulado entre as rodadas' },
  ],

  criterion: {
    id: 'execution-trace',
    name: 'Traço de execução',
    produces: 'o estado do programa a cada rodada, e o que ele devolve no fim',
    parts: [
      { id: 'variables', name: 'variáveis observadas',
        guarantee: 'quais nomes carregam o estado que decide o resultado' },
      { id: 'state-per-step', name: 'estado por rodada',
        guarantee: 'o valor de cada uma delas ao fim de cada rodada' },
      { id: 'guard', name: 'condição que governa',
        guarantee: 'a expressão que decide se existe uma próxima rodada' },
      { id: 'output', name: 'saída',
        guarantee: 'o que a função devolve, e sob qual condição ela devolve isso' },
    ],
    whenOmitted: [
      { partId: 'guard', reads: 'o laço roda n vezes' },
      { partId: 'state-per-step', reads: 'no fim, total é a soma de tudo' },
      { partId: 'variables', reads: 'o índice vai de 0 até o fim, então percorre a coleção' },
      { partId: 'output', reads: 'funciona' },
    ],
  },

  techniques: [
    {
      id: 'step-simulation',
      name: 'Simulação passo a passo',
      derivesCriterion: 'execution-trace',
      summary: 'Escrever a tabela do estado, uma linha por rodada, derivando cada linha da anterior.',
      produces: ['variables', 'state-per-step', 'guard', 'output'],
      wrongWhen: [
        { scenario: 'O número de rodadas depende da entrada e passa de algumas dezenas',
          useInstead: 'raciocínio por invariante, que descreve todas as rodadas de uma vez' },
        { scenario: 'A pergunta é sobre uma classe de entradas, não sobre uma entrada concreta',
          useInstead: 'raciocínio por invariante' },
      ],
      everydayAnchor:
        'É o que duas pessoas fazem no quadro branco quando discordam sobre um laço, e a ' +
        'discordância acaba na terceira linha da tabela.',
      invariant: 'Cada linha é derivada da anterior. Uma linha adivinhada invalida todas as seguintes.',
    },
    {
      id: 'invariant-reasoning',
      name: 'Raciocínio por invariante',
      derivesCriterion: 'execution-trace',
      summary: 'Declarar a propriedade que vale antes e depois de cada rodada, e mostrar que a rodada a preserva.',
      produces: ['variables', 'guard', 'output'],
      wrongWhen: [
        { scenario: 'Você ainda não consegue enunciar a propriedade',
          useInstead: 'simulação passo a passo — a invariante quase sempre aparece da tabela' },
        { scenario: 'A pergunta é "qual o valor na rodada 4", e não "o que vale sempre"',
          useInstead: 'simulação passo a passo' },
      ],
      everydayAnchor:
        'É o que um comentário como "aqui a parte à esquerda de i já está ordenada" está ' +
        'tentando dizer — e é por isso que esse comentário, quando está certo, vale mais que ' +
        'o laço inteiro.',
      invariant: 'A propriedade tem de valer na entrada do laço, com zero rodadas executadas.',
    },
  ],

  cycles: [
    { id: 'tracing.c0', title: 'O que é saber o que um código faz', layer: 'essential', band: 'criterion',
      introducesTerms: ['execution-trace', 'state'],
      body: [
        '"Eu li e entendi" não é uma afirmação verificável. Ela vira uma quando carrega quatro coisas: quais nomes guardam o estado, o valor de cada um a cada rodada, a condição que decide se há próxima rodada, e o que a função devolve.',
        'Cada uma dessas quatro partes, quando falta, produz uma frase que soa certa. Sem a condição, sai "o laço roda n vezes". Sem o estado por rodada, sai "no fim, total é a soma de tudo" — uma afirmação sobre o fim, derivada de nada. Guarde essas frases: elas são as armadilhas desta unidade, e você vai reencontrá-las nas outras sete.',
      ],
      exerciseId: 'tracing.e0' },

    { id: 'tracing.c1', title: 'A condição que decide se há próxima rodada', layer: 'essential', band: 'criterion',
      introducesTerms: ['guard', 'iteration'],
      body: [
        'Um laço não percorre uma coleção. Um laço testa uma condição, executa um corpo, e testa de novo. Que isso acabe percorrendo a coleção é consequência de como o corpo mexe no índice — não é a definição.',
        'A diferença importa no momento em que o corpo mexe em outra coisa além do índice. Se ele remove um elemento da própria coleção, os dois lados da condição mudam na mesma rodada: o índice sobe e o tamanho desce. O percurso deixa de ser o que a leitura ingênua supõe, e nada no código avisa.',
      ],
      workedExample: {
        problem: 'Percorrer [a, b, c, d] removendo b, com i avançando de um em um.',
        whatToNotice: 'Depois de remover b, c ocupa a posição 1 e i já foi para 2. c nunca é examinado, e a coleção final parece só ter perdido um elemento.',
      },
      exerciseId: 'tracing.e1' },

    { id: 'tracing.c2', title: 'Simular passo a passo', layer: 'essential', band: 'technique', elaborates: 'step-simulation',
      introducesTerms: [],
      body: [
        'A primeira técnica é escrever a tabela: uma coluna por nome que muda, uma linha por rodada. A regra é uma só, e ela é o que separa a tabela de um chute: cada linha é derivada da anterior.',
        'A parte difícil não é a conta, é decidir quais colunas existem. Um nome que muda dentro do laço e não está na tabela é um valor que você vai adivinhar quando precisar dele — e o traço inteiro passa a depender desse chute.',
      ],
      pseudocode: `função contar_pares(A)
    total ← 0
    i ← 0
    enquanto i < |A| faça
        se A[i] mod 2 = 0 então
            total ← total + 1
        i ← i + 2
    retorne total`,
      invariant: 'Ao começar cada rodada, total conta os elementos pares entre as posições já visitadas.',
      exerciseId: 'tracing.e2' },

    { id: 'tracing.c3', title: 'A propriedade que sobrevive a cada rodada', layer: 'essential', band: 'technique', elaborates: 'invariant-reasoning',
      introducesTerms: ['loop-invariant'],
      body: [
        'A tabela responde sobre uma entrada. A invariante responde sobre todas: é uma propriedade que vale antes de cada rodada e continua valendo depois dela.',
        'O teste que separa uma invariante de uma conclusão é este: ela precisa valer **antes da primeira rodada**, com o laço ainda sem ter feito nada. "No fim, total é a soma de tudo" não passa nesse teste — é a conclusão. "Ao começar a rodada de i, total é a soma das posições 0 até i − 1" passa, e é dela que a conclusão sai.',
        'Ela também não dispensa a tabela. Quando você não consegue enunciar a propriedade, simule três rodadas: ela quase sempre está escrita ali, esperando ser lida.',
      ],
      exerciseId: 'tracing.e3' },

    { id: 'tracing.c4', title: 'A fronteira, e a entrada que ninguém testou', layer: 'essential', band: 'failure',
      introducesTerms: ['off-by-one', 'empty-case'],
      body: [
        'Duas famílias de erro moram na fronteira, e as duas passam em teste feito com a entrada típica.',
        'A primeira é a posição: numa coleção de n elementos, a última posição válida é n − 1, e o primeiro valor que a condição precisa recusar é n. Trocar `<` por `≤` move essa linha em uma casa, e uma casa é o suficiente.',
        'A segunda é a coleção vazia. Todo laço tem um comportamento para zero rodadas, e ele é o valor que estava lá antes do laço começar. Se o código lê alguma coisa antes de testar a condição, o caso vazio não chega nem a esse valor.',
      ],
      exerciseId: 'tracing.e4' },

    { id: 'tracing.c5', title: 'O laço não roda n vezes', layer: 'essential', band: 'failure',
      introducesTerms: [],
      body: [
        'Volte ao critério do primeiro ciclo. A parte que falta com mais frequência é a condição que governa, e a frase que ela produz quando falta é a mais comum de todas: "o laço roda n vezes".',
        'Quantas rodadas acontecem é decidido por duas coisas juntas — a condição de parada e o passo com que o índice anda. O tamanho da coleção aparece numa das duas, e sozinho não responde nada.',
        'Este é o ciclo que a unidade inteira prepara, e é o que transfere: na unidade de análise de custo, contar rodadas é contar custo, e contar errado aqui é errar lá com convicção.',
      ],
      exerciseId: 'tracing.e5' },

    { id: 'tracing.c6', title: 'O que não chega a ser avaliado', layer: 'essential', band: 'failure',
      introducesTerms: ['short-circuit'],
      body: [
        'Numa condição composta, o segundo lado nem sempre é avaliado. Se o primeiro lado de um "e" já é falso, o resultado está decidido, e a linguagem não avalia o resto.',
        'Isso deixa de ser detalhe no momento em que avaliar o segundo lado quebraria — um acesso fora da coleção, uma divisão por zero, uma chamada em algo ausente. A ordem dos dois lados deixa de ser estilo e passa a ser a diferença entre funcionar e falhar.',
        'É a última família de leitura desta unidade, e a mais silenciosa: ela produz código que roda por anos e falha na primeira entrada vazia.',
      ],
      exerciseId: 'tracing.e6' },
  ],

  misconceptions: tracingMisconceptions,

  exercises: tracingExercises,

  mastery: {
    statement:
      'O aluno domina esta unidade quando, diante de um laço de até vinte linhas que nunca ' +
      'viu, consegue sem executar: nomear as variáveis que carregam o estado, dizer quantas ' +
      'rodadas acontecem a partir da condição e do passo — não do tamanho da coleção —, ' +
      'produzir o traço das três primeiras rodadas, e dizer o que a função devolve para a ' +
      'coleção vazia.',
    requiresClean: ['tracing.e2', 'tracing.e5'],
    revisitIntervalDays: 7,
  },
}
