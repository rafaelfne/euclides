import type { GlossaryTerm } from './schema'

/**
 * Canonical form is decided by one rule: whichever form the student will meet
 * in documentation, source code and posts. The rule produces a mixed table on
 * purpose — settled translations stay Portuguese, implementation terms of art
 * stay English, because that is how people actually speak.
 *
 * `isNot` is required by the schema. It is the negative space that stops one
 * word from quietly meaning four things.
 */
export const hashGlossary: GlossaryTerm[] = [
  { id: 'adt', canonical: 'tipo abstrato de dados', canonicalLanguage: 'pt',
    alsoKnownAs: ['TAD', 'abstract data type', 'ADT'],
    definition: 'O contrato: quais operações existem e o que cada uma garante.',
    isNot: ['não é uma estrutura de dados', 'não tem custo — custo pertence à implementação'],
    falseFriends: [], introducedIn: 'hash.c0' },

  { id: 'map', canonical: 'Map', canonicalLanguage: 'en',
    alsoKnownAs: ['mapa', 'dicionário', 'tabela de símbolos', 'associative array'],
    definition: 'Contrato que associa chave a valor e responde sobre uma chave por vez.',
    isNot: ['não promete ordem', 'não é sinônimo de tabela hash — hash é uma implementação dele'],
    falseFriends: [
      { context: 'Java', meaning: '`Map` é a interface; `HashMap` e `TreeMap` a implementam com garantias diferentes. O tipo declarado não revela o custo.' },
      { context: 'Ruby', meaning: '`Hash` é o nome da própria estrutura, equivalente ao `dict` do Python.' },
    ], introducedIn: 'hash.c0' },

  { id: 'hash', canonical: 'hash', canonicalLanguage: 'en',
    alsoKnownAs: ['tabela hash', 'hash table'],
    definition: 'Conforme o contexto: a função que mapeia chave em endereço, o valor que ela devolve, ou a estrutura inteira que usa esse valor como endereço.',
    isNot: ['não é sinônimo de Map — Map é o contrato, hash é uma forma de implementá-lo', 'não é criptografia: a função de hash de uma tabela não precisa ser irreversível nem resistente a colisão'],
    falseFriends: [
      { context: 'criptografia', meaning: 'SHA-256 e afins são hash com garantias de irreversibilidade e resistência a colisão. Uma tabela não precisa de nenhuma das duas, e pagaria caro por elas.' },
      { context: 'Git', meaning: 'o hash de um commit identifica conteúdo, não endereça um bucket. É hash criptográfico usado como identidade.' },
      { context: 'Ruby', meaning: '`Hash` é o nome da estrutura de dicionário — o contrato, não a política de endereçamento.' },
      { context: 'sistemas distribuídos', meaning: '“hash de partição” escolhe em qual máquina o dado mora. Mesma ideia, outra escala.' },
    ], introducedIn: 'hash.c1' },

  { id: 'hash-function', canonical: 'função de hash', canonicalLanguage: 'pt',
    alsoKnownAs: ['hash function'],
    definition: 'Mapeia uma chave de um domínio grande para um inteiro de um contradomínio pequeno e fixo.',
    isNot: ['não é o valor que ela produz', 'não é a estrutura de dados', 'não precisa ser segura nem irreversível'],
    falseFriends: [
      { context: 'criptografia', meaning: 'SHA-256 e bcrypt resolvem outro problema — resistência a colisão intencional e a pré-imagem — e custam ordens de grandeza mais por chamada.' },
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
    isNot: ['não é uma heurística — é uma demonstração'],
    falseFriends: [], introducedIn: 'hash.c2' },

  { id: 'bucket', canonical: 'bucket', canonicalLanguage: 'en',
    alsoKnownAs: ['balde', 'slot', 'entrada'],
    definition: 'Uma posição da tabela, que guarda zero ou mais pares.',
    isNot: ['não guarda exatamente um par — essa é a suposição que quebra em colisão'],
    falseFriends: [
      { context: 'object storage', meaning: 'um bucket do S3 é um contêiner nomeado de arquivos. Homônimo total: não há função de hash escolhendo em qual bucket o arquivo cai.' },
      { context: 'rate limiting', meaning: 'o token bucket é um algoritmo de vazão. A palavra vem da metáfora de balde que enche e esvazia, não de endereçamento.' },
    ], introducedIn: 'hash.c3' },

  { id: 'chaining', canonical: 'chaining', canonicalLanguage: 'en',
    alsoKnownAs: ['encadeamento', 'separate chaining', 'encadeamento separado'],
    definition: 'Política de colisão em que cada bucket guarda a lista dos pares que caíram ali.',
    isNot: ['não elimina colisão — apenas decide o que fazer com ela'],
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
    isNot: ['não é uma propriedade verificada — é uma hipótese sob a qual o custo médio vale'],
    falseFriends: [], introducedIn: 'hash.c4' },

  { id: 'rehash', canonical: 'rehash', canonicalLanguage: 'en',
    alsoKnownAs: ['redimensionamento', 'resize'],
    definition: 'Dobrar m e reinserir todos os pares, restaurando a invariante de posição.',
    isNot: ['não é copiar buckets', 'não elimina colisão — redistribui'],
    falseFriends: [], introducedIn: 'hash.c5' },

  { id: 'amortized', canonical: 'amortizado', canonicalLanguage: 'pt',
    alsoKnownAs: ['amortized'],
    definition: 'Custo médio por operação ao longo de uma sequência, quando operações caras são raras.',
    isNot: ['não é caso médio', 'não é uma média sobre entradas aleatórias — é sobre a sequência'],
    falseFriends: [], introducedIn: 'hash.c5' },

  { id: 'worst-case', canonical: 'pior caso', canonicalLanguage: 'pt',
    alsoKnownAs: ['worst case'],
    definition: 'O custo sobre a entrada mais desfavorável de um dado tamanho.',
    isNot: ['não é o custo típico', 'não é o custo que você vai medir em produção'],
    falseFriends: [], introducedIn: 'hash.c6' },

  { id: 'average-case', canonical: 'caso médio', canonicalLanguage: 'pt',
    alsoKnownAs: ['average case'],
    definition: 'O custo esperado sob uma distribuição declarada das entradas.',
    isNot: ['não vale sem a distribuição declarada', 'não é amortizado'],
    falseFriends: [], introducedIn: 'hash.c6' },

  { id: 'open-addressing', canonical: 'open addressing', canonicalLanguage: 'en',
    alsoKnownAs: ['endereçamento aberto'],
    definition: 'Política de colisão em que todos os pares moram no próprio array.',
    isNot: ['não tolera load factor alto', 'não permite deleção que apenas esvazia a posição'],
    falseFriends: [], introducedIn: 'hash.c7' },

  { id: 'probing', canonical: 'probing', canonicalLanguage: 'en',
    alsoKnownAs: ['sondagem', 'linear probing'],
    definition: 'A sequência de posições visitadas a partir do endereço inicial até achar espaço.',
    isNot: ['não é busca linear na tabela inteira — segue uma ordem determinada por h'],
    falseFriends: [
      { context: 'Kubernetes', meaning: 'liveness e readiness probe são checagens periódicas de saúde. Aqui probing é percorrer posições de um array.' },
      { context: 'monitoração', meaning: 'uma probe de rede mede latência. Nenhuma relação com sequência de sondagem.' },
    ], introducedIn: 'hash.c7' },

  { id: 'clustering', canonical: 'clustering', canonicalLanguage: 'en',
    alsoKnownAs: ['agrupamento', 'primary clustering'],
    definition: 'Posições ocupadas adjacentes que se fundem em blocos, alongando toda sondagem que cai neles.',
    isNot: ['não é colisão — é o efeito acumulado dela sob probing'],
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
    isNot: ['não é um problema teórico — é um vetor de negação de serviço documentado'],
    falseFriends: [], introducedIn: 'hash.c8' },
]

export const sortingGlossary: GlossaryTerm[] = [
  { id: 'sorting', canonical: 'ordenação', canonicalLanguage: 'pt',
    alsoKnownAs: ['sort', 'sorting'],
    definition: 'Devolver os mesmos elementos numa ordem em que nenhum vem antes de um menor, segundo o comparador dado.',
    isNot: ['não é uma estrutura — é um problema, e cada algoritmo é uma forma de resolvê-lo', 'não promete nada sobre elementos que comparam como iguais'],
    falseFriends: [], introducedIn: 'sorting.c0' },

  { id: 'permutation', canonical: 'permutação', canonicalLanguage: 'pt',
    alsoKnownAs: ['permutation'],
    definition: 'Os mesmos elementos, em outra ordem: nenhum entra, nenhum sai, nenhum duplica.',
    isNot: ['não é uma cópia com elementos trocados por outros', 'não permite descartar duplicata — ordenar não filtra'],
    falseFriends: [], introducedIn: 'sorting.c0' },

  { id: 'stability', canonical: 'estabilidade', canonicalLanguage: 'pt',
    alsoKnownAs: ['stable sort', 'ordenação estável'],
    definition: 'A garantia de que elementos que comparam como iguais saem na mesma ordem relativa em que entraram.',
    isNot: ['não fala de elementos diferentes — a ordem deles é a do comparador', 'não é uma propriedade do comparador, e sim do algoritmo'],
    falseFriends: [
      { context: 'sistemas', meaning: '“estável” como sinônimo de confiável ou sem falha. Aqui é uma garantia exata sobre ordem relativa, e um algoritmo instável não tem defeito nenhum.' },
      { context: 'versionamento', meaning: 'uma versão estável é a publicada. Homônimo total.' },
    ], introducedIn: 'sorting.c1' },

  { id: 'comparator', canonical: 'comparador', canonicalLanguage: 'pt',
    alsoKnownAs: ['comparator', 'função de comparação'],
    definition: 'A função que decide, para dois elementos, qual vem antes — ou que eles empatam.',
    isNot: ['não devolve sim ou não: devolve antes, depois ou empate', 'não pode contradizer a si mesmo — se diz que x vem antes de y e y antes de z, tem de dizer que x vem antes de z'],
    falseFriends: [], introducedIn: 'sorting.c1' },

  { id: 'insertion-sort', canonical: 'insertion sort', canonicalLanguage: 'en',
    alsoKnownAs: ['ordenação por inserção'],
    definition: 'Percorre a coleção mantendo a parte à esquerda já ordenada, e insere cada elemento novo nessa parte.',
    isNot: ['não é o mesmo que selection sort, que procura o menor em vez de inserir o próximo'],
    falseFriends: [], introducedIn: 'sorting.c2' },

  { id: 'adaptive', canonical: 'adaptatividade', canonicalLanguage: 'pt',
    alsoKnownAs: ['adaptive sort'],
    definition: 'A propriedade de custar menos quando a entrada já chega com parte da ordem pronta.',
    isNot: ['não é caso médio — caso médio fala de entrada sorteada, adaptatividade fala de entrada já quase ordenada', 'não é uma garantia de pior caso'],
    falseFriends: [], introducedIn: 'sorting.c2' },

  { id: 'merge-sort', canonical: 'merge sort', canonicalLanguage: 'en',
    alsoKnownAs: ['ordenação por intercalação'],
    definition: 'Divide a coleção ao meio, ordena as duas metades e intercala as duas em uma.',
    isNot: ['não ordena no próprio array — a intercalação precisa de espaço à parte'],
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
    isNot: ['não garante O(n log n) — essa é a afirmação de caso médio, e o pior caso é O(n²)'],
    falseFriends: [], introducedIn: 'sorting.c4' },

  { id: 'pivot', canonical: 'pivô', canonicalLanguage: 'pt',
    alsoKnownAs: ['pivot'],
    definition: 'O elemento contra o qual todos os outros são comparados numa rodada de particionamento.',
    isNot: ['não precisa ser o menor nem o do meio — a escolha é livre, e é ela que decide o custo'],
    falseFriends: [
      { context: 'planilhas', meaning: 'tabela dinâmica, ou pivot table, agrega dados por categoria. Nenhuma relação.' },
    ], introducedIn: 'sorting.c4' },

  { id: 'partition', canonical: 'partição', canonicalLanguage: 'pt',
    alsoKnownAs: ['partition', 'particionamento'],
    definition: 'A separação da coleção em duas partes, uma com o que é menor que o pivô e outra com o que é maior.',
    isNot: ['não ordena nenhuma das partes — só garante que o pivô ficou no lugar final dele'],
    falseFriends: [
      { context: 'discos', meaning: 'partição de disco é uma divisão fixa de armazenamento. Homônimo total.' },
      { context: 'sistemas distribuídos', meaning: 'particionar dados é distribuí-los por máquina, quase sempre por hash da chave. Mesma palavra, e ali não há pivô nem ordem.' },
    ], introducedIn: 'sorting.c4' },

  { id: 'in-place', canonical: 'in-place', canonicalLanguage: 'en',
    alsoKnownAs: ['no próprio array', 'em memória constante'],
    definition: 'Ordenar rearranjando o próprio array, sem alocar outra coleção do tamanho da entrada.',
    isNot: ['não quer dizer espaço O(1): a pilha de chamadas de um algoritmo recursivo conta e cresce', 'não é o mesmo que estável — são garantias independentes'],
    falseFriends: [], introducedIn: 'sorting.c5' },

  { id: 'binary-search', canonical: 'busca binária', canonicalLanguage: 'pt',
    alsoKnownAs: ['binary search'],
    definition: 'Procurar numa coleção ordenada cortando metade das posições a cada comparação.',
    isNot: ['não funciona sem ordem — e a ordem tem de ser a mesma que o comparador da busca usa', 'não devolve a primeira ocorrência por padrão quando há chaves repetidas'],
    falseFriends: [], introducedIn: 'sorting.c6' },

  { id: 'timsort', canonical: 'Timsort', canonicalLanguage: 'en',
    alsoKnownAs: [],
    definition: 'A combinação de insertion sort em trechos pequenos com intercalação dos trechos, usada como ordenação padrão de várias linguagens.',
    isNot: ['não é um algoritmo novo — é a composição deliberada de dois que a unidade já viu'],
    falseFriends: [], introducedIn: 'sorting.c8' },
]

/**
 * Terms whose false friends bite before their own unit exists. They carry
 * `introducedIn: PLANNED` and a `plannedIn` the validator cannot resolve yet
 * — and that fails the build as soon as the cycle it names starts to exist.
 */
export const plannedGlossary: GlossaryTerm[] = [
  { id: 'heap', canonical: 'heap', canonicalLanguage: 'en', alsoKnownAs: ['heap binário'],
    definition: 'Árvore binária quase completa em que todo nó respeita uma relação de ordem com os filhos.',
    isNot: ['não é árvore de busca', 'não acha elemento arbitrário melhor que O(n)'],
    falseFriends: [{ context: 'gerência de memória', meaning: 'a região de alocação dinâmica de um processo — nome coincidente, significado sem relação nenhuma.' }],
    introducedIn: 'planned', plannedIn: 'trees.c4' },
  { id: 'stack', canonical: 'pilha', canonicalLanguage: 'pt', alsoKnownAs: ['stack', 'LIFO'],
    definition: 'Contrato com inserção e remoção pela mesma extremidade.',
    isNot: ['não é uma implementação — array e lista ligada servem, com custos diferentes'],
    falseFriends: [
      { context: 'execução de programa', meaning: 'a call stack guarda os frames de chamada: é uma aplicação do contrato, não sinônimo dele.' },
      { context: 'infraestrutura', meaning: '“stack” como conjunto de tecnologias. Homônimo total.' },
    ], introducedIn: 'planned', plannedIn: 'linear.c2' },
]

export const PLANNED = 'planned'

/**
 * Words a student meets meaning four different things. Registering one here
 * makes `falseFriends` mandatory for it — the rest of the glossary may leave
 * the field empty rather than invent an entry.
 */
export const OVERLOADED_TERMS = [
  'hash', 'heap', 'stack', 'bucket', 'chaining', 'load-factor', 'probing', 'clustering',
  'merge', 'partition', 'pivot', 'stability',
]

export const allTerms: GlossaryTerm[] = [...hashGlossary, ...sortingGlossary, ...plannedGlossary]
