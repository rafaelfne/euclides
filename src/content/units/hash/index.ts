import type { Unit } from '../../schema'
import { hashExercises, hashMisconceptions } from './exercises'

export const hashUnit: Unit = {
  kind: 'structure',
  id: 'hash',
  number: 4,
  title: 'Tabelas Hash',
  learningObjective:
    'Prever quando uma tabela hash degrada, justificar a escolha dela contra alternativas ' +
    'para um caso concreto, e identificar em código gerado por IA as suposições implícitas ' +
    'que a fazem quebrar, tudo sem executar.',
  prerequisites: [
    'Notação O, e a distinção entre caso médio, pior caso e custo amortizado',
    'Array como bloco contíguo com acesso O(1) por índice',
    'Lista ligada e o custo de percorrê-la',
  ],
  motivatingProblem:
    'Dez milhões de e-mails cadastrados. A cada signup é preciso responder “esse e-mail já ' +
    'existe?” em tempo que não cresça com o cadastro. Array não ordenado responde em O(n); ' +
    'array ordenado responde em O(log n) mas insere em O(n). Nenhum dá O(1). ' +
    'Por que não dá, e o que teria que ser verdade para dar?',

  symbols: [
    { symbol: 'T', means: 'a tabela inteira' },
    { symbol: 'm', means: 'quantas posições a tabela tem' },
    { symbol: 'n', means: 'quantos pares estão guardados nela' },
    { symbol: 'h', means: 'a função que transforma uma chave em número' },
    { symbol: 'k, v', means: 'a chave e o valor de um par' },
    { symbol: 'α', means: 'a carga: pares guardados divididos por posições, ou n/m' },
    { symbol: 'i', means: 'a posição onde uma chave caiu' },
  ],

  adt: {
    id: 'map',
    name: 'Map',
    operations: [
      { name: 'inserir', signature: 'inserir(chave, valor)', guarantee: 'associa; se a chave já existe, substitui' },
      { name: 'contém',  signature: 'contém(chave)',         guarantee: 'sim ou não' },
      { name: 'obter',   signature: 'obter(chave)',          guarantee: 'o valor associado, ou NÃO_ENCONTRADO' },
      { name: 'remover', signature: 'remover(chave)',        guarantee: 'descarta o par, se existir' },
    ],
    answers: 'Perguntas sobre uma chave por vez.',
    cannotAnswer: [
      'Qual a menor ou a maior chave',
      'Quais chaves estão numa faixa',
      'Em que ordem as chaves foram inseridas',
      'Quais são as k primeiras chaves segundo qualquer critério',
    ],
  },

  implementations: [
    {
      id: 'chaining',
      name: 'Chaining',
      implementsAdt: 'map',
      summary: 'Cada bucket guarda a lista dos pares que colidiram ali.',
      cost: {
        inserir: { bound: 'O(1) amortizado', regime: 'average', amortized: true,
          assumptions: ['hashing uniforme', 'h(chave) custa O(1) no tamanho da chave'],
          measuredIn: 'n = pares armazenados; ignora |chave|' },
        contém: { bound: 'O(1)', regime: 'average', amortized: false,
          assumptions: ['hashing uniforme', 'h(chave) custa O(1) no tamanho da chave'],
          measuredIn: 'n = pares armazenados; ignora |chave|' },
        obter: { bound: 'O(1)', regime: 'average', amortized: false,
          assumptions: ['hashing uniforme'],
          measuredIn: 'n = pares armazenados' },
        remover: { bound: 'O(1)', regime: 'average', amortized: false,
          assumptions: ['hashing uniforme'],
          measuredIn: 'n = pares armazenados' },
      },
      space: { bound: 'O(n+m)', regime: 'worst', amortized: false,
        assumptions: [], measuredIn: 'n = pares, m = número de buckets' },
      wrongWhen: [
        { scenario: 'A consulta precisa de ordem: mínimo, máximo, faixa, ou os k primeiros',
          useInstead: 'BST balanceada, heap ou skip list' },
        { scenario: 'Índice em disco que responde consultas por faixa',
          useInstead: 'B-tree' },
        { scenario: 'As chaves são controladas por um adversário',
          useInstead: 'hash com semente aleatória por processo' },
        { scenario: 'n é pequeno, na casa das dezenas',
          useInstead: 'varredura linear em array, que ganha por localidade de cache' },
      ],
      everydayAnchor:
        'É por isso que o índice padrão do PostgreSQL é B-tree e não hash: índice hash ' +
        'responde “=” e nada mais. Quem já viu uma consulta com ORDER BY ignorar um índice ' +
        'viu esta limitação na prática.',
      invariant: 'Todo par (k, v) armazenado em bucket[i] satisfaz h(k) mod m = i.',
    },
    {
      id: 'open-addressing',
      name: 'Open addressing',
      implementsAdt: 'map',
      summary: 'Tudo mora no próprio array; em caso de colisão, sonda a próxima posição livre.',
      cost: {
        inserir: { bound: 'O(1) amortizado', regime: 'average', amortized: true,
          assumptions: ['hashing uniforme', 'load factor abaixo de 0,7'],
          measuredIn: 'n = pares armazenados' },
        contém: { bound: 'O(1)', regime: 'average', amortized: false,
          assumptions: ['load factor abaixo de 0,7, acima disso o clustering domina'],
          measuredIn: 'n = pares armazenados' },
        obter: { bound: 'O(1)', regime: 'average', amortized: false,
          assumptions: ['load factor abaixo de 0,7'],
          measuredIn: 'n = pares armazenados' },
        remover: { bound: 'O(1)', regime: 'average', amortized: false,
          assumptions: ['exige tombstone: esvaziar a posição interrompe a cadeia de sondagem'],
          measuredIn: 'n = pares armazenados' },
      },
      space: { bound: 'O(m)', regime: 'worst', amortized: false,
        assumptions: [], measuredIn: 'm = número de posições' },
      wrongWhen: [
        { scenario: 'O load factor passa de 0,7, a busca sem sucesso quadruplica entre 0,8 e 0,9',
          useInstead: 'chaining, que mal se mexe no mesmo intervalo' },
        { scenario: 'Remoções são frequentes e os tombstones se acumulam',
          useInstead: 'chaining' },
      ],
      everydayAnchor:
        'É a escolha das tabelas hash de linguagens que priorizam localidade de cache, ' +
        'e o motivo de elas redimensionarem muito antes de encher.',
      invariant:
        'Todo par ocupa a primeira posição livre a partir de h(k) mod m, seguindo a ordem de sondagem.',
    },
  ],

  cycles: [
    { id: 'hash.c0', title: 'O contrato, antes da estrutura', layer: 'essential', band: 'contract',
      introducesTerms: ['adt', 'map'],
      oneLine: "O Map associa chave a valor e não promete ordem nenhuma.",
      plainly:
        'Um cadastro precisa associar um e-mail ao perfil correspondente. Quem consulta quer passar ' +
        'o e-mail e receber o perfil; não quer saber em que ordem os cadastros chegaram nem qual é ' +
        'o menor e-mail. Antes de discutir como guardar, deixe claro qual pergunta o sistema precisa ' +
        'responder e quais perguntas ele pode recusar.',
      body: [
        'Antes de qualquer estrutura, o contrato. Um Map associa chave a valor e oferece 4 operações, e é tudo o que ele oferece.',
        'O que interessa aqui não é a lista de operações; é a lista do que o contrato NÃO cobre. Ordem não está lá. Nem mínimo, nem faixa, nem “os vinte primeiros”. Guarde essa ausência: no último ciclo ela volta como a resposta inteira.',
      ],
      workedExample: {
        problem: "Guarde 3 pares em um Map: \"b\"→1, \"a\"→2, \"c\"→3. Peça o valor de \"a\": 1 operação. Peça \"a menor chave\": nenhuma das 4 operações responde.",
        whatToNotice: "A ausência de ordem não é limitação de implementação, é o contrato. Guarde essa lista, ela é a resposta do último ciclo.",
      },
      exerciseId: 'hash.e0' },

    { id: 'hash.c1', title: 'A aposta: transformar chave em endereço', layer: 'essential', band: 'implementation', elaborates: 'chaining',
      introducesTerms: ['hash', 'hash-function'],
      oneLine: "Se a chave virar um índice, o acesso vira 1 operação.",
      plainly:
        'Procurar um e-mail entre milhões, um por um, é lento. A ideia é transformar o e-mail numa ' +
        'indicação de onde olhar, como usar um número de apartamento em vez de procurar em todas as ' +
        'portas. Se a indicação levar direto ao lugar certo, a busca deixa de depender da quantidade ' +
        'total de cadastros.',
      body: [
        'Acesso em O(1) só existe por índice. Se a chave virasse um índice, o problema estaria resolvido, e toda tabela hash é exatamente essa aposta.',
      ],
      pseudocode: 'índice ← h(chave) mod m',
      figure: {
        kind: 'hash-address',
        m: 8,
        keys: [3, 11, 19, 27],
        caption: 'Cada chave passa pela mesma conta e aponta para o bucket 3. O endereço reduz onde procurar; ele ainda não diz quantas chaves estarão naquele lugar.',
      },
      workedExample: {
        problem: 'Com m = 8 e h(k) = k, 3 mod 8 = 3, 11 mod 8 = 3, 19 mod 8 = 3 e 27 mod 8 = 3.',
        whatToNotice: 'As quatro chaves viram o mesmo endereço. O índice determina onde procurar; ainda não determina quantas comparações haverá ali.',
      },
      exerciseId: 'hash.e1a' },

    { id: 'hash.c2', title: 'Colisão é matemática, não defeito', layer: 'essential', band: 'implementation', elaborates: 'chaining',
      introducesTerms: ['collision', 'pigeonhole'],
      oneLine: "Com 4 buckets e 5 chaves, duas colidem. Não há h que evite isso.",
      plainly:
        'Você tem quatro gavetas e precisa guardar cinco documentos. Mesmo que escolha os números ' +
        'das gavetas com cuidado, dois documentos terão de dividir uma delas. Isso não é falha do ' +
        'cálculo nem azar dos documentos: há mais coisas para guardar do que destinos possíveis. O ' +
        'sistema precisa decidir o que fazer quando isso acontece.',
      body: [
        'Quantas strings existem? Quantos buckets você tem? Com 1000 buckets e 1001 chaves distintas, pelo menos 2 caem no mesmo lugar, e isso vale para qualquer h que se escreva.',
        'Isso muda o problema: não se trata de evitar colisão, e sim de decidir o que fazer quando ela ocorre.',
      ],
      workedExample: {
        problem: "Existem infinitas strings possíveis e uma tabela tem, digamos, 1000 buckets. Guardando 1001 chaves distintas, pelo menos duas caem no mesmo bucket, para qualquer h que se escreva.",
        whatToNotice: "Repare que o argumento não olha para a função h. Colisão é consequência de contar, não de escolher mal.",
      },
      exerciseId: 'hash.e1b' },

    { id: 'hash.c3', title: 'Chaining e a invariante de posição', layer: 'essential', band: 'implementation', elaborates: 'chaining',
      introducesTerms: ['bucket', 'chaining', 'position-invariant'],
      oneLine: "Todo par no bucket i satisfaz h(k) mod m = i, e é isso que o rehash quebra.",
      plainly:
        'Você tem os e-mails já cadastrados e precisa responder "esse e-mail já existe?" sem ' +
        'percorrer todos. A saída é calcular, a partir do próprio e-mail, um número que diz ' +
        'onde procurar. Dois e-mails diferentes podem dar o mesmo número; quando isso ' +
        'acontece, aquele lugar guarda os dois e a busca compara um por um só ali dentro. A ' +
        'conta que escolhe o lugar é sempre uma; o que varia é quantos vizinhos caíram no ' +
        'mesmo lugar.',
      body: [
        'Cada bucket guarda a lista dos pares que colidiram ali. A busca calcula o endereço 1 vez e depois compara chaves dentro do bucket, 3 chaves no bucket são 3 comparações.',
        'Há uma regra simples: uma chave precisa continuar no bucket indicado pela conta. A escrita h(k) mod m = i apenas registra essa regra; ela recebe o nome de invariante de posição.',
      ],
      pseudocode: `função buscar(T, chave)
    i ← h(chave) mod T.m
    para cada (k, v) em T.bucket[i] faça
        se k = chave então retorne v    // primeira ocorrência vence
    retorne NÃO_ENCONTRADO`,
      invariant: 'Todo par (k, v) em bucket[i] satisfaz h(k) mod m = i.',
      figure: {
        kind: 'buckets',
        m: 4,
        keys: [3, 7, 11],
        searchFor: 11,
        caption: 'Três chaves, um endereço só: 3, 7 e 11 deixam resto 3 na divisão por 4, e por isso ocupam o mesmo bucket. Nada aí está errado, o endereço leva ao bucket em uma operação, e é dentro dele que a busca compara chave por chave. Repare que os outros três buckets estão vazios: a colisão não é a tabela cheia, é a função levando chaves diferentes ao mesmo lugar.',
      },
      workedExample: {
        problem: 'Busca por 11 com m = 4 e o bucket 3 contendo [3, 7, 11].',
        whatToNotice: 'O endereço custa uma operação; as comparações de chave são três. Repare no que o endereço resolve e no que ele não resolve.',
      },
      exerciseId: 'hash.e1c' },

    { id: 'hash.c4', title: 'Load factor: pares por bucket', layer: 'essential', band: 'cost',
      introducesTerms: ['load-factor'],
      oneLine: "Com m = 1000 e n = 750, α é 0,75 e centenas de buckets ainda estão vazios.",
      plainly:
        'Uma tabela pode ter mil lugares e setecentos e cinquenta pares guardados. Em média, ela ' +
        'ainda está folgada, embora muitas posições estejam vazias e algumas já tenham mais de um ' +
        'par. O número útil não é só quantos pares existem nem só quantos lugares existem: é quanto ' +
        'um está ocupando do outro.',
      body: [
        'O load factor é a razão α = n/m entre pares armazenados e posições disponíveis. Com chaining ele pode passar de 1 sem que nada quebre.',
        'Ele não diz quantos buckets estão ocupados. Se dois pares caem juntos, um bucket continua vazio. O número serve para decidir quando a tabela precisa crescer.',
      ],
      workedExample: {
        problem: "Com 4 buckets e 3 pares, α = 3/4 = 0,75. Se dois pares colidem, apenas 2 buckets ficam ocupados e os outros 2 continuam vazios.",
        whatToNotice: "α = 0,75 significa três pares para quatro buckets. Não significa que 75% dos buckets estão ocupados.",
      },
      exerciseId: 'hash.e3' },

    { id: 'hash.c5', title: 'Rehash e o custo amortizado', layer: 'essential', band: 'implementation', elaborates: 'chaining',
      introducesTerms: ['rehash'],
      oneLine: "Ao inserir o 4, a tabela passa de 4 para 8 buckets e recalcula os endereços.",
      plainly:
        'Uma tabela passou de 4 para 8 buckets. Não basta manter cada par no mesmo bucket: ' +
        'o endereço anterior dependia do número 4. Com 8 buckets, cada chave precisa ter o endereço ' +
        'calculado novamente. É caro naquele momento, mas não acontece a cada inserção.',
      body: [
        'Quando a próxima inserção passaria do limite, a tabela dobra, por exemplo de 4 para 8 buckets. Como o endereço usa m, mudar m exige calcular novamente o endereço de cada chave. Esse trabalho recebe o nome de rehash.',
        'Uma inserção com rehash é cara, mas as inserções anteriores foram baratas. Espalhar esse custo pela sequência é a análise amortizada vista na unidade anterior.',
      ],
      pseudocode: `função inserir(T, chave, valor)
    se (T.n + 1) / T.m > LIMITE então
        redimensionar(T, 2 × T.m)
    i ← h(chave) mod T.m
    para cada (k, v) em T.bucket[i] faça
        se k = chave então
            v ← valor
            retorne                     // atualiza, não insere
    anexar (chave, valor) em T.bucket[i]
    T.n ← T.n + 1`,
      invariant: 'Após qualquer redimensionamento, toda chave inserida continua encontrável.',
      workedExample: {
        problem: 'Com m = 4 e LIMITE = 0,75, insira 3, 7, 11 e depois 4.',
        whatToNotice: 'O rehash separa o 7 de 3 e 11, mas mantém 3 e 11 juntos, ambos permanecem congruentes módulo 8. Redistribuir não é eliminar colisão.',
      },
      exerciseId: 'hash.e1' },

    { id: 'hash.c6', title: 'Quando a busca deixa de custar constante', layer: 'essential', band: 'cost',
      introducesTerms: ['uniform-hashing'],
      oneLine: "Com 5 chaves no mesmo bucket, buscar a última exige 5 comparações.",
      plainly:
        'A tabela chega ao bucket em um passo, mas ainda compara as chaves que estão dentro dele. ' +
        'Quando as chaves ficam bem espalhadas, essa lista costuma ser curta. Quando muitas caem ' +
        'juntas, a lista cresce e a busca cresce com ela.',
      body: [
        'Por isso a afirmação útil é: buscar custa O(1) no caso médio quando as chaves ficam bem distribuídas. A hipótese “chaves bem distribuídas” recebe o nome de hashing uniforme.',
        'No pior caso, as n chaves caem no mesmo bucket e a busca custa O(n). Primeiro escolha o caso que precisa garantir; depois escreva o custo.',
      ],
      workedExample: {
        problem: "As duas tabelas recebem as chaves 0, 1, 2, 3, 4, 5, 6 e 7. Com h(k) = k mod 8, cada chave ocupa um bucket. Com h(k) = 0, todas ocupam o bucket 0.",
        whatToNotice: "As chaves e o tamanho são iguais. Buscar 7 faz 1 comparação na primeira tabela e 8 na segunda. Só a função mudou.",
      },
      figure: {
        kind: 'bucket-comparison',
        m: 8,
        cases: [
          { label: 'chaves espalhadas', keys: [0, 1, 2, 3, 4, 5, 6, 7], searchFor: 7, hash: 'mod' },
          { label: 'chaves concentradas', keys: [0, 1, 2, 3, 4, 5, 6, 7], searchFor: 7, hash: 'zero' },
        ],
        caption: 'As duas tabelas têm as mesmas 8 chaves. A função de hash muda a distribuição e o número de comparações dentro do bucket.',
      },
      exerciseId: 'hash.e2a' },

    { id: 'hash.c7', title: 'Open addressing e a deleção que apaga demais', layer: 'deep-dive', band: 'implementation', elaborates: 'open-addressing',
      introducesTerms: ['open-addressing', 'probing', 'clustering', 'tombstone'],
      oneLine: "Se 3 chaves querem a posição 0, elas ocupam 0, 1 e 2.",
      plainly:
        'Três chaves querem a posição 0. A primeira ocupa 0; as seguintes procuram 1 e 2 no próprio ' +
        'array. Quando o lugar calculado já está ocupado, a tabela ' +
        'procura o próximo disponível. Isso evita listas separadas, mas deixa marcas no caminho. Se ' +
        'apagar um item simplesmente esvaziando a posição, uma busca pode parar cedo e concluir que ' +
        'um item posterior não existe.',
      body: [
        'Open addressing resolve a colisão procurando outra posição no próprio array: depois da posição 0, tenta 1 e então 2. Essa sequência recebe o nome de probing.',
        'Uma remoção não pode apenas deixar um buraco. A busca interpretaria o vazio como fim do caminho. Um tombstone marca que a busca deve continuar; muitos trechos ocupados juntos formam clustering e alongam o caminho.',
      ],
      workedExample: {
        problem: 'Com m = 8, insira 8, 16 e 24 por linear probing e depois esvazie a posição 1.',
        whatToNotice: 'As chaves ocupam 0, 1 e 2. Ao encontrar a posição 1 vazia, a busca para antes de chegar ao 24 na posição 2.',
      },
      exerciseId: 'hash.e7' },

    { id: 'hash.c8', title: 'Quando a tabela hash é a escolha errada', layer: 'essential', band: 'cost',
      introducesTerms: ['hash-flooding'],
      oneLine: "Encontrar um e-mail exato é uma pergunta; listar um intervalo de datas é outra.",
      plainly:
        'Uma tabela é ótima para responder se uma chave exata existe. Ela não ajuda a listar todos ' +
        'os pedidos entre duas datas, nem a devolver os primeiros cem em ordem. E, se alguém escolhe ' +
        'as chaves de propósito para fazê-las cair no mesmo lugar, a busca deixa de ser curta. A ' +
        'estrutura certa depende da pergunta e de quem controla a entrada.',
      body: [
        'Volte às 4 operações do primeiro ciclo. Elas recebem uma chave exata; nenhuma pede o próximo item, um intervalo ou os primeiros itens em ordem. A tabela não falhou: essas perguntas nunca fizeram parte do contrato.',
        'Há outra fronteira independente da ordem. Se quem envia as chaves consegue produzir muitas colisões, uma busca curta pode virar uma busca longa. Essa escolha deliberada recebe o nome de hash flooding.',
      ],
      workedExample: {
        problem: "Para obter os 20 usuários mais recentes de um Map com 50 mil pares, é preciso percorrer os 50 mil e ordenar os candidatos.",
        whatToNotice: "A estrutura não está lenta, ela está respondendo uma pergunta que o contrato dela nunca prometeu. Compare com a lista de ausências do ciclo 0.",
      },
      postmortem: {
        incident: "Volte aos dez milhões de e-mails e à pergunta \"esse e-mail já existe?\" a cada signup.",
        trapId: "hash.o1-sem-qualificar",
        missingClaim: "os quatro qualificadores. \"O(1)\" sozinho não diz que é amortizado, nem que supõe hashing uniforme, nem que ignora o custo de hashear a chave.",
        whatWouldCatch: "Perguntar quem escolhe as chaves. Vindo de fora, o caso médio deixa de descrever o que vai acontecer.",
      },
      exerciseId: 'hash.e5' },
  ],

  misconceptions: hashMisconceptions,

  exercises: hashExercises,

  mastery: {
    statement:
      'O aluno domina esta unidade quando, diante de uma implementação de tabela hash que ' +
      'nunca viu, consegue em menos de cinco minutos e sem executar: nomear a política de ' +
      'resolução de colisão, dizer qual load factor a degrada, apontar a operação que dispara ' +
      'o rehash, e construir uma entrada concreta que a leve a O(n).',
    requiresClean: ['hash.e1', 'hash.e3'],
    revisitIntervalDays: 7,
  },
}
