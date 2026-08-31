import type { Unit } from '../../schema'
import { preludeExercises, preludeMisconceptions } from './exercises'

export const preludeUnit: Unit = {
  kind: 'method',
  id: 'prelude',
  number: 0,
  title: 'Ler um procedimento',
  learningObjective:
    'Acompanhar valores, decisões e repetições em pseudocódigo curto, e explicar o resultado sem executar.',
  prerequisites: [
    'Nenhum conhecimento de programação',
    'Saber acompanhar uma conta simples em papel',
  ],
  motivatingProblem:
    'Um e-mail foi parar na pasta de spam, e a pessoa quer saber por quê. A regra começa com 0 sinais: soma 2 se houver um link desconhecido, soma 1 se o remetente não estiver nos contatos e tira 1 se houver uma assinatura conhecida. ' +
    'Com 2 ou mais sinais, o e-mail vai para o spam. Como acompanhar as regras para reconstruir a decisão?',

  symbols: [
    { symbol: 'total', means: 'o valor acumulado até o passo atual' },
    { symbol: 'i', means: 'a posição que será examinada' },
    { symbol: 'pontos', means: 'a sequência de números que o procedimento lê' },
  ],

  criterion: {
    id: 'procedural-reading',
    name: 'Leitura de procedimento',
    produces: 'uma sequência verificável de estados, decisões e resultado',
    parts: [
      { id: 'initial-state', name: 'estado inicial', guarantee: 'quais valores existem antes do primeiro passo' },
      { id: 'transformation', name: 'transformação', guarantee: 'qual valor muda e para qual valor vai' },
      { id: 'decision', name: 'decisão', guarantee: 'qual pergunta escolhe ou repete o próximo passo' },
      { id: 'result', name: 'resultado', guarantee: 'o que sobra ao terminar e de onde veio' },
    ],
    whenOmitted: [
      { partId: 'initial-state', reads: 'o valor muda em algum momento' },
      { partId: 'transformation', reads: 'o procedimento chega ao resultado certo' },
      { partId: 'decision', reads: 'ele repete o que for necessário' },
      { partId: 'result', reads: 'ele funciona' },
    ],
  },

  techniques: [
    {
      id: 'state-table',
      name: 'Tabela de estado',
      derivesCriterion: 'procedural-reading',
      summary: 'Escrever os nomes e os valores em cada passo, derivando uma linha da anterior.',
      produces: ['initial-state', 'transformation', 'result'],
      wrongWhen: [
        { scenario: 'A repetição tem muitas rodadas e a pergunta é sobre todas elas', useInstead: 'a condição e a invariante da unidade 01' },
      ],
      everydayAnchor: 'É a tabela que transforma uma divergência sobre um cálculo de pedidos em linhas que duas pessoas conseguem conferir.',
      invariant: 'Cada linha começa com o estado deixado pela linha anterior.',
    },
    {
      id: 'condition-reading',
      name: 'Leitura da condição',
      derivesCriterion: 'procedural-reading',
      summary: 'Separar a pergunta da ação que acontece quando a resposta permite avançar.',
      produces: ['decision', 'result'],
      wrongWhen: [
        { scenario: 'O trecho tem várias mudanças no mesmo nome', useInstead: 'tabela de estado' },
      ],
      everydayAnchor: 'É o que se confere ao revisar por que uma mensagem foi parar no spam: primeiro a pergunta sobre a pontuação, depois a ação que ela libera.',
      invariant: 'Uma ação condicionada só acontece depois que a sua pergunta foi respondida.',
    },
  ],

  cycles: [
    { id: 'prelude.c0', title: 'Um procedimento transforma valores', layer: 'essential', band: 'criterion',
      introducesTerms: ['state'],
      oneLine: 'Um procedimento transforma um estado em outro por passos observáveis.',
      plainly: 'Você não precisa saber programar para acompanhar uma sequência de 3 mudanças.',
      body: [
        'Estado é o retrato dos valores num momento. Neste caso, os sinais começam em 0, passam por 2 e 3, voltam a 2 e então são comparados com o limite 2.',
        'O resultado não é uma impressão sobre o texto. Ele vem dos valores antes e depois de cada passo, da pergunta que foi feita e do valor que sobrou no fim.',
      ],
      workedExample: {
        problem: 'Um e-mail tem um link desconhecido, vem de alguém fora dos contatos e traz uma assinatura conhecida. Os sinais passam por 0, 2, 3 e 2. Como 2 é pelo menos 2, ele vai para o spam.',
        whatToNotice: 'A decisão ficou conferível porque cada regra deixou um valor visível antes da pergunta final.',
      },
      figure: {
        kind: 'concept-flow',
        caption: 'O resultado aparece depois que o estado passa por transformações e decisões.',
        nodes: [
          { id: 'initial', label: '0 sinais', tone: 'contract' },
          { id: 'changed', label: '2 → 3 → 2 sinais', tone: 'implementation' },
          { id: 'decision', label: '2 ou mais?', tone: 'neutral' },
          { id: 'result', label: 'vai para spam', tone: 'cost' },
        ],
        edges: [
          { from: 'initial', to: 'changed' },
          { from: 'changed', to: 'decision' },
          { from: 'decision', to: 'result' },
        ],
      },
      exerciseId: 'prelude.e0' },

    { id: 'prelude.c1', title: 'Nomes guardam valores', layer: 'essential', band: 'technique', elaborates: 'state-table',
      introducesTerms: ['variable', 'assignment'],
      oneLine: 'Uma atribuição troca o valor guardado por um nome.',
      plainly: 'Um nome pode guardar 0 e depois guardar 2, em 2 passos.',
      body: [
        'Uma variável é um nome que guarda um valor enquanto o procedimento avança. Se total começa em 0, o nome total aponta para esse valor naquele momento.',
        'Uma atribuição calcula o lado direito e guarda o resultado no nome à esquerda. `total ← total + 2` não pergunta se os valores são iguais: ele produz 2 e substitui o valor guardado em total.',
      ],
      pseudocode: `total ← 0
total ← total + 2`,
      workedExample: {
        problem: 'Comece com total guardando 0. Leia total ← total + 2. A primeira linha deixa total em 0; a segunda calcula 0 + 2 e deixa total em 2.',
        whatToNotice: 'A tabela tem duas linhas porque o nome mudou duas vezes: o valor usado pela segunda linha veio da primeira.',
      },
      exerciseId: 'prelude.e1' },

    { id: 'prelude.c2', title: 'Uma condição faz uma pergunta', layer: 'essential', band: 'technique', elaborates: 'condition-reading',
      introducesTerms: ['condition'],
      oneLine: 'Uma condição decide se uma ação acontece, mas não é a ação.',
      plainly: 'A pergunta sobre 2 tem 2 respostas: sim ou não.',
      body: [
        'Uma condição é uma pergunta que pode ser respondida com sim ou não. Em `total ≥ 2`, o número 2 não muda total e o símbolo ≥ não soma nada.',
        'A ação vem depois da resposta. Se total vale 2, a condição é verdadeira e o passo seguinte pode acontecer; se total vale 0, a condição é falsa e esse passo é pulado.',
      ],
      pseudocode: `se total ≥ 2 então
    selo ← 1`,
      workedExample: {
        problem: 'Com total guardando 0, a pergunta total ≥ 2 é falsa e selo não muda. Com total guardando 2, a pergunta é verdadeira e selo recebe 1.',
        whatToNotice: 'A mesma ação depende do valor que já estava guardado. Primeiro vem a pergunta; só depois vem a atribuição de selo.',
      },
      exerciseId: 'prelude.e2' },

    { id: 'prelude.c3', title: 'Repetir é perguntar de novo', layer: 'essential', band: 'failure',
      introducesTerms: ['iteration'],
      oneLine: 'Cada rodada começa com um novo teste da condição.',
      plainly: 'Um procedimento com 3 números pode ter 3 rodadas e 3 mudanças.',
      body: [
        'Uma rodada é uma passagem pelo corpo de um laço. Se pontos tem 3 números, o procedimento pode ler um número, mudar total e avançar i em cada rodada.',
        'A repetição não acontece por magia nem porque alguém escreveu a palavra enquanto. Antes de cada rodada, a condição é testada; quando i chega a 3, i < 3 fica falso e o corpo não acontece de novo.',
      ],
      pseudocode: `função contar(pontos)
    total ← 0
    i ← 0
    enquanto i < |pontos| faça
        total ← total + pontos[i]
        i ← i + 1
    retorne total`,
      workedExample: {
        problem: 'Com pontos = [2, 4, 1], as rodadas começam com i = 0, i = 1 e i = 2. Depois da terceira, i vale 3 e a condição recusa uma quarta rodada.',
        whatToNotice: 'A condição é testada 4 vezes: 3 testes deixam o corpo passar e o quarto teste encerra a repetição.',
      },
      exerciseId: 'prelude.e3' },

    { id: 'prelude.c4', title: 'A ordem dos passos importa', layer: 'essential', band: 'failure',
      introducesTerms: [],
      oneLine: 'O segundo passo recebe exatamente o estado que o primeiro deixou.',
      plainly: 'Com 2 atribuições, trocar a ordem pode trocar o resultado.',
      body: [
        'Quando dois passos mudam o mesmo nome, o segundo não começa do zero. Ele recebe o valor produzido pelo primeiro, mesmo que as duas linhas usem palavras parecidas.',
        'Por isso não basta olhar a última linha e fazer uma conta solta. A ordem de 2 atribuições pode decidir qual valor está disponível quando a próxima pergunta acontece.',
      ],
      workedExample: {
        problem: 'Comece com total = 0. Faça total ← 5 e depois total ← total + 2: o resultado é 7. Se fizer total ← total + 2 antes de total ← 5, o resultado é 5.',
        whatToNotice: 'As duas versões têm as mesmas linhas, mas o segundo passo recebe estados diferentes porque a ordem mudou.',
      },
      exerciseId: 'prelude.e4' },

    { id: 'prelude.c5', title: 'O caso sem itens também é uma entrada', layer: 'essential', band: 'failure',
      introducesTerms: ['list', 'position', 'empty-case'],
      oneLine: 'Uma sequência sem itens não tem a posição 0 para ser lida.',
      plainly: 'Uma sequência com 0 itens responde diferente de uma com 1.',
      body: [
        'Uma lista guarda itens em posições. A primeira posição é 0, então uma lista com 1 item tem a posição 0, mas uma lista com 0 itens não tem posição nenhuma.',
        'O caso vazio precisa ser perguntado antes de confiar no procedimento. Se ele tenta ler a posição 0 antes de testar o tamanho, a falha acontece antes de qualquer rodada.',
      ],
      workedExample: {
        problem: 'Para uma lista com [7], a leitura da posição 0 encontra 7. Para uma lista [], a mesma leitura tenta encontrar uma posição que não existe.',
        whatToNotice: 'A diferença entre 1 item e 0 itens não é um detalhe: ela decide se a primeira leitura é possível.',
      },
      figure: {
        kind: 'concept-flow',
        caption: 'A posição 0 existe com um item e não existe quando a lista está vazia.',
        nodes: [
          { id: 'one', label: '[7] → posição 0', tone: 'contract' },
          { id: 'zero', label: '[] → nenhuma posição', tone: 'implementation' },
        ],
        edges: [{ from: 'one', to: 'zero' }],
      },
      exerciseId: 'prelude.e5' },

    { id: 'prelude.c6', title: 'O que você consegue ler agora', layer: 'essential', band: 'failure',
      introducesTerms: [],
      oneLine: 'Uma leitura verificável mostra o caminho, não só a frase final.',
      plainly: 'Depois de 6 ciclos, você consegue conferir um procedimento curto sem executá-lo.',
      body: [
        'Você chegou ao primeiro teste: diante de um procedimento de até 8 linhas, procure os valores iniciais, as mudanças, as perguntas e o resultado.',
        'Se a explicação disser apenas que o código funciona, ainda falta o caminho. Uma leitura que outra pessoa confere mostra pelo menos 2 estados intermediários ou explica por que nenhuma rodada acontece.',
      ],
      workedExample: {
        problem: 'Leia o procedimento de pontos: ele começa com total = 0, percorre 3 posições, soma 2, 4 e 1, chega a total = 7 e recusa a próxima rodada quando i = 3.',
        whatToNotice: 'O resultado 7 é confiável porque cada mudança foi ligada ao estado anterior e a condição final foi conferida.',
      },
      postmortem: {
        incident: 'O e-mail ia para o spam depois de passar por regras que somavam e retiravam sinais. Sem acompanhar os passos, a pessoa via a decisão, mas não conseguia justificar por que a pontuação final atingia o limite.',
        trapId: 'prelude.ordem-ignorada',
        missingClaim: 'O estado antes e depois de cada transformação, inclusive o valor testado pela condição.',
        whatWouldCatch: 'Uma tabela curta com os valores iniciais, as 2 mudanças e a pergunta respondida no estado correto.',
      },
      exerciseId: 'prelude.e6' },
  ],

  exercises: preludeExercises,
  misconceptions: preludeMisconceptions,

  mastery: {
    statement: 'A pessoa domina esta etapa quando identifica os valores iniciais, acompanha duas transformações, responde uma condição e explica o resultado final sem executar o código.',
    requiresClean: ['prelude.e1', 'prelude.e5'],
    revisitIntervalDays: 3,
  },
}
