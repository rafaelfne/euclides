import type { Exercise, Misconception } from '../../schema'

export const graphsMisconceptions: Misconception[] = [
  { id: 'graphs.percurso-sem-visitados', label: 'Percorrer sem guardar quem já foi visitado',
    socraticQuestion: 'Num grafo com A → B → C → A, comece em A e escreva a fila depois de cada retirada, sem marcar ninguém. Em que linha você para?',
    escalation: [
      'A fila nunca esvazia: A volta a entrar quando C é examinado. O que precisaria estar guardado para que a segunda visita a A não acontecesse?',
      'Numa árvore esse conjunto não é necessário. O que existe num grafo e não existe numa árvore que torna ele obrigatório?',
    ],
    reviewCycle: 'graphs.c4' },

  { id: 'graphs.bfs-e-dfs-equivalentes', label: 'Supor que a ordem do percurso não muda a resposta',
    socraticQuestion: 'Num grafo em que A leva a B e a D, e B leva a C, qual dos dois percursos visita D antes de C, e qual dos dois responde "qual o caminho com menos arestas até E"?',
    escalation: [
      'Um deles esgota um ramo inteiro antes de voltar; o outro avança por camadas. Só um garante que, ao chegar num vértice, chegou pelo caminho mais curto em arestas. Qual?',
    ],
    reviewCycle: 'graphs.c5' },

  { id: 'graphs.caminho-mais-curto-com-peso', label: 'Usar busca em largura em grafo com peso',
    socraticQuestion: 'Duas rotas entre A e Z: uma com uma aresta de peso 100, outra com três arestas de peso 1. Qual delas a busca em largura devolve como a mais curta?',
    escalation: [
      'A busca em largura conta arestas, não soma pesos. Se o que você quer é a menor soma, o que ela precisaria olhar que hoje não olha?',
    ],
    reviewCycle: 'graphs.c5' },

  { id: 'graphs.matriz-para-esparso', label: 'Escolher a representação sem contar as arestas',
    socraticQuestion: 'Dez mil vértices e vinte mil arestas. Quantas células uma matriz de adjacência ocupa, e quantos fatos ela precisa guardar?',
    escalation: [
      'A matriz reserva espaço para toda ligação possível, e quase nenhuma existe. Qual é a razão entre as duas contas, e o que ela diz sobre a escolha?',
    ],
    reviewCycle: 'graphs.c7' },

  { id: 'graphs.arvore-e-grafo', label: 'Aplicar a uma estrutura com ciclo o que só vale em árvore',
    socraticQuestion: 'Numa árvore, quantos caminhos existem entre a raiz e um nó qualquer? E num grafo com ciclo, entre dois vértices?',
    escalation: [
      'Se pode haver mais de um caminho, "já cheguei aqui" deixa de ser impossível. Que estrutura de apoio isso obriga a existir?',
    ],
    reviewCycle: 'graphs.c0' },

  { id: 'graphs.alcance-e-operacao', label: 'Supor que alcançabilidade é uma operação do contrato',
    socraticQuestion: 'Escreva "existe caminho de A até Z?" usando apenas vizinhos, existeAresta e vertices. Quantas chamadas isso exige, e quem decide a ordem delas?',
    escalation: [
      'O contrato responde sobre vizinhança direta, uma pergunta por chamada. Se a sua resposta precisou de um laço e de uma estrutura de apoio, o que você escreveu foi uma operação ou um algoritmo?',
    ],
    reviewCycle: 'graphs.c0' },
]

export const graphsExercises: Exercise[] = [
  {
    kind: 'choice', id: 'graphs.e0',
    prompt: 'O contrato Grafo oferece vizinhos, existeAresta, adicionarAresta e vertices. Qual das perguntas abaixo ele responde diretamente?',
    choices: [
      { correct: true, text: 'Quais vértices estão ligados diretamente a este',
        why: 'Vizinhança direta é a única pergunta do contrato. Caminho e alcance são algoritmos escritos sobre ele.' },
      { correct: false, text: 'Se existe algum caminho entre dois vértices', misconceptionId: 'graphs.alcance-e-operacao' },
      { correct: false, text: 'Quantos caminhos distintos ligam dois vértices, num grafo há sempre um só, como na árvore', misconceptionId: 'graphs.arvore-e-grafo' },
    ],
  },
  {
    kind: 'choice', id: 'graphs.e1',
    prompt: 'Uma hierarquia de times foi modelada como grafo. Alguém pôs o time A dentro do B e o B dentro do A. O que essa modelagem permite que uma árvore não permitiria?',
    choices: [
      { correct: true, text: 'Um ciclo: um caminho que sai de um vértice e volta a ele',
        why: 'Numa árvore há exatamente um caminho entre dois nós, então "já passei por aqui" é impossível. Aqui deixa de ser.' },
      { correct: false, text: 'Nada de diferente: uma árvore também admite que dois nós apontem um para o outro', misconceptionId: 'graphs.arvore-e-grafo' },
      { correct: false, text: 'Arestas com peso, que a árvore não tem', misconceptionId: 'graphs.caminho-mais-curto-com-peso' },
    ],
  },
  {
    kind: 'choice', id: 'graphs.e2',
    prompt: 'Uma lista de adjacência guarda, para cada vértice, a lista dos vizinhos dele. Quanto custa perguntar se existe aresta de u para v?',
    choices: [
      { correct: true, text: 'O grau de u',
        why: 'É preciso percorrer a lista dele. Barato quando o grau é pequeno, que é o caso na maioria dos grafos reais' },
      { correct: false, text: 'Constante: a lista de adjacência guarda as arestas indexadas pelos dois vértices', misconceptionId: 'graphs.matriz-para-esparso' },
      { correct: false, text: 'O número de vértices, porque é preciso varrer todos para achar u', misconceptionId: 'graphs.matriz-para-esparso' },
    ],
  },
  {
    kind: 'choice', id: 'graphs.e3',
    prompt: 'Uma matriz de adjacência para dez mil vértices ocupa cem milhões de células, independentemente do número de arestas. Quando essa escolha se justifica?',
    choices: [
      { correct: true, text: 'Quando o grafo é denso e a pergunta dominante é "existe aresta entre estes dois"',
        why: 'Ali a matriz responde numa conta, e o espaço reservado está de fato sendo usado' },
      { correct: false, text: 'Sempre que houver memória: a matriz responde tudo em tempo constante, inclusive listar os vizinhos de um vértice', misconceptionId: 'graphs.matriz-para-esparso' },
      { correct: false, text: 'Quando o grafo tem ciclos, porque a lista de adjacência não os representa', misconceptionId: 'graphs.arvore-e-grafo' },
    ],
  },
  {
    kind: 'trace', id: 'graphs.e4',
    prompt:
      'O grafo dirigido tem A→B, A→D, B→C, C→A, C→E e D→E. Faça a busca em largura a partir de A. ' +
      'Para cada retirada da fila: quais vizinhos entraram agora, como fica a fila, e quem já foi visitado.',
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
    columns: [
      { key: 'step', label: 'retirada' },
      { key: 'key', label: 'quem saiu' },
      { key: 'added', label: 'vizinhos que entraram', placeholder: 'X Y ou nenhum' },
      { key: 'queue', label: 'fila depois', placeholder: 'X Y ou vazia' },
      { key: 'visited', label: 'visitados', placeholder: 'V W X Y' },
    ],
    conventions: [
      { notation: 'B D', rule: 'um conjunto ou uma fila', why: 'Os vértices separados por espaço. Na fila, na ordem em que saem; em visitados, em ordem alfabética, conjunto não tem ordem própria, e a alfabética é a convenção para poder comparar.' },
      { notation: 'nenhum', rule: 'nenhum vizinho novo entrou', why: 'O vértice tinha vizinhos, e todos já estavam visitados. Não é o mesmo que não ter vizinho.' },
      { notation: 'vazia', rule: 'a fila esvaziou', why: 'É o que encerra o percurso. Se ela nunca esvazia no seu trace, essa é a resposta do exercício.' },
    ],
    reference: 'graphs.bfs-trace',
    misconceptionByStep: { '4': 'graphs.percurso-sem-visitados' },
  },
  {
    kind: 'choice', id: 'graphs.e5',
    prompt: 'Num mapa sem duração ou preço, uma estratégia explora primeiro todas as rotas com uma etapa, depois com duas, depois com três. Outra segue uma rota até o fim antes de voltar. Qual encontra a rota com menos etapas?',
    choices: [
      { correct: true, text: 'A primeira, chamada busca em largura, porque avança por camadas',
        why: 'Ao alcançar um vértice pela primeira vez, ela chegou pelo caminho com menos arestas. A busca em profundidade não dá essa garantia.' },
      { correct: false, text: 'A segunda, porque terminar uma rota cedo garante que ela seja menor', misconceptionId: 'graphs.bfs-e-dfs-equivalentes' },
      { correct: false, text: 'Qualquer uma, porque ambas acabam visitando os mesmos lugares', misconceptionId: 'graphs.bfs-e-dfs-equivalentes' },
    ],
  },
  {
    kind: 'choice', id: 'graphs.e6',
    prompt: 'A mesma busca em largura roda sobre lista de adjacência e sobre matriz. Como o custo difere?',
    choices: [
      { correct: true, text: 'Na lista, O(V+E); na matriz, O(V²)',
        why: 'Na lista cada vértice sai da fila uma vez e cada aresta é olhada uma vez. Na matriz, cada vértice retirado obriga a varrer uma linha inteira, mesmo tendo um vizinho só.' },
      { correct: false, text: 'O mesmo nas duas: o percurso visita os mesmos vértices na mesma ordem', misconceptionId: 'graphs.bfs-e-dfs-equivalentes' },
      { correct: false, text: 'A matriz é melhor nas duas contas, porque consultar uma célula é constante', misconceptionId: 'graphs.matriz-para-esparso' },
    ],
  },
  {
    kind: 'trace', id: 'graphs.e8',
    prompt:
      'O grafo é o mesmo do trace anterior: A→B, A→D, B→C, C→A, C→E e D→E. Agora a fila virou pilha, e ' +
      'sai o último em vez do primeiro. Faça a busca em profundidade a partir de A. Para cada retirada: ' +
      'quais vizinhos entraram agora, como fica a pilha, e quem já foi visitado.',
    pseudocode: `função profundidade(G, origem)
    pilha ← sequência com origem
    visitados ← conjunto com origem
    enquanto pilha não vazia faça
        atual ← retirar último de pilha
        para cada v em G.vizinhos(atual) faça
            se v não está em visitados então
                anexar v em visitados
                anexar v em pilha`,
    invariant: 'A pilha e a fila guardam os mesmos vértices; o que muda é de qual ponta se retira.',
    columns: [
      { key: 'step', label: 'retirada' },
      { key: 'key', label: 'quem saiu' },
      { key: 'added', label: 'vizinhos que entraram', placeholder: 'X Y ou nenhum' },
      { key: 'queue', label: 'pilha depois', placeholder: 'X Y ou vazia' },
      { key: 'visited', label: 'visitados', placeholder: 'V W X Y' },
    ],
    conventions: [
      { notation: 'B D', rule: 'uma pilha ou um conjunto', why: 'Na pilha, da base para o topo, o último escrito é o próximo a sair. Em visitados, em ordem alfabética, porque conjunto não tem ordem própria.' },
      { notation: 'nenhum', rule: 'nenhum vizinho novo entrou', why: 'O vértice tinha vizinhos, e todos já estavam visitados. Não é o mesmo que não ter vizinho.' },
      { notation: 'vazia', rule: 'a pilha esvaziou', why: 'É o que encerra o percurso, igual à fila. O critério de parada não mudou.' },
    ],
    reference: 'graphs.dfs-trace',
    misconceptionByStep: { '2': 'graphs.bfs-e-dfs-equivalentes' },
  },
  {
    kind: 'bug', id: 'graphs.e7',
    prompt: 'Esta busca em largura roda sem erro na maioria dos grafos da suíte de testes. Marque a linha defeituosa e escolha a consequência.',
    language: 'javascript',
    code: `function alcancaveis(grafo, origem) {
  const fila = [origem]
  const vistos = new Set()
  while (fila.length > 0) {
    const atual = fila.shift()
    vistos.add(atual)
    for (const v of grafo[atual]) fila.push(v)
  }
  return vistos
}`,
    faultyLines: [7],
    consequences: [
      { correct: true, text: 'Os vizinhos entram na fila sem consultar o conjunto',
        why: 'Num grafo com ciclo a fila nunca esvazia. O conjunto devolvido está certo, o laço é que não termina para devolvê-lo.' },
      { correct: false, text: 'Nada de grave: marcar na retirada em vez de na entrada só faz alguns vértices serem visitados duas vezes', misconceptionId: 'graphs.percurso-sem-visitados' },
      { correct: false, text: 'O defeito é usar fila em vez de pilha: com pilha o ciclo seria detectado ao voltar', misconceptionId: 'graphs.bfs-e-dfs-equivalentes' },
    ],
  },
]
