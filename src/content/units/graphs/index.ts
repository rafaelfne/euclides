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
    'suporte relata que para alguns usuários a tela trava. Ninguém consegue reproduzir, até ' +
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
          assumptions: ['a lista do vértice já está pronta, devolvê-la é entregar o que existe'],
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
        { scenario: 'O grafo é esparso, dez mil vértices e vinte mil arestas gastam cem milhões de células para guardar vinte mil fatos',
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
      oneLine: "O grafo responde quem está ligado a quem, e mais nada.",
      body: [
        'Um grafo é um conjunto de vértices e as ligações entre eles. O contrato responde 1 pergunta: quem está ligado diretamente a quem.',
        'A lista do que ele não promete é desconfortavelmente grande, e é a coisa mais importante desta unidade: se existe caminho entre dois vértices, qual o caminho mais curto, se há ciclo, quem é alcançável. **Nada disso é operação do contrato.** Tudo isso é algoritmo escrito sobre ele.',
        'A diferença entre árvore e grafo cabe numa frase: numa árvore existe exatamente um caminho entre dois nós; num grafo pode haver nenhum, um, ou muitos, e pode haver um que volte ao ponto de partida. Tudo que a unidade anterior podia assumir sem dizer deixa de valer aqui.',
      ],
      workedExample: {
        problem: "Com 4 vértices e as ligações A→B, B→C, C→A: perguntar os vizinhos de A devolve B em 1 operação. Perguntar \"existe caminho de A até C\" não é operação nenhuma, é um algoritmo que você escreve.",
        whatToNotice: "Repare que o caminho A→B→C existe e o contrato não sabe disso. Tudo que a unidade ensina depois é escrito sobre essas duas operações.",
      },
      exerciseId: 'graphs.e0' },

    { id: 'graphs.c1', title: 'Dirigido, não dirigido, com peso', layer: 'essential', band: 'contract',
      introducesTerms: ['directed', 'weight'],
      oneLine: "Uma aresta pode ter direção e pode ter peso, e as duas mudam a pergunta.",
      body: [
        '3 escolhas de modelagem mudam o que o grafo pode responder, e as 3 costumam ficar implícitas no código.',
        'Dirigido ou não: "A segue B" não implica "B segue A", e "A faz fronteira com B" implica. A escolha errada aqui produz um sistema que responde bem por acidente até o primeiro caso assimétrico.',
        'Com peso ou sem: uma aresta pode carregar um número, distância, custo, duração. Sem peso, "caminho mais curto" quer dizer menos arestas; com peso, quer dizer menor soma. As duas perguntas têm respostas diferentes, e usam algoritmos diferentes.',
      ],
      workedExample: {
        problem: "3 aeroportos e 2 rotas: A→B de 1 hora e B→C de 1 hora, contra A→C de 5 horas. Sem peso, A→C é o caminho mais curto: 1 aresta contra 2. Com peso, é o mais longo: 5 horas contra 2.",
        whatToNotice: "O mesmo grafo, a mesma pergunta em português, e duas respostas opostas. O que mudou foi só o que a aresta carrega.",
      },
      exerciseId: 'graphs.e1' },

    { id: 'graphs.c2', title: 'Lista de adjacência', layer: 'essential', band: 'implementation', elaborates: 'adjacency-list',
      introducesTerms: ['adjacency-list', 'degree'],
      oneLine: "Guarde por vértice a lista dos vizinhos dele, e o espaço é o que existe.",
      body: [
        'A primeira implementação guarda, para cada vértice, a lista dos vizinhos dele. O espaço é proporcional ao que existe: 1 entrada por vértice e 1 por aresta, com 10 mil vértices e 20 mil arestas, 30 mil entradas.',
        'Isso torna vizinhos barato, a lista já está pronta, e existeAresta proporcional ao grau do vértice, porque é preciso percorrer a lista procurando. Em grafo real o grau é pequeno, e essa varredura quase nunca importa.',
        'É a escolha padrão de toda biblioteca, e a razão está na forma dos grafos que aparecem: um usuário pertence a alguns times, uma página aponta para algumas páginas, uma cidade faz fronteira com algumas cidades.',
      ],
      workedExample: {
        problem: 'Pergunte existeAresta(u, v) para um vértice com três vizinhos e para um com trezentos.',
        whatToNotice: 'A operação é a mesma e o custo não é. Um grafo real tem quase todos os vértices no primeiro caso, e é essa forma, não a operação, que justifica a escolha.',
      },
      exerciseId: 'graphs.e2' },

    { id: 'graphs.c3', title: 'Matriz de adjacência e o custo do que não existe', layer: 'essential', band: 'implementation', elaborates: 'adjacency-matrix',
      introducesTerms: ['adjacency-matrix', 'density'],
      oneLine: "Com 10 mil vértices são 100 milhões de células, tenha o grafo 20 mil arestas ou 50 milhões.",
      body: [
        'A segunda implementação reserva 1 célula para cada par possível de vértices. Perguntar se 2 estão ligados vira uma conta, e a resposta é constante.',
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
      oneLine: "Sem o conjunto de visitados, um grafo com ciclo nunca esvazia a fila.",
      plainly:
        'A tela de permissões trava e ninguém sabe por quê. O código anda por uma estrutura ' +
        'em que cada item aponta para outros, e em algum lugar alguém aponta de volta para ' +
        'onde a busca já passou. O percurso chega lá, segue o ponteiro, volta ao ponto de ' +
        'partida e recomeça — para sempre. O conserto não é uma condição de parada nova; é ' +
        'anotar por onde já se passou e não passar de novo.',
      body: [
        'Percorrer um grafo é a consequência mais importante de tê-lo escolhido, e é onde o contrato mostra o que custa. A busca em largura usa 1 fila: tira um vértice, olha os vizinhos, põe na fila os que ainda não viu.',
        '"Os que ainda não viu" é a peça que a árvore não precisava. Como pode haver caminho de volta, um vértice pode ser alcançado duas vezes, e sem um conjunto de visitados a fila nunca esvazia. O laço infinito da tela de permissões é exatamente isto.',
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
      workedExample: {
        problem: "Com A→B, B→C e C→A, comece em A sem marcar visitados: a fila recebe B, depois C, depois A de novo, depois B de novo. Ela nunca esvazia.",
        whatToNotice: "São 3 vértices e o percurso não termina. O que falta não é uma condição de parada nova, é lembrar quem já foi visto.",
      },
      figure: {
        kind: 'visited',
        edges: [{ from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'C', to: 'A' }],
        origin: 'A',
        rounds: 6,
        caption:
          'O mesmo grafo de três vértices e a mesma busca dos dois lados; a única diferença ' +
          'é a linha que confere se o vizinho já está em visitados. À direita a fila esvazia ' +
          'em três rodadas. À esquerda ela nunca esvazia, e repare que o tamanho dela não ' +
          'cresce: o percurso fica dando voltas no mesmo ciclo, que é o laço da tela de ' +
          'permissões.',
      },
      exerciseId: 'graphs.e4' },

    { id: 'graphs.c5', title: 'Uma linha trocada muda o percurso inteiro', layer: 'essential', band: 'cost',
      introducesTerms: ['dfs'],
      oneLine: "Trocar a fila por uma pilha muda a ordem de visita inteira.",
      body: [
        'A diferença entre os dois percursos é **1 linha**: onde a busca em largura retira o primeiro da fila, a busca em profundidade retira o último de uma pilha. Nada mais muda, o conjunto de visitados, a condição de parada e os vizinhos são os mesmos.',
        'O efeito não é proporcional à mudança. Em vez de avançar por camadas, o percurso desce um ramo até o fim antes de voltar. As duas visitam **os mesmos vértices**, e visitam em ordens diferentes.',
        'Guarde a diferença nesta forma, porque é ela que vai importar no próximo ciclo: a busca em largura alcança cada vértice pelo caminho com menos arestas; a busca em profundidade encontra um caminho completo mais cedo, e usa memória proporcional à profundidade, não à largura.',
      ],
      figure: {
        kind: 'traversal',
        origin: 'A',
        edges: [
          { from: 'A', to: 'B' }, { from: 'A', to: 'D' }, { from: 'B', to: 'C' },
          { from: 'C', to: 'A' }, { from: 'C', to: 'E' }, { from: 'D', to: 'E' },
        ],
        caption: 'O número ao lado de cada vértice é a ordem em que ele foi visitado. Os dois percursos visitam os cinco, e a origem é o único vértice com o mesmo número nos dois painéis, os outros quatro trocam de posição. A posição no desenho é idêntica nos dois lados: as colunas são as camadas da busca em largura, e é por isso que a da esquerda avança coluna por coluna enquanto a da direita corta na diagonal.',
      },
      workedExample: {
        problem: 'A partir de A, com A→B, A→D, B→C, C→A, C→E e D→E: a busca em largura sai A B D C E, e a em profundidade sai A D E B C.',
        whatToNotice: 'Em largura, B sai antes de D porque entrou antes; em profundidade, D sai antes de B porque entrou por último. Os dois entraram no mesmo passo, o que mudou foi de qual ponta se retira.',
      },
      exerciseId: 'graphs.e8' },

    { id: 'graphs.c6', title: 'Menos arestas não é menor custo', layer: 'essential', band: 'cost',
      introducesTerms: [],
      oneLine: "Uma rota de 2 escalas pode durar o dobro de uma de 4.",
      body: [
        'A garantia da busca em largura tem uma forma exata, e a forma importa: ao alcançar um vértice **pela primeira vez**, ela chegou pelo caminho com o menor número de arestas, 2 escalas em vez de 4. É isso que responde "qual a rota com menos escalas".',
        'A ressalva separa quem entendeu de quem decorou: **menos arestas não é menor custo**. Se as arestas têm peso, duração, distância, preço, nenhum dos dois percursos responde caminho mais curto. Uma rota de duas escalas pode durar o dobro de uma de quatro.',
        'Isso não é uma limitação a contornar com um ajuste. É outro problema, e ele tem outro algoritmo, fora desta unidade. Saber que a ferramenta não responde a pergunta é metade do julgamento.',
      ],
      workedExample: {
        problem: "A→B→C com 1 hora cada, contra A→D→E→F→C com 20 minutos cada. A busca em largura devolve a primeira: 2 arestas contra 4. A primeira leva 2 horas e a segunda 1h20.",
        whatToNotice: "A busca em largura acertou o que prometeu, menos arestas. A pergunta que você tinha era outra.",
      },
      exerciseId: 'graphs.e5' },

    { id: 'graphs.c7', title: 'Esparso contra denso: onde a escolha vira', layer: 'essential', band: 'cost',
      introducesTerms: ['sparse'],
      oneLine: "Com 10 mil vértices e 20 mil arestas, a lista olha 30 mil coisas e a matriz 100 milhões.",
      body: [
        'A representação decide o custo do percurso, e é aqui que as 2 escolhas do meio da unidade cobram a conta.',
        'Sobre lista de adjacência, a busca em largura custa O(V+E): cada vértice sai da fila uma vez e cada aresta é olhada uma vez. Sobre matriz, custa O(V²), porque cada vértice retirado obriga a varrer uma linha inteira.',
        'Quando E é próximo de V², os dois números se encontram e a matriz deixa de ser desperdício. Quando E é próximo de V, que é o caso de quase todo grafo real, a diferença é entre percorrer vinte mil arestas e varrer cem milhões de células.',
      ],
      workedExample: {
        problem: "V = 10.000 e E = 20.000. Sobre lista, a busca em largura olha V + E = 30 mil itens. Sobre matriz, varre V² = 100 milhões de células.",
        whatToNotice: "É a mesma busca, sobre o mesmo grafo, com um fator de 3 mil entre as duas. A representação decidiu o custo do algoritmo.",
      },
      exerciseId: 'graphs.e6' },

    { id: 'graphs.c8', title: 'Quando o grafo é a escolha errada', layer: 'essential', band: 'cost',
      introducesTerms: [],
      oneLine: "O grafo é a escolha errada quando as ligações formam hierarquia e nada mais.",
      body: [
        'Volte ao contrato do primeiro ciclo. Tudo que ele não promete é onde a escolha falha, e aqui a lista de ausências é maior que a de operações, o que é próprio deste contrato.',
        'O grafo é a escolha errada quando a estrutura de fato não tem ciclo: uma hierarquia que é árvore paga o conjunto de visitados e a complexidade do percurso sem precisar. E é errada quando a pergunta real é sobre um par por vez, sem caminho envolvido, ali o contrato que responde é o Map da unidade 4.',
        'É errada, sobretudo, quando ninguém decidiu se é dirigido e se tem peso. Essas duas escolhas ficam implícitas no código e mudam a resposta de toda pergunta seguinte.',
      ],
      workedExample: {
        problem: "Uma estrutura de pastas com 5 mil nós, onde cada pasta tem exatamente 1 pai. Modelada como grafo, todo percurso carrega um conjunto de visitados que nunca impede nada.",
        whatToNotice: "Você está pagando pela possibilidade de ciclo numa estrutura que não tem ciclo. A árvore da unidade anterior já prometia o caminho único.",
      },
      postmortem: {
        incident: "Volte à tela de permissões que nunca carregava, com times herdando de times.",
        trapId: "graphs.percurso-sem-visitados",
        missingClaim: "nenhuma de custo: o percurso não terminava. O que faltava era a frase \"este percurso termina para entrada com ciclo\", e ela era falsa.",
        whatWouldCatch: "Perguntar se a estrutura admite ciclo. Admitindo, o conjunto de visitados deixa de ser detalhe e vira condição de parada.",
      },
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
