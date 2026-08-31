import type { Unit } from '../../schema'
import { treesExercises, treesMisconceptions } from './exercises'

export const treesUnit: Unit = {
  kind: 'structure',
  id: 'trees',
  number: 5,
  title: 'Árvores de busca',
  learningObjective:
    'Dizer, diante de uma implementação de árvore de busca que nunca viu, se ela balanceia e ' +
    'como; construir a sequência de inserções que a degrada; e dizer qual consulta ela ' +
    'responde que a tabela hash não responde.',
  prerequisites: [
    'O contrato Map, e a lista do que ele não promete',
    'Notação O, com regime e hipóteses declarados',
    'Nó e ponteiro, vindos das estruturas lineares',
  ],
  motivatingProblem:
    'Um relatório lista "os pedidos entre 1º e 15 de março, em ordem de data". A tabela tem ' +
    'índice na coluna de data, e o plano de execução diz que ele não foi usado: o índice é hash. ' +
    'A unidade anterior já disse por quê, a tabela hash responde igualdade e nada mais. ' +
    'O que precisa ser verdade numa estrutura para responder "todos entre A e B" sem varrer tudo?',

  symbols: [
    { symbol: 'T', means: 'a árvore, ou a subárvore que a chamada está olhando' },
    { symbol: 'n', means: 'quantas chaves estão guardadas' },
    { symbol: 'h', means: 'a altura: quantas arestas tem o caminho mais longo até uma folha' },
    { symbol: 'T.esquerda', means: 'a subárvore com as chaves menores que a do nó' },
    { symbol: 'T.direita', means: 'a subárvore com as chaves maiores que a do nó' },
  ],

  adt: {
    id: 'sorted-map',
    name: 'SortedMap',
    operations: [
      { name: 'inserir', signature: 'inserir(chave, valor)', guarantee: 'associa; se a chave já existe, substitui' },
      { name: 'obter', signature: 'obter(chave)', guarantee: 'o valor associado, ou NÃO_ENCONTRADO' },
      { name: 'remover', signature: 'remover(chave)', guarantee: 'descarta o par, se existir' },
      { name: 'minimo', signature: 'minimo()', guarantee: 'a menor chave guardada' },
      { name: 'faixa', signature: 'faixa(a, b)', guarantee: 'os pares com chave entre a e b, em ordem de chave' },
    ],
    answers: 'Tudo que o Map responde, mais as perguntas que dependem de ordem de chave.',
    cannotAnswer: [
      'Qual é a k-ésima chave, sem percorrer até ela',
      'Quantas chaves existem numa faixa, sem enumerá-las',
      'Qualquer coisa sobre a ordem dos valores, a comparação é sempre de chave',
      'Obter por chave em tempo constante: a ordem tem preço, e o preço é o caminho',
    ],
  },

  implementations: [
    {
      id: 'bst',
      name: 'Árvore de busca sem balanceamento',
      implementsAdt: 'sorted-map',
      summary: 'Cada nó separa as chaves menores à esquerda e as maiores à direita.',
      cost: {
        inserir: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['o custo é a altura, e nada impede a altura de ser n − 1'],
          measuredIn: 'n = chaves guardadas' },
        obter: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['O(log n) só vale se a árvore estiver equilibrada, e nada aqui garante isso'],
          measuredIn: 'n = chaves guardadas' },
        remover: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['remover um nó com dois filhos exige achar o sucessor, que é outro caminho até uma folha'],
          measuredIn: 'n = chaves guardadas' },
        minimo: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['descer sempre à esquerda percorre a altura'],
          measuredIn: 'n = chaves guardadas' },
        faixa: { bound: 'O(n)', regime: 'worst', amortized: false,
          assumptions: ['percorre a altura duas vezes e depois enumera o que está entre as duas bordas'],
          measuredIn: 'n = chaves guardadas' },
      },
      space: { bound: 'O(n)', regime: 'worst', amortized: false,
        assumptions: ['um nó e dois ponteiros por chave'], measuredIn: 'nós alocados' },
      wrongWhen: [
        { scenario: 'As chaves chegam em ordem, o que acontece sempre que a origem é um exportador ou um identificador crescente',
          useInstead: 'árvore balanceada, a entrada mais comum é justamente o pior caso desta' },
        { scenario: 'É preciso garantir um limite de tempo por requisição',
          useInstead: 'árvore balanceada, cujo O(log n) vale para toda entrada' },
      ],
      everydayAnchor:
        'É a implementação que aparece em exercício de faculdade e não aparece em banco nenhum. ' +
        'O motivo de não aparecer é o conteúdo desta unidade.',
      invariant: 'Para todo nó, toda chave da subárvore esquerda é menor que a dele, e toda da direita é maior.',
    },
    {
      id: 'avl',
      name: 'Árvore AVL',
      implementsAdt: 'sorted-map',
      summary: 'A mesma árvore de busca, mantendo os dois lados de todo nó com alturas que diferem no máximo em um.',
      cost: {
        inserir: { bound: 'O(log n)', regime: 'worst', amortized: false,
          assumptions: ['a invariante de altura garante h ≤ 1,44·log n', 'no máximo uma rotação por inserção'],
          measuredIn: 'n = chaves guardadas' },
        obter: { bound: 'O(log n)', regime: 'worst', amortized: false,
          assumptions: ['a altura é limitada por construção, não é uma esperança sobre a entrada'],
          measuredIn: 'n = chaves guardadas' },
        remover: { bound: 'O(log n)', regime: 'worst', amortized: false,
          assumptions: ['pode exigir rotações ao longo de todo o caminho de volta à raiz'],
          measuredIn: 'n = chaves guardadas' },
        minimo: { bound: 'O(log n)', regime: 'worst', amortized: false,
          assumptions: ['descer sempre à esquerda percorre a altura, que agora é limitada'],
          measuredIn: 'n = chaves guardadas' },
        faixa: { bound: 'O(log n + k)', regime: 'worst', amortized: false,
          assumptions: ['k é quantos pares a faixa contém, enumerá-los é inevitável'],
          measuredIn: 'n = chaves guardadas, k = pares devolvidos' },
      },
      space: { bound: 'O(n)', regime: 'worst', amortized: false,
        assumptions: ['cada nó guarda também a altura, ou o fator de balanceamento'],
        measuredIn: 'nós alocados' },
      wrongWhen: [
        { scenario: 'A estrutura mora em disco e cada nó visitado é um acesso',
          useInstead: 'B-tree, a altura de uma árvore binária, mesmo balanceada, é dezenas de acessos' },
        { scenario: 'Nenhuma consulta pede ordem, e a operação dominante é obter por chave exata',
          useInstead: 'tabela hash: a ordem está sendo paga e não está sendo usada' },
      ],
      everydayAnchor:
        'O `TreeMap` do Java e o `std::map` do C++ são árvores balanceadas, rubro-negras, não ' +
        'AVL. A invariante muda; a garantia de altura logarítmica, que é o que importa aqui, não.',
      invariant: 'Para todo nó, as alturas das duas subárvores diferem no máximo em um.',
    },
    {
      id: 'b-tree',
      name: 'B-tree',
      implementsAdt: 'sorted-map',
      summary: 'Cada nó guarda centenas de chaves e centenas de filhos, para que a altura caiba em três ou quatro níveis.',
      cost: {
        inserir: { bound: 'O(log n)', regime: 'worst', amortized: false,
          assumptions: ['a base do logaritmo é o número de filhos por nó, e é isso que derruba a altura'],
          measuredIn: 'n = chaves guardadas; o que se conta são acessos a nó, não comparações' },
        obter: { bound: 'O(log n)', regime: 'worst', amortized: false,
          assumptions: ['dentro do nó há uma busca linear ou binária, e ela é barata porque o nó já está em memória'],
          measuredIn: 'n = chaves guardadas; acessos a nó' },
        remover: { bound: 'O(log n)', regime: 'worst', amortized: false,
          assumptions: ['pode exigir fundir nós ao longo do caminho de volta'],
          measuredIn: 'n = chaves guardadas; acessos a nó' },
        minimo: { bound: 'O(log n)', regime: 'worst', amortized: false,
          assumptions: ['descer sempre pelo primeiro filho percorre a altura'],
          measuredIn: 'n = chaves guardadas; acessos a nó' },
        faixa: { bound: 'O(log n + k)', regime: 'worst', amortized: false,
          assumptions: ['as folhas costumam ser encadeadas, e a faixa vira uma varredura sequencial'],
          measuredIn: 'n = chaves guardadas, k = pares devolvidos' },
      },
      space: { bound: 'O(n)', regime: 'worst', amortized: false,
        assumptions: ['cada nó fica parcialmente ocupado, a ocupação mínima é metade'],
        measuredIn: 'espaço em disco' },
      wrongWhen: [
        { scenario: 'A estrutura mora inteira em memória',
          useInstead: 'AVL ou rubro-negra: sem custo de acesso a disco, nós grandes só acrescentam trabalho por nível' },
      ],
      everydayAnchor:
        'É o índice padrão de todo banco relacional. Quando um `EXPLAIN` mostra "index scan", é ' +
        'esta estrutura respondendo, e é por isso que o índice serve tanto para igualdade ' +
        'quanto para faixa e para ORDER BY.',
      invariant: 'Todas as folhas estão no mesmo nível, e todo nó que não é a raiz está ao menos metade cheio.',
    },
  ],

  cycles: [
    { id: 'trees.c0', title: 'O que a ordem compra, e o que ela cobra', layer: 'essential', band: 'contract',
      introducesTerms: ['sorted-map', 'key-order'],
      oneLine: "A ordem entre as chaves vira operação, e o custo 1 do Map vai embora.",
      plainly:
        'Um relatório pede todos os pedidos entre duas datas, já em ordem. Uma tabela que encontra ' +
        'uma data exata muito rápido não sabe caminhar do dia 1º ao dia 15. Para responder ' +
        'intervalos, os dados precisam manter uma ordem. Esse ganho traz um preço: procurar uma ' +
        'chave exata deixa de ser um salto direto.',
      body: [
        'O contrato desta unidade é o Map da unidade anterior mais 1 promessa: as chaves têm ordem, e a estrutura sabe usá-la. Mínimo, máximo e faixa passam a ser operações, e não varreduras.',
        'A promessa é sobre chave. O valor guardado nunca é comparado com nada, e percorrer a estrutura em ordem devolve as chaves ordenadas, não os valores. Essa distinção parece pedante até a primeira vez que alguém espera o contrário.',
        'E ela tem preço declarado: obter por chave deixa de ser uma conta e passa a ser um caminho. A lista do que este contrato não promete inclui, agora, o tempo constante que o anterior prometia.',
      ],
      figure: {
        kind: 'concept-flow',
        nodes: [
          { id: 'keys', label: 'chaves', tone: 'neutral' },
          { id: 'order', label: 'ordem entre chaves', tone: 'contract' },
          { id: 'range', label: 'mínimo, máximo e faixa', tone: 'contract' },
          { id: 'lookup', label: 'obter por chave: caminho', tone: 'cost' },
        ],
        edges: [
          { from: 'keys', to: 'order' },
          { from: 'order', to: 'range' },
          { from: 'order', to: 'lookup' },
        ],
        caption:
          'A estrutura ordenada acrescenta uma promessa: compara as chaves para responder ' +
          'mínimo, máximo e faixa. O ganho troca o salto direto por um caminho.',
      },
      workedExample: {
        problem: "Um relatório de entregas guarda as datas 3, 8, 12 e 20. Pedir as entregas entre 8 e 12 é uma faixa natural para uma estrutura ordenada; num Map, seria preciso conferir as 4 chaves.",
        whatToNotice: "A ordem compra a pergunta por faixa, mas a busca deixa de ser um salto por conta: a estrutura passa a descer um caminho entre as chaves.",
      },
      exerciseId: 'trees.e0' },

    { id: 'trees.c1', title: 'A busca binária virada estrutura', layer: 'essential', band: 'implementation', elaborates: 'bst',
      introducesTerms: ['bst', 'subtree'],
      oneLine: "Cada nó separa as chaves menores das maiores, e procurar é escolher um lado.",
      plainly:
        'Você procura uma data numa coleção ordenada e, a cada comparação, descarta metade das ' +
        'opções. Uma árvore guarda essa mesma decisão em cada ponto: valores menores seguem por um ' +
        'lado, maiores pelo outro. Procurar não percorre tudo; a cada escolha, uma parte inteira ' +
        'deixa de importar.',
      body: [
        'A ideia é a busca binária guardada em ponteiros: cada nó separa as chaves menores das maiores, e procurar é descer escolhendo 1 lado por comparação. Com 1 milhão de chaves bem distribuídas, são cerca de 20 comparações.',
        'A invariante é uma frase e sustenta tudo o que vem depois: para todo nó, toda chave da subárvore esquerda é menor que a dele, e toda da direita é maior. É ela que permite descartar metade da estrutura a cada comparação, e é ela que uma busca que desce pelos dois lados joga fora sem perceber.',
        'A ordem de visita também depende dela. Só uma das travessias devolve as chaves ordenadas: a que visita a subárvore esquerda, depois o nó, depois a direita. As outras devolvem sequências que parecem arbitrárias, porque são.',
      ],
      pseudocode: `função inserir(T, chave)
    se T é vazia então
        retorne novo nó com chave
    se chave < T.chave então
        T.esquerda ← inserir(T.esquerda, chave)
    senão
        T.direita ← inserir(T.direita, chave)
    retorne T`,
      invariant: 'Para todo nó, toda chave da subárvore esquerda é menor que a dele, e toda da direita é maior.',
      workedExample: {
        problem: 'Na árvore criada por 50, 30, 70, 20 e 40, buscar 40 compara com 50, desce à esquerda; compara com 30, desce à direita; compara com 40 e encontra.',
        whatToNotice: 'Foram três comparações e em cada uma um lado inteiro deixou de importar. A divisão está guardada nos ponteiros.',
      },
      exerciseId: 'trees.e1' },

    { id: 'trees.c2', title: 'Altura não é log n', layer: 'essential', band: 'implementation', elaborates: 'bst',
      introducesTerms: ['height', 'degeneration'],
      oneLine: "Insira 1, 2, 3, 4, 5 numa árvore vazia e ela vira uma lista de altura 4.",
      plainly:
        'Inserir 1, depois 2, depois 3 parece inofensivo. Mas, se cada valor maior sempre vai para ' +
        'a direita, a estrutura fica como uma lista inclinada: para chegar ao último, você passa por ' +
        'todos os anteriores. Ter poucos níveis não é uma propriedade automática; depende de como os ' +
        'valores chegaram.',
      body: [
        'O custo de toda operação desta estrutura é a altura. E a invariante de ordem não diz nada sobre altura.',
        'Insira 1, 2, 3, 4 e 5 numa árvore vazia: cada chave vira o filho direito da anterior, a altura vira n − 1, e a estrutura virou uma lista ligada com ponteiros a mais. Toda operação passou a custar O(n), e a invariante continua valendo.',
        'A entrada que produz isso é a coleção já ordenada, a mais comum que existe num sistema real, porque identificador cresce e exportador exporta em ordem. Aqui, como na unidade de análise de custo, o pior caso não é o caso raro.',
        'Vale separar duas palavras que costumam ser trocadas: a profundidade de um nó é o caminho da raiz até ele, contado de cima para baixo; a altura de um nó é o caminho mais longo dele até uma folha, contado de baixo para cima. Portanto, a altura da árvore é a altura da raiz: o caminho da raiz até a folha mais distante.',
      ],
      figure: {
        kind: 'tree',
        sequences: [
          { keys: [50, 30, 70, 20, 40, 35], label: 'Chegando fora de ordem: cada inserção escolhe um lado, e a altura fica perto de log n.' },
          { keys: [20, 30, 35, 40, 50, 70], label: 'Chegando em ordem: toda chave é maior que a anterior, então toda inserção desce à direita.' },
        ],
        caption:
          'As duas árvores guardam exatamente as mesmas seis chaves, e as duas satisfazem a ' +
          'invariante de ordem. Só a ordem de chegada mudou. A da direita é a coleção já ' +
          'ordenada, a entrada mais comum que existe num sistema real.',
      },
      workedExample: {
        problem: 'As sequências 50, 30, 70, 20, 40, 35 e 20, 30, 35, 40, 50, 70 produzem formas diferentes; a travessia em ordem das duas é 20, 30, 35, 40, 50, 70.',
        whatToNotice: 'A saída ordenada é idêntica enquanto as alturas diferem. A invariante de ordem não limita a altura.',
      },
      exerciseId: 'trees.e2' },

    { id: 'trees.c3', title: 'Balancear: a rotação', layer: 'essential', band: 'implementation', elaborates: 'avl',
      introducesTerms: ['rotation', 'balancing'],
      oneLine: "A rotação baixa a altura e não muda a ordem das chaves.",
      plainly:
        'Três valores chegam em ordem e formam uma escada: 1 aponta para 2, que aponta para 3. A ' +
        'busca pelo último precisa descer dois níveis. Trocar quem fica no meio reduz o caminho sem ' +
        'trocar a ordem dos valores. O conserto não muda o que a coleção contém; muda o formato do ' +
        'caminho até ela.',
      body: [
        'Se o custo é a altura, a saída é impedir a altura de crescer. Uma rotação troca quem é pai de quem entre 2 nós vizinhos: a subárvore desce 1 nível de um lado e sobe 1 do outro.',
        'O que a rotação **não** muda é a ordem: percorrer a árvore antes e depois devolve exatamente a mesma sequência de chaves. Isso não é um efeito colateral feliz, é a condição para a operação ser legítima, e é o que dá para conferir num exemplo de três nós em trinta segundos.',
        'A árvore AVL aplica rotações para manter uma invariante extra: as alturas dos dois lados de todo nó diferem no máximo em um. Com ela, a altura passa a ser limitada por construção, e O(log n) deixa de ser uma esperança sobre a entrada.',
      ],
      workedExample: {
        problem: 'Inserir 1, 2 e 3 numa AVL e aplicar a rotação que o desequilíbrio dispara.',
        whatToNotice: 'A travessia em ordem é 1, 2, 3 antes e depois. A altura cai de 2 para 1, e é só isso que mudou.',
      },
      figure: {
        kind: 'rotation',
        keys: [1, 2, 3],
        caption:
          'A mesma árvore dos dois lados, e a travessia em ordem embaixo devolve a mesma ' +
          'sequência nas duas. O que a rotação muda é a altura; o que ela não muda é a ordem, ' +
          'e é essa segunda metade que torna a operação legítima. Os nós em azul são os que ' +
          'trocaram de nível.',
      },
      exerciseId: 'trees.e3' },

    { id: 'trees.c4', title: 'Garantido não é o mesmo que esperado', layer: 'essential', band: 'cost',
      introducesTerms: [],
      oneLine: "A árvore promete O(log n) sempre; a tabela hash promete O(1) quase sempre.",
      plainly:
        'Uma tabela costuma responder uma chave exata em pouco tempo, mas depende de os dados se ' +
        'comportarem bem. Uma árvore mantida baixa faz mais comparações, porém limita esse número ' +
        'mesmo quando a entrada vem em uma ordem ruim. A escolha não é entre “rápido” e “lento”; é ' +
        'entre uma média melhor e uma garantia mais forte.',
      body: [
        'Tabela hash oferece O(1) no caso médio e O(n) no pior. Árvore balanceada oferece O(log n) no pior caso, para toda entrada. Comparar os dois números sem os qualificadores é comparar coisas diferentes.',
        'A escolha depende de quem controla a entrada. Se as chaves são suas, o caso médio descreve o que vai acontecer. Se elas vêm de fora, alguém pode escolher a entrada que ativa o pior caso, e a garantia passa a valer mais que a média.',
        'É a unidade 2 sendo cobrada: sem regime declarado, as duas estruturas parecem trocáveis, e não são.',
      ],
      workedExample: {
        problem: "1 milhão de chaves: a árvore balanceada garante cerca de 20 comparações para toda entrada. A tabela hash faz 1 em média, e n = 1 milhão no pior caso.",
        whatToNotice: "Os dois números descrevem regimes diferentes. Pergunte quem escolhe as chaves antes de comparar 20 com 1.",
      },
      exerciseId: 'trees.e4' },

    { id: 'trees.c5', title: 'B-tree e o custo do acesso a disco', layer: 'deep-dive', band: 'implementation', elaborates: 'b-tree',
      introducesTerms: ['b-tree'],
      oneLine: "Em disco o que custa é visitar um nó, e 20 visitas por consulta é caro.",
      plainly:
        'Ler um nó de uma árvore na memória é barato. Ler um nó no disco pode custar muito mais que ' +
        'comparar dezenas de valores. Em vez de guardar uma chave por página, um índice de banco ' +
        'guarda muitas chaves juntas e reduz o número de páginas visitadas. O formato do nó muda ' +
        'porque a parte cara mudou.',
      body: [
        'Quando a estrutura mora em disco, a unidade de medida muda: o que custa não é comparar chaves, é visitar um nó. Uma árvore binária balanceada com 1 milhão de chaves tem altura perto de 20, e 20 acessos a disco por consulta é caro.',
        'A B-tree resolve mudando o formato do nó: centenas de chaves e centenas de filhos por nó. A altura cai para três ou quatro, e a busca dentro do nó, que agora tem muitas chaves, acontece em memória e é barata.',
        'É o índice padrão de todo banco relacional, e explica por que um índice serve para igualdade, faixa e ordenação ao mesmo tempo, enquanto um índice hash, que a unidade anterior descreveu, serve só para a primeira.',
      ],
      workedExample: {
        problem: 'Com um milhão de chaves, uma árvore binária balanceada tem cerca de log₂(1.000.000) ≈ 20 níveis; uma B-tree com 200 chaves por nó tem cerca de log₂₀₀(1.000.000) ≈ 3.',
        whatToNotice: 'As duas são O(log n), mas três acessos a disco e vinte acessos a disco não são o mesmo custo. A base some na notação e domina a escolha física.',
      },
      exerciseId: 'trees.e5' },

    { id: 'trees.c6', title: 'Quando a árvore é a escolha errada', layer: 'essential', band: 'cost',
      introducesTerms: [],
      oneLine: "A árvore é a escolha errada quando nenhuma consulta pede ordem.",
      plainly:
        'Você só precisa responder se um e-mail exato existe. Não precisa de menor valor, nem de ' +
        'intervalo, nem de ordem de chegada. Manter os dados ordenados cobra comparações e manutenção ' +
        'que não ajudam essa pergunta. Quando a ordem não será consultada, ela é custo sem retorno.',
      body: [
        'Volte ao contrato do primeiro ciclo. Tudo que ele não promete é onde a escolha falha, e desta vez há 1 ausência nova: o tempo constante que o contrato anterior prometia.',
        'A árvore é a escolha errada quando nenhuma consulta pede ordem: ali a ordem está sendo paga em cada operação e não está comprando nada. É a decisão inversa da que abre esta unidade, e as duas se justificam pela mesma leitura da carga de trabalho.',
        'É errada também quando a implementação escolhida não balanceia e a entrada chega ordenada; e quando a estrutura mora em disco e alguém usou uma árvore binária, pagando altura onde o formato do nó resolveria.',
      ],
      workedExample: {
        problem: "Um cache de sessão por token, 100 mil entradas, e nenhuma consulta por faixa. A árvore cobra cerca de 17 comparações por acesso; a tabela hash cobra 1.",
        whatToNotice: "A ordem está sendo paga em toda operação e nenhuma consulta a usa. É a decisão do ciclo 0 lida ao contrário.",
      },
      postmortem: {
        incident: "Volte ao relatório de pedidos entre 1º e 15 de março, e ao índice que o plano de execução não usava.",
        trapId: "trees.arvore-substitui-hash",
        missingClaim: "qual consulta o índice responde. Um índice hash responde igualdade; faixa e ordem pedem árvore, e a diferença não aparece no nome da coluna.",
        whatWouldCatch: "Listar as consultas antes de criar o índice. \"Entre duas datas, em ordem\" é faixa mais ordem, e isso escolhe a estrutura sozinho.",
      },
      exerciseId: 'trees.e6' },
  ],

  misconceptions: treesMisconceptions,

  exercises: treesExercises,

  mastery: {
    statement:
      'O aluno domina esta unidade quando, diante de uma implementação de árvore de busca que ' +
      'nunca viu, consegue sem executar: dizer se ela balanceia e por qual invariante; ' +
      'construir a sequência de inserções que a degrada a O(n); nomear a consulta que ela ' +
      'responde e a tabela hash não; e dizer o que a ordem está custando quando nenhuma ' +
      'consulta pede ordem.',
    requiresClean: ['trees.e1', 'trees.e6'],
    revisitIntervalDays: 7,
  },
}
