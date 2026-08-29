import type { Exercise, Misconception } from '../../schema'

export const sortingMisconceptions: Misconception[] = [
  { id: 'sorting.sort-e-estavel', label: 'Supor que a ordem anterior entre iguais sobrevive',
    socraticQuestion: 'Ordene [2a, 5b, 5c] com [1d, 5e, 7f] tomando o da direita quando empatar. O resultado está ordenado?',
    escalation: [
      'Está ordenado, e 5e saiu antes de 5b. Compare essa saída com a que você teria se o empate fosse para a esquerda: em que elas diferem, e quem pediu essa diferença?',
      'Agora vá à documentação do `sort` da linguagem que você usa e procure a palavra "stable". Ela aparece, ou está ausente?',
    ],
    reviewCycle: 'sorting.c1' },

  { id: 'sorting.quicksort-e-n-log-n', label: 'Quicksort declarado O(n log n) sem regime',
    socraticQuestion: 'Escolha o primeiro elemento como pivô e ordene uma coleção que já chega ordenada. Quantos elementos cada partição recebe?',
    escalation: [
      'Uma partição ficou com zero e a outra com todo o resto. Escreva quantas rodadas isso dá para n elementos, e compare com log n.',
    ],
    reviewCycle: 'sorting.c4' },

  { id: 'sorting.in-place-e-sem-memoria', label: 'In-place confundido com espaço constante',
    socraticQuestion: 'Um quicksort não aloca array nenhum. Quantas chamadas ficam abertas ao mesmo tempo quando o pivô é sempre o pior possível?',
    escalation: [
      'Cada chamada aberta ocupa um quadro na pilha. Isso é espaço que cresce com a entrada, ou não é espaço?',
    ],
    reviewCycle: 'sorting.c5' },

  { id: 'sorting.comparador-inconsistente', label: 'Comparador que contradiz a si mesmo',
    socraticQuestion: 'Escreva três elementos x, y e z para os quais seu comparador diga que x vem antes de y, y antes de z, e z antes de x. Qual saída é a correta?',
    escalation: [
      'Se as três afirmações valem ao mesmo tempo, existe alguma ordem que satisfaça as três? E se não existe, o que o algoritmo pode devolver?',
    ],
    reviewCycle: 'sorting.c1' },

  { id: 'sorting.ordenar-para-achar-um', label: 'Ordenar tudo para responder uma pergunta que era linear',
    socraticQuestion: 'Você precisa do menor elemento, uma vez só. Quantas comparações isso custa varrendo a coleção, e quantas custa ordenando antes?',
    escalation: [
      'Uma varredura responde em n − 1 comparações. Ordenar antes responde na mesma pergunta depois de n log n. Em que situação a segunda conta compensa?',
    ],
    reviewCycle: 'sorting.c6' },

  { id: 'sorting.adaptativo-e-caso-medio', label: 'Adaptatividade confundida com caso médio',
    socraticQuestion: 'Insertion sort custa O(n) numa entrada quase ordenada e O(n²) numa entrada sorteada. Qual das duas afirmações é sobre o caso médio?',
    escalation: [
      'Caso médio fala de uma distribuição de entradas; adaptatividade fala de uma propriedade de uma entrada concreta. Qual delas você consegue conferir olhando a entrada que tem em mãos?',
    ],
    reviewCycle: 'sorting.c2' },

  { id: 'sorting.estabilidade-custa', label: 'Supor que estabilidade é um custo assintótico',
    socraticQuestion: 'Volte à intercalação e mude só o desempate, de ≤ para <. Quantas comparações a mais isso fez?',
    escalation: [
      'O desempate é a mesma comparação, com outro resultado. Se o custo não mudou, por que merge sort é estável e quicksort não é?',
    ],
    reviewCycle: 'sorting.c8' },
]

export const sortingExercises: Exercise[] = [
  {
    kind: 'choice', id: 'sorting.e0',
    prompt: 'Uma função de ordenação devolveu a coleção em ordem crescente. O que essa saída, sozinha, permite concluir?',
    choices: [
      { correct: true, text: 'Que nenhum elemento vem antes de um menor',
        why: 'E nada além disso sobre o que aconteceu com os iguais, com a memória ou com a ordem original' },
      { correct: false, text: 'Que os elementos iguais mantiveram a ordem em que estavam', misconceptionId: 'sorting.sort-e-estavel' },
      { correct: false, text: 'Que o algoritmo é o mais adequado para essa coleção, já que o resultado está correto', misconceptionId: 'sorting.ordenar-para-achar-um' },
    ],
  },
  {
    kind: 'choice', id: 'sorting.e1',
    prompt: 'A lista de pedidos foi ordenada por data e depois ordenada por cliente. Os pedidos de um mesmo cliente saíram fora da ordem de data. O que aconteceu?',
    choices: [
      { correct: true, text: 'A segunda ordenação não preservou a ordem entre iguais',
        why: 'Para dois pedidos do mesmo cliente o comparador disse "empate", e o que um algoritmo faz com empate não está no contrato.' },
      { correct: false, text: 'O comparador de cliente está errado: ele deveria desempatar por data', misconceptionId: 'sorting.comparador-inconsistente' },
      { correct: false, text: 'Ordenar duas vezes sempre desfaz a primeira ordenação, independentemente do algoritmo', misconceptionId: 'sorting.sort-e-estavel' },
    ],
  },
  {
    kind: 'choice', id: 'sorting.e2',
    prompt: 'Insertion sort recebe uma coleção em que só dois elementos vizinhos estão trocados. Quanto trabalho ele faz?',
    choices: [
      { correct: true, text: 'Percorre a coleção uma vez e desloca um elemento',
        why: 'O laço interno quase não roda, porque a parte à esquerda já está ordenada' },
      { correct: false, text: 'O mesmo trabalho de sempre: o caso médio dele é O(n²)', misconceptionId: 'sorting.adaptativo-e-caso-medio' },
      { correct: false, text: 'Detecta que a coleção está quase ordenada e troca para outro algoritmo', misconceptionId: 'sorting.adaptativo-e-caso-medio' },
    ],
  },
  {
    kind: 'trace', id: 'sorting.e3',
    prompt:
      'Duas metades já ordenadas: à esquerda 2a, 5b, 5c; à direita 1d, 5e, 7f. A letra diz de onde o ' +
      'elemento veio e o número é o que o comparador enxerga. Intercale as duas, passo a passo.',
    pseudocode: `função intercalar(E, D)
    S ← sequência vazia
    enquanto E não vazia e D não vazia faça
        se primeiro(E) ≤ primeiro(D) então
            mover primeiro(E) para o fim de S
        senão
            mover primeiro(D) para o fim de S
    mover o que restou de E e depois de D para o fim de S
    retorne S`,
    invariant: 'S está ordenada, e todo elemento que ainda está em E ou em D é maior ou igual ao último de S.',
    columns: [
      { key: 'step', label: 'passo' },
      { key: 'key', label: 'quem está na frente' },
      { key: 'side', label: 'de que lado saiu', placeholder: 'esquerda ou direita' },
      { key: 'emitted', label: 'elemento que saiu', placeholder: '3x' },
      { key: 'output', label: 'S até aqui', placeholder: '3x 4y 9z' },
    ],
    conventions: [
      { notation: '5b', rule: 'um elemento', why: 'O número é o que o comparador enxerga; a letra diz de qual metade ele veio, e é só ela que revela a ordem entre iguais.' },
      { notation: '1d 2a 5b', rule: 'a sequência S', why: 'Os elementos que já saíram, na ordem em que saíram, separados por espaço.' },
      { notation: 'esquerda / direita', rule: 'de que lado saiu', why: 'De qual das duas metades o elemento foi retirado naquele passo.' },
    ],
    reference: 'sorting.merge-step-trace',
    misconceptionByStep: { '3': 'sorting.sort-e-estavel' },
  },
  {
    kind: 'choice', id: 'sorting.e4',
    prompt: 'Quicksort com o primeiro elemento como pivô recebe uma coleção que já chega ordenada. Qual afirmação sobrevive a uma revisão?',
    choices: [
      { correct: true, text: 'O(n²) no pior caso, e esta entrada é o pior caso',
        why: 'Com o pivô no primeiro elemento, cada partição separa um elemento do resto: são n rodadas, não log n.' },
      { correct: false, text: 'O(n log n), porque essa é a complexidade do quicksort', misconceptionId: 'sorting.quicksort-e-n-log-n' },
      { correct: false, text: 'O(n), porque a coleção já está ordenada e não há troca a fazer', misconceptionId: 'sorting.adaptativo-e-caso-medio' },
    ],
  },
  {
    kind: 'choice', id: 'sorting.e5',
    prompt: 'Um quicksort recursivo não aloca array nenhum além da entrada. Quanto espaço extra ele usa no pior caso?',
    choices: [
      { correct: true, text: 'O(n), na pilha de chamadas',
        why: 'Nenhum array é alocado, e cada chamada aberta ocupa um quadro. Com o pivô no extremo são n chamadas abertas ao mesmo tempo.' },
      { correct: false, text: 'O(1), porque ele ordena no próprio array', misconceptionId: 'sorting.in-place-e-sem-memoria' },
      { correct: false, text: 'O(n), porque a intercalação precisa de uma cópia', misconceptionId: 'sorting.in-place-e-sem-memoria' },
    ],
  },
  {
    kind: 'choice', id: 'sorting.e6',
    prompt: 'Uma coleção de um milhão de itens, consultada por chave. Em que caso vale ordenar antes em vez de varrer a cada consulta?',
    choices: [
      { correct: true, text: 'Quando a coleção muda pouco e as consultas são muitas',
        why: 'Paga-se n log n uma vez para que cada consulta seguinte custe log n. Para uma consulta só, a varredura ganha.' },
      { correct: false, text: 'Sempre: log n por consulta é melhor que n, e isso decide a questão', misconceptionId: 'sorting.ordenar-para-achar-um' },
      { correct: false, text: 'Nunca, porque manter a coleção ordenada a cada inserção custa mais que varrer', misconceptionId: 'sorting.ordenar-para-achar-um' },
    ],
  },
  {
    kind: 'bug', id: 'sorting.e7',
    prompt: 'Este comparador é plausível e passa numa revisão distraída. Marque a linha defeituosa e escolha a consequência. Marcar a linha certa pela razão errada não conta.',
    language: 'javascript',
    code: `items.sort((a, b) => {
  if (a.priority === b.priority) return 0
  return a.priority > b.priority
})`,
    faultyLines: [3],
    consequences: [
      { correct: true, text: 'A comparação devolve verdadeiro ou falso, que viram 1 e 0',
        why: 'A função nunca diz "a vem antes de b", e a saída depende de detalhes do algoritmo em vez do comparador' },
      { correct: false, text: 'Nada de grave: verdadeiro e falso ordenam do mesmo jeito, só invertido', misconceptionId: 'sorting.comparador-inconsistente' },
      { correct: false, text: 'A ordenação deixa de ser estável, mas a ordem por prioridade continua correta', misconceptionId: 'sorting.comparador-inconsistente' },
    ],
  },
  {
    kind: 'choice', id: 'sorting.e8',
    prompt: 'O `sort` padrão de várias linguagens combina insertion sort em trechos curtos com intercalação dos trechos. Por que a combinação, em vez de um dos dois?',
    choices: [
      { correct: true, text: 'Cada um cobre a fraqueza do outro',
        why: 'A intercalação garante o pior caso; o insertion sort aproveita os trechos que já chegam ordenados, que ela sozinha ignoraria.' },
      { correct: false, text: 'Para recuperar a estabilidade, que a intercalação sozinha não oferece', misconceptionId: 'sorting.estabilidade-custa' },
      { correct: false, text: 'Porque a intercalação sozinha teria custo maior em troca de ser estável', misconceptionId: 'sorting.estabilidade-custa' },
    ],
  },
]
