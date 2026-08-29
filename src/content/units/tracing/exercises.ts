import type { Exercise, Misconception } from '../../schema'

export const tracingMisconceptions: Misconception[] = [
  { id: 'tracing.laco-roda-n-vezes', label: 'Contar rodadas pelo tamanho da coleção em vez de pela condição',
    socraticQuestion: 'Escreva os valores que i assume até o laço parar, um por linha. Quantas linhas você escreveu?',
    escalation: [
      'Compare esse número com o tamanho da coleção. Se eles diferem, qual linha do código decide a diferença?',
      'A condição de parada olha i, e o passo do laço decide de quanto em quanto i anda. Qual das duas você usou para contar?',
    ],
    reviewCycle: 'tracing.c5' },

  { id: 'tracing.off-by-one', label: 'Fronteira do índice lida por hábito',
    socraticQuestion: 'Qual é o maior valor de i para o qual A[i] existe numa coleção de n elementos, e qual é o primeiro valor que a condição precisa recusar?',
    escalation: [
      'Escreva os dois números para n = 3. Eles diferem de quanto, e o operador da condição concorda com essa diferença?',
    ],
    reviewCycle: 'tracing.c4' },

  { id: 'tracing.estado-nao-observado', label: 'Traçar o índice e esquecer o acumulador',
    socraticQuestion: 'Liste todos os nomes cujo valor muda dentro do laço. Quantos deles aparecem no seu traço?',
    escalation: [
      'Um nome que muda e não está no traço é um valor que você está adivinhando. Qual das colunas você conseguiria preencher sem ele?',
    ],
    reviewCycle: 'tracing.c2' },

  { id: 'tracing.vazio-nao-considerado', label: 'Nunca perguntar o que acontece com zero elementos',
    socraticQuestion: 'Rode o traço para a coleção vazia. Quantas rodadas acontecem, e o que a função devolve?',
    escalation: [
      'Se nenhuma rodada acontece, o valor devolvido é o que foi inicializado antes do laço. Esse valor está correto para uma coleção vazia?',
    ],
    reviewCycle: 'tracing.c4' },

  { id: 'tracing.mutacao-durante-iteracao', label: 'Alterar a coleção enquanto a percorre',
    socraticQuestion: 'A condição compara i com o tamanho da coleção. Se o corpo remove um elemento, o que acontece com os dois lados dessa comparação?',
    escalation: [
      'Um lado cresce e o outro encolhe na mesma rodada. Escreva o traço de uma remoção no meio e diga qual elemento nunca é visitado.',
    ],
    reviewCycle: 'tracing.c1' },

  { id: 'tracing.curto-circuito', label: 'Supor que os dois lados de uma condição composta são avaliados',
    socraticQuestion: 'Numa condição "x e y", com x falso, o que precisa acontecer com y para a condição ser falsa?',
    escalation: [
      'Se o resultado já está decidido por x, avaliar y muda alguma coisa? E se avaliar y quebrar — índice fora da coleção, por exemplo — isso acontece?',
    ],
    reviewCycle: 'tracing.c6' },

  { id: 'tracing.invariante-so-no-fim', label: 'Enunciar a propriedade só para o fim do laço',
    socraticQuestion: 'Enuncie a sua propriedade e depois teste-a antes da primeira rodada, com o laço ainda sem ter executado nada. Ela vale?',
    escalation: [
      'Uma propriedade que só vale no fim não sustenta o raciocínio: ela é a conclusão, não o argumento. O que precisaria ser verdade já na entrada do laço?',
    ],
    reviewCycle: 'tracing.c3' },
]

export const tracingExercises: Exercise[] = [
  {
    kind: 'choice', id: 'tracing.e0',
    prompt: 'Alguém diz "eu li o código e entendi o que ele faz". O que essa afirmação precisa carregar para ser verificável por outra pessoa?',
    choices: [
      { correct: true, text: 'As variáveis, o estado por rodada, a condição e a saída',
        why: 'São quatro partes, e cada uma que falta produz uma frase que soa certa.' },
      { correct: false, text: 'O valor devolvido para uma entrada de exemplo — é isso que "o que ele faz" significa', misconceptionId: 'tracing.estado-nao-observado' },
      { correct: false, text: 'O número de rodadas, que é o tamanho da coleção', misconceptionId: 'tracing.laco-roda-n-vezes' },
    ],
  },
  {
    kind: 'choice', id: 'tracing.e1',
    prompt: 'Um laço percorre uma lista de pendências e remove as já concluídas de dentro da própria lista. Metade das concluídas continua lá no fim. Por quê?',
    choices: [
      { correct: true, text: 'Remover desloca os elementos seguintes uma casa para trás, e o índice avança na mesma rodada',
        why: 'O elemento que ocupou a posição removida nunca é examinado' },
      { correct: false, text: 'A condição de parada usa o tamanho original, então o laço termina cedo demais', misconceptionId: 'tracing.laco-roda-n-vezes' },
      { correct: false, text: 'Remover durante a iteração não afeta o percurso; o defeito está na condição que decide se a pendência está concluída', misconceptionId: 'tracing.mutacao-durante-iteracao' },
    ],
  },
  {
    kind: 'trace', id: 'tracing.e2',
    prompt:
      'A coleção é [4, 7, 3, 9, 6, 1, 8], com sete elementos. Preencha uma linha por rodada do laço: ' +
      'o elemento lido, se ele é par, o total ao fim da rodada, e o valor de i ao fim dela.',
    pseudocode: `função contar_pares(A)
    total ← 0
    i ← 0
    enquanto i < |A| faça
        se A[i] mod 2 = 0 então
            total ← total + 1
        i ← i + 2
    retorne total`,
    invariant: 'Ao começar cada rodada, total conta os elementos pares entre as posições já visitadas.',
    columns: [
      { key: 'step', label: 'rodada' },
      { key: 'read', label: 'elemento lido', placeholder: '0' },
      { key: 'even', label: 'é par?', placeholder: 'sim ou não' },
      { key: 'total', label: 'total ao fim', placeholder: '0' },
      { key: 'next', label: 'i ao fim', placeholder: '0' },
    ],
    conventions: [
      { notation: '4', rule: 'o elemento lido', why: 'O valor que está na posição i naquela rodada, não a posição.' },
      { notation: 'sim / não', rule: 'é par?', why: 'Responda todas as rodadas. A resposta muda o total, e deixar em branco não é dizer não.' },
      { notation: '(linhas)', rule: 'quantas rodadas há', why: 'A tabela já tem uma linha por rodada. Se o número surpreender você, essa surpresa é o exercício.' },
    ],
    reference: 'tracing.count-even-trace',
    misconceptionByStep: { '2': 'tracing.laco-roda-n-vezes' },
  },
  {
    kind: 'choice', id: 'tracing.e3',
    prompt: 'Um laço soma os elementos de uma coleção. Qual propriedade sustenta o raciocínio sobre ele, sem precisar simular rodada por rodada?',
    choices: [
      { correct: true, text: 'Ao começar a rodada de i, a soma já cobre as posições 0 até i − 1',
        why: 'Isso vale antes da primeira rodada, com soma zero e nenhuma posição visitada — e é o que separa uma invariante de uma conclusão.' },
      { correct: false, text: 'Ao terminar o laço, a soma acumulada é a soma de todos os elementos', misconceptionId: 'tracing.invariante-so-no-fim' },
      { correct: false, text: 'A soma acumulada cresce a cada rodada, o que garante que ela chega ao total', misconceptionId: 'tracing.invariante-so-no-fim' },
    ],
  },
  {
    kind: 'choice', id: 'tracing.e4',
    prompt: 'Uma função devolve o maior elemento de uma coleção. Ela começa com maior ← A[0] e percorre a partir de i = 1. Que entrada quebra essa função?',
    choices: [
      { correct: true, text: 'A coleção vazia',
        why: 'A[0] é lido antes de qualquer verificação, e numa coleção vazia não existe posição 0.' },
      { correct: false, text: 'A coleção com um elemento só: o laço não roda e a função devolve lixo', misconceptionId: 'tracing.vazio-nao-considerado' },
      { correct: false, text: 'A coleção em ordem decrescente: o primeiro elemento nunca é substituído e o laço percorre à toa', misconceptionId: 'tracing.off-by-one' },
    ],
  },
  {
    kind: 'choice', id: 'tracing.e5',
    prompt: 'Um laço tem condição i < |A| e avança com i ← i + 3. A coleção tem dez elementos. Quantas rodadas acontecem?',
    choices: [
      { correct: true, text: 'Quatro: i vale 0, 3, 6 e 9, e para em 12',
        why: 'O passo do laço decide, não o tamanho da coleção' },
      { correct: false, text: 'Dez, uma por elemento, porque o laço percorre a coleção', misconceptionId: 'tracing.laco-roda-n-vezes' },
      { correct: false, text: 'Três: i vale 0, 3 e 6, porque 9 mais 3 passa do fim', misconceptionId: 'tracing.off-by-one' },
    ],
  },
  {
    kind: 'bug', id: 'tracing.e6',
    prompt: 'Esta função é chamada com listas que às vezes chegam vazias, e nunca falhou nos testes. Marque a linha defeituosa e escolha a consequência.',
    language: 'javascript',
    code: `function primeiroAtivo(itens) {
  let i = 0
  while (itens[i].ativo === false && i < itens.length) {
    i = i + 1
  }
  return itens[i]
}`,
    faultyLines: [3],
    consequences: [
      { correct: true, text: 'Os dois lados estão na ordem errada',
        why: 'O acesso acontece antes da verificação de fronteira. Como o "e" avalia da esquerda para a direita, a lista vazia falha já na primeira avaliação.' },
      { correct: false, text: 'Nada de grave: os dois lados de um "e" são avaliados de qualquer forma, então a ordem não importa', misconceptionId: 'tracing.curto-circuito' },
      { correct: false, text: 'O defeito é o operador: deveria ser "ou", para que a verificação de fronteira seja considerada', misconceptionId: 'tracing.curto-circuito' },
    ],
  },
]
