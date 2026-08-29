import type { Exercise, Misconception } from '../../schema'

export const treesMisconceptions: Misconception[] = [
  { id: 'trees.bst-e-log-n', label: 'Árvore de busca declarada O(log n) sem dizer que balanceia',
    socraticQuestion: 'Insira 1, 2, 3, 4 e 5 numa árvore de busca vazia, nessa ordem. Que altura sobrou?',
    escalation: [
      'Cada nó ficou à direita do anterior. Quantos nós a busca por 5 precisa visitar, e isso se parece com log n ou com n?',
      'Agora repare de onde veio essa entrada: uma coleção já ordenada. Ela é rara no seu sistema, ou é a mais comum de todas?',
    ],
    reviewCycle: 'trees.c2' },

  { id: 'trees.altura-e-profundidade', label: 'Altura e profundidade usadas como sinônimos',
    socraticQuestion: 'Numa árvore com raiz e dois filhos, qual é a altura da árvore e qual é a profundidade da raiz?',
    escalation: [
      'Uma delas é contada de baixo para cima e a outra de cima para baixo. Qual das duas muda quando você olha um nó diferente da mesma árvore?',
    ],
    reviewCycle: 'trees.c2' },

  { id: 'trees.arvore-ordena-valores', label: 'Esperar que a ordem valha para o valor guardado',
    socraticQuestion: 'A árvore guarda pares chave-valor e a invariante compara chaves. Percorrendo em ordem, o que sai ordenado — as chaves, os valores, ou os dois?',
    escalation: [
      'A comparação que decide onde o par foi parar usou qual dos dois? Se o valor nunca foi comparado com nada, o que a estrutura pode afirmar sobre ele?',
    ],
    reviewCycle: 'trees.c0' },

  { id: 'trees.rotacao-muda-ordem', label: 'Supor que rotacionar reordena as chaves',
    socraticQuestion: 'Rotacione uma árvore de três nós e percorra as duas versões em ordem. As duas sequências de chaves são iguais?',
    escalation: [
      'Se as sequências são iguais, o que exatamente a rotação mudou? Escreva a altura antes e depois.',
    ],
    reviewCycle: 'trees.c3' },

  { id: 'trees.travessia-errada', label: 'Esperar saída ordenada de qualquer travessia',
    socraticQuestion: 'Numa árvore com raiz 50, filho esquerdo 30 e filho direito 70, escreva a saída visitando a raiz primeiro. Ela está ordenada?',
    escalation: [
      'Só uma das ordens de visita produz sequência ordenada, e ela é a que visita a subárvore esquerda antes da raiz. Qual das três você usou?',
    ],
    reviewCycle: 'trees.c1' },

  { id: 'trees.arvore-substitui-hash', label: 'Trocar tabela hash por árvore sem contar o que se perde',
    socraticQuestion: 'Numa carga em que a única operação é obter por chave exata, milhões de vezes por minuto, o que a árvore cobra a mais que a tabela hash?',
    escalation: [
      'Uma responde em uma conta, a outra em log n comparações. Se nenhuma consulta pede ordem, o que a ordem está comprando?',
    ],
    reviewCycle: 'trees.c6' },
]

export const treesExercises: Exercise[] = [
  {
    kind: 'choice', id: 'trees.e0',
    prompt: 'O contrato SortedMap acrescenta ordem ao que o Map já respondia. O que exatamente ele passa a responder, e sobre o quê?',
    choices: [
      { correct: true, text: 'Mínimo, máximo e faixa',
        why: 'Sobre as chaves, que são o que a estrutura compara. Sobre os valores ele não afirma nada' },
      { correct: false, text: 'Mínimo, máximo e faixa sobre chaves e valores: percorrer em ordem devolve os dois ordenados', misconceptionId: 'trees.arvore-ordena-valores' },
      { correct: false, text: 'As mesmas perguntas do Map, respondidas em O(log n) em vez de O(1)', misconceptionId: 'trees.arvore-substitui-hash' },
    ],
  },
  {
    kind: 'trace', id: 'trees.e1',
    prompt:
      'Insira 50, 30, 70, 20, 40 e 35 numa árvore de busca vazia, nessa ordem e sem balanceamento. ' +
      'Para cada inserção: quantas comparações foram feitas, de quem o novo nó virou filho, de que ' +
      'lado, e qual a altura da árvore depois.',
    pseudocode: `função inserir(T, chave)
    se T é vazia então
        retorne novo nó com chave
    se chave < T.chave então
        T.esquerda ← inserir(T.esquerda, chave)
    senão
        T.direita ← inserir(T.direita, chave)
    retorne T`,
    invariant: 'Para todo nó, toda chave da subárvore esquerda é menor que a dele, e toda da direita é maior.',
    columns: [
      { key: 'step', label: 'inserção' },
      { key: 'key', label: 'chave inserida' },
      { key: 'comparisons', label: 'comparações feitas', placeholder: 'um número' },
      { key: 'parent', label: 'filho de quem', placeholder: '99' },
      { key: 'side', label: 'de que lado', placeholder: 'esquerda ou direita' },
      { key: 'height', label: 'altura depois', placeholder: 'um número' },
    ],
    conventions: [
      { notation: 'raiz', rule: 'quando não há pai', why: 'A primeira inserção não compara com nada e não vira filho de ninguém. Escreva "raiz" nas duas colunas.' },
      { notation: '0', rule: 'altura de uma árvore com um nó só', why: 'Altura é contada em arestas, de baixo para cima: um nó sozinho tem altura zero.' },
      { notation: '(comparações)', rule: 'quantas comparações', why: 'Uma por nó visitado no caminho até o lugar vazio. A primeira inserção faz zero.' },
    ],
    reference: 'trees.bst-insert-trace',
    misconceptionByStep: { '6': 'trees.bst-e-log-n' },
  },
  {
    kind: 'choice', id: 'trees.e2',
    prompt: 'Um índice em memória usa árvore de busca sem balanceamento. As chaves chegam de um exportador que as emite em ordem crescente. O que acontece?',
    choices: [
      { correct: true, text: 'Cada chave vira o filho direito da anterior',
        why: 'A altura vira n − 1 e toda busca passa a custar O(n): a estrutura virou uma lista ligada com ponteiros a mais.' },
      { correct: false, text: 'Nada de grave: a busca continua O(log n), que é a complexidade da árvore de busca', misconceptionId: 'trees.bst-e-log-n' },
      { correct: false, text: 'A árvore fica com profundidade zero, porque nenhum nó tem filho esquerdo', misconceptionId: 'trees.altura-e-profundidade' },
    ],
  },
  {
    kind: 'choice', id: 'trees.e3',
    prompt: 'Uma rotação foi aplicada a uma subárvore. O que ela mudou e o que ela preservou?',
    choices: [
      { correct: true, text: 'Mudou a altura e quem é pai de quem; preservou a ordem',
        why: 'A travessia em ordem devolve a mesma sequência de chaves antes e depois — é a condição para a operação ser legítima.' },
      { correct: false, text: 'Reordenou as chaves para equilibrar os dois lados, e é por isso que a altura cai', misconceptionId: 'trees.rotacao-muda-ordem' },
      { correct: false, text: 'Mudou a profundidade da raiz, que é o que a altura mede', misconceptionId: 'trees.altura-e-profundidade' },
    ],
  },
  {
    kind: 'choice', id: 'trees.e4',
    prompt: 'Uma requisição não pode passar de um limite de tempo. As chaves vêm de um cliente externo. Entre árvore balanceada e tabela hash, o que decide?',
    choices: [
      { correct: true, text: 'A árvore balanceada, por ser garantia e não média',
        why: 'O(log n) vale para toda entrada; a hash oferece O(1) no caso médio e O(n) no pior, e quem escolhe as chaves pode escolher o pior.' },
      { correct: false, text: 'A tabela hash: O(1) é melhor que O(log n), e o pior caso dela é uma possibilidade teórica', misconceptionId: 'trees.arvore-substitui-hash' },
      { correct: false, text: 'A árvore sem balanceamento já basta: em média ela também dá O(log n)', misconceptionId: 'trees.bst-e-log-n' },
    ],
  },
  {
    kind: 'choice', id: 'trees.e5',
    prompt: 'Um índice de banco mora em disco. Por que ele usa B-tree, com nós de centenas de chaves, em vez de uma árvore binária balanceada?',
    choices: [
      { correct: true, text: 'Cada nó visitado é um acesso a disco',
        why: 'Um nó com centenas de chaves reduz a altura de dezenas para três ou quatro: o número de comparações sobe e o de acessos despenca.' },
      { correct: false, text: 'Porque a B-tree é balanceada e a árvore binária não é', misconceptionId: 'trees.bst-e-log-n' },
      { correct: false, text: 'Porque comparar centenas de chaves de uma vez é mais barato que comparar duas', misconceptionId: 'trees.arvore-substitui-hash' },
    ],
  },
  {
    kind: 'bug', id: 'trees.e6',
    prompt: 'Esta busca numa árvore de busca é plausível e devolve a resposta certa em muitos casos. Marque a linha defeituosa e escolha a consequência.',
    language: 'javascript',
    code: `function buscar(no, chave) {
  if (no === null) return null
  if (no.chave === chave) return no.valor
  return buscar(no.esquerda, chave) || buscar(no.direita, chave)
}`,
    faultyLines: [4],
    consequences: [
      { correct: true, text: 'Ela desce pelos dois lados em vez de escolher um',
        why: 'A resposta continua certa e o custo vira O(n): a invariante de ordem, que é a única razão de a árvore existir, deixou de ser usada.' },
      { correct: false, text: 'Ela devolve a chave errada quando há valores repetidos na subárvore direita', misconceptionId: 'trees.arvore-ordena-valores' },
      { correct: false, text: 'Nada de grave: visitar os dois lados é a travessia padrão de uma árvore de busca', misconceptionId: 'trees.travessia-errada' },
    ],
  },
]
