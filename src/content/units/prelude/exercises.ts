import type { Exercise, Misconception } from '../../schema'

export const preludeMisconceptions: Misconception[] = [
  { id: 'prelude.igualdade-nao-atribuicao', label: 'Ler atribuição como igualdade matemática',
    socraticQuestion: 'Depois de `total ← total + 4`, qual valor fica guardado em total e qual valor antigo foi usado na conta?',
    escalation: [
      'Comece com total guardando 10 e faça a conta no papel. O resultado ocupa o mesmo nome ou cria uma comparação entre dois valores?',
      'Escreva os dois estados, antes e depois da seta. O que mudou e o que permaneceu igual?',
    ],
    reviewCycle: 'prelude.c1' },

  { id: 'prelude.condicao-e-acao', label: 'Confundir a pergunta com a ação que vem depois',
    socraticQuestion: 'Na frase "se total ≥ 12, acrescente um selo", qual parte decide e qual parte só acontece depois?',
    escalation: [
      'Substitua total por 10 e depois por 14. Em qual dos dois casos a ação acontece, e qual símbolo permitiu decidir?',
    ],
    reviewCycle: 'prelude.c2' },

  { id: 'prelude.repeticao-automatica', label: 'Imaginar repetição sem testar a condição',
    socraticQuestion: 'Antes de cada rodada, qual pergunta precisa ser verdadeira para o corpo acontecer outra vez?',
    escalation: [
      'Marque a condição antes da primeira volta e depois da segunda. Em qual teste o procedimento para?',
    ],
    reviewCycle: 'prelude.c3' },

  { id: 'prelude.ordem-ignorada', label: 'Calcular o fim sem acompanhar a ordem dos passos',
    socraticQuestion: 'Se dois passos mudam o mesmo nome, qual estado você precisa conhecer antes de executar o segundo?',
    escalation: [
      'Troque a ordem de duas atribuições e compare os dois resultados. Se eles mudarem, o que a ordem estava decidindo?',
    ],
    reviewCycle: 'prelude.c4' },

  { id: 'prelude.vazio-esquecido', label: 'Não considerar uma sequência sem elementos',
    socraticQuestion: 'Se a sequência tem zero elementos, qual condição é testada primeiro e qual valor pode ser lido?',
    escalation: [
      'Escreva o estado inicial e conte as rodadas para uma sequência vazia. O resultado vem de alguma leitura ou da inicialização?',
    ],
    reviewCycle: 'prelude.c5' },
]

export const preludeExercises: Exercise[] = [
  {
    kind: 'choice', id: 'prelude.e0',
    prompt: 'Outro e-mail tem um link desconhecido e o assunto todo em maiúsculas, sem assinatura. O filtro soma 2 por link desconhecido, tira 1 por assinatura conhecida e dobra por assunto em maiúsculas, nessa ordem. Qual relato explica a decisão?',
    choices: [
      { correct: true, text: 'Começa em 0, vai a 2, dobra para 4 e vai para spam', why: 'O relato mostra o estado inicial, cada transformação na ordem do filtro e a decisão que vem depois. Sem assinatura, a regra que tira 1 não muda nada.' },
      { correct: false, text: 'Dobra antes de somar: o 0 continua 0, vai a 2 e para no limite do spam', misconceptionId: 'prelude.ordem-ignorada' },
      { correct: false, text: 'Termina em 2; o assunto em maiúsculas só descreve o e-mail', misconceptionId: 'prelude.condicao-e-acao' },
    ],
  },
  {
    kind: 'choice', id: 'prelude.e1',
    prompt: 'O procedimento faz `total ← 6` e depois `total ← total + 3`. Qual valor fica guardado em total?',
    choices: [
      { correct: false, text: '6: total não pode ser igual a total + 3, então nada muda', misconceptionId: 'prelude.igualdade-nao-atribuicao' },
      { correct: true, text: '9: a conta usa o 6 guardado, e o resultado fica no lugar dele', why: 'A atribuição calcula o lado direito com o valor que já estava guardado e substitui esse valor pelo resultado.' },
      { correct: false, text: '3: o nome passa a guardar só o número que aparece na segunda linha', misconceptionId: 'prelude.ordem-ignorada' },
    ],
  },
  {
    kind: 'choice', id: 'prelude.e2',
    prompt: 'Comece com `total ← 0`. Depois leia `total ← total + 2` e `se total ≥ 2 então selo ← 1`. Qual afirmação descreve os dois passos?',
    choices: [
      { correct: false, text: 'A segunda linha soma 2 ao total, porque a condição também é uma conta', misconceptionId: 'prelude.condicao-e-acao' },
      { correct: true, text: 'Muda total; depois pergunta se o novo valor chega a 2', why: 'Uma atribuição transforma o estado. Uma condição apenas escolhe se a ação será executada.' },
      { correct: false, text: 'As duas linhas apenas conferem valores e nenhuma delas muda o estado', misconceptionId: 'prelude.igualdade-nao-atribuicao' },
    ],
  },
  {
    kind: 'trace', id: 'prelude.e3',
    prompt: 'A sequência é [2, 4, 1], com 3 elementos. Preencha o elemento lido, o total ao fim e o próximo valor de i.',
    pseudocode: `função contar(pontos)
    total ← 0
    i ← 0
    enquanto i < |pontos| faça
        total ← total + pontos[i]
        i ← i + 1
    retorne total`,
    invariant: 'Ao começar cada rodada, total é a soma dos elementos nas posições já visitadas.',
    columns: [
      { key: 'step', label: 'rodada' },
      { key: 'key', label: 'posição lida' },
      { key: 'read', label: 'elemento lido', placeholder: 'um número' },
      { key: 'total', label: 'total ao fim', placeholder: 'um número' },
      { key: 'next', label: 'próximo i', placeholder: 'um número' },
    ],
    conventions: [
      { notation: 'posição 0', rule: 'a primeira posição', why: 'A sequência começa em 0, então o primeiro elemento está em pontos[0].' },
      { notation: 'um número', rule: 'célula numérica', why: 'Escreva o valor, não a conta que produziu o valor.' },
      { notation: 'rodada', rule: 'uma linha por passagem', why: 'Cada linha registra o estado depois de o corpo mudar os nomes.' },
    ],
    reference: 'prelude.count-trace',
    lineByColumn: { read: 5, total: 5, next: 6 },
    misconceptionByStep: { '2': 'prelude.repeticao-automatica' },
  },
  {
    kind: 'choice', id: 'prelude.e4',
    prompt: 'Comece com `total ← 0`. O procedimento faz `total ← 5` e depois `total ← total + 2`. Qual é o resultado?',
    choices: [
      { correct: false, text: '2, porque a primeira atribuição deixa de importar quando a segunda começa', misconceptionId: 'prelude.ordem-ignorada' },
      { correct: true, text: '7, porque a segunda conta usa o 5 produzido pela primeira', why: 'A segunda transformação recebe o estado deixado pela primeira; os passos não são independentes.' },
      { correct: false, text: '5, porque uma variável só pode receber um valor durante o procedimento', misconceptionId: 'prelude.igualdade-nao-atribuicao' },
    ],
  },
  {
    kind: 'choice', id: 'prelude.e5',
    prompt: 'Uma função lê `pontos[0]` antes de testar se a sequência está vazia. Qual entrada quebra a primeira leitura?',
    choices: [
      { correct: false, text: 'Uma sequência com um elemento, porque posição 0 nunca é uma posição válida', misconceptionId: 'prelude.vazio-esquecido' },
      { correct: true, text: 'Uma sequência com zero elementos, porque não existe posição 0 para ler', why: 'A posição 0 existe quando há pelo menos um elemento; com zero, a leitura acontece fora da sequência.' },
      { correct: false, text: 'Uma sequência com 3 elementos, porque a função deveria começar pela posição 3', misconceptionId: 'prelude.ordem-ignorada' },
    ],
  },
  {
    kind: 'choice', id: 'prelude.e6',
    prompt: 'Qual é uma leitura verificável de um procedimento curto?',
    choices: [
      { correct: false, text: 'Ele parece simples e deve funcionar para qualquer entrada', misconceptionId: 'prelude.vazio-esquecido' },
      { correct: false, text: 'Ele faz a conta principal e repete o que for necessário', misconceptionId: 'prelude.repeticao-automatica' },
      { correct: true, text: 'Mostra valores, mudanças, decisões e resultado em ordem', why: 'Uma leitura verificável mostra o caminho que produz o resultado, inclusive a entrada com zero elementos.' },
    ],
  },
]
