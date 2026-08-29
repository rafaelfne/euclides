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

    { id: 'hash.c1', title: 'A aposta: transformar chave em endereço', layer: 'essential', band: 'implementation', elaborates: 'chaining',
      introducesTerms: ['hash', 'hash-function'],
      body: [
        'Acesso em O(1) só existe por índice. Se a chave virasse um índice, o problema estaria resolvido — e toda tabela hash é exatamente essa aposta.',
      ],
      pseudocode: 'índice ← h(chave) mod m',
      workedExample: {
        problem: 'Com m = 8 e h(k) = k, calcule o endereço de 3, 11, 19 e 27.',
        whatToNotice: 'Os quatro caem no mesmo endereço. Isso não é azar — é o que acontece quando o domínio é maior que o contradomínio.',
      },
      exerciseId: 'hash.e1a' },

    { id: 'hash.c2', title: 'Colisão é matemática, não defeito', layer: 'essential', band: 'implementation', elaborates: 'chaining',
      introducesTerms: ['collision', 'pigeonhole'],
      body: [
        'Quantas strings existem? Quantos buckets você tem? A resposta à segunda pergunta é finita e a da primeira não é, o que torna a colisão inevitável para qualquer h.',
        'Isso muda o problema: não se trata de evitar colisão, e sim de decidir o que fazer quando ela ocorre.',
      ],
      exerciseId: 'hash.e1b' },

    { id: 'hash.c3', title: 'Chaining e a invariante de posição', layer: 'essential', band: 'implementation', elaborates: 'chaining',
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

    { id: 'hash.c5', title: 'Rehash e o custo amortizado', layer: 'essential', band: 'implementation', elaborates: 'chaining',
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

    { id: 'hash.c7', title: 'Open addressing e a deleção que apaga demais', layer: 'deep-dive', band: 'implementation', elaborates: 'open-addressing',
      introducesTerms: ['open-addressing', 'probing', 'clustering', 'tombstone'],
      body: [
        'Outra implementação do mesmo contrato, com perfil oposto: sem ponteiros, melhor localidade de cache, e degradação muito mais abrupta.',
        'Entre α = 0,8 e α = 0,9 a busca sem sucesso vai de 12,5 para 48,1 sondagens medidas, enquanto o chaining sai de 1,40 para 1,45. E remover não pode esvaziar a posição: isso interrompe a cadeia de sondagem e some com o que veio depois.',
      ],
      workedExample: {
        problem: 'Com m = 8, insira 8, 16 e 24 por linear probing e depois esvazie a posição 1.',
        whatToNotice: 'As três chaves colidem no mesmo endereço e ocupam posições vizinhas. Esvaziar uma do meio não apaga a chave que veio depois — apaga o caminho até ela.',
      },
      exerciseId: 'hash.e7' },

    { id: 'hash.c8', title: 'Quando a tabela hash é a escolha errada', layer: 'essential', band: 'cost',
      introducesTerms: ['hash-flooding'],
      body: [
        'Volte ao contrato do primeiro ciclo. Tudo que o Map não promete é exatamente onde esta estrutura falha — e a lista de ausências que você guardou lá é a resposta inteira deste ciclo.',
      ],
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
