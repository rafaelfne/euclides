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
      body: [
        'Acesso em O(1) só existe por índice. Se a chave virasse um índice, o problema estaria resolvido, e toda tabela hash é exatamente essa aposta.',
      ],
      pseudocode: 'índice ← h(chave) mod m',
      workedExample: {
        problem: 'Com m = 8 e h(k) = k, calcule o endereço de 3, 11, 19 e 27.',
        whatToNotice: 'Os quatro caem no mesmo endereço. Isso não é azar, é o que acontece quando o domínio é maior que o contradomínio.',
      },
      exerciseId: 'hash.e1a' },

    { id: 'hash.c2', title: 'Colisão é matemática, não defeito', layer: 'essential', band: 'implementation', elaborates: 'chaining',
      introducesTerms: ['collision', 'pigeonhole'],
      oneLine: "Com 4 buckets e 5 chaves, duas colidem. Não há h que evite isso.",
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
        'A propriedade que sustenta tudo o que vem depois é discreta: todo par armazenado no bucket i satisfaz h(k) mod m = i. Guarde essa frase, ela é o motivo de o rehash precisar reinserir em vez de copiar.',
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

    { id: 'hash.c4', title: 'Load factor', layer: 'essential', band: 'cost',
      introducesTerms: ['load-factor', 'uniform-hashing'],
      oneLine: "Com m = 1000 e n = 750, α é 0,75 e centenas de buckets ainda estão vazios.",
      body: [
        'O load factor é a razão α = n/m entre pares armazenados e posições disponíveis. Com chaining ele pode passar de 1 sem que nada quebre.',
        'Ele não mede quanto da memória está ocupada. Numa tabela com m = 1000 e n = 750, estime quantos buckets estão vazios antes de calcular, e depois calcule.',
      ],
      workedExample: {
        problem: "m = 1000, n = 750, α = 0,75. Com espalhamento uniforme, cerca de 472 buckets ficam vazios, quase metade da tabela.",
        whatToNotice: "α = 0,75 sugere \"três quartos cheia\" e a tabela está com metade das posições sem nada. α mede pares por posição, não ocupação.",
      },
      exerciseId: 'hash.e2a' },

    { id: 'hash.c5', title: 'Rehash e o custo amortizado', layer: 'essential', band: 'implementation', elaborates: 'chaining',
      introducesTerms: ['rehash'],
      oneLine: "A tabela dobra e reinsere tudo; copiar quebraria a invariante de posição.",
      body: [
        'Quando α passa do limite, a tabela dobra e reinsere. Reinsere, não copia: com m indo de 4 para 8, a chave 11 sai do bucket 3 e vai para o 3 de novo, mas a chave 4 sai do 0 e vai para o 4.',
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
        whatToNotice: 'O rehash separa o 7 de 3 e 11, mas mantém 3 e 11 juntos, ambos permanecem congruentes módulo 8. Redistribuir não é eliminar colisão.',
      },
      exerciseId: 'hash.e1' },

    { id: 'hash.c6', title: 'O custo, com todos os qualificadores', layer: 'essential', band: 'cost',
      introducesTerms: [],
      oneLine: "A frase \"hash é O(1)\" omite 4 coisas, e cada omissão muda o que ela afirma.",
      body: [
        'A frase “hash é O(1)” omite quatro coisas: o regime, a hipótese de hashing uniforme, a amortização vinda do rehash, e o que n mede, porque ela ignora o custo de hashear a própria chave.',
        'Neste ciclo cada um dos quatro é nomeado, e você reescreve a afirmação de forma que ela sobreviva a uma code review.',
      ],
      workedExample: {
        problem: "Reescreva \"hash é O(1)\": vira \"O(1) amortizado no caso médio, supondo hashing uniforme, com n contando pares e o custo de hashear a chave ignorado\".",
        whatToNotice: "A versão completa tem 4 qualificadores que a curta não tinha. Cada um deles é uma condição que pode não valer no seu sistema.",
      },
      exerciseId: 'hash.e3' },

    { id: 'hash.c7', title: 'Open addressing e a deleção que apaga demais', layer: 'deep-dive', band: 'implementation', elaborates: 'open-addressing',
      introducesTerms: ['open-addressing', 'probing', 'clustering', 'tombstone'],
      oneLine: "Entre α = 0,8 e α = 0,9 as sondagens vão de 12,5 para 48,1.",
      body: [
        'Outra implementação do mesmo contrato, com perfil oposto: sem ponteiros, melhor localidade de cache, e degradação muito mais abrupta.',
        'Entre α = 0,8 e α = 0,9 a busca sem sucesso vai de 12,5 para 48,1 sondagens medidas, enquanto o chaining sai de 1,40 para 1,45. E remover não pode esvaziar a posição: isso interrompe a cadeia de sondagem e some com o que veio depois.',
      ],
      workedExample: {
        problem: 'Com m = 8, insira 8, 16 e 24 por linear probing e depois esvazie a posição 1.',
        whatToNotice: 'As três chaves colidem no mesmo endereço e ocupam posições vizinhas. Esvaziar uma do meio não apaga a chave que veio depois, apaga o caminho até ela.',
      },
      exerciseId: 'hash.e7' },

    { id: 'hash.c8', title: 'Quando a tabela hash é a escolha errada', layer: 'essential', band: 'cost',
      introducesTerms: ['hash-flooding'],
      oneLine: "A tabela hash falha exatamente onde o Map não prometeu nada.",
      body: [
        'Volte às 4 operações do primeiro ciclo. Tudo que elas não prometem é exatamente onde esta estrutura falha, e a lista de ausências que você guardou lá é a resposta inteira deste ciclo.',
      ],
      workedExample: {
        problem: "Peça \"os 20 usuários mais recentes\" a um Map com 50 mil pares: a única saída é percorrer os 50 mil e ordenar.",
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
