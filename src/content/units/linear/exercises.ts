import type { Exercise, Misconception } from '../../schema'

export const linearMisconceptions: Misconception[] = [
  { id: 'linear.insercao-no-comeco-e-barata', label: 'Supor que mexer no começo custa o mesmo que mexer no fim',
    socraticQuestion: 'Numa coleção de cinco elementos guardada em bloco contíguo, quantas posições precisam receber um novo valor quando o primeiro elemento sai?',
    escalation: [
      'Você contou as escritas ou contou a chamada? Escreva o conteúdo do bloco depois de cada escrita e conte as linhas.',
      'Agora troque cinco por um milhão. A chamada continua sendo uma; e o número de escritas?',
    ],
    reviewCycle: 'linear.c3' },

  { id: 'linear.capacidade-e-tamanho', label: 'Capacidade confundida com quantidade de elementos',
    socraticQuestion: 'Um array dinâmico com capacidade 16 guarda 9 elementos. Quantas posições existem, quantas têm valor, e qual dos dois números a próxima inserção compara com o limite?',
    escalation: [
      'Se os dois números fossem o mesmo, toda inserção precisaria realocar. Qual dos dois cresce de um em um, e qual dá saltos?',
    ],
    reviewCycle: 'linear.c3' },

  { id: 'linear.pilha-inverte-a-entrada', label: 'Supor que a pilha devolve a ordem de entrada invertida',
    socraticQuestion: 'Escreva o conteúdo da pilha, de baixo para cima, depois de cada operação. Qual elemento estava no topo quando cada desempilhar aconteceu?',
    escalation: [
      'Inverter a ordem de entrada só dá a saída quando todos entram antes de o primeiro sair. Nesta sequência, quem entrou depois do primeiro desempilhar?',
    ],
    reviewCycle: 'linear.c1' },

  { id: 'linear.pilha-e-fila-invertidas', label: 'Supor que fila é a pilha lida ao contrário',
    socraticQuestion: 'Empilhe A, B, C e desempilhe tudo; depois enfileire A, B, C e desenfileire tudo. Escreva as duas saídas. Uma é o inverso da outra?',
    escalation: [
      'Uma saída é C B A e a outra é A B C, inverter uma dá a outra, para esta entrada. Agora intercale as operações: empilhe A, empilhe B, tire um, empilhe C, tire tudo. Faça o mesmo com a fila e compare de novo.',
    ],
    reviewCycle: 'linear.c2' },

  { id: 'linear.ponteiro-em-maos', label: 'Remover de lista ligada declarado O(1) sem dizer o que já se tem',
    socraticQuestion: 'Para desligar um nó de uma lista ligada é preciso ter o nó anterior. Quanto custa chegar até ele partindo da cabeça?',
    escalation: [
      'A remoção em si é constante. Somando o que foi pago para achar o nó, qual é o custo da operação que alguém pediu, "remova este valor"?',
    ],
    reviewCycle: 'linear.c4' },

  { id: 'linear.indice-em-lista-ligada', label: 'Esperar acesso por índice numa lista ligada',
    socraticQuestion: 'Numa lista ligada, o que existe guardado em cada nó que permitiria pular direto para a posição 500?',
    escalation: [
      'Cada nó conhece só o próximo. Se o único caminho é seguir os ponteiros, quantos saltos até a posição 500?',
    ],
    reviewCycle: 'linear.c4' },

  { id: 'linear.lista-ligada-e-sempre-melhor', label: 'Escolher pela tabela de custos, ignorando as hipóteses dela',
    socraticQuestion: 'A tabela diz que inserir no meio é O(1) na lista ligada e O(n) no array. Que hipótese sobre o acesso à memória essa tabela assumiu e não declarou?',
    escalation: [
      'Percorrer um bloco contíguo lê posições vizinhas; percorrer uma lista ligada salta para endereços quaisquer. Qual das duas o processador consegue adiantar?',
    ],
    reviewCycle: 'linear.c5' },
]

export const linearExercises: Exercise[] = [
  {
    kind: 'choice', id: 'linear.e0',
    prompt: 'O contrato Lista oferece obter, inserir e remover por posição, e tamanho. Qual pergunta ele responde diretamente?',
    choices: [
      { correct: true, text: 'O que está na posição 7',
        why: 'As quatro operações são todas por posição. Achar um valor ou o menor deles exige percorrer, e isso o contrato não promete.' },
      { correct: false, text: 'Em que posição está o valor 42', misconceptionId: 'linear.indice-em-lista-ligada' },
      { correct: false, text: 'Qual é o menor valor guardado', misconceptionId: 'linear.insercao-no-comeco-e-barata' },
    ],
  },
  {
    kind: 'choice', id: 'linear.e1',
    prompt: 'Uma pilha vazia recebe, nesta ordem: empilha A, empilha B, empilha C, desempilha, empilha D, desempilha, desempilha. Em que ordem os elementos saíram?',
    choices: [
      { correct: true, text: 'C, D, B, e A fica na pilha',
        why: 'Cada desempilhar tira o que está no topo naquele momento. D entrou depois da primeira saída, então ficou no topo antes de B.' },
      { correct: false, text: 'D, C, B: o inverso da ordem de entrada', misconceptionId: 'linear.pilha-inverte-a-entrada' },
      { correct: false, text: 'C, B, A: cada saída volta um passo na entrada', misconceptionId: 'linear.pilha-inverte-a-entrada' },
    ],
  },
  {
    kind: 'choice', id: 'linear.e2',
    prompt: 'Uma fila guarda os jobs num array: novos jobs entram no fim e o próximo sai da posição 0. Por que cada retirada fica mais cara quando a fila cresce?',
    choices: [
      { correct: true, text: 'Desenfileirar da posição 0 desloca todos os outros uma casa',
        why: 'O custo por job cresce com o tamanho da fila, então a carga não precisou mudar para o atraso aparecer.' },
      { correct: false, text: 'O array precisou realocar várias vezes para caber dez mil elementos, e cada realocação copia tudo', misconceptionId: 'linear.capacidade-e-tamanho' },
      { correct: false, text: 'Arrays não servem para fila porque não há operação de fila neles; o defeito é conceitual e não de custo', misconceptionId: 'linear.pilha-e-fila-invertidas' },
    ],
  },
  {
    kind: 'trace', id: 'linear.e3',
    prompt:
      'O bloco guarda 10, 20, 30, 40 e 50, nesta ordem, a partir da posição 0. Execute remover(0) ' +
      'e preencha uma linha por escrita: que valor foi escrito, como fica o bloco, e quantas ' +
      'escritas já aconteceram.',
    pseudocode: `função remover(A, p)
    para cada j de p até n − 2 faça
        A[j] ← A[j + 1]
    n ← n − 1`,
    invariant: 'Depois da escrita em j, as posições p até j já contêm os elementos que vinham depois delas.',
    columns: [
      { key: 'step', label: 'escrita' },
      { key: 'key', label: 'onde escreve' },
      { key: 'moved', label: 'valor escrito', placeholder: '0' },
      { key: 'content', label: 'bloco depois da escrita', placeholder: '11 22 33 44 55' },
      { key: 'moves', label: 'escritas até aqui', placeholder: '0' },
    ],
    conventions: [
      { notation: '11 22 33 44 55', rule: 'o bloco', why: 'Os cinco valores na ordem das posições, separados por espaço. O bloco continua com cinco posições: remover não encolhe o bloco, só o tamanho lógico.' },
      { notation: '(última posição)', rule: 'o que sobra no fim', why: 'A última posição mantém o valor antigo até que n mude. Escreva o que está lá, não o que deveria estar.' },
    ],
    reference: 'linear.remove-first-trace',
    misconceptionByStep: { '4': 'linear.capacidade-e-tamanho' },
  },
  {
    kind: 'choice', id: 'linear.e4',
    prompt: 'Uma lista ligada tem mil nós e cada nó aponta só para o próximo. Você tem em mãos o nó da posição 499 e quer remover o da 500, que vem logo depois. Qual o custo, e qual o custo de "remova o nó que contém o valor X"?',
    choices: [
      { correct: true, text: 'Com o anterior em mãos, constante; por valor, O(n)',
        why: '"Remoção é O(1)" é verdade depois que alguém pagou para chegar ao nó anterior, e é esse custo que a frase omite. Com o próprio nó da posição 500 em mãos o custo não mudaria: o anterior continuaria a 499 saltos da cabeça.' },
      { correct: false, text: 'Constante nos dois casos, é a vantagem da lista ligada sobre o array', misconceptionId: 'linear.ponteiro-em-maos' },
      { correct: false, text: 'O(n) nos dois casos, porque a lista ligada não tem acesso por índice', misconceptionId: 'linear.indice-em-lista-ligada' },
    ],
  },
  {
    kind: 'choice', id: 'linear.e5',
    prompt: 'A tabela de custos favorece a lista ligada na inserção, e na prática o array dinâmico costuma vencer ao percorrer coleções grandes. O que a tabela não declarou?',
    choices: [
      { correct: true, text: 'Que os acessos custam o mesmo em qualquer endereço',
        why: 'Um bloco contíguo lê posições vizinhas, e a lista ligada salta para endereços quaisquer' },
      { correct: false, text: 'Nada: a tabela está certa, e a prática contradiz a teoria por causa de detalhes de implementação da linguagem', misconceptionId: 'linear.lista-ligada-e-sempre-melhor' },
      { correct: false, text: 'Que a lista ligada aloca um nó por elemento, o que a torna O(n log n) no percurso', misconceptionId: 'linear.lista-ligada-e-sempre-melhor' },
    ],
  },
  {
    kind: 'bug', id: 'linear.e6',
    prompt: 'Esta implementação de pilha sobre array é plausível e passa nos testes de uso normal. Em JavaScript, escrever depois do fim de um array faz o array crescer. Marque a linha defeituosa e escolha a consequência.',
    language: 'javascript',
    code: `class Pilha {
  constructor() { this.dados = new Array(8); this.n = 0 }
  empilhar(x) {
    this.dados[this.n] = x
    this.n = this.n + 1
  }
  desempilhar() { this.n = this.n - 1; return this.dados[this.n] }
}`,
    faultyLines: [7],
    consequences: [
      { correct: true, text: 'Na pilha vazia, n vai a −1 e o próximo empilhar grava em dados[-1]',
        why: 'Desempilhar não confere se n é zero antes de descontar. Teste de uso normal nunca tira de pilha vazia; um caminho de erro que desempilha a mais, sim, e daí em diante n conta um elemento a menos do que a pilha guarda. Empilhar além de 8 não é defeito aqui: o 8 de new Array(8) é o comprimento inicial, e o array cresce quando a escrita passa do fim.' },
      { correct: false, text: 'A pilha perde uma das 8 posições do bloco e passa a caber só 7 elementos', misconceptionId: 'linear.capacidade-e-tamanho' },
      { correct: false, text: 'Nada de grave: devolve undefined e a pilha continua guardando o que guardava', misconceptionId: 'linear.capacidade-e-tamanho' },
    ],
  },
]
