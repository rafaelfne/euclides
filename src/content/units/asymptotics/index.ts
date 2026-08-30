import type { Unit } from '../../schema'
import { asymptoticsExercises, asymptoticsMisconceptions } from './exercises'

export const asymptoticsUnit: Unit = {
  kind: 'method',
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
    'Uma consulta que respondia em 40 ms com dez mil registros passou a responder em 4 s com ' +
    'um milhão. Ninguém mudou o código. A pergunta na retrospectiva é "por que ninguém viu ' +
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
        'Numa revisão alguém escreve “essa busca é rápida”. Outra pessoa pergunta: rápida em qual ' +
        'situação, contando o quê, e supondo o quê sobre os dados? Sem essas respostas, duas ' +
        'implementações muito diferentes recebem o mesmo rótulo. A frase parece técnica, mas ainda ' +
        'não permite prever nada.',
      body: [
        '"Hash é O(1)." A frase não é falsa. Ela está incompleta em quatro lugares, e cada omissão produz uma frase que soa igualmente precisa.',
        'Uma afirmação de custo verificável carrega cinco partes: o limite, o regime, se ele é amortizado, sob quais hipóteses vale, e o que n conta. Este ciclo apresenta as cinco; os próximos atacam uma de cada vez, e cada um deles começa pela frase que a omissão produz.',
        'Não é formalidade. O schema deste projeto exige as cinco partes em toda afirmação de custo que aparece na trilha, você vai encontrá-las preenchidas em todas as outras unidades. Aqui você aprende a produzi-las.',
      ],
      workedExample: {
        problem: "\"Buscar é O(1)\" contra \"buscar é O(1) amortizado no caso médio, supondo hash uniforme, com n contando pares na tabela\". A segunda tem 5 partes; a primeira tem 1.",
        whatToNotice: "As duas frases descrevem a mesma tabela. Só a segunda deixa você prever o que acontece quando as chaves são escolhidas por quem ataca o sistema.",
      },
      exerciseId: 'asymptotics.e0' },

    { id: 'asymptotics.c1', title: 'O que a notação joga fora, e quando isso importa', layer: 'essential', band: 'criterion',
      introducesTerms: ['asymptotic', 'constant-factor'],
      oneLine: "Mil vezes n é maior que n ao quadrado até n chegar a mil.",
      plainly:
        'Duas implementações do mesmo filtro: uma faz mil operações para cada elemento, a ' +
        'outra faz uma operação para cada par de elementos. No papel a segunda cresce pior, e ' +
        'em coleção grande ela perde feio. Só que com duzentos elementos a primeira faz ' +
        'duzentas mil operações e a segunda faz quarenta mil — a que cresce pior é a que ' +
        'ganha. A comparação da teoria só passa a valer quando a coleção fica grande o ' +
        'bastante, e esse "grande o bastante" é um número que você consegue calcular.',
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
        problem: "Com n = 200: 1000·n dá 200 mil, e n² dá 40 mil. O algoritmo \"melhor\" na notação custa 5 vezes mais.",
        whatToNotice: "Ache o n em que os dois empatam antes de escolher. Se as suas coleções vivem abaixo dele, a notação está respondendo sobre um tamanho que você não tem.",
      },
      exerciseId: 'asymptotics.e1' },

    { id: 'asymptotics.c2', title: 'O que n conta, e o que ele ignora', layer: 'essential', band: 'criterion',
      introducesTerms: ['measured-in'],
      oneLine: "A conta soma elementos e costuma ignorar o tamanho de cada elemento.",
      plainly:
        'Contar cem registros não é o mesmo que contar cem arquivos de vídeo. Duas coleções podem ' +
        'ter o mesmo número de itens e exigir trabalhos muito diferentes para comparar, copiar ou ' +
        'ler cada item. Antes de aceitar uma conta, pergunte o que está sendo contado e o que ficou ' +
        'fora dela.',
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
        'como “o trabalho de agora mais o trabalho das partes” torna visível o que se repete e onde ' +
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
        problem: 'Escreva a relação de uma busca binária: ela olha o meio e chama a si mesma numa das metades.',
        whatToNotice: 'Dá T(n) = T(n/2) + c, com um único T(n/2) e não dois. O que separa esta relação da do merge sort é o número de chamadas por nível, e é ele que decide log n contra n log n.',
      },
      exerciseId: 'asymptotics.e3' },

    { id: 'asymptotics.c4', title: 'A árvore de recursão, desenhada', layer: 'essential', band: 'technique', elaborates: 'recurrence',
      introducesTerms: ['recursion-tree'],
      oneLine: "As chamadas dobram, o tamanho cai pela metade, e o custo do nível fica igual.",
      plainly:
        'Dividir oito itens ao meio cria duas tarefas de quatro; depois quatro tarefas de dois; ' +
        'depois oito tarefas de um. Cada camada tem mais tarefas, mas cada tarefa ficou menor. ' +
        'Desenhar essas camadas mostra por que o trabalho de uma camada pode ficar igual ao da ' +
        'anterior, mesmo com mais chamadas abertas.',
      body: [
        'Escrever a relação é metade do trabalho. A outra metade é resolvê-la, e "resolver essa relação dá n log n" dito sem derivação é exatamente o reconhecimento de padrão que o ciclo anterior condena. Para n = 8, os níveis são 3, e cada um custa 8.',
        'Duas coisas aparecem quando a tabela fica pronta, e nenhuma das duas é óbvia antes. A primeira: o custo por nível **não cresce**, as chamadas dobram e o tamanho cai pela metade, e o produto fica igual. A segunda: o número de níveis não é n, é quantas vezes dá para dividir n ao meio até chegar ao caso base, que é log n.',
        'O total é o custo de um nível vezes o número de níveis. É daí que n log n sai, e não de reconhecer a forma da relação.',
      ],
      pseudocode: `função custo(n)
    se n ≤ 1 então
        retorne c
    retorne 2 × custo(n / 2) + n`,
      figure: {
        kind: 'recursion',
        branches: 2,
        divisor: 2,
        n: 8,
        caption: 'Cada nível tem duas grandezas: quantas chamadas existem ali e de que tamanho é cada uma. O custo do nível é o produto, e a coluna da direita mostra que ele não muda: as chamadas dobram enquanto o tamanho cai pela metade. O número de níveis não é n, é quantas vezes dá para dividir n ao meio até chegar ao caso base.',
      },
      invariant: 'Em cada nível, o número de chamadas dobra e o tamanho de cada uma cai pela metade.',
      workedExample: {
        problem: 'Some o nível 1 de T(n) = 2·T(n/2) + n com n = 8: duas chamadas de tamanho 4.',
        whatToNotice: 'Dá 8, o mesmo do nível 0, que tinha uma chamada de tamanho 8. É o produto que se mantém, e é ele que torna a soma um retângulo em vez de um triângulo.',
      },
      exerciseId: 'asymptotics.e7' },

    { id: 'asymptotics.c5', title: 'Regime: o pior caso não é o caso raro', layer: 'essential', band: 'failure',
      introducesTerms: ['worst-case', 'average-case'],
      oneLine: "O pior caso do quicksort ingênuo é a entrada já ordenada, que é a mais comum.",
      plainly:
        'Um algoritmo escolhe sempre o primeiro item como referência. Com dados misturados, ele ' +
        'divide bem o trabalho; com dados já em ordem, deixa quase tudo de um lado e recomeça. A ' +
        'entrada que parece mais organizada é justamente a que produz o pior caminho. “Raro” não ' +
        'quer dizer “seguro de ignorar”.',
      body: [
        'Pior caso, caso médio e melhor caso qualificam o **custo**, não a frequência da entrada. Dizer que algo é O(n²) no pior caso não afirma que esse caso é improvável, ele pode ser 100% das suas entradas.',
        'O exemplo que desfaz a confusão de uma vez: o pior caso do quicksort com pivô no primeiro elemento é a entrada já ordenada, a mais comum que existe num sistema real. O pior caso ali não é raro; é o caso normal.',
        'E quando a entrada vem de fora, a distinção deixa de ser acadêmica: quem escolhe as chaves pode escolhê-las para ativar o pior caso de propósito. É a mesma família de problema que a unidade de tabelas hash chama de hash flooding.',
      ],
      workedExample: {
        problem: "Quicksort com pivô no primeiro elemento, sobre [1, 2, 3, 4, 5]: as partições ficam de tamanho 0 e 4, depois 0 e 3, e assim por diante. São 4 níveis em vez de 3, e o custo vai a n².",
        whatToNotice: "Nada nessa entrada é estranho, ela é o que sai de qualquer consulta ordenada. \"Pior caso\" qualificou o custo e não disse nada sobre a frequência.",
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
        'Os dois qualificadores são independentes e podem aparecer juntos. "O(1) amortizado no caso médio" afirma duas coisas diferentes, e a unidade de tabelas hash usa exatamente essa frase.',
      ],
      figure: {
        kind: 'growth-doubling',
        insertions: 16,
        initialCapacity: 1,
        caption: 'A barra é o custo de cada inserção e a linha é a média até ali. Os picos são altíssimos e raros, e a média desce e estabiliza abaixo de 2. É essa forma que "amortizado" descreve, e é por isso que ela não é a mesma coisa que caso médio: os picos estão em posições que dá para apontar no dedo, não numa distribuição sorteada.',
      },
      workedExample: {
        problem: 'Some o custo de oito inserções seguidas num array que começa com capacidade 1 e dobra quando enche.',
        whatToNotice: 'As caras acontecem nas inserções 1, 2, 3, 5 e 9, posições que dá para apontar antes de rodar. Nenhum sorteio decidiu isso, e é o que separa amortizado de caso médio.',
      },
      exerciseId: 'asymptotics.e5' },

    { id: 'asymptotics.c7', title: 'Escolher a técnica pela forma do código', layer: 'essential', band: 'technique', elaborates: 'operation-counting',
      introducesTerms: [],
      oneLine: "A forma do código escolhe a técnica: laço conta, chamada recorre, dobra agrega.",
      plainly:
        'Antes de calcular, olhe a forma do código. Se há um laço, conte o que cada volta faz. Se ' +
        'uma função chama a si mesma com parte da entrada, descreva o trabalho que sobra. Se o custo ' +
        'grande aparece só depois de muitas operações, some a sequência. A forma do código diz qual ' +
        'pergunta resolve o custo.',
      body: [
        'As 3 técnicas não competem: elas respondem partes diferentes, e a forma do código diz qual usar.',
        'Laço simples, sem chamada a si mesmo e sem nada que redistribua custo: contagem de operações responde limite, regime, hipóteses e unidade de medida, e responde em uma linha.',
        'Chamada a si mesmo: recorrência. Alguma operação que dobra, reconstrói ou reorganiza: agregação, e é a única das três que produz a parte da amortização diretamente.',
        'Usar recorrência num laço simples não está errado, está caro, e é sinal de que a forma do código não foi lida antes da conta começar.',
      ],
      workedExample: {
        problem: 'Olhe três procedimentos sem contar nada: um laço sobre a coleção, um que chama a si mesmo em metades, e um append num array dinâmico.',
        whatToNotice: 'A forma decide a técnica antes de qualquer conta começar. Escolher errado aqui não dá resultado errado, dá o resultado certo por um caminho caro.',
      },
      postmortem: {
        incident: "Volte à consulta que foi de 40 ms com dez mil registros para 4 s com um milhão, sem ninguém mudar o código.",
        trapId: "asymptotics.pior-caso-e-raro",
        missingClaim: "o regime. A afirmação registrada era \"é rápido\", e o que valia era O(n²) no pior caso, com o pior caso sendo a entrada já ordenada.",
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
