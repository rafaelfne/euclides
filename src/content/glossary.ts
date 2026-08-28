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
export const glossary: GlossaryTerm[] = [
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
    falseFriends: [], introducedIn: 'hash.c3' },

  { id: 'chaining', canonical: 'chaining', canonicalLanguage: 'en',
    alsoKnownAs: ['encadeamento', 'separate chaining', 'encadeamento separado'],
    definition: 'Política de colisão em que cada bucket guarda a lista dos pares que caíram ali.',
    isNot: ['não elimina colisão — apenas decide o que fazer com ela'],
    falseFriends: [], introducedIn: 'hash.c3' },

  { id: 'position-invariant', canonical: 'invariante de posição', canonicalLanguage: 'pt',
    alsoKnownAs: [],
    definition: 'Todo par (k, v) armazenado no bucket i satisfaz h(k) mod m = i.',
    isNot: ['não sobrevive a uma mudança de m sem reinserção'],
    falseFriends: [], introducedIn: 'hash.c3' },

  { id: 'load-factor', canonical: 'load factor', canonicalLanguage: 'en',
    alsoKnownAs: ['fator de carga', 'α'],
    definition: 'A razão n/m entre pares armazenados e número de posições.',
    isNot: ['não é a fração da memória ocupada', 'não é limitado a 1 com chaining', 'não é a probabilidade de colisão'],
    falseFriends: [], introducedIn: 'hash.c4' },

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
    falseFriends: [], introducedIn: 'hash.c7' },

  { id: 'clustering', canonical: 'clustering', canonicalLanguage: 'en',
    alsoKnownAs: ['agrupamento', 'primary clustering'],
    definition: 'Posições ocupadas adjacentes que se fundem em blocos, alongando toda sondagem que cai neles.',
    isNot: ['não é colisão — é o efeito acumulado dela sob probing'],
    falseFriends: [], introducedIn: 'hash.c7' },

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

/** `heap` and `stack` live here already because their false friends bite early. */
export const crossUnitGlossary: GlossaryTerm[] = [
  { id: 'heap', canonical: 'heap', canonicalLanguage: 'en', alsoKnownAs: ['heap binário'],
    definition: 'Árvore binária quase completa em que todo nó respeita uma relação de ordem com os filhos.',
    isNot: ['não é árvore de busca', 'não acha elemento arbitrário melhor que O(n)'],
    falseFriends: [{ context: 'gerência de memória', meaning: 'a região de alocação dinâmica de um processo — nome coincidente, significado sem relação nenhuma.' }],
    introducedIn: 'trees.c4' },
  { id: 'stack', canonical: 'pilha', canonicalLanguage: 'pt', alsoKnownAs: ['stack', 'LIFO'],
    definition: 'Contrato com inserção e remoção pela mesma extremidade.',
    isNot: ['não é uma implementação — array e lista ligada servem, com custos diferentes'],
    falseFriends: [
      { context: 'execução de programa', meaning: 'a call stack guarda os frames de chamada: é uma aplicação do contrato, não sinônimo dele.' },
      { context: 'infraestrutura', meaning: '“stack” como conjunto de tecnologias. Homônimo total.' },
    ], introducedIn: 'linear.c2' },
]
