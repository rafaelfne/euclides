import type { Unit } from '../../schema'
import { sortingExercises, sortingMisconceptions } from './exercises'

export const sortingUnit: Unit = {
  kind: 'structure',
  runnable: 'typescript',
  id: 'sorting',
  number: 7,
  title: 'Ordenação e busca',
  learningObjective:
    'Dizer o que uma chamada de ordenação promete e o que ela cala, prever o pior caso do ' +
    'algoritmo por trás dela, e decidir entre ordenar uma vez ou varrer sempre a partir da ' +
    'carga de trabalho, sem executar.',
  prerequisites: [
    'Notação O, com regime e hipóteses declarados',
    'Array como bloco contíguo, e o custo de deslocar elementos',
    'Recursão: uma chamada que se repete sobre uma parte menor da entrada',
  ],
  motivatingProblem:
    'Uma lista de pedidos ordenada por data e depois reordenada por cliente. Os pedidos de um ' +
    'mesmo cliente saíram fora da ordem de data, e ninguém pediu isso. A ordenação por cliente ' +
    'devolveu a coleção em ordem correta de cliente, ela fez o que prometeu. ' +
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
      'Quanto custou, o contrato promete o resultado, nunca o preço',
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
        'É a metade do `sort` que o Python e o Java usam para objetos, e é por isso que esses ' +
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
        { scenario: 'O pior caso é inaceitável, uma requisição que não pode passar de um limite de tempo',
          useInstead: 'merge sort, cujo n log n vale para toda entrada' },
        { scenario: 'As chaves são escolhidas por um adversário que conhece a regra do pivô',
          useInstead: 'pivô sorteado por execução, pela mesma razão que uma tabela hash usa semente aleatória' },
        { scenario: 'A ordem entre elementos iguais precisa ser preservada',
          useInstead: 'merge sort, ou desempatar pelo índice original dentro do comparador' },
      ],
      everydayAnchor:
        'É o `sort` de tipos primitivos de quase toda biblioteca, e o motivo de algumas ' +
        'nomearem a função `unstable_sort`, o nome está avisando qual ausência você aceitou.',
      invariant: 'Depois de particionar, o pivô está na posição final dele, e tudo à esquerda é menor.',
    },
  ],

  cycles: [
    { id: 'sorting.c0', title: 'O que ordenar promete, e o que ele cala', layer: 'essential', band: 'contract',
      introducesTerms: ['sorting', 'permutation'],
      oneLine: "Ordenar devolve os mesmos elementos em ordem, e não promete mais nada.",
      plainly:
        'Você ordena pedidos por cliente depois de já os ter ordenado por data. Os pedidos do mesmo ' +
        'cliente podem manter a ordem de data, ou podem sair embaralhados; ambos continuam ' +
        '“ordenados por cliente”. A palavra ordenar promete uma coisa específica. O restante — ' +
        'memória usada, tratamento dos empates e aproveitamento da ordem existente — precisa ser perguntado.',
      body: [
        'Ordenar devolve os mesmos elementos, em ordem. Entram 3, saem 3: nenhum elemento entra, nenhum sai, nenhum vira outro, e nenhum vem antes de um menor.',
        'O que interessa aqui é a lista do que essa promessa NÃO cobre. Ela não diz o que aconteceu com os elementos que o comparador considera iguais. Não diz quanta memória foi usada. Não diz se a ordem que a entrada já trazia foi aproveitada. Guarde essa lista: cada item dela é uma garantia que alguns algoritmos oferecem e outros não, e escolher entre eles é escolher qual dessas você precisa.',
      ],
      figure: {
        kind: 'concept-flow',
        nodes: [
          { id: 'input', label: '[3, 1, 2]', tone: 'contract' },
          { id: 'sort', label: 'ordenar', tone: 'implementation' },
          { id: 'output', label: '[1, 2, 3]', tone: 'contract' },
          { id: 'same', label: 'mesmos elementos', tone: 'contract' },
        ],
        edges: [
          { from: 'input', to: 'sort' },
          { from: 'sort', to: 'output' },
          { from: 'sort', to: 'same' },
        ],
        caption: 'Ordenar muda a posição dos elementos para formar uma ordem, mas preserva quais elementos existem. Memória e empates continuam perguntas abertas.',
      },
      workedExample: {
        problem: "Três chamados chegam nesta ordem: (urgente, Ana), (urgente, Caio), (normal, Bia). Ordenar por prioridade precisa pôr os urgentes antes do normal, mas pode trocar Ana e Caio sem violar essa promessa.",
        whatToNotice: "A saída continua ordenada por prioridade nos dois casos. A ordem de chegada entre Ana e Caio é uma informação diferente, que ordenar não promete preservar.",
      },
      exerciseId: 'sorting.e0' },

    { id: 'sorting.c1', title: 'Estabilidade: a ausência que reordena o que ninguém pediu', layer: 'essential', band: 'contract',
      introducesTerms: ['stability', 'comparator'],
      oneLine: "Um algoritmo estável mantém a ordem de chegada entre 2 elementos que empatam.",
      plainly:
        'Dois pedidos do mesmo cliente chegaram em datas diferentes. Ao organizar por cliente, ' +
        'nenhum dos dois deveria passar na frente do outro sem motivo. Alguns métodos preservam a ' +
        'chegada anterior quando há empate; outros não. A lista continua corretamente ordenada nos ' +
        'dois casos, mas só um preserva a informação que já estava lá.',
      body: [
        'Volte aos pedidos ordenados por data e depois por cliente. A segunda ordenação comparou clientes; para 2 pedidos do mesmo cliente, ela disse "empate". E o que um algoritmo faz com um empate não está no contrato.',
        'O comparador também tem uma obrigação, e ela é fácil de quebrar sem perceber: se ele diz que x vem antes de y e que y vem antes de z, ele precisa dizer que x vem antes de z. Um comparador que se contradiz não produz uma ordem errada, produz uma saída que não é ordem nenhuma.',
      ],
      figure: {
        kind: 'stability',
        items: [
          { value: 3, tag: 'a' },
          { value: 1, tag: 'b' },
          { value: 3, tag: 'c' },
          { value: 2, tag: 'd' },
          { value: 3, tag: 'e' },
        ],
        caption: 'As duas saídas estão ordenadas pelo número, e as etiquetas discordam. A única diferença entre os dois algoritmos é o que cada um faz quando o comparador diz "empate": um mantém a ordem de chegada, o outro resolve como for conveniente para ele. Foi essa ordem de chegada que a ordenação anterior tinha produzido.',
      },
      workedExample: {
        problem: 'Em [(3,Ana), (1,Bia), (3,Caio)], a saída estável é [(1,Bia), (3,Ana), (3,Caio)]; uma saída não estável pode trocar Ana e Caio.',
        whatToNotice: 'As duas sequências de chaves são 1, 3, 3. Só as etiquetas revelam se a ordem de chegada no empate foi preservada.',
      },
      exerciseId: 'sorting.e1' },

    { id: 'sorting.c2', title: 'Insertion sort e a parte que já está pronta', layer: 'essential', band: 'implementation', elaborates: 'insertion-sort',
      introducesTerms: ['insertion-sort', 'adaptive'],
      oneLine: "Sobre 1000 elementos quase ordenados o laço interno quase não roda.",
      plainly:
        'Você recebe uma lista quase em ordem, com um único pedido fora do lugar. Em vez de ' +
        'reorganizar tudo, basta abrir espaço perto dele e encaixá-lo. Se a lista chega invertida, ' +
        'cada item precisa atravessar quase todos os anteriores. O mesmo método muda muito de custo ' +
        'conforme o estado real da entrada.',
      body: [
        'A primeira forma de entregar o contrato é a que a mão faz sozinha com um baralho: mantenha à esquerda 1 trecho já ordenado e encaixe cada elemento novo dentro dele.',
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
      workedExample: {
        problem: 'Em [1, 2, 4, 3, 5], insertion sort mantém 1, 2 e 4; ao inserir 3, desloca apenas o 4; o 5 já fica no lugar. Total: um deslocamento.',
        whatToNotice: 'A parte à esquerda já estava pronta e o laço interno quase não rodou. A entrada, não uma condição especial no código, produziu o caso barato.',
      },
      figure: {
        kind: 'insertion',
        inputs: [
          { values: [1, 2, 4, 3, 5, 6], label: 'Quase ordenada: só o 3 está fora do lugar, e é o único que faz o laço interno rodar.' },
          { values: [6, 5, 4, 3, 2, 1], label: 'Invertida: todo elemento novo é menor que todos os que já estão à esquerda, então o laço interno atravessa a parte pronta inteira.' },
        ],
        caption:
          'Os mesmos seis números dos dois lados, e o mesmo código. O que muda é a ordem em ' +
          'que eles chegam, e o contador de deslocamentos no canto é onde a diferença aparece: ' +
          'o azul é a parte já ordenada, e à esquerda ela quase nunca precisa se abrir. Repare ' +
          'que nenhuma linha do pseudocódigo pergunta se a entrada já está quase ordenada.',
      },
      exerciseId: 'sorting.e2' },

    { id: 'sorting.c3', title: 'Merge sort e a intercalação', layer: 'essential', band: 'implementation', elaborates: 'merge-sort',
      introducesTerms: ['merge-sort', 'merge'],
      oneLine: "São log n níveis custando n cada, e isso vale para toda entrada.",
      plainly:
        'Duas listas já estão em ordem. Para juntá-las, compare apenas o primeiro item disponível de ' +
        'cada uma e leve o menor. Repita até acabar. Esse trabalho percorre cada item uma vez; o ' +
        'custo está em quantas vezes você precisou dividir a lista antes de chegar a listas pequenas, ' +
        'não em escolher entre os dois primeiros.',
      body: [
        'A segunda forma parte de uma observação: intercalar 2 sequências já ordenadas é barato. Basta olhar o primeiro de cada uma e tomar o menor, até esgotar as duas.',
        'Se intercalar é barato, ordenar vira dividir ao meio até sobrar um elemento, que já está ordenado sozinho, e intercalar de volta. São log n níveis, cada um custando n. O limite é O(n log n), e ele vale para toda entrada, não para a média delas.',
        'A linha que decide o empate na intercalação é a linha que decide a estabilidade da coleção inteira. Tomar o da esquerda quando os dois primeiros comparam como iguais preserva a ordem de chegada; tomar o da direita a inverte. É uma comparação, e as duas custam o mesmo.',
      ],
      figure: {
        kind: 'merge-structure',
        values: [8, 3, 7, 4, 6, 2, 5, 1],
        caption: 'A divisão cria log n níveis. Na volta, cada nível intercala todos os elementos uma vez; é por isso que o custo total fica em O(n log n), independentemente da entrada.',
      },
      pseudocode: `função intercalar(E, D)
    S ← sequência vazia
    enquanto E não vazia e D não vazia faça
        se primeiro(E) ≤ primeiro(D) então
            mover primeiro(E) para o fim de S
        senão
            mover primeiro(D) para o fim de S
    mover o que restou de E e depois de D para o fim de S
    retorne S`,
      pseudocodeIsProse: true,
      invariant: 'S está ordenada, e todo elemento que ainda está em E ou em D é maior ou igual ao último de S.',
      workedExample: {
        problem: 'Intercalando [2a, 5b] e [5c, 7d], escolher a esquerda no empate produz 2a, 5b, 5c, 7d; escolher a direita produz 2a, 5c, 5b, 7d.',
        whatToNotice: 'As chaves são 2, 5, 5, 7 nos dois casos. As etiquetas mostram a única diferença: qual elemento empatado saiu primeiro.',
      },
      exerciseId: 'sorting.e3' },

    { id: 'sorting.c4', title: 'Quicksort, o pivô e o pior caso', layer: 'essential', band: 'implementation', elaborates: 'quicksort',
      introducesTerms: ['quicksort', 'pivot', 'partition'],
      oneLine: "Pivô no meio dá log n rodadas; pivô no extremo dá n.",
      plainly:
        'Você escolhe um item como referência e separa os menores de um lado, os maiores do outro. ' +
        'Se a referência cai perto do meio, as partes encolhem rápido. Se ela cai sempre na ponta, ' +
        'sobra quase toda a lista para a próxima rodada. A diferença entre os dois casos está numa ' +
        'escolha aparentemente pequena.',
      body: [
        'A terceira forma não divide ao meio: divide em torno de 1 elemento escolhido. Depois de separar o que é menor do que é maior, o pivô está na posição final dele, e as 2 partes podem ser resolvidas do mesmo jeito.',
        'Quando o pivô cai perto do meio, as partes têm metade do tamanho e o total é O(n log n). Quando ele cai no extremo, uma parte fica vazia e a outra fica com todo o resto, são n rodadas em vez de log n, e o total é O(n²).',
        'A escolha do pivô é livre, e é ela que decide qual dos dois cenários acontece. Escolher sempre o primeiro elemento transforma uma coleção que já chega ordenada, a mais comum de todas, no pior caso.',
      ],
      figure: {
        kind: 'quicksort-partition',
        values: [1, 2, 3, 4, 5, 6, 7],
        pivotIndex: 0,
        caption: 'Com o primeiro elemento como pivô numa entrada ordenada, uma partição fica vazia e a outra guarda quase tudo. Repetir isso produz n níveis em vez de log n.',
      },
      workedExample: {
        problem: 'Em [1, 2, 3, 4, 5], o primeiro pivô 1 separa 0 e 4 elementos; depois 2 separa 0 e 3; o padrão continua até o fim.',
        whatToNotice: 'Toda partição deixa uma parte vazia. A entrada já ordenada ativa profundidade n e custo quadrático.',
      },
      exerciseId: 'sorting.e4' },

    { id: 'sorting.c5', title: 'O preço que o contrato não menciona', layer: 'essential', band: 'cost',
      introducesTerms: ['in-place'],
      oneLine: "In-place não é espaço constante: no pior caso são n chamadas abertas.",
      plainly:
        'Um método reorganiza a lista sem criar outra lista do mesmo tamanho, mas ainda pode abrir ' +
        'várias chamadas enquanto divide o problema. Dizer que ele usa “pouca memória” é ' +
        'incompleto: é preciso contar tanto o espaço dos itens quanto o espaço das chamadas que ainda ' +
        'não terminaram.',
      body: [
        'Ordenar in-place é rearranjar o próprio array em vez de montar outro. Merge sort não faz isso: a intercalação escreve numa sequência à parte, e ordenar 1 milhão de elementos aloca outro 1 milhão.',
        'Quicksort faz, e é aqui que a palavra engana. Ele não aloca coleção nenhuma, mas cada chamada aberta ocupa um quadro na pilha. No pior caso são n chamadas abertas ao mesmo tempo, e isso é espaço que cresce com a entrada, ainda que nenhum array tenha sido alocado.',
        'In-place e espaço constante são coisas diferentes, e a segunda é a que importa quando a memória é o limite.',
      ],
      workedExample: {
        problem: "Quicksort sobre 1 milhão de elementos com pivô sempre no extremo: nenhum array novo é alocado, e há 1 milhão de quadros abertos na pilha ao mesmo tempo.",
        whatToNotice: "\"Não alocou coleção\" e \"usa espaço constante\" são afirmações diferentes. A pilha de chamadas é espaço, e ela cresceu com a entrada.",
      },
      exerciseId: 'sorting.e5' },

    { id: 'sorting.c6', title: 'Ordenar uma vez para buscar muitas', layer: 'essential', band: 'cost',
      introducesTerms: ['binary-search'],
      oneLine: "Achar o menor de 1000 custa 999 comparações; ordenar antes custa cerca de 10 mil.",
      plainly:
        'Você precisa achar o menor pedido uma única vez. Percorrer mil pedidos custa menos do que ' +
        'ordenar todos para então pegar o primeiro. Mas, se a pergunta se repete centenas de vezes, ' +
        'pagar a organização uma vez pode compensar. O custo correto depende de quantas consultas ' +
        'virão depois.',
      body: [
        'Numa coleção ordenada de 1000, procurar por chave custa cerca de 10 comparações: compare com o do meio e descarte metade das posições. Sem ordem, custa até 1000.',
        'Isso torna a ordenação um investimento, não um fim: paga-se n log n uma vez para que toda consulta seguinte fique em log n. A conta fecha quando as consultas são muitas e a coleção muda pouco.',
        'E ela não fecha quando a pergunta é uma só. Achar o menor elemento custa n − 1 comparações varrendo. Ordenar antes para depois olhar a primeira posição custa n log n, e devolve a mesma resposta.',
      ],
      workedExample: {
        problem: "1000 elementos, uma pergunta: qual o menor. Varrer custa 999 comparações. Ordenar antes custa cerca de 10 mil e devolve a mesma resposta.",
        whatToNotice: "A ordenação é investimento e só rende com muitas consultas. Com 1 consulta, ela é 10 vezes o preço.",
      },
      exerciseId: 'sorting.e6' },

    { id: 'sorting.c7', title: 'Quando ordenar é a escolha errada', layer: 'essential', band: 'cost',
      introducesTerms: [],
      oneLine: "Ordenar é a escolha errada quando a pergunta era sobre 1 elemento.",
      plainly:
        'Você recebe um pedido para encontrar um único registro por identificador. Ordenar todos os ' +
        'registros antes não ajuda a responder melhor essa pergunta; só acrescenta trabalho. ' +
        'Ordenação é investimento para perguntas sobre ordem, faixa ou repetição de buscas, não uma ' +
        'etapa padrão antes de qualquer consulta.',
      body: [
        'Volte ao contrato do primeiro ciclo. As 4 ausências que você guardou lá são a resposta inteira deste ciclo.',
        'Ordenar é a escolha errada quando a pergunta era sobre um elemento e você ordenou todos; quando a ordem entre iguais importava e o algoritmo escolhido não a promete; quando a memória era o limite e o algoritmo escolhido pede uma cópia; e quando o pior caso era inaceitável e o algoritmo escolhido só garante o caso médio.',
        'Nenhuma dessas é um defeito do algoritmo. Todas são uma ausência do contrato que alguém não leu.',
      ],
      workedExample: {
        problem: "Um endpoint que devolve o pedido mais recente entre 50 mil, chamado a cada requisição. Ordenando: cerca de 780 mil comparações por chamada. Varrendo: 49.999.",
        whatToNotice: "A saída é idêntica nos dois. Nada no código está errado, o que está errado é a operação escolhida para a pergunta feita.",
      },
      exerciseId: 'sorting.e7' },

    { id: 'sorting.c8', title: 'O que as bibliotecas realmente fazem', layer: 'deep-dive', band: 'implementation', elaborates: 'merge-sort',
      introducesTerms: ['timsort'],
      oneLine: "A ordenação padrão de várias linguagens compõe 2 algoritmos, não escolhe 1.",
      plainly:
        'Uma biblioteca não precisa escolher um único método para toda lista. Ela pode perceber ' +
        'trechos que já estão em ordem, usar uma estratégia simples em pedaços pequenos e outra em ' +
        'listas maiores. O nome da função parece uma operação só; por dentro, ela pode combinar ' +
        'ferramentas conforme a entrada.',
      body: [
        'A ordenação padrão de várias linguagens não é nenhum dos 3: é a composição deliberada de 2 deles. Ela procura na entrada os trechos que já vêm ordenados, completa com insertion sort os menores que 32, e intercala os trechos.',
        'Cada peça está lá por uma ausência da outra. A intercalação dá o pior caso garantido e a estabilidade; o insertion sort aproveita a ordem que a entrada já traz, que a intercalação sozinha ignoraria.',
        'É a resposta prática à pergunta do ciclo anterior: quando nenhuma escolha isolada serve, a saída costuma ser compor duas, e é o mesmo movimento que uma LRU cache faz com tabela hash e lista ligada.',
      ],
      workedExample: {
        problem: "Sobre uma coleção de 10 mil quase ordenada, a biblioteca acha os trechos já em ordem, completa os menores que 32 com insertion sort, e intercala. O resultado fica perto de O(n).",
        whatToNotice: "Nenhum dos dois algoritmos sozinho dá isso: a intercalação ignoraria a ordem existente, e o insertion sort não garantiria o pior caso.",
      },
      postmortem: {
        incident: "Volte aos pedidos ordenados por data e depois por cliente, que saíram fora da ordem de data sem ninguém pedir.",
        trapId: "sorting.sort-e-estavel",
        missingClaim: "a estabilidade. O contrato de ordenar não diz nada sobre o que acontece com os elementos que empatam, e a segunda ordenação empatava em cliente.",
        whatWouldCatch: "Perguntar o que o algoritmo faz com um empate. Sem estabilidade declarada, ordenar duas vezes desfaz a primeira.",
      },
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
