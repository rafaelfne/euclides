import type { Exercise, Misconception } from '../../schema'

export const hashMisconceptions: Misconception[] = [
  { id: 'hash.o1-sem-qualificar', label: '“Hash é O(1)” sem qualificar',
    socraticQuestion: 'Construa uma sequência de cinco chaves que caem no mesmo bucket. Qual o custo da busca depois disso?',
    escalation: ['Você acabou de construir o pior caso. Ele contradiz a afirmação, ou ela estava incompleta desde o começo?'],
    reviewCycle: 'hash.c6' },
  { id: 'hash.colisao-e-bug', label: 'Colisão tratada como defeito da função',
    socraticQuestion: 'Quantas strings existem? Quantos buckets você tem?',
    escalation: ['Uma função de um conjunto infinito para um conjunto finito pode ser injetiva?'],
    reviewCycle: 'hash.c2' },
  { id: 'hash.rehash-copia-buckets', label: 'Rehash copia buckets em vez de reinserir',
    socraticQuestion: 'Reescreva a invariante de posição trocando m por 2m. Ela continua valendo para os pares que você copiou?',
    escalation: [
      'Pegue uma chave concreta que estava no bucket 3 com m = 4. Onde ela deveria estar com m = 8?',
      'Note que algumas chaves continuam encontráveis e outras não. Por que o defeito é parcial — e o que isso significa para o seu teste manual?',
    ],
    reviewCycle: 'hash.c5' },
  { id: 'hash.duplicata-inofensiva', label: 'Duplicata tratada como inofensiva',
    socraticQuestion: 'Se n passa a contar duplicatas, o que acontece com α?',
    escalation: ['E se α infla antes da hora, o que dispara antes da hora?'],
    reviewCycle: 'hash.c3' },
  { id: 'hash.load-factor-memoria', label: 'Load factor confundido com ocupação de memória',
    socraticQuestion: 'Numa tabela com m = 1000 e n = 750, estime quantos buckets estão vazios antes de calcular. Depois calcule — as duas coisas são a mesma?',
    escalation: ['Com chaining, dois pares podem morar no mesmo bucket. Isso muda a relação entre α e posições ocupadas?'],
    reviewCycle: 'hash.c4' },
  { id: 'hash.delecao-ingenua', label: 'Deleção que esvazia a posição em open addressing',
    socraticQuestion: 'Você esvaziou a posição 5. O item da posição 6 chegou lá sondando a partir da 5. Como a busca vai encontrá-lo agora?',
    escalation: ['O que precisaria ficar na posição 5 para a sondagem não parar ali?'],
    reviewCycle: 'hash.c7' },
  { id: 'hash.ordem', label: 'Tabela hash usada onde a consulta precisa de ordem',
    socraticQuestion: 'Escreva “os vinte mais antigos” usando apenas as quatro operações do contrato Map. Qual o custo?',
    escalation: ['Se a única saída é varrer tudo, o contrato cobre essa pergunta ou você está pedindo algo que ele nunca prometeu?'],
    reviewCycle: 'hash.c8' },
]

export const hashExercises: Exercise[] = [
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
      { key: 'rehash', label: 'rehash?', placeholder: 'sim ou não' },
      { key: 'n', label: 'pares guardados (n)', placeholder: '0' },
      { key: 'm', label: 'posições (m)', placeholder: '0' },
      { key: 'alpha', label: 'carga (α)', placeholder: '0,000' },
      { key: 'content', label: 'onde cada chave está', placeholder: '0:[12,20] 5:[45]' },
    ],
    reference: 'hash.chaining-insert-trace',
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
]
