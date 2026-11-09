import type { Unit } from '../../schema'
import { asymptoticsExercises, asymptoticsMisconceptions } from './exercises'

export const asymptoticsUnit: Unit = {
  kind: 'method',
  runnable: 'typescript',
  id: 'asymptotics',
  number: 2,
  title: 'Análise assintótica',
  learningObjective:
    'Escrever uma afirmação de custo com todas as partes que a tornam verificável, e ' +
    'construir a entrada concreta em que cada parte omitida inverteria a conclusão.',
  prerequisites: [
    'Traçar um laço e dizer quantas rodadas ele executa a partir da condição',
    'Reconhecer uma chamada que se repete sobre uma parte menor da entrada',
  ],
  motivatingProblem:
    'Uma consulta que respondia em 40 ms com mil registros passou a responder em 4 s com ' +
    'dez mil. Ninguém mudou o código. A pergunta na retrospectiva é "por que ninguém viu ' +
    'isso vindo?", e a resposta incômoda é que o custo estava escrito no código o tempo todo, ' +
    'numa forma que ninguém leu. O que uma afirmação de custo precisa declarar para ser lida?',

  symbols: [
    { symbol: 'n', means: 'o tamanho da entrada, e a afirmação precisa dizer o que ele conta' },
    { symbol: 'T(n)', means: 'o custo do procedimento para uma entrada desse tamanho' },
    { symbol: 'O(...)', means: 'um limite superior de crescimento, ignorando constantes' },
    { symbol: 'log n', means: 'quantas vezes dá para dividir n ao meio até chegar a um' },
    { symbol: 'T(1)', means: 'o caso base: o custo da menor entrada que o procedimento resolve direto' },
  ],

  criterion: {
    id: 'cost-claim',
    name: 'Afirmação de custo',
    produces: 'uma afirmação sobre custo que outra pessoa consegue conferir ou refutar',
    parts: [
      { id: 'bound', name: 'limite', guarantee: 'a classe de crescimento afirmada' },
      { id: 'regime', name: 'regime', guarantee: 'pior caso, caso médio ou melhor caso' },
      { id: 'amortized', name: 'amortização', guarantee: 'se o custo é por operação, ou espalhado ao longo de uma sequência' },
      { id: 'assumptions', name: 'hipóteses', guarantee: 'o que precisa ser verdade para o limite valer' },
      { id: 'measured-in', name: 'unidade de medida', guarantee: 'o que n conta, e o que ele deliberadamente ignora' },
    ],
    whenOmitted: [
      { partId: 'regime', reads: 'hash é O(1)' },
      { partId: 'assumptions', reads: 'a busca é O(1) porque a tabela distribui bem' },
      { partId: 'amortized', reads: 'inserir no fim de um array dinâmico é O(1)' },
      { partId: 'measured-in', reads: 'comparar duas strings é O(1)' },
      { partId: 'bound', reads: 'essa parte é a rápida' },
    ],
  },

  techniques: [
    {
      id: 'operation-counting',
      name: 'Contagem de operações',
      derivesCriterion: 'cost-claim',
      summary: 'Somar quantas vezes cada operação executa, em função do tamanho da entrada.',
      produces: ['bound', 'regime', 'assumptions', 'measured-in'],
      wrongWhen: [
        { scenario: 'O procedimento chama a si mesmo e o número de níveis depende da entrada',
          useInstead: 'recorrência' },
        { scenario: 'Uma operação redistribui custo entre as chamadas seguintes, como um redimensionamento',
          useInstead: 'análise amortizada por agregação, somando a sequência inteira e dividindo' },
      ],
      everydayAnchor:
        'É o que você faz de cabeça ao ler dois laços aninhados numa revisão e concluir que ' +
        'aquilo não sobrevive a dez mil linhas.',
      invariant: 'A soma só vale se toda operação somada custar o mesmo, e dizer isso é declarar uma hipótese.',
    },
    {
      id: 'recurrence',
      name: 'Recorrência',
      derivesCriterion: 'cost-claim',
      summary: 'Escrever o custo em função do custo do subproblema, com um caso base, e resolver a relação somando a árvore nível a nível.',
      produces: ['bound', 'regime', 'assumptions', 'measured-in'],
      wrongWhen: [
        { scenario: 'O procedimento é um laço simples, sem chamada a si mesmo',
          useInstead: 'contagem de operações, que responde em uma linha' },
        { scenario: 'As partes não têm tamanho previsível, como no quicksort com pivô ruim',
          useInstead: 'escrever duas relações, a do melhor e a do pior caso, e declarar as duas' },
      ],
      everydayAnchor:
        'É o raciocínio por trás de "dividir ao meio dá log n", que todo mundo repete numa ' +
        'entrevista e quase ninguém deriva num quadro.',
      invariant: 'A relação precisa de um caso base, ou não descreve procedimento que pare.',
    },
    {
      id: 'aggregate-amortized',
      name: 'Análise amortizada por agregação',
      derivesCriterion: 'cost-claim',
      summary: 'Somar o custo de uma sequência inteira de operações e dividir pelo número delas.',
      produces: ['amortized', 'bound', 'regime'],
      wrongWhen: [
        { scenario: 'A pergunta é sobre uma operação isolada, e não sobre uma sequência',
          useInstead: 'contagem de operações, declarando o pior caso daquela operação' },
        { scenario: 'Não existe operação que redistribua custo, nada dobra, nada reconstrói',
          useInstead: 'contagem de operações; amortizado aqui não afirma nada além do que ela já disse' },
      ],
      everydayAnchor:
        'É o argumento que sustenta "inserir no fim de uma lista dinâmica é barato" mesmo ' +
        'sabendo que uma inserção em cada tantas copia o array inteiro.',
      invariant: 'A conta é sobre uma sequência fixa de operações, não sobre entradas sorteadas, e é isso que separa amortizado de caso médio.',
    },
  ],

  cycles: [
    { id: 'asymptotics.c0', title: 'A afirmação que passa na revisão e não vale nada', layer: 'essential', band: 'criterion',
      introducesTerms: ['big-o', 'cost-claim'],
      oneLine: "Dizer o custo sem dizer o regime e as hipóteses não afirma quase nada.",
      plainly:
        'Numa revisão alguém escreve "essa busca é rápida", e outra pessoa pergunta: rápida em ' +
        'qual situação, contando o quê, supondo o quê sobre os dados? Sem as respostas, a frase ' +
        'não permite prever nada.',
      body: [
        '"Hash é O(1)." A frase não é falsa. Ela está incompleta em quatro lugares, e cada omissão produz uma frase que soa igualmente precisa.',
        'Uma afirmação de custo verificável carrega cinco partes: o limite, o regime, se ele é amortizado, sob quais hipóteses vale, e o que n conta. Este ciclo apresenta as cinco; os próximos atacam uma de cada vez, e cada um deles começa pela frase que a omissão produz.',
        'Não é formalidade. Nas unidades sobre estruturas, mais adiante, toda afirmação de custo vem com as cinco partes preenchidas, e é com elas que você vai comparar uma escolha com outra. Aqui você aprende a produzi-las.',
      ],
      figure: {
        kind: 'concept-flow',
        nodes: [
          { id: 'claim', label: '"Hash é O(1)"', tone: 'implementation' },
          { id: 'regime', label: 'regime', tone: 'contract' },
          { id: 'amortized', label: 'amortizado', tone: 'contract' },
          { id: 'assumptions', label: 'hipóteses', tone: 'contract' },
          { id: 'measured-in', label: 'o que n conta', tone: 'contract' },
        ],
        edges: [
          { from: 'claim', to: 'regime' },
          { from: 'claim', to: 'amortized' },
          { from: 'claim', to: 'assumptions' },
          { from: 'claim', to: 'measured-in' },
        ],
        caption: 'Uma afirmação de custo só permite previsão quando o limite vem acompanhado do regime, das hipóteses e do que n mede.',
      },
      workedExample: {
        problem: "Um sistema de check-in com 1 milhão de pulseiras digitais promete: \"cadastrar uma pulseira é O(1)\". A revisão troca por: \"cadastrar é O(1) amortizado no caso médio, supondo hash uniforme, com n contando pulseiras na tabela\". A segunda tem 5 partes; a primeira tem 1.",
        whatToNotice: "Cada parte nova avisa de um risco. Amortizado: de tempos em tempos um cadastro reconstrói a tabela inteira, e esse custo se espalha pelos outros. Caso médio, supondo hash uniforme: pulseiras que caem todas no mesmo lugar tornam a conta outra.",
      },
      exerciseId: 'asymptotics.e0' },

    { id: 'asymptotics.c1', title: 'O que a notação joga fora, e quando isso importa', layer: 'essential', band: 'criterion',
      introducesTerms: ['asymptotic', 'constant-factor'],
      oneLine: "Mil vezes n é maior que n ao quadrado até n chegar a mil.",
      plainly:
        'Duas implementações do mesmo filtro: uma faz mil operações para cada elemento, a ' +
        'outra faz uma operação para cada par de elementos. Com duzentos elementos, a primeira ' +
        'faz duzentas mil operações e a segunda faz quarenta mil, e é a segunda que cresce pior.',
      body: [
        'A notação descreve como o custo cresce, não quanto ele é. Ela descarta constantes de propósito: 1000·n e n são a mesma coisa para ela, porque a constante depende da máquina e o crescimento não.',
        'A consequência: para n pequeno, a comparação assintótica não decide nada. Mil vezes n é maior que n ao quadrado até n chegar a mil. Se as suas coleções têm duzentos elementos, a afirmação que ganha na notação é a que perde na máquina.',
        'É por isso que "é O(n), então é a escolha certa" não é um argumento, e é a primeira vez nesta trilha em que a resposta correta é "depende, e o eixo é este".',
      ],
      figure: {
        kind: 'growth',
        xLabel: 'n, elementos da coleção',
        xMax: 1400,
        curves: [
          { label: '1000·n', shape: 'linear', factor: 1000 },
          { label: 'n²', shape: 'quadratic', factor: 1 },
        ],
        highlight: { from: 20, to: 200, label: 'as coleções reais' },
        caption:
          'A faixa destacada é onde as suas coleções vivem, e ela cabe num traço perto da ' +
          'origem. À esquerda do cruzamento a curva quadrática está por baixo: a afirmação que ' +
          'ganha na notação é a que perde na máquina, e o gráfico mostra por quanto.',
      },
      workedExample: {
        problem: "Com n = 500: 1000·n dá 500 mil, enquanto n² dá 250 mil. As duas expressões empatam apenas em n = 1000.",
        whatToNotice: "Abaixo do ponto de empate, o termo quadrático ainda custa menos. A notação descreve o crescimento; o tamanho real e as constantes dizem de que lado do cruzamento o sistema vive.",
      },
      exerciseId: 'asymptotics.e1' },

    { id: 'asymptotics.c2', title: 'O que n conta, e o que ele ignora', layer: 'essential', band: 'criterion',
      introducesTerms: ['measured-in'],
      oneLine: "A conta soma elementos e costuma ignorar o tamanho de cada elemento.",
      plainly:
        'Contar cem registros não é o mesmo que contar cem arquivos de vídeo. Duas coleções podem ' +
        'ter o mesmo número de itens e exigir trabalhos muito diferentes para comparar, copiar ou ' +
        'ler cada item.',
      body: [
        'Toda afirmação de custo conta alguma coisa e ignora outra, e quase nunca diz qual é qual. "Procurar numa lista de 1000 é O(n)" conta os 1000 elementos e ignora o tamanho de cada um.',
        'Isso é aceitável quando comparar dois elementos custa o mesmo sempre, inteiros, por exemplo. Deixa de ser quando os elementos são URLs de tamanhos diferentes: a operação que a conta chamou de unitária passa a depender de uma segunda grandeza que a afirmação não menciona.',
        'A pergunta que resolve: uma operação que a sua conta somou como uma só realmente custa o mesmo em todas as entradas?',
      ],
      workedExample: {
        problem: "Procurar entre 1000 inteiros e entre 1000 URLs de 200 caracteres é O(n) nos dois. Comparar dois inteiros custa 1 operação; comparar duas URLs pode custar 200.",
        whatToNotice: "O n é o mesmo e o custo real difere em duas ordens de grandeza. A pergunta é sempre qual operação a conta chamou de unitária.",
      },
      exerciseId: 'asymptotics.e2' },

    { id: 'asymptotics.c3', title: 'Quando a conta não fecha: recorrência', layer: 'essential', band: 'technique', elaborates: 'recurrence',
      introducesTerms: ['recurrence', 'base-case'],
      oneLine: "Quando o procedimento chama a si mesmo, escreva o custo em função do subproblema.",
      plainly:
        'Um procedimento divide uma lista ao meio, resolve cada metade e junta as respostas. Contar ' +
        'um laço não basta, porque o mesmo trabalho reaparece em listas menores. Escrever a conta ' +
        'como "o trabalho de agora mais o trabalho das partes" torna visível o que se repete e onde ' +
        'ele finalmente para.',
      body: [
        'Contar rodadas funciona enquanto o procedimento não chama a si mesmo. Quando ele chama, o número de níveis depende da entrada, e não há o que somar diretamente.',
        'A saída é escrever o custo em função do custo do subproblema: dividir ao meio e chamar duas vezes, gastando tempo linear para juntar, é T(n) = 2·T(n/2) + n. Resolver essa relação dá n log n.',
        'A parte que some com mais frequência é o caso base. Sem T(1), a relação não descreve nenhum procedimento que pare, ela é uma definição circular, e devolver "n log n" a partir dela é reconhecer um padrão, não derivar um custo.',
        'Escrever a relação é o que este ciclo cobra. Resolvê-la é o próximo, e ele é onde o n log n deixa de ser afirmação e passa a ser conta.',
      ],
      pseudocode: `função custo(n)
    se n ≤ 1 então
        retorne c
    retorne 2 × custo(n / 2) + n`,
      invariant: 'Toda relação de recorrência tem um caso base, e ele é o único ponto em que a recursão para.',
      workedExample: {
        problem: 'A busca binária compara o meio, descarta uma metade e continua em apenas uma delas: T(1) = c e T(n) = T(n/2) + c.',
        whatToNotice: 'Há um único T(n/2), porque uma metade é descartada. No merge sort aparecem dois porque as duas metades precisam ser resolvidas.',
      },
      exerciseId: 'asymptotics.e3' },

    { id: 'asymptotics.c4', title: 'A árvore de recursão, desenhada', layer: 'essential', band: 'technique', elaborates: 'recurrence',
      introducesTerms: ['recursion-tree'],
      oneLine: "As chamadas dobram, o tamanho cai pela metade, e o custo do nível fica igual.",
      plainly:
        'Um procedimento divide o trabalho ao meio, e cada metade divide de novo. A cada camada ' +
        'há mais tarefas abertas, e cada uma é menor. A pergunta é o que acontece com o trabalho ' +
        'somado de uma camada inteira.',
      body: [
        'Escrever a relação é metade do trabalho. A outra metade é resolvê-la, e "resolver essa relação dá n log n" dito sem derivação é exatamente o reconhecimento de padrão que o ciclo anterior condena. Para n = 8, a entrada se divide ao meio 3 vezes até chegar ao tamanho 1, e a árvore tem 4 níveis: os 3 de divisão e o do caso base.',
        'Duas coisas aparecem quando a tabela fica pronta, e nenhuma das duas é óbvia antes. A primeira: o custo por nível **não cresce**, as chamadas dobram e o tamanho cai pela metade, e o produto fica igual. A segunda: o número de divisões não é n, é quantas vezes dá para dividir n ao meio até chegar a 1, que é log n.',
        'O total é o custo de um nível vezes o número de níveis. Os log n níveis de divisão custam n cada um e somam n log n. O nível do caso base também existe: são n chamadas de tamanho 1, e com o caso base custando 1 por chamada ele soma mais n. A conta exata é n log n + n, e a notação guarda só n log n, o termo que cresce mais depressa. É daí que n log n sai, e não de reconhecer a forma da relação.',
      ],
      pseudocode: `função custo(n)
    se n ≤ 1 então
        retorne c
    retorne 2 × custo(n / 2) + n`,
      figure: {
        kind: 'recursion',
        branches: 2,
        divisor: 2,
        n: 16,
        caption: 'A mesma relação com n = 16, para o exercício com n = 8 continuar sendo seu. Cada nível tem duas grandezas: quantas chamadas existem ali e de que tamanho é cada uma. O custo do nível é o produto, e a coluna da direita mostra que ele não muda: as chamadas dobram enquanto o tamanho cai pela metade. Os níveis são os de divisão, log n deles, mais o do caso base.',
      },
      invariant: 'Em cada nível, o número de chamadas dobra e o tamanho de cada uma cai pela metade.',
      workedExample: {
        problem: 'Em T(n) = 2·T(n/2) + n com n = 8, o nível 0 custa 1×8 = 8; o nível 1 tem duas chamadas de tamanho 4 e custa 2×4 = 8.',
        whatToNotice: 'As chamadas dobraram e o tamanho caiu pela metade, então o produto ficou igual. Repetir essa derivação em cada nível produz um retângulo, não um triângulo.',
      },
      exerciseId: 'asymptotics.e7' },

    { id: 'asymptotics.c5', title: 'Regime: o pior caso não é o caso raro', layer: 'essential', band: 'failure',
      introducesTerms: ['worst-case', 'average-case'],
      oneLine: "O pior caso do quicksort ingênuo é a entrada já ordenada, que nada tem de rara.",
      plainly:
        'Um algoritmo de ordenação escolhe sempre o primeiro item como referência. Com dados ' +
        'misturados, ele divide bem o trabalho; com dados que já chegam em ordem, deixa tudo de ' +
        'um lado só e recomeça com quase o mesmo tamanho. A entrada mais arrumada é a que dá ' +
        'mais trabalho.',
      body: [
        'Pior caso, caso médio e melhor caso qualificam o **custo**, não a frequência da entrada. Dizer que algo é O(n²) no pior caso não afirma que esse caso é improvável, ele pode ser 100% das suas entradas.',
        'O exemplo que desfaz a confusão: o pior caso do quicksort com pivô no primeiro elemento é a entrada já ordenada, que é o que sai de uma consulta com ORDER BY ou de um identificador que só cresce. Num sistema que ordena o que acabou de ler do banco, esse pior caso não é raro.',
        'Quando a entrada vem de fora, a distinção deixa de ser acadêmica. Se qualquer cliente pode enviar uma entrada válida, a garantia de tempo precisa cobrir também a entrada que produz o caminho mais caro.',
      ],
      workedExample: {
        problem: "Quicksort com pivô no primeiro elemento, sobre os números de 1 a 1.000 já em ordem: cada partição separa só o pivô, e sobram 999, depois 998, e assim por diante. São cerca de 1.000 níveis, contra cerca de 10 quando cada partição corta ao meio, e as comparações somam 999 + 998 + ... + 1 = 499.500, perto de n²/2. Cortando ao meio, seriam cerca de 10 mil.",
        whatToNotice: "Nada nessa entrada é estranho, ela é o que sai de uma consulta com ORDER BY. \"Pior caso\" qualificou o custo e não disse nada sobre a frequência.",
      },
      exerciseId: 'asymptotics.e4' },

    { id: 'asymptotics.c6', title: 'Amortizado não é caso médio', layer: 'essential', band: 'technique', elaborates: 'aggregate-amortized',
      introducesTerms: ['amortized-analysis', 'amortized'],
      oneLine: "Mil inserções custam O(n) no total, e isso não é o mesmo que caso médio.",
      plainly:
        'Um bloco de memória cresce e, de vez em quando, precisa copiar tudo para um bloco maior. ' +
        'Essa cópia isolada é cara. Mas ela acontece depois de muitas inserções baratas e atende ' +
        'muitas das próximas. Para julgar esse custo, não olhe uma inserção sozinha: olhe a ' +
        'sequência inteira de inserções.',
      body: [
        'Um array dinâmico dobra de capacidade quando enche, e a figura abaixo mostra as 16 primeiras inserções: as barras vermelhas são as que copiaram tudo.',
        'Isso é amortização, e ela não é caso médio. Caso médio fala de uma distribuição de entradas possíveis, e responde "se eu sortear uma entrada, quanto custa". Amortização fala de uma sequência fixa e conhecida de operações, sem sorteio nenhum: as inserções caras acontecem em posições que dá para apontar no dedo.',
        'Os dois qualificadores são independentes e podem aparecer juntos. "O(1) amortizado no caso médio" afirma duas coisas diferentes, e a unidade de tabelas hash usa exatamente essa frase para a inserção.',
      ],
      figure: {
        kind: 'growth-doubling',
        insertions: 16,
        initialCapacity: 1,
        caption: 'A barra é o custo de cada inserção e a linha é a média até ali. Os picos são altíssimos e raros, e a média desce e estabiliza abaixo de 2. É essa forma que "amortizado" descreve, e é por isso que ela não é a mesma coisa que caso médio: os picos estão em posições que dá para apontar no dedo, não numa distribuição sorteada.',
      },
      workedExample: {
        problem: 'Com capacidade inicial 1, oito inserções custam 1, 2, 3, 1, 5, 1, 1 e 1 operações: total 15, média 1,875.',
        whatToNotice: 'As cópias acontecem nas inserções 2, 3 e 5, posições determinadas pela dobra. Nenhum sorteio decidiu onde ficam os picos.',
      },
      exerciseId: 'asymptotics.e5' },

    { id: 'asymptotics.c7', title: 'Escolher a técnica pela forma do código', layer: 'essential', band: 'technique', elaborates: 'operation-counting',
      introducesTerms: [],
      oneLine: "A forma do código escolhe a técnica: laço conta, chamada recorre, dobra agrega.",
      plainly:
        'Três trechos chegam na mesma revisão: um laço, uma função que chama a si mesma e uma ' +
        'lista que dobra quando enche. Cada um pede uma conta diferente, e começar pela conta ' +
        'errada custa tempo antes de custar acerto.',
      body: [
        'As 3 técnicas não competem: elas respondem partes diferentes, e a forma do código diz qual usar.',
        'Laço simples, sem chamada a si mesmo e sem nada que redistribua custo: contagem de operações responde limite, regime, hipóteses e unidade de medida, e responde em uma linha.',
        'Chamada a si mesmo: recorrência. Alguma operação que dobra, reconstrói ou reorganiza: agregação, e é a única das três que produz a parte da amortização diretamente.',
        'Usar recorrência num laço simples não está errado, está caro, e é sinal de que a forma do código não foi lida antes da conta começar.',
      ],
      workedExample: {
        problem: 'Laço simples → contagem de operações; duas chamadas sobre metades → recorrência; append com dobras ocasionais → agregação da sequência.',
        whatToNotice: 'A forma do código escolhe a técnica antes da conta. A técnica não é outro resultado: é o caminho mais curto que ainda deriva o resultado.',
      },
      postmortem: {
        incident: "Volte à consulta que foi de 40 ms com mil registros para 4 s com dez mil, sem ninguém mudar o código. Dez vezes mais registros e cem vezes mais tempo é a marca do quadrático, porque dez ao quadrado é cem. A consulta ordenava os registros com pivô no primeiro elemento, e eles chegavam já ordenados pelo índice.",
        trapId: "asymptotics.pior-caso-e-raro",
        missingClaim: "\"Ordenar aqui é O(n log n) no caso médio e O(n²) no pior caso, e o pior caso é a entrada que já chega ordenada.\" A afirmação registrada era \"é rápido\", sem regime.",
        whatWouldCatch: "Exigir as cinco partes na descrição do PR. Sem regime declarado, a frase não sobrevive à revisão.",
      },
      exerciseId: 'asymptotics.e6' },
  ],

  misconceptions: asymptoticsMisconceptions,

  exercises: asymptoticsExercises,

  mastery: {
    statement:
      'O aluno domina esta unidade quando, diante de um trecho de até trinta linhas que nunca ' +
      'viu, escreve a afirmação de custo com as cinco partes declaradas, escolhe a técnica ' +
      'pela forma do código, e constrói a entrada concreta em que o regime declarado muda a ' +
      'conclusão.',
    requiresClean: ['asymptotics.e4', 'asymptotics.e5'],
    revisitIntervalDays: 7,
  },
}
