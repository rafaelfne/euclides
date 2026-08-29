import type { Unit } from '../../schema'
import { linearExercises, linearMisconceptions } from './exercises'

export const linearUnit: Unit = {
  kind: 'structure',
  id: 'linear',
  number: 3,
  title: 'Estruturas lineares',
  learningObjective:
    'Dizer, diante de uma coleção linear em código que nunca viu, qual implementação o custo ' +
    'observado denuncia, qual operação domina a carga, e o que teria de mudar na carga para ' +
    'a outra implementação ganhar.',
  prerequisites: [
    'Traçar um laço e contar as escritas que ele executa',
    'Notação O, com regime e hipóteses declarados',
    'Array como bloco contíguo com acesso por índice',
  ],
  motivatingProblem:
    'Uma fila de jobs em memória. Chegam eventos, um worker consome do começo. Alguém usou um ' +
    'array e removeu sempre da posição 0, e com dez mil pendentes a fila começou a atrasar sem ' +
    'que a carga de trabalho tivesse mudado. Nada no código diz que remover do começo custa ' +
    'diferente de remover do fim. Por que custa?',

  symbols: [
    { symbol: 'A', means: 'a coleção' },
    { symbol: 'n', means: 'quantos elementos estão guardados' },
    { symbol: 'A[i]', means: 'o elemento que está na posição i' },
    { symbol: 'p', means: 'a posição em que a operação foi pedida' },
    { symbol: 'j', means: 'a posição que o laço de deslocamento está escrevendo' },
  ],

  adt: {
    id: 'list',
    name: 'Lista',
    operations: [
      { name: 'obter', signature: 'obter(p)', guarantee: 'o elemento que está na posição p' },
      { name: 'inserir', signature: 'inserir(p, x)', guarantee: 'põe x na posição p; o que estava de p em diante anda uma casa' },
      { name: 'remover', signature: 'remover(p)', guarantee: 'tira o elemento da posição p; o que estava à direita anda uma casa' },
      { name: 'tamanho', signature: 'tamanho()', guarantee: 'quantos elementos existem' },
    ],
    answers: 'Perguntas por posição.',
    cannotAnswer: [
      'Em que posição está um valor — só varrendo',
      'Se um valor existe, melhor que percorrendo tudo',
      'Qual é o menor ou o maior valor',
      'Quais valores estão numa faixa',
    ],
  },

  implementations: [
    {
      id: 'dynamic-array',
      name: 'Array dinâmico',
      implementsAdt: 'list',
      summary: 'Bloco contíguo com capacidade própria, que dobra quando enche.',
      cost: {
        obter: { bound: 'O(1)', regime: 'worst', amortized: false,
          assumptions: ['o endereço da posição sai de uma conta, sem percorrer nada'],
          measuredIn: 'n = elementos guardados' },
        inserir: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['inserir na posição p desloca os n − p elementos à direita', 'inserir no fim é O(1) amortizado, e é outro caso'],
          measuredIn: 'n = elementos guardados' },
        remover: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['remover da posição p desloca os n − p − 1 elementos à direita'],
          measuredIn: 'n = elementos guardados' },
        tamanho: { bound: 'O(1)', regime: 'worst', amortized: false,
          assumptions: ['o tamanho é guardado, não contado'],
          measuredIn: 'n = elementos guardados' },
      },
      space: { bound: 'O(n)', regime: 'worst', amortized: false,
        assumptions: ['a capacidade pode ser até o dobro do tamanho, logo depois de dobrar'],
        measuredIn: 'posições alocadas' },
      wrongWhen: [
        { scenario: 'Inserção e remoção acontecem no começo com frequência, como numa fila',
          useInstead: 'deque, ou uma fila circular que move só os dois índices das pontas' },
        { scenario: 'Os elementos são grandes e cada deslocamento copia muito byte',
          useInstead: 'um array de referências, deslocando ponteiros em vez dos elementos' },
      ],
      everydayAnchor:
        'É o `ArrayList`, o `Vec`, a `list` do Python. Que `append` seja barato e `insert(0, x)` ' +
        'seja caro não é um detalhe da linguagem: é esta tabela de custos aparecendo.',
      invariant: 'Os n elementos ocupam as posições 0 a n − 1 do bloco, sem buraco no meio.',
    },
    {
      id: 'linked-list',
      name: 'Lista ligada',
      implementsAdt: 'list',
      summary: 'Cada elemento mora num nó que aponta para o próximo.',
      cost: {
        obter: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['chegar à posição p exige seguir p ponteiros a partir da cabeça'],
          measuredIn: 'n = elementos guardados' },
        inserir: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['a religação em si é O(1); o custo é chegar até o nó anterior'],
          measuredIn: 'n = elementos guardados' },
        remover: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['com o nó anterior já em mãos, a remoção é O(1) — e é isso que a frase costuma omitir'],
          measuredIn: 'n = elementos guardados' },
        tamanho: { bound: 'O(1)', regime: 'worst', amortized: false,
          assumptions: ['o contador é mantido a cada operação'],
          measuredIn: 'n = elementos guardados' },
      },
      space: { bound: 'O(n)', regime: 'worst', amortized: false,
        assumptions: ['cada elemento paga também o ponteiro para o próximo'],
        measuredIn: 'nós alocados' },
      wrongWhen: [
        { scenario: 'O acesso é por índice, ou a coleção é percorrida inteira com frequência',
          useInstead: 'array dinâmico — cada salto de ponteiro é um acesso a endereço qualquer' },
        { scenario: 'A coleção é pequena e cabe inteira num punhado de linhas de cache',
          useInstead: 'array dinâmico, onde o percurso não sai do bloco' },
      ],
      everydayAnchor:
        'É a outra metade de uma LRU cache: a tabela hash acha o item em O(1) e entrega o nó, e ' +
        'com o nó em mãos a lista ligada o move para a frente sem varrer nada.',
      invariant: 'Seguindo o ponteiro do próximo a partir da cabeça, chega-se a todos os nós exatamente uma vez.',
    },
  ],

  cycles: [
    { id: 'linear.c0', title: 'O que a lista promete, e promete por posição', layer: 'essential', band: 'contract',
      introducesTerms: ['list', 'position'],
      oneLine: "A lista responde \"o que está na posição 3\", nunca \"onde está o valor 3\".",
      body: [
        'Uma lista é uma sequência de elementos em posições, e as 4 operações são todas sobre posição: obter, inserir, remover, tamanho.',
        'A lista do que ela não promete é curta e cara: onde está um valor, se um valor existe, qual é o menor, quais estão numa faixa. Nada disso sai das quatro operações sem percorrer tudo. Guarde essa ausência — a unidade seguinte existe para prometer a primeira delas.',
      ],
      workedExample: {
        problem: "Numa lista de 1000 nomes, obter a posição 500 é 1 operação. Descobrir em que posição está \"Ana\" são até 1000 comparações.",
        whatToNotice: "As duas perguntas parecem simétricas e não são. Só a primeira sai das quatro operações do contrato.",
      },
      exerciseId: 'linear.e0' },

    { id: 'linear.c1', title: 'Pilha: o que sobra quando só uma ponta é acessível', layer: 'essential', band: 'contract',
      introducesTerms: ['stack'],
      oneLine: "Numa pilha só a última ponta é acessível, e as duas operações custam 1.",
      body: [
        'Uma pilha é a lista com uma restrição: só a última ponta é acessível. Empilhar põe no fim, desempilhar tira do fim, e as 2 custam 1 operação — obter por posição não existe.',
        'A restrição não é uma perda — é o que torna as duas operações constantes em qualquer implementação, e é o que permite a quem lê o código saber, sem verificar, que ninguém vai varrer a coleção.',
        'Ela é o contrato que a execução de todo programa usa: a call stack empilha um quadro por chamada aberta, e é por isso que uma recursão profunda demais estoura — a pilha tem fundo.',
      ],
      workedExample: {
        problem: "Empilhe 3 quadros de chamada e desempilhe: sai o terceiro, o segundo, o primeiro. Uma recursão de 100 mil níveis empilha 100 mil quadros e estoura.",
        whatToNotice: "Nenhuma das operações percorreu nada. É a restrição que garante isso — com acesso ao meio, não haveria como prometer custo 1.",
      },
      exerciseId: 'linear.e1' },

    { id: 'linear.c2', title: 'Fila, e por que ela não é a pilha ao contrário', layer: 'essential', band: 'contract',
      introducesTerms: ['queue'],
      oneLine: "A fila devolve A, B, C onde a pilha devolve B, C, A.",
      body: [
        'Uma fila restringe a outra ponta: entra no fim, sai do começo. Parece a pilha invertida, e com 3 elementos já dá para ver que não é.',
        'A diferença aparece assim que as operações são intercaladas. Empilhe A, empilhe B, tire um, empilhe C, tire tudo: a pilha devolve B, C, A. A fila, com as mesmas operações, devolve A, B, C. Uma não é o inverso da outra; elas respondem a perguntas diferentes.',
        'E é aqui que o problema motivador desta unidade mora: a fila é o contrato que o worker de jobs quer, e implementá-la com remoção da posição 0 de um array é escolher a implementação errada para o contrato certo.',
      ],
      workedExample: {
        problem: "Entre A, entre B, saia 1, entre C, saia tudo. A pilha devolve B, C, A. A fila devolve A, B, C.",
        whatToNotice: "São as mesmas 5 operações na mesma ordem, e as saídas não têm nada em comum além do conjunto. Uma não é o inverso da outra.",
      },
      exerciseId: 'linear.e2' },

    { id: 'linear.c3', title: 'Array dinâmico e o custo de andar uma casa', layer: 'essential', band: 'implementation', elaborates: 'dynamic-array',
      introducesTerms: ['dynamic-array', 'capacity'],
      oneLine: "Tirar o primeiro de 5 elementos obriga 4 escritas; tirar o último, nenhuma.",
      body: [
        'A primeira implementação guarda tudo num bloco contíguo. O endereço de uma posição sai de uma conta, e é por isso que obter é constante — nada é percorrido.',
        'O preço aparece quando o meio muda. Para tirar o elemento da posição p, todos os que estavam à direita precisam andar uma casa, uma escrita por elemento. A chamada é uma; as escritas são n − p − 1.',
        'O bloco também tem duas grandezas que não são a mesma: quantas posições foram alocadas, e quantas têm valor. A segunda cresce de um em um; a primeira dá saltos, dobrando quando enche — e é por isso que inserir no fim é barato quase sempre, e caro de vez em quando.',
      ],
      pseudocode: `função remover(A, p)
    para cada j de p até n − 2 faça
        A[j] ← A[j + 1]
    n ← n − 1`,
      invariant: 'Os n elementos ocupam as posições 0 a n − 1, sem buraco no meio.',
      figure: {
        kind: 'shift',
        values: [10, 20, 30, 40, 50],
        removeAt: 0,
        caption:
          'A chamada é uma; as escritas são quatro. E a última posição continua guardando 50 ' +
          'depois da última escrita: o bloco não encolheu, só o tamanho lógico mudou — que é a ' +
          'diferença entre capacidade e tamanho.',
      },
      workedExample: {
        problem: 'Remover a posição 0 de um bloco com 10, 20, 30, 40, 50.',
        whatToNotice: 'A última posição continua guardando 50 depois da última escrita. Só o tamanho muda, e o bloco não encolhe.',
      },
      exerciseId: 'linear.e3' },

    { id: 'linear.c4', title: 'Lista ligada e o nó em mãos', layer: 'essential', band: 'implementation', elaborates: 'linked-list',
      introducesTerms: ['linked-list', 'node'],
      oneLine: "Religar dois ponteiros custa 1; chegar até o nó certo pode custar 500.",
      body: [
        'A segunda implementação abre mão do bloco: cada elemento mora num nó que aponta para o próximo. Nada precisa andar uma casa, porque nada é vizinho de nada por endereço.',
        'Isso troca um custo por outro. Religar dois ponteiros é constante, mas chegar até o nó certo é percorrer. "Remoção é O(1) numa lista ligada" é verdade **depois** que alguém pagou para achar o nó — e a operação que se pede na prática é "remova o valor X", que inclui a busca.',
        'A operação que a lista ligada realmente perde é obter por posição. Não há conta que dê o endereço da posição 500: só existe seguir quinhentos ponteiros.',
      ],
      workedExample: {
        problem: 'Remova o valor X de uma lista ligada de mil nós, e depois remova o nó que você já tem em mãos.',
        whatToNotice: 'A segunda operação é a mesma religação de ponteiros da primeira. Toda a diferença de custo está no que aconteceu antes dela.',
      },
      exerciseId: 'linear.e4' },

    { id: 'linear.c5', title: 'A tabela de custos não conta tudo', layer: 'essential', band: 'cost',
      introducesTerms: ['cache-locality'],
      oneLine: "Ler um endereço traz os vizinhos junto, e a tabela de custos não conta isso.",
      body: [
        'Pela tabela, a lista ligada ganha em inserção e a escolha parece decidida. Na prática, somar 1 milhão de inteiros num bloco contíguo costuma terminar em uma fração do tempo de percorrer os mesmos 1 milhão em nós ligados — e o motivo não aparece em notação O.',
        'Ler um endereço traz os vizinhos junto. Percorrer um bloco contíguo aproveita isso a cada passo; percorrer uma lista ligada salta para endereços quaisquer, e cada salto pode não aproveitar nada.',
        'Isso não invalida a tabela — declara uma hipótese que ela tinha e não escreveu: que todo acesso custa o mesmo. É o melhor exemplo da trilha inteira de por que uma afirmação de custo carrega hipóteses, e é a unidade 2 aparecendo aqui com consequência concreta.',
      ],
      workedExample: {
        problem: "Somar 1 milhão de inteiros num bloco contíguo e na mesma quantidade de nós ligados dá a mesma conta O(n) — e o bloco costuma terminar em uma fração do tempo do outro.",
        whatToNotice: "A diferença não está na notação, está na hipótese que ela não escreveu: que todo acesso custa o mesmo.",
      },
      exerciseId: 'linear.e5' },

    { id: 'linear.c6', title: 'Quando a lista é a escolha errada', layer: 'essential', band: 'cost',
      introducesTerms: [],
      oneLine: "A lista é a escolha errada quando a pergunta é por valor, não por posição.",
      body: [
        'Volte às 4 operações do primeiro ciclo. Tudo que elas não prometem é onde a escolha falha.',
        'A lista é a escolha errada quando a pergunta é por valor e não por posição; quando a carga concentra inserção e remoção numa ponta que a implementação escolhida não favorece; e quando alguém leu a tabela de custos sem ler as hipóteses dela.',
        'O primeiro caso é o que abre a unidade seguinte: responder "esse valor já existe?" sem varrer é exatamente o que a lista não promete, e é o que uma tabela hash promete.',
      ],
      workedExample: {
        problem: "Um cadastro com 50 mil e-mails, e a pergunta \"esse e-mail já existe?\". Com lista, são até 50 mil comparações por cadastro novo.",
        whatToNotice: "Nenhuma das 4 operações da lista responde isso. O custo alto não é o defeito — o defeito é o contrato não prometer a pergunta.",
      },
      exerciseId: 'linear.e6' },
  ],

  misconceptions: linearMisconceptions,

  exercises: linearExercises,

  mastery: {
    statement:
      'O aluno domina esta unidade quando, diante de uma coleção linear em código que nunca ' +
      'viu, consegue sem executar: nomear qual implementação o custo observado denuncia, ' +
      'apontar a operação que domina a carga, construir a carga de trabalho que inverte a ' +
      'escolha entre bloco contíguo e nós ligados, e dizer qual hipótese da tabela de custos ' +
      'a máquina real desmente.',
    requiresClean: ['linear.e3', 'linear.e5'],
    revisitIntervalDays: 7,
  },
}
