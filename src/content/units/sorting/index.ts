import type { Unit } from '../../schema'
import { sortingExercises, sortingMisconceptions } from './exercises'

export const sortingUnit: Unit = {
  kind: 'structure',
  id: 'sorting',
  number: 7,
  title: 'Ordenação e busca',
  learningObjective:
    'Dizer o que uma chamada de ordenação promete e o que ela cala, prever o pior caso do ' +
    'algoritmo por trás dela, e decidir entre ordenar uma vez ou varrer sempre a partir da ' +
    'carga de trabalho — sem executar.',
  prerequisites: [
    'Notação O, com regime e hipóteses declarados',
    'Array como bloco contíguo, e o custo de deslocar elementos',
    'Recursão: uma chamada que se repete sobre uma parte menor da entrada',
  ],
  motivatingProblem:
    'Uma lista de pedidos ordenada por data e depois reordenada por cliente. Os pedidos de um ' +
    'mesmo cliente saíram fora da ordem de data, e ninguém pediu isso. A ordenação por cliente ' +
    'devolveu a coleção em ordem correta de cliente — ela fez o que prometeu. ' +
    'O que exatamente ela prometeu, e o que ela nunca prometeu?',

  symbols: [
    { symbol: 'A', means: 'a coleção que está sendo ordenada' },
    { symbol: 'n', means: 'quantos elementos a coleção tem' },
    { symbol: 'A[i]', means: 'o elemento que está na posição i' },
    { symbol: 'i, j', means: 'as posições que os laços percorrem' },
    { symbol: 'E, D', means: 'as duas metades já ordenadas, à esquerda e à direita' },
    { symbol: 'S', means: 'a sequência de saída, sendo montada' },
  ],

  adt: {
    id: 'ordering',
    name: 'Ordenação',
    operations: [
      { name: 'ordenar',
        signature: 'ordenar(A, comparar)',
        guarantee: 'devolve os mesmos elementos numa ordem em que nenhum vem antes de um menor' },
    ],
    answers: 'Quais são os elementos, em ordem.',
    cannotAnswer: [
      'Em que ordem ficam os elementos que o comparador considera iguais',
      'Quanta memória além da entrada o algoritmo usou',
      'Se ele aproveitou a ordem que a entrada já trazia',
      'Quanto custou — o contrato promete o resultado, nunca o preço',
    ],
  },

  implementations: [
    {
      id: 'insertion-sort',
      name: 'Insertion sort',
      implementsAdt: 'ordering',
      summary: 'Mantém a parte à esquerda já ordenada e insere cada elemento novo dentro dela.',
      cost: {
        ordenar: { bound: 'O(n²)', regime: 'worst', amortized: false,
          assumptions: ['comparar dois elementos custa O(1)', 'a entrada chega em ordem decrescente, que é o pior caso'],
          measuredIn: 'n = elementos da coleção; ignora o tamanho de cada elemento' },
      },
      space: { bound: 'O(1)', regime: 'worst', amortized: false,
        assumptions: ['o deslocamento acontece no próprio array'], measuredIn: 'espaço além da entrada' },
      wrongWhen: [
        { scenario: 'n passa de algumas dezenas e a entrada chega sem ordem nenhuma',
          useInstead: 'merge sort, que troca o quadrado por n log n garantido' },
        { scenario: 'Cada deslocamento custa caro porque o elemento é grande',
          useInstead: 'ordenar um array de índices, e mover os elementos uma vez só no fim' },
      ],
      everydayAnchor:
        'É como se organiza um baralho na mão: cada carta nova entra no lugar dela entre as ' +
        'que já estão ordenadas. E é por isso que as bibliotecas trocam para ele abaixo de umas ' +
        'dezenas de elementos, onde o laço simples ganha da recursão.',
      invariant: 'Ao começar a rodada de i, as posições 0 até i − 1 já estão ordenadas entre si.',
    },
    {
      id: 'merge-sort',
      name: 'Merge sort',
      implementsAdt: 'ordering',
      summary: 'Divide a coleção ao meio, ordena as duas metades e intercala as duas em uma.',
      cost: {
        ordenar: { bound: 'O(n log n)', regime: 'worst', amortized: false,
          assumptions: ['comparar dois elementos custa O(1)', 'nenhuma: o limite vale para toda entrada'],
          measuredIn: 'n = elementos da coleção' },
      },
      space: { bound: 'O(n)', regime: 'worst', amortized: false,
        assumptions: ['a intercalação escreve numa sequência à parte'], measuredIn: 'espaço além da entrada' },
      wrongWhen: [
        { scenario: 'A memória disponível não comporta uma segunda cópia da coleção',
          useInstead: 'quicksort, que rearranja o próprio array' },
        { scenario: 'A coleção tem poucas dezenas de elementos',
          useInstead: 'insertion sort, sem recursão e sem cópia' },
      ],
      everydayAnchor:
        'É a metade do `sort` que o Python e o Java usam para objetos — e é por isso que esses ' +
        'dois são estáveis, enquanto o `sort` de tipos primitivos ao lado deles não é.',
      invariant:
        'A sequência de saída está ordenada, e todo elemento que ainda não saiu é maior ou ' +
        'igual ao último que saiu.',
    },
    {
      id: 'quicksort',
      name: 'Quicksort',
      implementsAdt: 'ordering',
      summary: 'Escolhe um pivô, separa a coleção em menores e maiores que ele, e repete nas duas partes.',
      cost: {
        ordenar: { bound: 'O(n log n)', regime: 'average', amortized: false,
          assumptions: ['o pivô cai perto do meio na maior parte das rodadas', 'comparar dois elementos custa O(1)'],
          measuredIn: 'n = elementos da coleção' },
      },
      space: { bound: 'O(n)', regime: 'worst', amortized: false,
        assumptions: ['nada é alocado, mas cada chamada aberta ocupa um quadro de pilha'],
        measuredIn: 'espaço além da entrada, contando a pilha de chamadas' },
      wrongWhen: [
        { scenario: 'O pior caso é inaceitável — uma requisição que não pode passar de um limite de tempo',
          useInstead: 'merge sort, cujo n log n vale para toda entrada' },
        { scenario: 'As chaves são escolhidas por um adversário que conhece a regra do pivô',
          useInstead: 'pivô sorteado por execução, pela mesma razão que uma tabela hash usa semente aleatória' },
        { scenario: 'A ordem entre elementos iguais precisa ser preservada',
          useInstead: 'merge sort, ou desempatar pelo índice original dentro do comparador' },
      ],
      everydayAnchor:
        'É o `sort` de tipos primitivos de quase toda biblioteca, e o motivo de algumas ' +
        'nomearem a função `unstable_sort` — o nome está avisando qual ausência você aceitou.',
      invariant: 'Depois de particionar, o pivô está na posição final dele, e tudo à esquerda é menor.',
    },
  ],

  cycles: [
    { id: 'sorting.c0', title: 'O que ordenar promete, e o que ele cala', layer: 'essential', band: 'contract',
      introducesTerms: ['sorting', 'permutation'],
      body: [
        'Ordenar devolve os mesmos elementos, em ordem. É pouco, e é exatamente isso: nenhum elemento entra, nenhum sai, nenhum vira outro — e nenhum vem antes de um menor.',
        'O que interessa aqui é a lista do que essa promessa NÃO cobre. Ela não diz o que aconteceu com os elementos que o comparador considera iguais. Não diz quanta memória foi usada. Não diz se a ordem que a entrada já trazia foi aproveitada. Guarde essa lista: cada item dela é uma garantia que alguns algoritmos oferecem e outros não, e escolher entre eles é escolher qual dessas você precisa.',
      ],
      exerciseId: 'sorting.e0' },

    { id: 'sorting.c1', title: 'Estabilidade: a ausência que reordena o que ninguém pediu', layer: 'essential', band: 'contract',
      introducesTerms: ['stability', 'comparator'],
      body: [
        'Volte aos pedidos ordenados por data e depois por cliente. A segunda ordenação comparou clientes; para dois pedidos do mesmo cliente, ela disse "empate". E o que um algoritmo faz com um empate não está no contrato.',
        'Um algoritmo estável resolve o empate mantendo a ordem em que os elementos chegaram. Um instável resolve como for conveniente para ele. As duas saídas estão ordenadas por cliente; só uma preserva o trabalho da ordenação anterior.',
        'O comparador também tem uma obrigação, e ela é fácil de quebrar sem perceber: se ele diz que x vem antes de y e que y vem antes de z, ele precisa dizer que x vem antes de z. Um comparador que se contradiz não produz uma ordem errada — produz uma saída que não é ordem nenhuma.',
      ],
      workedExample: {
        problem: 'Duas ordenações de [(3,Ana), (1,Bia), (3,Caio)] por número, uma estável e uma não.',
        whatToNotice: 'As duas devolvem 1, 3, 3. Só olhando os nomes dá para saber qual foi qual — e é por isso que este defeito passa em teste que compara só as chaves.',
      },
      exerciseId: 'sorting.e1' },

    { id: 'sorting.c2', title: 'Insertion sort e a parte que já está pronta', layer: 'essential', band: 'implementation', elaborates: 'insertion-sort',
      introducesTerms: ['insertion-sort', 'adaptive'],
      body: [
        'A primeira forma de entregar o contrato é a que a mão faz sozinha com um baralho: mantenha à esquerda um trecho já ordenado e encaixe cada elemento novo dentro dele.',
        'O laço interno é onde mora o custo, e ele depende da entrada. Numa coleção em ordem decrescente ele roda inteiro toda vez, e o total é O(n²). Numa coleção que já chega quase ordenada ele quase não roda, e o total cai para O(n).',
        'Essa segunda frase não é sobre caso médio. Caso médio fala de uma distribuição de entradas possíveis; adaptatividade fala da entrada concreta que está na sua frente, e você consegue olhar para ela e prever.',
      ],
      pseudocode: `função ordenar(A)
    para cada i de 1 até n − 1 faça
        x ← A[i]
        j ← i − 1
        enquanto j ≥ 0 e A[j] > x faça
            A[j + 1] ← A[j]
            j ← j − 1
        A[j + 1] ← x`,
      invariant: 'Ao começar a rodada de i, as posições 0 até i − 1 já estão ordenadas entre si.',
      exerciseId: 'sorting.e2' },

    { id: 'sorting.c3', title: 'Merge sort e a intercalação', layer: 'essential', band: 'implementation', elaborates: 'merge-sort',
      introducesTerms: ['merge-sort', 'merge'],
      body: [
        'A segunda forma parte de uma observação: intercalar duas sequências já ordenadas é barato. Basta olhar o primeiro de cada uma e tomar o menor, até esgotar as duas.',
        'Se intercalar é barato, ordenar vira dividir ao meio até sobrar um elemento — que já está ordenado sozinho — e intercalar de volta. São log n níveis, cada um custando n. O limite é O(n log n), e ele vale para toda entrada, não para a média delas.',
        'A linha que decide o empate na intercalação é a linha que decide a estabilidade da coleção inteira. Tomar o da esquerda quando os dois primeiros comparam como iguais preserva a ordem de chegada; tomar o da direita a inverte. É uma comparação, e as duas custam o mesmo.',
      ],
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
      exerciseId: 'sorting.e3' },

    { id: 'sorting.c4', title: 'Quicksort, o pivô e o pior caso', layer: 'essential', band: 'implementation', elaborates: 'quicksort',
      introducesTerms: ['quicksort', 'pivot', 'partition'],
      body: [
        'A terceira forma não divide ao meio: divide em torno de um elemento escolhido. Depois de separar o que é menor do que é maior, o pivô está na posição final dele, e as duas partes podem ser resolvidas do mesmo jeito.',
        'Quando o pivô cai perto do meio, as partes têm metade do tamanho e o total é O(n log n). Quando ele cai no extremo, uma parte fica vazia e a outra fica com todo o resto — são n rodadas em vez de log n, e o total é O(n²).',
        'A escolha do pivô é livre, e é ela que decide qual dos dois cenários acontece. Escolher sempre o primeiro elemento transforma uma coleção que já chega ordenada — a mais comum de todas — no pior caso.',
      ],
      workedExample: {
        problem: 'Ordene [1, 2, 3, 4, 5] com quicksort tomando o primeiro elemento como pivô.',
        whatToNotice: 'Toda partição devolve uma parte vazia. A entrada mais bem comportada que existe ativou o pior caso, e nenhuma delas parece rara.',
      },
      exerciseId: 'sorting.e4' },

    { id: 'sorting.c5', title: 'O preço que o contrato não menciona', layer: 'essential', band: 'cost',
      introducesTerms: ['in-place'],
      body: [
        'Ordenar in-place é rearranjar o próprio array em vez de montar outro. Merge sort não faz isso: a intercalação escreve numa sequência à parte, e o espaço extra é O(n).',
        'Quicksort faz — e é aqui que a palavra engana. Ele não aloca coleção nenhuma, mas cada chamada aberta ocupa um quadro na pilha. No pior caso são n chamadas abertas ao mesmo tempo, e isso é espaço que cresce com a entrada, ainda que nenhum array tenha sido alocado.',
        'In-place e espaço constante são coisas diferentes, e a segunda é a que importa quando a memória é o limite.',
      ],
      exerciseId: 'sorting.e5' },

    { id: 'sorting.c6', title: 'Ordenar uma vez para buscar muitas', layer: 'essential', band: 'cost',
      introducesTerms: ['binary-search'],
      body: [
        'Numa coleção ordenada, procurar por chave custa O(log n): compare com o do meio e descarte metade das posições. Numa coleção sem ordem, custa O(n).',
        'Isso torna a ordenação um investimento, não um fim: paga-se n log n uma vez para que toda consulta seguinte fique em log n. A conta fecha quando as consultas são muitas e a coleção muda pouco.',
        'E ela não fecha quando a pergunta é uma só. Achar o menor elemento custa n − 1 comparações varrendo. Ordenar antes para depois olhar a primeira posição custa n log n, e devolve a mesma resposta.',
      ],
      exerciseId: 'sorting.e6' },

    { id: 'sorting.c7', title: 'Quando ordenar é a escolha errada', layer: 'essential', band: 'cost',
      introducesTerms: [],
      body: [
        'Volte ao contrato do primeiro ciclo. Tudo que ele não promete é onde a escolha falha, e a lista que você guardou lá é a resposta inteira deste ciclo.',
        'Ordenar é a escolha errada quando a pergunta era sobre um elemento e você ordenou todos; quando a ordem entre iguais importava e o algoritmo escolhido não a promete; quando a memória era o limite e o algoritmo escolhido pede uma cópia; e quando o pior caso era inaceitável e o algoritmo escolhido só garante o caso médio.',
        'Nenhuma dessas é um defeito do algoritmo. Todas são uma ausência do contrato que alguém não leu.',
      ],
      exerciseId: 'sorting.e7' },

    { id: 'sorting.c8', title: 'O que as bibliotecas realmente fazem', layer: 'deep-dive', band: 'implementation', elaborates: 'merge-sort',
      introducesTerms: ['timsort'],
      body: [
        'A ordenação padrão de várias linguagens não é nenhum dos três: é a composição deliberada de dois deles. Ela procura na entrada os trechos que já vêm ordenados, completa os curtos com insertion sort, e intercala os trechos.',
        'Cada peça está lá por uma ausência da outra. A intercalação dá o pior caso garantido e a estabilidade; o insertion sort aproveita a ordem que a entrada já traz, que a intercalação sozinha ignoraria.',
        'É a resposta prática à pergunta do ciclo anterior: quando nenhuma escolha isolada serve, a saída costuma ser compor duas — e é o mesmo movimento que uma LRU cache faz com tabela hash e lista ligada.',
      ],
      exerciseId: 'sorting.e8' },
  ],

  misconceptions: sortingMisconceptions,

  exercises: sortingExercises,

  mastery: {
    statement:
      'O aluno domina esta unidade quando, diante de uma chamada de ordenação em código que ' +
      'nunca viu, consegue em menos de cinco minutos e sem executar: dizer se a ordem entre ' +
      'elementos iguais é preservada e como confirmar isso; nomear o pior caso do algoritmo ' +
      'usado e construir a entrada que o ativa; e decidir, para uma carga de trabalho dada, ' +
      'se vale ordenar uma vez ou varrer a cada consulta.',
    requiresClean: ['sorting.e3', 'sorting.e7'],
    revisitIntervalDays: 7,
  },
}
