import type { Unit } from '../../schema'
import { graphsExercises, graphsMisconceptions } from './exercises'

export const graphsUnit: Unit = {
  kind: 'structure',
  id: 'graphs',
  number: 6,
  title: 'Grafos',
  learningObjective:
    'Dizer, diante de código que percorre uma estrutura ligada, se ele termina para entrada ' +
    'com ciclo; nomear a representação que o custo de espaço denuncia; e escolher o percurso ' +
    'pela pergunta que precisa ser respondida.',
  prerequisites: [
    'Fila e pilha como contratos, e o custo de cada operação delas',
    'Árvore como estrutura ligada sem ciclo',
    'Notação O com unidade de medida declarada',
  ],
  motivatingProblem:
    'Uma tela de permissões: um usuário pertence a times, times herdam de times, e a pergunta é ' +
    '"esse usuário pode ver este documento?". A implementação consulta um nível por vez, e o ' +
    'suporte relata que para alguns usuários a tela trava. Ninguém consegue reproduzir — até ' +
    'alguém descobrir que o time A foi posto dentro do B, e o B dentro do A. ' +
    'O que muda num percurso quando o caminho pode voltar?',

  symbols: [
    { symbol: 'G', means: 'o grafo inteiro' },
    { symbol: 'V', means: 'quantos vértices o grafo tem' },
    { symbol: 'E', means: 'quantas arestas o grafo tem' },
    { symbol: 'u, v', means: 'dois vértices quaisquer' },
    { symbol: 'grau(v)', means: 'quantos vizinhos diretos o vértice v tem' },
  ],

  adt: {
    id: 'graph',
    name: 'Grafo',
    operations: [
      { name: 'vizinhos', signature: 'vizinhos(v)', guarantee: 'os vértices ligados diretamente a v' },
      { name: 'existeAresta', signature: 'existeAresta(u, v)', guarantee: 'sim ou não' },
      { name: 'adicionarAresta', signature: 'adicionarAresta(u, v)', guarantee: 'liga u a v' },
      { name: 'vertices', signature: 'vertices()', guarantee: 'todos os vértices do grafo' },
    ],
    answers: 'Perguntas sobre vizinhança direta, uma por chamada.',
    cannotAnswer: [
      'Se existe caminho entre dois vértices',
      'Qual o caminho mais curto entre dois vértices',
      'Se o grafo tem ciclo',
      'Quais vértices são alcançáveis a partir de um dado',
    ],
  },

  implementations: [
    {
      id: 'adjacency-list',
      name: 'Lista de adjacência',
      implementsAdt: 'graph',
      summary: 'Cada vértice guarda a lista dos vizinhos dele.',
      cost: {
        vizinhos: { bound: 'O(k)', regime: 'worst', amortized: false,
          assumptions: ['a lista do vértice já está pronta — devolvê-la é entregar o que existe'],
          measuredIn: 'k = grau do vértice' },
        existeAresta: { bound: 'O(k)', regime: 'worst', amortized: false,
          assumptions: ['é preciso percorrer a lista de u procurando v'],
          measuredIn: 'k = grau de u' },
        adicionarAresta: { bound: 'O(1)', regime: 'average', amortized: true,
          assumptions: ['anexar ao fim de um array dinâmico', 'não verifica se a aresta já existe'],
          measuredIn: 'V = vértices, E = arestas' },
        vertices: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['enumerar os vértices é percorrê-los'],
          measuredIn: 'n = V, o número de vértices' },
      },
      space: { bound: 'O(n+m)', regime: 'worst', amortized: false,
        assumptions: ['uma entrada por vértice e uma por aresta, e nada além disso'],
        measuredIn: 'n = V vértices, m = E arestas' },
      wrongWhen: [
        { scenario: 'O grafo é denso e a pergunta dominante é "existe aresta entre estes dois"',
          useInstead: 'matriz de adjacência, que responde numa conta' },
        { scenario: 'As arestas mudam o tempo todo e é preciso remover uma aresta específica com frequência',
          useInstead: 'matriz de adjacência, ou lista com conjunto no lugar da lista' },
      ],
      everydayAnchor:
        'É o padrão de toda biblioteca de grafo, e o motivo é que grafo real é esparso: um ' +
        'usuário pertence a cinco times, não a todos os times da empresa.',
      invariant: 'v aparece na lista de u se e somente se existe aresta de u para v.',
    },
    {
      id: 'adjacency-matrix',
      name: 'Matriz de adjacência',
      implementsAdt: 'graph',
      summary: 'Uma tabela de todos contra todos, dizendo sim ou não para cada par possível.',
      cost: {
        vizinhos: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['é preciso varrer a linha inteira, mesmo que o vértice tenha um vizinho só'],
          measuredIn: 'n = V, o número de vértices' },
        existeAresta: { bound: 'O(1)', regime: 'worst', amortized: false,
          assumptions: ['o endereço da célula sai de uma conta com os dois índices'],
          measuredIn: 'V = vértices' },
        adicionarAresta: { bound: 'O(1)', regime: 'worst', amortized: false,
          assumptions: ['a célula já existe: adicionar é escrever nela'],
          measuredIn: 'V = vértices' },
        vertices: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['os vértices são os índices da matriz'],
          measuredIn: 'n = V, o número de vértices' },
      },
      space: { bound: 'O(n²)', regime: 'worst', amortized: false,
        assumptions: ['uma célula por par possível, exista a aresta ou não'],
        measuredIn: 'n = V, o número de vértices' },
      wrongWhen: [
        { scenario: 'O grafo é esparso — dez mil vértices e vinte mil arestas gastam cem milhões de células para guardar vinte mil fatos',
          useInstead: 'lista de adjacência' },
        { scenario: 'A operação dominante é percorrer os vizinhos de um vértice',
          useInstead: 'lista de adjacência: a matriz cobra uma linha inteira por vértice visitado' },
      ],
      everydayAnchor:
        'É a forma natural de uma matriz de distâncias entre cidades, onde toda ligação existe ' +
        'e a pergunta é sempre sobre um par específico.',
      invariant: 'A célula (u, v) é verdadeira se e somente se existe aresta de u para v.',
    },
  ],

  cycles: [
    { id: 'graphs.c0', title: 'O que o grafo promete: vizinhança, e só', layer: 'essential', band: 'contract',
      introducesTerms: ['graph', 'vertex', 'edge'],
      body: [
        'Um grafo é um conjunto de vértices e as ligações entre eles. O contrato responde uma pergunta: quem está ligado diretamente a quem.',
        'A lista do que ele não promete é desconfortavelmente grande, e é a coisa mais importante desta unidade: se existe caminho entre dois vértices, qual o caminho mais curto, se há ciclo, quem é alcançável. **Nada disso é operação do contrato.** Tudo isso é algoritmo escrito sobre ele.',
        'A diferença entre árvore e grafo cabe numa frase: numa árvore existe exatamente um caminho entre dois nós; num grafo pode haver nenhum, um, ou muitos — e pode haver um que volte ao ponto de partida. Tudo que a unidade anterior podia assumir sem dizer deixa de valer aqui.',
      ],
      exerciseId: 'graphs.e0' },

    { id: 'graphs.c1', title: 'Dirigido, não dirigido, com peso', layer: 'essential', band: 'contract',
      introducesTerms: ['directed', 'weight'],
      body: [
        'Três escolhas de modelagem que mudam o que o grafo pode responder, e que costumam ficar implícitas no código.',
        'Dirigido ou não: "A segue B" não implica "B segue A", e "A faz fronteira com B" implica. A escolha errada aqui produz um sistema que responde bem por acidente até o primeiro caso assimétrico.',
        'Com peso ou sem: uma aresta pode carregar um número — distância, custo, duração. Sem peso, "caminho mais curto" quer dizer menos arestas; com peso, quer dizer menor soma. As duas perguntas têm respostas diferentes, e usam algoritmos diferentes.',
      ],
      exerciseId: 'graphs.e1' },

    { id: 'graphs.c2', title: 'Lista de adjacência', layer: 'essential', band: 'implementation', elaborates: 'adjacency-list',
      introducesTerms: ['adjacency-list', 'degree'],
      body: [
        'A primeira implementação guarda, para cada vértice, a lista dos vizinhos dele. O espaço é proporcional ao que existe: uma entrada por vértice e uma por aresta.',
        'Isso torna vizinhos barato — a lista já está pronta — e existeAresta proporcional ao grau do vértice, porque é preciso percorrer a lista procurando. Em grafo real o grau é pequeno, e essa varredura quase nunca importa.',
        'É a escolha padrão de toda biblioteca, e a razão está na forma dos grafos que aparecem: um usuário pertence a alguns times, uma página aponta para algumas páginas, uma cidade faz fronteira com algumas cidades.',
      ],
      workedExample: {
        problem: 'Pergunte existeAresta(u, v) para um vértice com três vizinhos e para um com trezentos.',
        whatToNotice: 'A operação é a mesma e o custo não é. Um grafo real tem quase todos os vértices no primeiro caso, e é essa forma — não a operação — que justifica a escolha.',
      },
      exerciseId: 'graphs.e2' },

    { id: 'graphs.c3', title: 'Matriz de adjacência e o custo do que não existe', layer: 'essential', band: 'implementation', elaborates: 'adjacency-matrix',
      introducesTerms: ['adjacency-matrix', 'density'],
      body: [
        'A segunda implementação reserva uma célula para cada par possível de vértices. Perguntar se dois estão ligados vira uma conta, e a resposta é constante.',
        'O preço está no espaço, e ele não depende das arestas: dez mil vértices custam cem milhões de células, tenha o grafo vinte mil arestas ou cinquenta milhões. A matriz paga por toda ligação que poderia existir.',
        'E ela cobra de novo no percurso: listar os vizinhos de um vértice exige varrer a linha inteira, mesmo que ele tenha um vizinho só.',
      ],
      workedExample: {
        problem: 'Conte as células de uma matriz para dez mil vértices e as arestas de uma rede social com esse tamanho.',
        whatToNotice: 'Cem milhões de células para guardar algumas centenas de milhares de fatos. O espaço não depende do que existe: depende do que poderia existir.',
      },
      exerciseId: 'graphs.e3' },

    { id: 'graphs.c4', title: 'Percorrer sem voltar: o conjunto de visitados', layer: 'essential', band: 'cost',
      introducesTerms: ['bfs', 'visited'],
      body: [
        'Percorrer um grafo é a consequência mais importante de tê-lo escolhido, e é onde o contrato mostra o que custa. A busca em largura usa uma fila: tira um vértice, olha os vizinhos, põe na fila os que ainda não viu.',
        '"Os que ainda não viu" é a peça que a árvore não precisava. Como pode haver caminho de volta, um vértice pode ser alcançado duas vezes — e sem um conjunto de visitados a fila nunca esvazia. O laço infinito da tela de permissões é exatamente isto.',
        'Marcar na entrada da fila, e não na saída, é o detalhe que decide. Marcar na saída deixa o mesmo vértice entrar várias vezes antes de ser processado uma.',
      ],
      pseudocode: `função largura(G, origem)
    fila ← sequência com origem
    visitados ← conjunto com origem
    enquanto fila não vazia faça
        atual ← retirar primeiro de fila
        para cada v em G.vizinhos(atual) faça
            se v não está em visitados então
                anexar v em visitados
                anexar v em fila`,
      invariant: 'Todo vértice entra na fila no máximo uma vez, porque entra em visitados no mesmo instante.',
      exerciseId: 'graphs.e4' },

    { id: 'graphs.c5', title: 'Largura e profundidade respondem perguntas diferentes', layer: 'essential', band: 'cost',
      introducesTerms: ['dfs'],
      body: [
        'Trocar a fila por uma pilha muda o percurso inteiro: em vez de avançar por camadas, ele desce um ramo até o fim antes de voltar. As duas visitam os mesmos vértices e não respondem a mesma coisa.',
        'A busca em largura chega a cada vértice pelo caminho com menos arestas, e por isso responde "qual a rota com menos escalas". A busca em profundidade não dá essa garantia, e em compensação encontra um caminho completo cedo e usa memória proporcional à profundidade, não à largura.',
        'Uma ressalva que separa quem entendeu de quem decorou: "menos arestas" não é "menor custo". Se as arestas têm peso, nenhuma das duas responde caminho mais curto — isso é outro algoritmo, e está fora desta unidade.',
      ],
      exerciseId: 'graphs.e5' },

    { id: 'graphs.c6', title: 'Esparso contra denso: onde a escolha vira', layer: 'essential', band: 'cost',
      introducesTerms: ['sparse'],
      body: [
        'A representação decide o custo do percurso, e é aqui que as duas escolhas do meio da unidade cobram a conta.',
        'Sobre lista de adjacência, a busca em largura custa O(V+E): cada vértice sai da fila uma vez e cada aresta é olhada uma vez. Sobre matriz, custa O(V²), porque cada vértice retirado obriga a varrer uma linha inteira.',
        'Quando E é próximo de V², os dois números se encontram e a matriz deixa de ser desperdício. Quando E é próximo de V — que é o caso de quase todo grafo real —, a diferença é entre percorrer vinte mil arestas e varrer cem milhões de células.',
      ],
      exerciseId: 'graphs.e6' },

    { id: 'graphs.c7', title: 'Quando o grafo é a escolha errada', layer: 'essential', band: 'cost',
      introducesTerms: [],
      body: [
        'Volte ao contrato do primeiro ciclo. Tudo que ele não promete é onde a escolha falha — e aqui a lista de ausências é maior que a de operações, o que é próprio deste contrato.',
        'O grafo é a escolha errada quando a estrutura de fato não tem ciclo: uma hierarquia que é árvore paga o conjunto de visitados e a complexidade do percurso sem precisar. E é errada quando a pergunta real é sobre um par por vez, sem caminho envolvido — ali o contrato que responde é o Map da unidade 4.',
        'É errada, sobretudo, quando ninguém decidiu se é dirigido e se tem peso. Essas duas escolhas ficam implícitas no código e mudam a resposta de toda pergunta seguinte.',
      ],
      exerciseId: 'graphs.e7' },
  ],

  misconceptions: graphsMisconceptions,

  exercises: graphsExercises,

  mastery: {
    statement:
      'O aluno domina esta unidade quando, diante de código que percorre uma estrutura ligada ' +
      'que nunca viu, consegue sem executar: dizer se ele termina para uma entrada com ciclo e ' +
      'apontar a linha que decide isso; nomear a representação que o custo de espaço denuncia; ' +
      'e dizer qual pergunta a busca em largura responde que a busca em profundidade não ' +
      'responde.',
    requiresClean: ['graphs.e4', 'graphs.e7'],
    revisitIntervalDays: 7,
  },
}
