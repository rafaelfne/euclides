import type { Unit } from '../../schema'

export const hashUnit: Unit = {
  id: 'hash',
  number: 4,
  title: 'Tabelas Hash',
  learningObjective:
    'Prever quando uma tabela hash degrada, justificar a escolha dela contra alternativas ' +
    'para um caso concreto, e identificar em código gerado por IA as suposições implícitas ' +
    'que a fazem quebrar — tudo sem executar.',
  prerequisites: [
    'Notação O, e a distinção entre caso médio, pior caso e custo amortizado',
    'Array como bloco contíguo com acesso O(1) por índice',
    'Lista ligada e o custo de percorrê-la',
  ],
  motivatingProblem:
    'Dez milhões de e-mails cadastrados. A cada signup é preciso responder “esse e-mail já ' +
    'existe?” em tempo que não cresça com o cadastro. Array não ordenado responde em O(n); ' +
    'array ordenado responde em O(log n) mas insere em O(n). Nenhum dá O(1). ' +
    'Por que não dá — e o que teria que ser verdade para dar?',

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
          assumptions: ['load factor abaixo de 0,7 — acima disso o clustering domina'],
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
        { scenario: 'O load factor passa de 0,7 — a busca sem sucesso quadruplica entre 0,8 e 0,9',
          useInstead: 'chaining, que mal se mexe no mesmo intervalo' },
        { scenario: 'Remoções são frequentes e os tombstones se acumulam',
          useInstead: 'chaining' },
      ],
      everydayAnchor:
        'É a escolha das tabelas hash de linguagens que priorizam localidade de cache — ' +
        'e o motivo de elas redimensionarem muito antes de encher.',
      invariant:
        'Todo par ocupa a primeira posição livre a partir de h(k) mod m, seguindo a ordem de sondagem.',
    },
  ],

  cycles: [
    { id: 'hash.c0', title: 'O contrato, antes da estrutura', layer: 'essential', band: 'contract',
      introducesTerms: ['adt', 'map'],
      body: [
        'Antes de qualquer estrutura, o contrato. Um Map associa chave a valor e oferece quatro operações — e é tudo o que ele oferece.',
        'O que interessa aqui não é a lista de operações; é a lista do que o contrato NÃO cobre. Ordem não está lá. Nem mínimo, nem faixa, nem “os vinte primeiros”. Guarde essa ausência: no último ciclo ela volta como a resposta inteira.',
      ],
      exerciseId: 'hash.e0' },

    { id: 'hash.c1', title: 'A aposta: transformar chave em endereço', layer: 'essential', band: 'implementation', implementationId: 'chaining',
      introducesTerms: ['hash-function'],
      body: [
        'Acesso em O(1) só existe por índice. Se a chave virasse um índice, o problema estaria resolvido — e toda tabela hash é exatamente essa aposta.',
      ],
      pseudocode: 'índice ← h(chave) mod m',
      workedExample: {
        problem: 'Com m = 8 e h(k) = k, calcule o endereço de 3, 11, 19 e 27.',
        whatToNotice: 'Os quatro caem no mesmo endereço. Isso não é azar — é o que acontece quando o domínio é maior que o contradomínio.',
      },
      exerciseId: 'hash.e1a' },

    { id: 'hash.c2', title: 'Colisão é matemática, não defeito', layer: 'essential', band: 'implementation', implementationId: 'chaining',
      introducesTerms: ['collision', 'pigeonhole'],
      body: [
        'Quantas strings existem? Quantos buckets você tem? A resposta à segunda pergunta é finita e a da primeira não é, o que torna a colisão inevitável para qualquer h.',
        'Isso muda o problema: não se trata de evitar colisão, e sim de decidir o que fazer quando ela ocorre.',
      ],
      exerciseId: 'hash.e1b' },

    { id: 'hash.c3', title: 'Chaining e a invariante de posição', layer: 'essential', band: 'implementation', implementationId: 'chaining',
      introducesTerms: ['bucket', 'chaining', 'position-invariant'],
      body: [
        'Cada bucket guarda a lista dos pares que colidiram ali. A busca calcula o endereço uma vez e depois compara chaves dentro do bucket.',
        'A propriedade que sustenta tudo o que vem depois é discreta: todo par armazenado no bucket i satisfaz h(k) mod m = i. Guarde essa frase — ela é o motivo de o rehash precisar reinserir em vez de copiar.',
      ],
      pseudocode: `função buscar(T, chave)
    i ← h(chave) mod T.m
    para cada (k, v) em T.bucket[i] faça
        se k = chave então retorne v    // primeira ocorrência vence
    retorne NÃO_ENCONTRADO`,
      invariant: 'Todo par (k, v) em bucket[i] satisfaz h(k) mod m = i.',
      workedExample: {
        problem: 'Busca por 11 com m = 4 e o bucket 3 contendo [3, 7, 11].',
        whatToNotice: 'O endereço custa uma operação; as comparações de chave são três. Repare no que o endereço resolve e no que ele não resolve.',
      },
      exerciseId: 'hash.e1c' },

    { id: 'hash.c4', title: 'Load factor', layer: 'essential', band: 'cost',
      introducesTerms: ['load-factor', 'uniform-hashing'],
      body: [
        'O load factor é a razão α = n/m entre pares armazenados e posições disponíveis. Com chaining ele pode passar de 1 sem que nada quebre.',
        'Ele não mede quanto da memória está ocupada. Numa tabela com m = 1000 e n = 750, estime quantos buckets estão vazios antes de calcular — e depois calcule.',
      ],
      exerciseId: 'hash.e2a' },

    { id: 'hash.c5', title: 'Rehash e o custo amortizado', layer: 'essential', band: 'implementation', implementationId: 'chaining',
      introducesTerms: ['rehash', 'amortized'],
      body: [
        'Quando α passa do limite, a tabela dobra e reinsere. Reinsere, não copia: mudar m quebra a invariante de posição para todos os pares ao mesmo tempo.',
        'O rehash custa O(n+m) pontualmente. Como ele acontece a cada duplicação, o custo por inserção continua constante quando espalhado ao longo da sequência.',
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
        whatToNotice: 'O rehash separa o 7 de 3 e 11, mas mantém 3 e 11 juntos — ambos permanecem congruentes módulo 8. Redistribuir não é eliminar colisão.',
      },
      exerciseId: 'hash.e1' },

    { id: 'hash.c6', title: 'O custo, com todos os qualificadores', layer: 'essential', band: 'cost',
      introducesTerms: ['worst-case', 'average-case'],
      body: [
        'A frase “hash é O(1)” omite quatro coisas: o regime, a hipótese de hashing uniforme, a amortização vinda do rehash, e o que n mede — porque ela ignora o custo de hashear a própria chave.',
        'Neste ciclo cada um dos quatro é nomeado, e você reescreve a afirmação de forma que ela sobreviva a uma code review.',
      ],
      exerciseId: 'hash.e3' },

    { id: 'hash.c7', title: 'Open addressing e a deleção que apaga demais', layer: 'deep-dive', band: 'implementation', implementationId: 'open-addressing',
      introducesTerms: ['open-addressing', 'probing', 'clustering', 'tombstone'],
      body: [
        'Outra implementação do mesmo contrato, com perfil oposto: sem ponteiros, melhor localidade de cache, e degradação muito mais abrupta.',
        'Entre α = 0,8 e α = 0,9 a busca sem sucesso vai de 12,5 para 48,1 sondagens medidas, enquanto o chaining sai de 1,40 para 1,45. E remover não pode esvaziar a posição: isso interrompe a cadeia de sondagem e some com o que veio depois.',
      ],
      exerciseId: 'hash.e7' },

    { id: 'hash.c8', title: 'Quando a tabela hash é a escolha errada', layer: 'essential', band: 'cost',
      introducesTerms: ['hash-flooding'],
      body: [
        'Volte ao contrato do primeiro ciclo. Tudo que o Map não promete é exatamente onde esta estrutura falha — e a lista de ausências que você guardou lá é a resposta inteira deste ciclo.',
      ],
      exerciseId: 'hash.e5' },
  ],

  misconceptions: [
    { id: 'hash.o1-sem-qualificar', label: '“Hash é O(1)” sem qualificar',
      socraticQuestion: 'Construa uma sequência de cinco chaves que caem no mesmo bucket. Qual o custo da busca depois disso?',
      ladder: ['Você acabou de construir o pior caso. Ele contradiz a afirmação, ou ela estava incompleta desde o começo?'],
      reviewCycle: 'hash.c6' },
    { id: 'hash.colisao-e-bug', label: 'Colisão tratada como defeito da função',
      socraticQuestion: 'Quantas strings existem? Quantos buckets você tem?',
      ladder: ['Uma função de um conjunto infinito para um conjunto finito pode ser injetiva?'],
      reviewCycle: 'hash.c2' },
    { id: 'hash.rehash-copia-buckets', label: 'Rehash copia buckets em vez de reinserir',
      socraticQuestion: 'Reescreva a invariante de posição trocando m por 2m. Ela continua valendo para os pares que você copiou?',
      ladder: [
        'Pegue uma chave concreta que estava no bucket 3 com m = 4. Onde ela deveria estar com m = 8?',
        'Note que algumas chaves continuam encontráveis e outras não. Por que o defeito é parcial — e o que isso significa para o seu teste manual?',
      ],
      reviewCycle: 'hash.c5' },
    { id: 'hash.duplicata-inofensiva', label: 'Duplicata tratada como inofensiva',
      socraticQuestion: 'Se n passa a contar duplicatas, o que acontece com α?',
      ladder: ['E se α infla antes da hora, o que dispara antes da hora?'],
      reviewCycle: 'hash.c3' },
    { id: 'hash.load-factor-memoria', label: 'Load factor confundido com ocupação de memória',
      socraticQuestion: 'Numa tabela com m = 1000 e n = 750, estime quantos buckets estão vazios antes de calcular. Depois calcule — as duas coisas são a mesma?',
      ladder: ['Com chaining, dois pares podem morar no mesmo bucket. Isso muda a relação entre α e posições ocupadas?'],
      reviewCycle: 'hash.c4' },
    { id: 'hash.delecao-ingenua', label: 'Deleção que esvazia a posição em open addressing',
      socraticQuestion: 'Você esvaziou a posição 5. O item da posição 6 chegou lá sondando a partir da 5. Como a busca vai encontrá-lo agora?',
      ladder: ['O que precisaria ficar na posição 5 para a sondagem não parar ali?'],
      reviewCycle: 'hash.c7' },
    { id: 'hash.ordem', label: 'Tabela hash usada onde a consulta precisa de ordem',
      socraticQuestion: 'Escreva “os vinte mais antigos” usando apenas as quatro operações do contrato Map. Qual o custo?',
      ladder: ['Se a única saída é varrer tudo, o contrato cobre essa pergunta ou você está pedindo algo que ele nunca prometeu?'],
      reviewCycle: 'hash.c8' },
  ],

  exercises: [
    {
      kind: 'trace', id: 'hash.e1',
      prompt: 'Com m = 4, h(k) = k e LIMITE = 0,75, insira 3, 7, 11, 4 e 8. Preencha o estado a cada passo.',
      pseudocode: `função inserir(T, chave, valor)
    se (T.n + 1) / T.m > LIMITE então
        redimensionar(T, 2 × T.m)
    i ← h(chave) mod T.m
    anexar (chave, valor) em T.bucket[i]
    T.n ← T.n + 1`,
      invariant: 'Todo par (k, v) em bucket[i] satisfaz h(k) mod m = i.',
      columns: [
        { key: 'step', label: 'passo' }, { key: 'key', label: 'chave' },
        { key: 'rehash', label: 'rehash?' }, { key: 'n', label: 'n' },
        { key: 'm', label: 'm' }, { key: 'alpha', label: 'α' },
        { key: 'content', label: 'conteúdo dos buckets' },
      ],
      reference: 'chaining-insert-trace',
      misconceptionByStep: { '4': 'hash.rehash-copia-buckets' },
    },
    {
      kind: 'choice', id: 'hash.e1b',
      prompt: 'Duas chaves diferentes produziram o mesmo endereço. O que isso indica?',
      choices: [
        { correct: true, text: 'Que o domínio das chaves é maior que o número de endereços — nenhuma função de hash escapa disso' },
        { correct: false, text: 'Que a função de hash está mal escolhida e deveria ser trocada', misconceptionId: 'hash.colisao-e-bug' },
        { correct: false, text: 'Que a tabela precisa ser redimensionada imediatamente', misconceptionId: 'hash.load-factor-memoria' },
      ],
    },
    {
      kind: 'bug', id: 'hash.e3',
      prompt: 'Esta implementação de inserção é plausível e idiomática. Marque a linha defeituosa e escolha a consequência. Marcar a linha certa pela razão errada não conta.',
      language: 'javascript',
      code: `insert(key, value) {
  if ((this.n + 1) / this.m > 0.75) this.resize(this.m * 2)
  const i = this.hash(key) % this.m
  this.buckets[i].push([key, value])
  this.n++
}`,
      faultyLines: [4],
      consequences: [
        { correct: true, text: 'n passa a contar duplicatas, o que infla α e dispara o rehash antes da hora — a tabela fica mais lenta e maior, mas a busca continua funcionando' },
        { correct: false, text: 'A busca passa a falhar para chaves que existem na tabela', misconceptionId: 'hash.duplicata-inofensiva' },
        { correct: false, text: 'Nada de grave: é apenas desperdício de memória', misconceptionId: 'hash.duplicata-inofensiva' },
      ],
    },
    {
      kind: 'choice', id: 'hash.e0',
      prompt: 'Um cache de sessão precisa de várias coisas. Qual delas o contrato Map, sozinho, responde diretamente?',
      choices: [
        { correct: true, text: 'Se uma sessão específica existe' },
        { correct: false, text: 'Quais são as vinte sessões mais antigas', misconceptionId: 'hash.ordem' },
        { correct: false, text: 'Em que ordem as sessões foram criadas', misconceptionId: 'hash.ordem' },
      ],
    },
    {
      kind: 'choice', id: 'hash.e1a',
      prompt: 'A expressão h(chave) mod m devolve um índice. O que exatamente esse índice garante?',
      choices: [
        { correct: true, text: 'Que você chega a um bucket em uma operação — e nada sobre o que está dentro dele' },
        { correct: false, text: 'Que o valor procurado está naquela posição', misconceptionId: 'hash.colisao-e-bug' },
        { correct: false, text: 'Que a busca inteira custa O(1)', misconceptionId: 'hash.o1-sem-qualificar' },
      ],
    },
    {
      kind: 'choice', id: 'hash.e1c',
      prompt: 'Com m = 4 e o bucket 3 contendo [3, 7, 11], quantas comparações de chave a busca por 11 faz?',
      choices: [
        { correct: true, text: 'Três — calcular o endereço é uma operação, comparar chaves dentro do bucket é outra' },
        { correct: false, text: 'Uma, porque a busca numa tabela hash é O(1)', misconceptionId: 'hash.o1-sem-qualificar' },
        { correct: false, text: 'Nenhuma, o endereço já entrega o par diretamente', misconceptionId: 'hash.colisao-e-bug' },
      ],
    },
    {
      kind: 'choice', id: 'hash.e2a',
      prompt: 'Tabela com chaining, m = 1000 e n = 750, portanto α = 0,75. Estime antes de calcular: quantos buckets você espera encontrar vazios?',
      choices: [
        { correct: true, text: 'Cerca de 470 — quase metade, porque as colisões concentram vários pares em poucos buckets' },
        { correct: false, text: '250, já que 75% da tabela está ocupada', misconceptionId: 'hash.load-factor-memoria' },
        { correct: false, text: 'Nenhum: com α abaixo de 1 todo bucket recebe pelo menos um par', misconceptionId: 'hash.load-factor-memoria' },
      ],
    },
    {
      kind: 'choice', id: 'hash.e7',
      prompt: 'Com m = 8 e linear probing, as chaves 8, 16 e 24 ocupam as posições 0, 1 e 2. Você remove o 16 esvaziando a posição 1. O que acontece com a busca por 24?',
      choices: [
        { correct: true, text: 'Ela para na posição 1, encontra vazio, e conclui que 24 não está na tabela' },
        { correct: false, text: 'Encontra 24 normalmente, porque ele continua na posição 2', misconceptionId: 'hash.delecao-ingenua' },
        { correct: false, text: 'A tabela se reorganiza sozinha para fechar o buraco', misconceptionId: 'hash.delecao-ingenua' },
      ],
    },
    {
      kind: 'choice', id: 'hash.e5',
      prompt: 'Cache de sessão: contém(sessao) a cada requisição, e um job que expira as vinte mais antigas por minuto. Qual estrutura escolher?',
      choices: [
        { correct: true, text: 'Nenhuma das duas sozinha — tabela hash para contém, e uma lista por ordem de chegada para as mais antigas' },
        { correct: false, text: 'Tabela hash, que responde contém em O(1) e é a operação dominante', misconceptionId: 'hash.ordem' },
        { correct: false, text: 'Lista por ordem de chegada, que já tem as mais antigas na ponta', misconceptionId: 'hash.ordem' },
      ],
    },
  ],

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
