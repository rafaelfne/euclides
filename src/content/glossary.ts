import type { GlossaryTerm } from './schema'

/**
 * Canonical form is decided by one rule: whichever form the student will meet
 * in documentation, source code and posts. The rule produces a mixed table on
 * purpose, settled translations stay Portuguese, implementation terms of art
 * stay English, because that is how people actually speak.
 *
 * `isNot` is required by the schema. It is the negative space that stops one
 * word from quietly meaning four things.
 */
export const hashGlossary: GlossaryTerm[] = [
  { id: 'adt', canonical: 'tipo abstrato de dados', canonicalLanguage: 'pt',
    alsoKnownAs: ['TAD', 'abstract data type', 'ADT'],
    definition: 'O contrato: quais operações existem e o que cada uma garante.',
    isNot: ['não é uma estrutura de dados', 'não tem custo, custo pertence à implementação'],
    falseFriends: [], introducedIn: 'hash.c0' },

  { id: 'map', canonical: 'Map', canonicalLanguage: 'en',
    alsoKnownAs: ['mapa', 'dicionário', 'tabela de símbolos', 'associative array'],
    definition: 'Contrato que associa chave a valor e responde sobre uma chave por vez.',
    isNot: ['não promete ordem', 'não é sinônimo de tabela hash, hash é uma implementação dele'],
    falseFriends: [
      { context: 'Java', meaning: '`Map` é a interface; `HashMap` e `TreeMap` a implementam com garantias diferentes. O tipo declarado não revela o custo.' },
      { context: 'Ruby', meaning: '`Hash` é o nome da própria estrutura, equivalente ao `dict` do Python.' },
    ], introducedIn: 'hash.c0' },

  { id: 'hash', canonical: 'hash', canonicalLanguage: 'en',
    alsoKnownAs: ['tabela hash', 'hash table'],
    definition: 'Conforme o contexto: a função que mapeia chave em endereço, o valor que ela devolve, ou a estrutura inteira que usa esse valor como endereço.',
    isNot: ['não é sinônimo de Map, Map é o contrato, hash é uma forma de implementá-lo', 'não é criptografia: a função de hash de uma tabela não precisa ser irreversível nem resistente a colisão'],
    falseFriends: [
      { context: 'criptografia', meaning: 'SHA-256 e afins são hash com garantias de irreversibilidade e resistência a colisão. Uma tabela não precisa de nenhuma das duas, e pagaria caro por elas.' },
      { context: 'Git', meaning: 'o hash de um commit identifica conteúdo, não endereça um bucket. É hash criptográfico usado como identidade.' },
      { context: 'Ruby', meaning: '`Hash` é o nome da estrutura de dicionário, o contrato, não a política de endereçamento.' },
      { context: 'sistemas distribuídos', meaning: '“hash de partição” escolhe em qual máquina o dado mora. Mesma ideia, outra escala.' },
    ], introducedIn: 'hash.c1' },

  { id: 'hash-function', canonical: 'função de hash', canonicalLanguage: 'pt',
    alsoKnownAs: ['hash function'],
    definition: 'Mapeia uma chave de um domínio grande para um inteiro de um contradomínio pequeno e fixo.',
    isNot: ['não é o valor que ela produz', 'não é a estrutura de dados', 'não precisa ser segura nem irreversível'],
    falseFriends: [
      { context: 'criptografia', meaning: 'SHA-256 e bcrypt resolvem outro problema, resistência a colisão intencional e a pré-imagem, e custam ordens de grandeza mais por chamada.' },
      { context: 'sistemas distribuídos', meaning: 'consistent hashing é particionamento entre nós, não endereçamento numa tabela em memória.' },
    ], introducedIn: 'hash.c1' },

  { id: 'collision', canonical: 'colisão', canonicalLanguage: 'pt',
    alsoKnownAs: ['collision'],
    definition: 'Duas chaves distintas produzindo o mesmo endereço.',
    isNot: ['não é defeito da função de hash', 'não é evitável para nenhum h'],
    falseFriends: [], introducedIn: 'hash.c2' },

  { id: 'pigeonhole', canonical: 'princípio da casa dos pombos', canonicalLanguage: 'pt',
    alsoKnownAs: ['pigeonhole principle'],
    definition: 'Se há mais itens que compartimentos, algum compartimento recebe mais de um item.',
    isNot: ['não é uma heurística, é uma demonstração', 'não explica as colisões de uma tabela que cresce antes de encher: ali elas vêm do paradoxo do aniversário'],
    falseFriends: [], introducedIn: 'hash.c2' },

  { id: 'birthday-paradox', canonical: 'paradoxo do aniversário', canonicalLanguage: 'pt',
    alsoKnownAs: ['problema do aniversário', 'birthday paradox', 'birthday problem'],
    definition: 'Com itens espalhados ao acaso entre muitos compartimentos, a primeira repetição aparece por volta da raiz quadrada do número de compartimentos, muito antes de eles acabarem.',
    isNot: ['não é paradoxo de lógica, é uma conta de probabilidade que contraria a intuição', 'não precisa de mais itens que compartimentos, que é a casa dos pombos'],
    falseFriends: [], introducedIn: 'hash.c2' },

  { id: 'bucket', canonical: 'bucket', canonicalLanguage: 'en',
    alsoKnownAs: ['balde', 'slot', 'entrada'],
    definition: 'Uma posição da tabela, que guarda zero ou mais pares.',
    isNot: ['não guarda exatamente um par, essa é a suposição que quebra em colisão'],
    falseFriends: [
      { context: 'object storage', meaning: 'um bucket do S3 é um contêiner nomeado de arquivos. Homônimo total: não há função de hash escolhendo em qual bucket o arquivo cai.' },
      { context: 'rate limiting', meaning: 'o token bucket é um algoritmo de vazão. A palavra vem da metáfora de balde que enche e esvazia, não de endereçamento.' },
    ], introducedIn: 'hash.c3' },

  { id: 'chaining', canonical: 'chaining', canonicalLanguage: 'en',
    alsoKnownAs: ['encadeamento', 'separate chaining', 'encadeamento separado'],
    definition: 'Política de colisão em que cada bucket guarda a lista dos pares que caíram ali.',
    isNot: ['não elimina colisão, apenas decide o que fazer com ela'],
    falseFriends: [
      { context: 'APIs fluentes', meaning: 'method chaining encadeia chamadas num objeto. Nenhuma relação com resolução de colisão.' },
      { context: 'blockchain', meaning: 'a “corrente” é de blocos ligados por hash criptográfico. Empresta as duas palavras e não empresta o mecanismo.' },
    ], introducedIn: 'hash.c3' },

  { id: 'position-invariant', canonical: 'invariante de posição', canonicalLanguage: 'pt',
    alsoKnownAs: [],
    definition: 'Todo par (k, v) armazenado no bucket i satisfaz h(k) mod m = i.',
    isNot: ['não sobrevive a uma mudança de m sem reinserção'],
    falseFriends: [], introducedIn: 'hash.c3' },

  { id: 'load-factor', canonical: 'load factor', canonicalLanguage: 'en',
    alsoKnownAs: ['fator de carga', 'α'],
    definition: 'A razão n/m entre pares armazenados e número de posições.',
    isNot: ['não é a fração da memória ocupada', 'não é limitado a 1 com chaining', 'não é a probabilidade de colisão'],
    falseFriends: [
      { context: 'sistemas operacionais', meaning: 'o load average mede processos na fila de execução. Mesma palavra “carga”, outra grandeza, outra unidade.' },
      { context: 'infraestrutura', meaning: 'load balancer distribui requisições entre máquinas. Não há razão n/m envolvida.' },
    ], introducedIn: 'hash.c4' },

  { id: 'uniform-hashing', canonical: 'hashing uniforme', canonicalLanguage: 'pt',
    alsoKnownAs: ['uniform hashing', 'simple uniform hashing'],
    definition: 'Hipótese de que cada chave tem a mesma chance de cair em qualquer bucket.',
    isNot: ['não é uma propriedade verificada, é uma hipótese sob a qual o custo médio vale'],
    falseFriends: [], introducedIn: 'hash.c6' },

  { id: 'rehash', canonical: 'rehash', canonicalLanguage: 'en',
    alsoKnownAs: ['redimensionamento', 'resize'],
    definition: 'Dobrar m e reinserir todos os pares, restaurando a invariante de posição.',
    isNot: ['não é copiar buckets', 'não elimina colisão, redistribui'],
    falseFriends: [], introducedIn: 'hash.c5' },




  { id: 'open-addressing', canonical: 'open addressing', canonicalLanguage: 'en',
    alsoKnownAs: ['endereçamento aberto'],
    definition: 'Política de colisão em que todos os pares moram no próprio array.',
    isNot: ['não tolera load factor alto', 'não permite deleção que apenas esvazia a posição'],
    falseFriends: [], introducedIn: 'hash.c7' },

  { id: 'probing', canonical: 'probing', canonicalLanguage: 'en',
    alsoKnownAs: ['linear probing', 'sondagem linear'],
    definition: 'A sequência de posições visitadas a partir do endereço inicial até achar espaço.',
    isNot: ['não é busca linear na tabela inteira, segue uma ordem determinada por h'],
    falseFriends: [
      { context: 'Kubernetes', meaning: 'liveness e readiness probe são checagens periódicas de saúde. Aqui probing é percorrer posições de um array.' },
      { context: 'monitoração', meaning: 'uma probe de rede mede latência. Nenhuma relação com sequência de sondagem.' },
    ], introducedIn: 'hash.c7' },

  { id: 'clustering', canonical: 'clustering', canonicalLanguage: 'en',
    alsoKnownAs: ['agrupamento', 'primary clustering'],
    definition: 'Posições ocupadas adjacentes que se fundem em blocos, alongando toda sondagem que cai neles.',
    isNot: ['não é colisão, é o efeito acumulado dela sob probing'],
    falseFriends: [
      { context: 'infraestrutura', meaning: 'um cluster é um conjunto de máquinas. Homônimo total, e é o contexto em que o aluno mais encontra a palavra.' },
      { context: 'estatística', meaning: 'clustering é agrupar pontos por similaridade. Aqui o agrupamento é de posições ocupadas e ninguém o quis.' },
    ], introducedIn: 'hash.c7' },

  { id: 'tombstone', canonical: 'tombstone', canonicalLanguage: 'en',
    alsoKnownAs: ['marca de remoção'],
    definition: 'Marca que registra “havia algo aqui”, para a sondagem não parar numa posição liberada.',
    isNot: ['não é uma posição livre', 'não devolve espaço até o próximo rehash'],
    falseFriends: [], introducedIn: 'hash.c7' },

  { id: 'hash-flooding', canonical: 'hash flooding', canonicalLanguage: 'en',
    alsoKnownAs: [],
    definition: 'Ataque que escolhe chaves colidentes de propósito para levar a tabela ao pior caso.',
    isNot: ['não é um problema teórico, é um vetor de negação de serviço documentado'],
    falseFriends: [], introducedIn: 'hash.c8' },
]

export const synthesisGlossary: GlossaryTerm[] = [
  { id: 'workload', canonical: 'carga de trabalho', canonicalLanguage: 'pt',
    alsoKnownAs: ['workload', 'perfil de uso'],
    definition: 'A lista das operações que um sistema executa, com a frequência de cada uma.',
    isNot: ['não é o volume de dados, duas cargas sobre a mesma coleção podem exigir estruturas opostas'],
    falseFriends: [
      { context: 'infraestrutura', meaning: 'workload como “o que roda naquele cluster”. Aqui é a mistura de operações, não o processo.' },
    ], introducedIn: 'synthesis.c0' },

  { id: 'dominant-operation', canonical: 'operação dominante', canonicalLanguage: 'pt',
    alsoKnownAs: ['operação mais frequente'],
    definition: 'A operação cuja frequência é ordens de grandeza maior que as demais, e que por isso decide a escolha.',
    isNot: ['não é a operação mais custosa', 'não é a mais visível no código: uma chamada dentro de um laço quente domina uma rotina inteira que roda por dia'],
    falseFriends: [], introducedIn: 'synthesis.c0' },

  { id: 'candidate', canonical: 'candidata', canonicalLanguage: 'pt',
    alsoKnownAs: ['estrutura candidata'],
    definition: 'Uma estrutura que promete tudo que o problema exige, e que por isso entra na comparação de custo.',
    isNot: ['não é qualquer estrutura conhecida: quem não promete o que o problema exige foi cortada antes de comparar custo'],
    falseFriends: [], introducedIn: 'synthesis.c1' },

  { id: 'composition', canonical: 'composição', canonicalLanguage: 'pt',
    alsoKnownAs: ['estrutura composta'],
    definition: 'Manter duas estruturas sobre os mesmos dados, cada uma respondendo a pergunta que a outra não responde.',
    isNot: ['não é duplicar os dados: as duas apontam para os mesmos itens', 'não é grátis, toda escrita precisa acontecer nas duas, e esquecer uma produz duas verdades'],
    falseFriends: [
      { context: 'programação', meaning: 'composição de funções, ou composição em vez de herança. Mesma palavra, outra ideia.' },
    ], introducedIn: 'synthesis.c3' },
]

export const graphsGlossary: GlossaryTerm[] = [
  { id: 'graph', canonical: 'grafo', canonicalLanguage: 'pt',
    alsoKnownAs: ['graph'],
    definition: 'Um conjunto de vértices e as ligações entre eles.',
    isNot: ['não é uma árvore, pode haver ciclo, e pode haver mais de um caminho entre dois vértices', 'não responde alcançabilidade: isso é algoritmo escrito sobre o contrato'],
    falseFriends: [
      { context: 'visualização', meaning: '“gráfico” de barras ou de linhas. Em inglês os dois são graph, e não têm relação.' },
      { context: 'APIs', meaning: 'GraphQL nomeia o grafo de dados que ela expõe. A estrutura é parecida; o que se chama de grafo ali é o esquema.' },
    ], introducedIn: 'graphs.c0' },

  { id: 'vertex', canonical: 'vértice', canonicalLanguage: 'pt',
    // "nó" e "node" saíram: eles são de `node`, e o falso amigo abaixo já diz
    // que a palavra é a mesma. Apelido reivindicado por dois termos é a deriva
    // 1 do CLAUDE.md com outro nome.
    alsoKnownAs: ['vertex'],
    definition: 'Cada um dos elementos que o grafo liga.',
    isNot: ['não é o nó de lista ligada, que carrega um ponteiro para o próximo, aqui as ligações moram na representação, não no elemento'],
    falseFriends: [
      { context: 'estruturas lineares e árvores', meaning: 'ali “nó” é a caixa que guarda o elemento e o ponteiro para o próximo. Num grafo o vértice não carrega ligação nenhuma: quem carrega é a lista de adjacência ou a matriz.' },
      { context: 'computação gráfica', meaning: 'vertex é um ponto no espaço, com coordenadas. Vertex shader opera sobre esses. Homônimo total.' },
    ], introducedIn: 'graphs.c0' },

  { id: 'edge', canonical: 'aresta', canonicalLanguage: 'pt',
    alsoKnownAs: ['edge', 'ligação'],
    definition: 'A ligação entre dois vértices.',
    isNot: ['não é necessariamente simétrica: num grafo dirigido, u para v não implica v para u'],
    falseFriends: [
      { context: 'infraestrutura', meaning: 'edge computing é computação perto do usuário. Homônimo total.' },
    ], introducedIn: 'graphs.c0' },

  { id: 'directed', canonical: 'dirigido', canonicalLanguage: 'pt',
    alsoKnownAs: ['direcionado', 'directed', 'digrafo'],
    definition: 'A propriedade de as arestas terem sentido: de u para v não é o mesmo que de v para u.',
    isNot: ['não é uma escolha de implementação, é uma decisão sobre o que o grafo modela'],
    falseFriends: [], introducedIn: 'graphs.c1' },

  { id: 'weight', canonical: 'peso', canonicalLanguage: 'pt',
    alsoKnownAs: ['weight', 'custo da aresta'],
    definition: 'Um número associado a uma aresta, distância, duração, custo.',
    isNot: ['não é contado pela busca em largura, que conta arestas e ignora peso'],
    falseFriends: [
      { context: 'redes neurais, unidade 09', meaning: 'o peso do neurônio é um número que o treino ajusta e que multiplica uma entrada. O peso de aresta é dado do problema, e ninguém o ajusta. Em inglês os dois são weight.' },
    ], introducedIn: 'graphs.c1' },

  { id: 'adjacency-list', canonical: 'lista de adjacência', canonicalLanguage: 'pt',
    alsoKnownAs: ['adjacency list'],
    definition: 'Representação em que cada vértice guarda a lista dos vizinhos dele.',
    isNot: ['não responde existeAresta em tempo constante, é preciso percorrer a lista'],
    falseFriends: [], introducedIn: 'graphs.c2' },

  { id: 'degree', canonical: 'grau', canonicalLanguage: 'pt',
    alsoKnownAs: ['degree'],
    definition: 'Quantos vizinhos diretos um vértice tem.',
    isNot: ['não é a distância até outro vértice', 'num grafo dirigido são dois números: quantas entram e quantas saem'],
    falseFriends: [], introducedIn: 'graphs.c2' },

  { id: 'adjacency-matrix', canonical: 'matriz de adjacência', canonicalLanguage: 'pt',
    alsoKnownAs: ['adjacency matrix'],
    definition: 'Representação em que uma tabela de todos contra todos diz se cada par possível está ligado.',
    isNot: ['não economiza espaço quando há poucas arestas: o espaço depende só do número de vértices'],
    falseFriends: [], introducedIn: 'graphs.c3' },

  { id: 'density', canonical: 'densidade', canonicalLanguage: 'pt',
    alsoKnownAs: ['density'],
    definition: 'A razão entre as arestas que existem e as que poderiam existir.',
    isNot: ['não é o número de arestas, é ele comparado com o máximo possível'],
    falseFriends: [], introducedIn: 'graphs.c3' },

  { id: 'bfs', canonical: 'busca em largura', canonicalLanguage: 'pt',
    alsoKnownAs: ['BFS', 'breadth-first search'],
    definition: 'Percurso que avança por camadas, usando uma fila.',
    isNot: ['não é uma operação do contrato Grafo, é um algoritmo escrito sobre ele', 'não devolve o caminho de menor custo quando as arestas têm peso: ela conta arestas'],
    falseFriends: [], introducedIn: 'graphs.c4' },

  { id: 'visited', canonical: 'conjunto de visitados', canonicalLanguage: 'pt',
    alsoKnownAs: ['visited set', 'marcados'],
    definition: 'A estrutura que guarda quem já foi alcançado, para que ninguém seja alcançado duas vezes.',
    isNot: ['não é opcional num grafo com ciclo: sem ele o percurso não termina', 'não é necessário numa árvore, e é por isso que quem vem de árvore esquece dele'],
    falseFriends: [], introducedIn: 'graphs.c4' },

  { id: 'dfs', canonical: 'busca em profundidade', canonicalLanguage: 'pt',
    alsoKnownAs: ['DFS', 'depth-first search'],
    definition: 'Percurso que desce um ramo até o fim antes de voltar, usando uma pilha.',
    isNot: ['não garante caminho com menos arestas, essa garantia é da busca em largura', 'não gasta menos memória que a busca em largura na versão com pilha que marca na entrada: a pilha pode guardar quase todos os vértices, como a fila'],
    falseFriends: [], introducedIn: 'graphs.c5' },

  { id: 'sparse', canonical: 'esparso', canonicalLanguage: 'pt',
    alsoKnownAs: ['sparse'],
    definition: 'A propriedade de ter muito menos arestas do que o máximo possível.',
    isNot: ['não é ter poucos vértices, um grafo esparso pode ser enorme'],
    falseFriends: [
      { context: 'álgebra linear', meaning: 'matriz esparsa é a que tem quase tudo zero. É a mesma ideia, e é literalmente o que uma matriz de adjacência de grafo esparso vira.' },
    ], introducedIn: 'graphs.c7' },
]

export const treesGlossary: GlossaryTerm[] = [
  { id: 'sorted-map', canonical: 'SortedMap', canonicalLanguage: 'en',
    alsoKnownAs: ['mapa ordenado', 'dicionário ordenado', 'ordered map'],
    definition: 'Contrato que associa chave a valor e preserva a ordem das chaves.',
    isNot: ['não ordena valores, a comparação é sempre de chave', 'não promete obter em tempo constante: a ordem tem preço'],
    falseFriends: [
      { context: 'Python', meaning: '`dict` preserva a ordem de inserção desde a 3.7, que não é ordem de chave. São promessas diferentes.' },
      { context: 'JavaScript', meaning: '`Map` preserva ordem de inserção. Também não é ordem de chave.' },
    ], introducedIn: 'trees.c0' },

  { id: 'key-order', canonical: 'ordem de chave', canonicalLanguage: 'pt',
    alsoKnownAs: ['ordem das chaves'],
    definition: 'A relação de comparação entre chaves que a estrutura usa para decidir posição.',
    isNot: ['não é ordem de inserção', 'não diz nada sobre a ordem dos valores associados'],
    falseFriends: [], introducedIn: 'trees.c0' },

  { id: 'bst', canonical: 'árvore de busca', canonicalLanguage: 'pt',
    alsoKnownAs: ['BST', 'binary search tree', 'árvore binária de busca'],
    definition: 'Árvore em que, para todo nó, as chaves menores ficam à esquerda e as maiores à direita.',
    isNot: ['não é uma árvore binária qualquer, a invariante de ordem é o que a define', 'não garante altura logarítmica: sem balanceamento a altura pode ser n − 1'],
    falseFriends: [], introducedIn: 'trees.c1' },

  { id: 'subtree', canonical: 'subárvore', canonicalLanguage: 'pt',
    alsoKnownAs: ['subtree'],
    definition: 'Um nó junto com tudo que pende dele.',
    isNot: ['não é um pedaço qualquer da árvore: é um nó e todos os descendentes dele'],
    falseFriends: [], introducedIn: 'trees.c1' },

  { id: 'height', canonical: 'altura', canonicalLanguage: 'pt',
    alsoKnownAs: ['height'],
    definition: 'O número de arestas do caminho mais longo entre um nó e uma folha abaixo dele.',
    isNot: ['não é profundidade, altura é contada de baixo para cima, profundidade de cima para baixo', 'não é o número de nós: uma árvore com um nó só tem altura zero'],
    falseFriends: [], introducedIn: 'trees.c2' },

  { id: 'degeneration', canonical: 'degeneração', canonicalLanguage: 'pt',
    alsoKnownAs: ['árvore degenerada', 'degenerate tree'],
    definition: 'O estado em que a árvore virou uma corrente de nós e a altura passou a crescer com n.',
    isNot: ['não é uma violação da invariante de ordem, a árvore degenerada continua correta, e só o custo mudou'],
    falseFriends: [], introducedIn: 'trees.c2' },

  { id: 'rotation', canonical: 'rotação', canonicalLanguage: 'pt',
    alsoKnownAs: ['rotation'],
    definition: 'Trocar quem é pai de quem entre dois nós vizinhos, mudando a altura e preservando a ordem.',
    isNot: ['não reordena chaves, a travessia em ordem devolve a mesma sequência antes e depois'],
    falseFriends: [
      { context: 'operação', meaning: 'rotação de credencial ou de log é substituição periódica. Homônimo total.' },
      { context: 'gráficos', meaning: 'rotacionar é girar no espaço. A metáfora é essa, e o mecanismo não tem relação.' },
    ], introducedIn: 'trees.c3' },

  { id: 'balancing', canonical: 'balanceamento', canonicalLanguage: 'pt',
    alsoKnownAs: ['balancing', 'árvore balanceada'],
    definition: 'Manter uma invariante extra sobre altura, para que ela não cresça com n.',
    isNot: ['não é distribuir chaves igualmente entre os dois lados, é limitar a diferença de altura'],
    falseFriends: [
      { context: 'infraestrutura', meaning: 'load balancing distribui requisições entre máquinas. Homônimo total.' },
    ], introducedIn: 'trees.c3' },

  { id: 'b-tree', canonical: 'B-tree', canonicalLanguage: 'en',
    alsoKnownAs: ['árvore B', 'B+ tree'],
    definition: 'Árvore de busca com muitas chaves por nó, desenhada para que a altura caiba em poucos acessos a disco.',
    isNot: ['não é uma árvore binária', 'o B não é de binária'],
    falseFriends: [], introducedIn: 'trees.c5' },
]

export const linearGlossary: GlossaryTerm[] = [
  { id: 'list', canonical: 'lista', canonicalLanguage: 'pt',
    alsoKnownAs: ['list', 'sequência'],
    definition: 'Contrato que guarda elementos em posições e responde por posição.',
    isNot: ['não é uma implementação, array e nós ligados servem, com custos opostos', 'não promete achar um valor melhor que percorrendo tudo'],
    falseFriends: [
      { context: 'Python', meaning: '`list` é o array dinâmico, não o contrato: a escolha de implementação já foi feita pelo nome.' },
      { context: 'Lisp e afins', meaning: '`list` é a lista ligada. Mesmo nome, implementação oposta e custos opostos.' },
    ], introducedIn: 'prelude.c5' },

  { id: 'position', canonical: 'posição', canonicalLanguage: 'pt',
    alsoKnownAs: ['índice', 'index'],
    definition: 'O número que identifica um lugar na sequência, contado a partir de zero.',
    isNot: ['não é um endereço de memória', 'não é uma identidade estável: inserir ou remover antes dela muda a posição de todos os seguintes'],
    falseFriends: [], introducedIn: 'prelude.c5' },

  { id: 'stack', canonical: 'pilha', canonicalLanguage: 'pt', alsoKnownAs: ['stack', 'LIFO'],
    definition: 'Contrato com inserção e remoção pela mesma extremidade.',
    isNot: ['não é uma implementação, array e lista ligada servem, com custos diferentes', 'não é a fila ao contrário: com operações intercaladas as saídas divergem'],
    falseFriends: [
      { context: 'execução de programa', meaning: 'a call stack guarda os quadros de chamada: é uma aplicação do contrato, não sinônimo dele.' },
      { context: 'infraestrutura', meaning: '“stack” como conjunto de tecnologias. Homônimo total.' },
    ], introducedIn: 'linear.c1' },

  { id: 'queue', canonical: 'fila', canonicalLanguage: 'pt',
    alsoKnownAs: ['queue', 'FIFO'],
    definition: 'Contrato com inserção numa ponta e remoção na outra.',
    isNot: ['não é a pilha invertida, com operações intercaladas as duas saídas divergem', 'não é uma implementação: array circular e lista ligada servem'],
    falseFriends: [
      { context: 'mensageria', meaning: 'uma fila de mensagens promete durabilidade, entrega e reprocessamento. O contrato aqui é só a ordem.' },
    ], introducedIn: 'linear.c2' },

  { id: 'dynamic-array', canonical: 'array dinâmico', canonicalLanguage: 'pt',
    alsoKnownAs: ['vetor dinâmico', 'dynamic array', 'growable array'],
    definition: 'Bloco contíguo com capacidade própria, que realoca dobrando quando enche.',
    isNot: ['não é um array de tamanho fixo', 'não guarda os elementos em posições espalhadas'],
    falseFriends: [], introducedIn: 'linear.c3' },

  { id: 'capacity', canonical: 'capacidade', canonicalLanguage: 'pt',
    alsoKnownAs: ['capacity'],
    definition: 'Quantas posições o bloco tem alocadas, tenham elas valor ou não.',
    isNot: ['não é o tamanho, o tamanho cresce de um em um e a capacidade dá saltos'],
    falseFriends: [
      { context: 'infraestrutura', meaning: 'planejamento de capacidade é dimensionar máquinas. Homônimo total.' },
    ], introducedIn: 'linear.c3' },

  { id: 'linked-list', canonical: 'lista ligada', canonicalLanguage: 'pt',
    alsoKnownAs: ['lista encadeada', 'linked list'],
    definition: 'Sequência em que cada elemento mora num nó que aponta para o próximo.',
    isNot: ['não tem acesso por índice, chegar à posição p custa p saltos', 'não é sempre melhor que o bloco contíguo: a tabela de custos assume que todo acesso custa o mesmo'],
    falseFriends: [], introducedIn: 'linear.c4' },

  { id: 'node', canonical: 'nó', canonicalLanguage: 'pt',
    alsoKnownAs: ['node'],
    definition: 'A caixa que guarda um elemento e o ponteiro para a próxima caixa.',
    isNot: ['não é o elemento, é o que o embrulha', 'não basta ter o nó em mãos para removê-lo de uma lista ligada simples: quem precisa estar em mãos é o anterior'],
    falseFriends: [
      { context: 'infraestrutura', meaning: 'um nó de cluster é uma máquina. Homônimo total, e frequente na mesma conversa.' },
      { context: 'Node.js', meaning: 'nome de um runtime. Nenhuma relação.' },
      { context: 'redes neurais, unidade 09', meaning: 'cada conta intermediária, uma soma ou um produto, é um nó da conta. Não guarda ponteiro para uma próxima caixa: guarda um valor e um gradient.' },
    ], introducedIn: 'linear.c4' },

  { id: 'doubly-linked-list', canonical: 'lista duplamente ligada', canonicalLanguage: 'pt',
    alsoKnownAs: ['lista duplamente encadeada', 'doubly linked list'],
    definition: 'Lista ligada em que cada nó aponta para o próximo e também para o anterior.',
    isNot: ['não é a lista ligada simples, em que ter o nó em mãos não dá o anterior', 'não é de graça: paga um ponteiro a mais por nó, e toda religação mexe nos dois sentidos'],
    falseFriends: [], introducedIn: 'linear.c4' },

  { id: 'cache-locality', canonical: 'localidade de cache', canonicalLanguage: 'pt',
    alsoKnownAs: ['cache locality', 'localidade de referência'],
    definition: 'A propriedade de acessar endereços vizinhos, aproveitando que a memória é trazida em blocos.',
    isNot: ['não aparece em notação O, ela é uma hipótese que a notação assume e não declara'],
    falseFriends: [
      { context: 'web', meaning: 'cache de HTTP ou de aplicação guarda resultado para não recalcular. Aqui não se guarda nada de propósito: é como o processador já lê a memória.' },
    ], introducedIn: 'linear.c5' },
]

export const asymptoticsGlossary: GlossaryTerm[] = [
  { id: 'big-o', canonical: 'notação O', canonicalLanguage: 'pt',
    alsoKnownAs: ['big O', 'O grande', 'notação assintótica'],
    definition: 'Uma forma de dizer que o custo não cresce mais rápido que uma função dada, a menos de constante.',
    isNot: ['não é o custo exato, é um limite superior de crescimento', 'não afirma nada sobre n pequeno, onde a constante descartada domina'],
    falseFriends: [
      { context: 'conversa de corredor', meaning: '“é O(n)” dito como sinônimo de “é lento”. A notação não fala de tempo de relógio; fala de crescimento.' },
    ], introducedIn: 'asymptotics.c0' },

  { id: 'cost-claim', canonical: 'afirmação de custo', canonicalLanguage: 'pt',
    alsoKnownAs: ['cost claim'],
    definition: 'Um limite acompanhado do regime, da amortização, das hipóteses e do que n conta.',
    isNot: ['não é a classe sozinha, “O(1)” sem as outras quatro partes não é afirmação, é fragmento'],
    falseFriends: [], introducedIn: 'asymptotics.c0' },

  { id: 'asymptotic', canonical: 'assintótico', canonicalLanguage: 'pt',
    alsoKnownAs: ['asymptotic'],
    definition: 'Relativo ao comportamento quando o tamanho da entrada cresce sem limite.',
    isNot: ['não descreve o comportamento para a entrada que você tem hoje, se ela for pequena'],
    falseFriends: [], introducedIn: 'asymptotics.c1' },

  { id: 'constant-factor', canonical: 'fator constante', canonicalLanguage: 'pt',
    alsoKnownAs: ['constante multiplicativa', 'constant factor'],
    definition: 'O multiplicador que a notação descarta, e que depende de máquina, linguagem e implementação.',
    isNot: ['não é irrelevante, é irrelevante apenas quando n é grande o bastante, e "grande o bastante" precisa ser calculado'],
    falseFriends: [], introducedIn: 'asymptotics.c1' },

  { id: 'measured-in', canonical: 'unidade de medida', canonicalLanguage: 'pt',
    alsoKnownAs: ['o que n conta'],
    definition: 'A declaração do que a variável de tamanho está contando, e do que ela está ignorando.',
    isNot: ['não é sempre "elementos": pode ser bytes, comparações, acessos a disco ou nós visitados'],
    falseFriends: [], introducedIn: 'asymptotics.c2' },

  { id: 'recurrence', canonical: 'recorrência', canonicalLanguage: 'pt',
    alsoKnownAs: ['relação de recorrência', 'recurrence'],
    definition: 'Uma relação que escreve o custo de uma entrada em função do custo de entradas menores.',
    isNot: ['não é a solução, resolver a relação é um passo separado de escrevê-la'],
    falseFriends: [
      { context: 'agenda e cobrança', meaning: 'evento recorrente, cobrança recorrente: repetição no tempo. Aqui a repetição é sobre o tamanho da entrada.' },
    ], introducedIn: 'asymptotics.c3' },

  { id: 'base-case', canonical: 'caso base', canonicalLanguage: 'pt',
    alsoKnownAs: ['base case'],
    definition: 'A entrada que o procedimento resolve sem se chamar de novo, e onde a recursão para.',
    isNot: ['não é o caso vazio necessariamente, é o menor caso que o procedimento sabe responder direto'],
    falseFriends: [], introducedIn: 'asymptotics.c3' },

  { id: 'recursion-tree', canonical: 'árvore de recursão', canonicalLanguage: 'pt',
    alsoKnownAs: ['recursion tree'],
    definition: 'O desenho das chamadas por nível, com quantas existem e de que tamanho, usado para somar o custo total.',
    isNot: ['não é a árvore de dados de uma estrutura, é o registro das chamadas de um procedimento', 'não tem n níveis: tem tantos quantos couberem entre o tamanho da entrada e o caso base'],
    falseFriends: [
      { context: 'depuração', meaning: 'a call stack mostra as chamadas ABERTAS num instante; a árvore mostra todas as que acontecem ao longo da execução.' },
    ], introducedIn: 'asymptotics.c4' },

  { id: 'worst-case', canonical: 'pior caso', canonicalLanguage: 'pt',
    alsoKnownAs: ['worst case'],
    definition: 'O custo sobre a entrada mais desfavorável de um dado tamanho.',
    isNot: ['não é o custo típico', 'não é o custo que você vai medir em produção'],
    falseFriends: [], introducedIn: 'asymptotics.c5' },
  { id: 'average-case', canonical: 'caso médio', canonicalLanguage: 'pt',
    alsoKnownAs: ['average case'],
    definition: 'O custo esperado sob uma distribuição declarada das entradas.',
    isNot: ['não vale sem a distribuição declarada', 'não é amortizado'],
    falseFriends: [], introducedIn: 'asymptotics.c5' },
  { id: 'amortized', canonical: 'amortizado', canonicalLanguage: 'pt',
    alsoKnownAs: ['amortized'],
    definition: 'Custo médio por operação ao longo de uma sequência, quando operações caras são raras.',
    isNot: ['não é caso médio', 'não é uma média sobre entradas aleatórias, é sobre a sequência'],
    falseFriends: [], introducedIn: 'asymptotics.c6' },

  { id: 'amortized-analysis', canonical: 'análise amortizada', canonicalLanguage: 'pt',
    alsoKnownAs: ['amortized analysis'],
    definition: 'Somar o custo de uma sequência inteira de operações e dividir pelo número delas.',
    isNot: ['não é caso médio: aqui não há sorteio, a sequência é fixa e as operações caras acontecem em posições conhecidas', 'não é uma média empírica medida em produção'],
    falseFriends: [
      { context: 'contabilidade', meaning: 'amortizar é distribuir um custo ao longo de períodos. A metáfora é a mesma, e é de onde o nome veio.' },
    ], introducedIn: 'asymptotics.c6' },
]

export const preludeGlossary: GlossaryTerm[] = [
  { id: 'variable', canonical: 'variável', canonicalLanguage: 'pt',
    alsoKnownAs: ['variable'],
    definition: 'Um nome associado a um valor que pode mudar enquanto o procedimento avança.',
    isNot: ['não é o valor em si, é o nome que permite encontrá-lo', 'não precisa manter o mesmo valor durante todo o procedimento'],
    falseFriends: [], introducedIn: 'prelude.c1' },

  { id: 'assignment', canonical: 'atribuição', canonicalLanguage: 'pt',
    alsoKnownAs: ['assignment'],
    definition: 'A operação que calcula um valor e o guarda no nome à esquerda da seta.',
    isNot: ['não é comparação', 'não pergunta se os dois lados são iguais'],
    falseFriends: [], introducedIn: 'prelude.c1' },

  { id: 'condition', canonical: 'condição', canonicalLanguage: 'pt',
    alsoKnownAs: ['condition', 'teste'],
    definition: 'Uma pergunta que resulta em sim ou não e decide se uma ação acontece.',
    isNot: ['não é a ação que vem depois', 'não muda um valor sozinha'],
    falseFriends: [], introducedIn: 'prelude.c2' },
]

export const tracingGlossary: GlossaryTerm[] = [
  { id: 'execution-trace', canonical: 'execution trace', canonicalLanguage: 'en',
    alsoKnownAs: ['trace', 'dry run', 'teste de mesa', 'traço de execução'],
    definition: 'A tabela do estado do programa, uma linha por rodada, cada linha derivada da anterior.',
    isNot: ['não é a saída do programa, é o caminho até ela', 'não é depuração: nada é executado'],
    falseFriends: [
      { context: 'observabilidade', meaning: 'um trace distribuído registra o caminho de uma requisição entre serviços, em produção e depois do fato. Aqui nada roda.' },
    ], introducedIn: 'tracing.c0' },

  { id: 'state', canonical: 'estado', canonicalLanguage: 'pt',
    alsoKnownAs: ['state'],
    definition: 'O conjunto dos valores que decidem o que o programa vai fazer a seguir.',
    isNot: ['não é toda variável do arquivo, só as que mudam e afetam o resultado'],
    falseFriends: [
      { context: 'front-end', meaning: '“estado” de componente é o que dispara nova renderização. Ideia parecida, escopo e mecanismo diferentes.' },
    ], introducedIn: 'prelude.c0' },

  { id: 'guard', canonical: 'condição de parada', canonicalLanguage: 'pt',
    alsoKnownAs: ['guarda', 'guard', 'condição do laço'],
    definition: 'A expressão testada antes de cada rodada, que decide se existe uma próxima.',
    isNot: ['não é o passo do laço, a condição decide se continua, o passo decide de quanto em quanto se anda', 'não garante terminação sozinha'],
    falseFriends: [
      { context: 'linguagens', meaning: '“guard clause” é o retorno antecipado no começo de uma função. Mesma palavra, outro papel.' },
    ], introducedIn: 'tracing.c1' },

  { id: 'iteration', canonical: 'rodada', canonicalLanguage: 'pt',
    alsoKnownAs: ['iteração', 'iteration'],
    definition: 'Uma execução completa do corpo do laço, entre dois testes da condição.',
    isNot: ['não corresponde a um elemento da coleção, exceto quando o passo é de um em um'],
    falseFriends: [], introducedIn: 'prelude.c3' },

  { id: 'loop-invariant', canonical: 'invariante de laço', canonicalLanguage: 'pt',
    alsoKnownAs: ['loop invariant'],
    definition: 'Propriedade que vale antes da primeira rodada e continua valendo depois de cada uma.',
    isNot: ['não é a conclusão do laço, a conclusão sai dela, junto com a condição de parada', 'não é um comentário sobre intenção: é uma afirmação testável em qualquer rodada'],
    falseFriends: [
      { context: 'banco de dados', meaning: 'invariante como restrição de integridade que vale sempre. Ideia próxima, e aqui o escopo é um laço.' },
    ], introducedIn: 'tracing.c3' },

  { id: 'off-by-one', canonical: 'off-by-one', canonicalLanguage: 'en',
    alsoKnownAs: ['erro de um', 'erro de fronteira'],
    definition: 'Errar a fronteira de um índice ou de uma contagem por exatamente uma posição.',
    isNot: ['não é erro de digitação, é um modelo mental de fronteira aplicado sem conferir'],
    falseFriends: [], introducedIn: 'tracing.c4' },

  { id: 'empty-case', canonical: 'caso vazio', canonicalLanguage: 'pt',
    alsoKnownAs: ['entrada vazia', 'empty case'],
    definition: 'O comportamento do código quando a coleção não tem nenhum elemento e o laço não roda nenhuma vez.',
    isNot: ['não é um erro por definição, é uma resposta que precisa ser decidida de propósito'],
    falseFriends: [], introducedIn: 'prelude.c5' },

  { id: 'short-circuit', canonical: 'curto-circuito', canonicalLanguage: 'pt',
    alsoKnownAs: ['short-circuit', 'avaliação preguiçosa de condição'],
    definition: 'A regra de não avaliar o segundo lado de uma condição composta quando o primeiro já decide o resultado.',
    isNot: ['não é uma otimização opcional: é a semântica da linguagem, e código depende dela para não quebrar'],
    falseFriends: [
      { context: 'eletrônica', meaning: 'curto-circuito é um caminho de baixa resistência que danifica o circuito. Homônimo total.' },
    ], introducedIn: 'tracing.c6' },
]

export const sortingGlossary: GlossaryTerm[] = [
  { id: 'sorting', canonical: 'ordenação', canonicalLanguage: 'pt',
    alsoKnownAs: ['sort', 'sorting'],
    definition: 'Devolver os mesmos elementos numa ordem em que nenhum vem antes de um menor, segundo o comparador dado.',
    isNot: ['não é uma estrutura, é um problema, e cada algoritmo é uma forma de resolvê-lo', 'não promete nada sobre elementos que comparam como iguais'],
    falseFriends: [], introducedIn: 'sorting.c0' },

  { id: 'permutation', canonical: 'permutação', canonicalLanguage: 'pt',
    alsoKnownAs: ['permutation'],
    definition: 'Os mesmos elementos, em outra ordem: nenhum entra, nenhum sai, nenhum duplica.',
    isNot: ['não é uma cópia com elementos trocados por outros', 'não permite descartar duplicata, ordenar não filtra'],
    falseFriends: [], introducedIn: 'sorting.c0' },

  { id: 'stability', canonical: 'estabilidade', canonicalLanguage: 'pt',
    alsoKnownAs: ['stable sort', 'ordenação estável'],
    definition: 'A garantia de que elementos que comparam como iguais saem na mesma ordem relativa em que entraram.',
    isNot: ['não fala de elementos diferentes, a ordem deles é a do comparador', 'não é uma propriedade do comparador, e sim do algoritmo'],
    falseFriends: [
      { context: 'sistemas', meaning: '“estável” como sinônimo de confiável ou sem falha. Aqui é uma garantia exata sobre ordem relativa, e um algoritmo instável não tem defeito nenhum.' },
      { context: 'versionamento', meaning: 'uma versão estável é a publicada. Homônimo total.' },
    ], introducedIn: 'sorting.c1' },

  { id: 'comparator', canonical: 'comparador', canonicalLanguage: 'pt',
    alsoKnownAs: ['comparator', 'função de comparação'],
    definition: 'A função que decide, para dois elementos, qual vem antes, ou que eles empatam.',
    isNot: ['não devolve sim ou não: devolve antes, depois ou empate', 'não pode contradizer a si mesmo, se diz que x vem antes de y e y antes de z, tem de dizer que x vem antes de z'],
    falseFriends: [], introducedIn: 'sorting.c1' },

  { id: 'insertion-sort', canonical: 'insertion sort', canonicalLanguage: 'en',
    alsoKnownAs: ['ordenação por inserção'],
    definition: 'Percorre a coleção mantendo a parte à esquerda já ordenada, e insere cada elemento novo nessa parte.',
    isNot: ['não é o mesmo que selection sort, que procura o menor em vez de inserir o próximo'],
    falseFriends: [], introducedIn: 'sorting.c2' },

  { id: 'adaptive', canonical: 'adaptatividade', canonicalLanguage: 'pt',
    alsoKnownAs: ['adaptive sort'],
    definition: 'A propriedade de custar menos quando a entrada já chega com parte da ordem pronta.',
    isNot: ['não é caso médio, caso médio fala de entrada sorteada, adaptatividade fala de entrada já quase ordenada', 'não é uma garantia de pior caso'],
    falseFriends: [], introducedIn: 'sorting.c2' },

  { id: 'merge-sort', canonical: 'merge sort', canonicalLanguage: 'en',
    alsoKnownAs: ['ordenação por intercalação'],
    definition: 'Divide a coleção ao meio, ordena as duas metades e intercala as duas em uma.',
    isNot: ['não ordena no próprio array, a intercalação precisa de espaço à parte'],
    falseFriends: [], introducedIn: 'sorting.c3' },

  { id: 'merge', canonical: 'intercalação', canonicalLanguage: 'pt',
    alsoKnownAs: ['merge'],
    definition: 'Percorrer duas sequências já ordenadas tomando sempre o menor dos dois primeiros, até esgotar as duas.',
    isNot: ['não é concatenar e depois ordenar', 'não reordena nada: ela depende das duas entradas já estarem ordenadas'],
    falseFriends: [
      { context: 'Git', meaning: '`merge` junta históricos e resolve conflito de conteúdo. Não há ordem envolvida, e a operação não é comutativa como esta é.' },
      { context: 'banco de dados', meaning: '`MERGE` insere ou atualiza conforme a linha existir. Homônimo total.' },
    ], introducedIn: 'sorting.c3' },

  { id: 'quicksort', canonical: 'quicksort', canonicalLanguage: 'en',
    alsoKnownAs: ['ordenação por particionamento'],
    definition: 'Escolhe um pivô, separa a coleção em menores e maiores que ele, e repete nas duas partes.',
    isNot: ['não garante O(n log n), essa é a afirmação de caso médio, e o pior caso é O(n²)'],
    falseFriends: [], introducedIn: 'sorting.c4' },

  { id: 'pivot', canonical: 'pivô', canonicalLanguage: 'pt',
    alsoKnownAs: ['pivot'],
    definition: 'O elemento contra o qual todos os outros são comparados numa rodada de particionamento.',
    isNot: ['não precisa ser o menor nem o do meio, a escolha é livre, e é ela que decide o custo'],
    falseFriends: [
      { context: 'planilhas', meaning: 'tabela dinâmica, ou pivot table, agrega dados por categoria. Nenhuma relação.' },
    ], introducedIn: 'sorting.c4' },

  { id: 'partition', canonical: 'partição', canonicalLanguage: 'pt',
    alsoKnownAs: ['partition', 'particionamento'],
    definition: 'A separação da coleção em duas partes, uma com o que é menor que o pivô e outra com o que é maior.',
    isNot: ['não ordena nenhuma das partes, só garante que o pivô ficou no lugar final dele'],
    falseFriends: [
      { context: 'discos', meaning: 'partição de disco é uma divisão fixa de armazenamento. Homônimo total.' },
      { context: 'sistemas distribuídos', meaning: 'particionar dados é distribuí-los por máquina, quase sempre por hash da chave. Mesma palavra, e ali não há pivô nem ordem.' },
    ], introducedIn: 'sorting.c4' },

  { id: 'in-place', canonical: 'in-place', canonicalLanguage: 'en',
    alsoKnownAs: ['no próprio array', 'em memória constante'],
    definition: 'Ordenar rearranjando o próprio array, sem alocar outra coleção do tamanho da entrada.',
    isNot: ['não quer dizer espaço O(1): a pilha de chamadas de um algoritmo recursivo conta e cresce', 'não é o mesmo que estável, são garantias independentes'],
    falseFriends: [], introducedIn: 'sorting.c5' },

  { id: 'binary-search', canonical: 'busca binária', canonicalLanguage: 'pt',
    alsoKnownAs: ['binary search'],
    definition: 'Procurar numa coleção ordenada cortando metade das posições a cada comparação.',
    isNot: ['não funciona sem ordem, e a ordem tem de ser a mesma que o comparador da busca usa', 'não devolve a primeira ocorrência por padrão quando há chaves repetidas'],
    falseFriends: [], introducedIn: 'sorting.c6' },

  { id: 'timsort', canonical: 'Timsort', canonicalLanguage: 'en',
    alsoKnownAs: [],
    definition: 'A combinação de insertion sort em trechos pequenos com intercalação dos trechos, usada como ordenação padrão de várias linguagens.',
    isNot: ['não é um algoritmo novo, é a composição deliberada de dois que a unidade já viu'],
    falseFriends: [], introducedIn: 'sorting.c8' },
]

/**
 * A unidade 09. Fica fora do currículo, como a pré-trilha, e os termos dela
 * ficam no glossário do mesmo jeito: quem abre a unidade precisa do verbete.
 *
 * Forma canônica em inglês onde é o que o aluno encontra em código e em
 * documentação, `loss`, `gradient`, `learning rate`; em português onde a
 * palavra é nossa. `peso do neurônio` não reivindica `peso` nem `weight`, que
 * são do peso de aresta (`graphs.c1`); os dois se declaram falsos amigos.
 * Nenhum verbete usa "derivada": decisão 5 do spec.
 */
export const aiGlossary: GlossaryTerm[] = [
  { id: 'neuron', canonical: 'neurônio', canonicalLanguage: 'pt',
    alsoKnownAs: ['neuron'],
    definition: 'A conta básica de um modelo: cada entrada multiplicada pelo seu peso, os produtos somados ao bias, e a soma passada por uma activation function. Muitos deles ligados, a saída de um entrando em outro, formam uma rede.',
    isNot: ['não é uma célula do cérebro: o nome é uma analogia antiga, e a conta é só soma e produto', 'não decide sim ou não, devolve um número'],
    falseFriends: [], introducedIn: 'ai.c0' },

  { id: 'neuron-weight', canonical: 'peso do neurônio', canonicalLanguage: 'pt',
    alsoKnownAs: [],
    definition: 'O número que multiplica uma entrada na conta de um neurônio: quanto aquela entrada conta na soma. É o que o treino ajusta.',
    isNot: [
      'não é o peso de aresta de um grafo, que é dado do problema e ninguém ajusta',
      'não é escolhido por alguém: sai do treino, e por isso aparece num modelo pronto sem explicação',
      'não diz sozinho quanto move o resultado: isso é o gradient dele, e depende da entrada que ele multiplica',
    ],
    falseFriends: [
      { context: 'grafos, unidade 06', meaning: 'o peso de aresta é distância, duração ou custo, um dado do problema que nenhum laço ajusta. Em inglês os dois se chamam weight.' },
    ], introducedIn: 'ai.c0' },

  { id: 'bias', canonical: 'bias', canonicalLanguage: 'en',
    alsoKnownAs: ['viés'],
    definition: 'O número somado no fim da conta de um neurônio, em toda entrada, inclusive quando todas as entradas valem zero. Decide de onde a pontuação parte.',
    isNot: ['não multiplica entrada nenhuma', 'não é um preconceito do modelo'],
    falseFriends: [
      { context: 'estatística e ética de IA', meaning: 'o viés de um modelo é erro sistemático, ou resultado que prejudica um grupo. O bias do neurônio é um número somado à pontuação, e um modelo enviesado pode ter qualquer bias.' },
    ], introducedIn: 'ai.c0' },

  { id: 'activation-function', canonical: 'activation function', canonicalLanguage: 'en',
    alsoKnownAs: ['função de ativação'],
    definition: 'A regra que transforma a soma de um neurônio na saída dele. A tanh, por exemplo, leva qualquer soma para um número entre −1 e 1.',
    isNot: ['não é um if: a tanh devolve um grau, que muda quando a soma muda', 'não decide sim ou não; quem decide compara a saída com um limite, fora da conta'],
    falseFriends: [], introducedIn: 'ai.c1' },

  { id: 'loss', canonical: 'loss', canonicalLanguage: 'en',
    alsoKnownAs: ['função de perda', 'loss function'],
    definition: 'Um número só que mede o quanto a saída errou. A forma mais comum soma o quadrado de cada erro.',
    isNot: [
      'não é a soma dos erros com sinal, em que um erro para cima apaga um para baixo',
      'não é o custo de tempo de um algoritmo, o da unidade 02',
      'não diz o que mexer, só o quanto errou',
    ],
    falseFriends: [
      { context: 'redes de computadores', meaning: 'packet loss é a fração de pacotes que não chegou. Nenhuma relação com o erro de um modelo.' },
    ], introducedIn: 'ai.c2' },

  { id: 'gradient', canonical: 'gradient', canonicalLanguage: 'en',
    alsoKnownAs: ['gradiente', 'grad'],
    definition: 'Quanto o resultado muda se um número subir um pouco, com os outros parados, por unidade de empurrão. Cada número da conta tem o seu.',
    isNot: [
      'não é o valor do número: um peso pequeno pode ter gradient grande',
      'não é o efeito de uma conta só: é o efeito até o resultado final',
      'não é o tamanho do passo; o passo é learning rate vezes gradient',
    ],
    falseFriends: [
      { context: 'CSS', meaning: 'linear-gradient é uma transição de cor. Mesma palavra, nenhuma conta.' },
    ], introducedIn: 'ai.c3' },

  { id: 'local-impact', canonical: 'impacto local', canonicalLanguage: 'pt',
    alsoKnownAs: ['local gradient'],
    definition: 'Quanto uma conta só muda se um dos números que ela usa subir 1, com os outros parados. Numa soma, cada parcela tem impacto local 1; num produto, o impacto local de um fator é o valor do outro fator.',
    isNot: [
      'não é o gradient: diz quanto muda a conta seguinte, e o gradient diz quanto muda o resultado final, o produto dos impactos locais do caminho',
      'não é o valor do próprio número: num produto, é o valor do outro fator',
    ],
    falseFriends: [], introducedIn: 'ai.c4' },

  { id: 'chain-rule', canonical: 'regra da cadeia', canonicalLanguage: 'pt',
    alsoKnownAs: ['chain rule'],
    definition: 'Quando uma conta alimenta outra, o impacto de um número no resultado final é o produto dos impactos locais de cada conta no caminho.',
    isNot: ['não soma os impactos do caminho, multiplica', 'não exige refazer a conta inteira: usa o gradient do nó de cima, já pronto'],
    falseFriends: [], introducedIn: 'ai.c4' },

  { id: 'forward-pass', canonical: 'passada para frente', canonicalLanguage: 'pt',
    alsoKnownAs: ['forward pass'],
    definition: 'A execução da conta do começo ao fim que guarda o valor de cada nó. É a primeira das duas passadas da backpropagation.',
    isNot: [
      'não calcula gradient nenhum, só valores',
      'não é a conta refeita do gradient numérico: acontece uma vez, e o que importa nela é guardar os valores do meio',
    ],
    falseFriends: [], introducedIn: 'ai.c5' },

  { id: 'backward-pass', canonical: 'passada para trás', canonicalLanguage: 'pt',
    alsoKnownAs: ['backward pass'],
    definition: 'A volta do resultado até as entradas, em ordem reversa, que soma em cada nó o impacto local dele vezes o gradient do nó de cima. É a segunda das duas passadas da backpropagation.',
    isNot: [
      'não refaz a conta: usa os valores que a passada para frente guardou',
      'não escreve o gradient do zero: soma ao que já estava no nó',
      'não ajusta pesos: o passo é que consome o gradient que ela deixa',
    ],
    falseFriends: [], introducedIn: 'ai.c5' },

  { id: 'backpropagation', canonical: 'backpropagation', canonicalLanguage: 'en',
    alsoKnownAs: ['backprop', 'retropropagação'],
    definition: 'Uma passada para frente que guarda o valor de cada nó, e uma para trás que sai do resultado e aplica a regra da cadeia nó a nó, em ordem reversa, até as entradas. Entrega o gradient de todos os números em duas passadas.',
    isNot: [
      'não ajusta os pesos: entrega o gradient, e é o passo da gradient descent que consome esse gradient para decidir a direção e o tamanho do ajuste',
      'não funciona em conta com ciclo, porque não existe de trás para frente',
      'não sai de graça: guarda todo valor intermediário da passada para frente',
    ],
    falseFriends: [], introducedIn: 'ai.c5' },

  { id: 'learning-rate', canonical: 'learning rate', canonicalLanguage: 'en',
    alsoKnownAs: ['taxa de aprendizado', 'lr'],
    definition: 'O número que multiplica o gradient para dar o tamanho do passo: peso ← peso − learning rate × gradient.',
    isNot: ['não é quanto o modelo aprende por rodada: maior não chega antes, e pode passar do ponto', 'não é calculado pelo treino, é escolhido por quem o roda'],
    falseFriends: [], introducedIn: 'ai.c6' },

  { id: 'gradient-descent', canonical: 'gradient descent', canonicalLanguage: 'en',
    alsoKnownAs: ['descida de gradiente', 'gradiente descendente'],
    definition: 'O laço de treino: usar o gradient onde o peso está, dar um passo para o lado oposto, e repetir.',
    isNot: [
      'não calcula o gradient, usa o que a backpropagation entregou',
      'não garante chegar ao ponto em que o loss é mínimo: com passo grande ele passa do ponto e se afasta',
    ],
    falseFriends: [], introducedIn: 'ai.c6' },
]

/**
 * Terms whose false friends bite before their own unit exists. They carry
 * `introducedIn: PLANNED` and a `plannedIn` the validator cannot resolve yet
 *, and that fails the build as soon as the cycle it names starts to exist.
 */
export const plannedGlossary: GlossaryTerm[] = [
  { id: 'heap', canonical: 'heap', canonicalLanguage: 'en', alsoKnownAs: ['heap binário'],
    definition: 'Árvore binária quase completa em que todo nó respeita uma relação de ordem com os filhos.',
    isNot: ['não é árvore de busca', 'não acha elemento arbitrário melhor que O(n)'],
    falseFriends: [{ context: 'gerência de memória', meaning: 'a região de alocação dinâmica de um processo, nome coincidente, significado sem relação nenhuma.' }],
    introducedIn: 'planned', plannedIn: 'heaps.c0' },
]

export const PLANNED = 'planned'

/**
 * O vocabulário do próprio app.
 *
 * O glossário explicava os termos de computação e não explicava ciclo, banda,
 * armadilha, lacuna nem revisita, as palavras com que o app fala do aluno
 * para o aluno. Uma leitura de iniciante achou isso antes de mim: o produto
 * apresenta o vocabulário da matéria e assume o próprio. ADR-0019.
 *
 * `introducedIn` é APP porque estes termos não nascem num ciclo: eles nascem
 * na primeira tela. A checagem `glossário` trata esse valor à parte e exige
 * que nenhum ciclo os reivindique.
 */
export const APP = 'app'

export const appGlossary: GlossaryTerm[] = [
  { id: 'app.cycle', canonical: 'ciclo', canonicalLanguage: 'pt', alsoKnownAs: ['aula', 'lição'],
    definition: 'A menor unidade de estudo: uma frase de abertura, dois ou três parágrafos, um exemplo trabalhado e um exercício que fecha.',
    isNot: ['não é um capítulo, um ciclo cabe em poucos minutos', 'não termina sem exercício'],
    falseFriends: [{ context: 'grafos', meaning: 'na unidade de grafos, ciclo é um caminho que volta ao ponto de partida. Nada a ver com o ciclo de estudo.' }],
    introducedIn: APP },

  { id: 'app.band', canonical: 'banda', canonicalLanguage: 'pt', alsoKnownAs: ['trilho'],
    definition: 'Onde o ciclo fica no mapa da unidade: contrato, implementação ou custo, critério, técnica ou falha, quando a unidade é sobre um método.',
    isNot: ['não é dificuldade', 'não é ordem obrigatória de leitura'],
    falseFriends: [], introducedIn: APP },

  { id: 'app.criterion', canonical: 'critério de domínio', canonicalLanguage: 'pt', alsoKnownAs: ['critério'],
    definition: 'A lista de exercícios que precisam sair na primeira tentativa para a unidade contar como dominada.',
    isNot: ['não é nota', 'não é "fez todos os exercícios", é "resolveu estes sem ativar armadilha"'],
    falseFriends: [], introducedIn: APP },

  { id: 'app.trap', canonical: 'armadilha', canonicalLanguage: 'pt', alsoKnownAs: ['misconception', 'ideia errada'],
    definition: 'Um erro de raciocínio previsto, com nome, escrito no catálogo da unidade antes de você chegar. Toda alternativa incorreta aponta uma.',
    isNot: ['não é um erro seu, é um erro que o material esperava', 'não é bug de código'],
    falseFriends: [], introducedIn: APP },

  { id: 'app.gap', canonical: 'lacuna', canonicalLanguage: 'pt', alsoKnownAs: ['gap'],
    definition: 'Uma armadilha que você ativou e ainda não desarmou: falta resolver o exercício limpo numa revisita, depois do intervalo.',
    isNot: ['não é o mesmo que errar uma vez', 'não é uma nota baixa, é um item para revisitar'],
    falseFriends: [], introducedIn: APP },

  { id: 'app.revisit', canonical: 'revisita', canonicalLanguage: 'pt', alsoKnownAs: ['volta'],
    definition: 'Voltar a um ciclo já resolvido depois de um intervalo, para ver se o raciocínio ficou ou se só a resposta ficou.',
    isNot: ['não é refazer tudo', 'não é castigo por ter errado'],
    falseFriends: [], introducedIn: APP },

  { id: 'app.rank', canonical: 'faixa', canonicalLanguage: 'pt', alsoKnownAs: [],
    definition: 'O quanto você já consegue julgar, derivado das unidades dominadas, e nomeado por quem você já consegue ser: code reader, code tracer, complexity analyst, code reviewer, design reviewer.',
    isNot: [
      'não é nível, e não sobe por tempo de uso',
      'não é a banda do ciclo, que é onde ele fica no mapa',
      'a faixa "code tracer" não é o execution trace: uma é quem você já consegue ser, o outro é a tabela que você escreve no exercício',
    ],
    falseFriends: [], introducedIn: APP },

  { id: 'app.placement', canonical: 'sondagem', canonicalLanguage: 'pt', alsoKnownAs: ['nivelamento'],
    definition: 'Seis perguntas, uma por unidade, que recomendam por onde começar. As respostas contam como os exercícios que elas são.',
    isNot: ['não é prova e não tem nota', 'não bloqueia unidade nenhuma', 'não é a sondagem de probing, que é política de colisão da unidade 04'],
    falseFriends: [
      { context: 'tabelas hash', meaning: 'em open addressing, sondar é procurar a próxima posição livre. Mesma palavra, e é por isso que o glossário chama aquela de "sondagem linear".' },
    ], introducedIn: APP },

  { id: 'app.seal', canonical: 'selo de domínio', canonicalLanguage: 'pt', alsoKnownAs: ['selo'],
    definition: 'O carimbo que acende quando os exercícios do critério saem na primeira tentativa, e ganha uma marca a mais na consolidação.',
    isNot: ['não é troféu, e não existe selo de participação', 'não acende por ter visitado a unidade'],
    falseFriends: [], introducedIn: APP },

  { id: 'app.bestiary', canonical: 'bestiário', canonicalLanguage: 'pt', alsoKnownAs: ['caderno de armadilhas'],
    definition: 'A lista das armadilhas com o estado de cada uma: não encontrada, ativada, desarmada.',
    isNot: ['não é uma lista de leitura', 'ler a explicação não desarma nenhuma'],
    falseFriends: [], introducedIn: APP },

  { id: 'app.postmortem', canonical: 'postmortem', canonicalLanguage: 'en', alsoKnownAs: [],
    definition: 'O fechamento do último ciclo, que retoma o incidente da abertura da unidade e pergunta qual armadilha estava ali, qual afirmação de custo faltava, e o que teria pego isso.',
    isNot: ['não é um resumo da unidade', 'não é sobre culpa'],
    falseFriends: [{ context: 'operações', meaning: 'num time de infraestrutura, postmortem é o documento depois de um incidente em produção. É a mesma ideia, e é de propósito.' }],
    introducedIn: APP },

  { id: 'app.rung', canonical: 'degrau', canonicalLanguage: 'pt', alsoKnownAs: [],
    definition: 'Um dos três níveis da devolutiva: onde quebrou, qual campo, e a pergunta que ataca a raiz. São sempre os mesmos, para toda armadilha.',
    isNot: ['não é a escalation, que é do conteúdo e tem de uma a três tarefas dentro do terceiro degrau', 'nenhum degrau revela o valor correto'],
    falseFriends: [], introducedIn: APP },

  { id: 'app.escalation', canonical: 'escalation', canonicalLanguage: 'en', alsoKnownAs: ['tarefas da armadilha'],
    definition: 'As tarefas que a devolutiva entrega quando você erra, de uma a três, uma por tentativa. Esgotadas, o exercício encerra.',
    isNot: ['não é a resposta em partes, nenhuma delas revela o valor certo', 'não é ilimitada'],
    falseFriends: [], introducedIn: APP },
]

/**
 * Words a student meets meaning four different things. Registering one here
 * makes `falseFriends` mandatory for it, the rest of the glossary may leave
 * the field empty rather than invent an entry.
 */
export const OVERLOADED_TERMS = [
  'hash', 'heap', 'stack', 'bucket', 'chaining', 'load-factor', 'probing', 'clustering',
  'merge', 'partition', 'pivot', 'stability',
  'list', 'node', 'capacity', 'rotation', 'balancing', 'state', 'guard',
  'graph', 'edge', 'sparse', 'vertex', 'weight',
]

export const allTerms: GlossaryTerm[] = [
  ...appGlossary,
  ...preludeGlossary, ...tracingGlossary, ...asymptoticsGlossary, ...linearGlossary, ...hashGlossary,
  ...treesGlossary, ...graphsGlossary, ...sortingGlossary, ...synthesisGlossary,
  ...aiGlossary,
  ...plannedGlossary,
]
