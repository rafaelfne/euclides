import type { Exercise, Misconception } from '../../schema'

export const asymptoticsMisconceptions: Misconception[] = [
  { id: 'asymptotics.sem-regime', label: 'Afirmação de custo sem dizer de que regime fala',
    socraticQuestion: 'Escreva a mesma frase trocando "em média" por "no pior caso". As duas continuam verdadeiras?',
    escalation: [
      'Se elas discordam, a frase original estava afirmando qual das duas? E quem lê tem como saber?',
      'Construa a entrada em que o pior caso acontece. Ela é rara, ou é a entrada mais comum que você tem?',
    ],
    reviewCycle: 'asymptotics.c5' },

  { id: 'asymptotics.sem-unidade', label: 'Não dizer o que n conta',
    socraticQuestion: 'Comparar duas strings de mil caracteres custa o mesmo que comparar dois inteiros. Se não custa, o que a sua conta estava chamando de uma operação?',
    escalation: [
      'A conta contou comparações e chamou cada uma de O(1). Escreva o custo de novo, agora com duas grandezas: quantos elementos e quão grande é cada um.',
    ],
    reviewCycle: 'asymptotics.c2' },

  { id: 'asymptotics.amortizado-e-caso-medio', label: 'Amortizado confundido com caso médio',
    socraticQuestion: 'Um array dobra de capacidade quando enche. Das mil inserções seguidas, quantas são caras, e isso depende de sorteio nenhum?',
    escalation: [
      'Caso médio fala de uma distribuição de entradas possíveis. Aqui a sequência é fixa e o custo alto é certo em posições conhecidas. Qual dos dois qualificadores descreve isso?',
    ],
    reviewCycle: 'asymptotics.c6' },

  { id: 'asymptotics.constante-nao-importa', label: 'Ignorar constantes onde n é pequeno',
    socraticQuestion: 'Um algoritmo custa 1000·n e outro custa n². Para quais valores de n o segundo termina antes?',
    escalation: [
      'Encontre o ponto em que eles empatam. Se o seu n real está abaixo dele, qual das duas afirmações assintóticas ajuda a decidir?',
    ],
    reviewCycle: 'asymptotics.c1' },

  { id: 'asymptotics.pior-caso-e-raro', label: 'Supor que o pior caso é raro por definição',
    socraticQuestion: 'Qual entrada leva um quicksort com pivô no primeiro elemento ao pior caso? Quantas vezes por dia você recebe uma entrada assim?',
    escalation: [
      'A entrada já ordenada é o pior caso, e é o que sai de qualquer consulta com ORDER BY. O que "pior caso" está qualificando: a frequência da entrada, ou o custo dela?',
    ],
    reviewCycle: 'asymptotics.c5' },

  { id: 'asymptotics.custo-por-nivel-cresce', label: 'Supor que o custo cresce a cada nível da árvore de recursão',
    socraticQuestion: 'No nível 2 há quatro chamadas de tamanho 2. Multiplique as duas e compare com o nível 0, que tem uma chamada de tamanho 8. Qual dos dois custa mais?',
    escalation: [
      'A cada nível o número de chamadas dobra e o tamanho de cada uma cai pela metade. O que o produto das duas faz?',
      'Se todo nível custa o mesmo, o total é esse custo vezes o número de níveis. Quantos níveis existem até o tamanho chegar a 1?',
    ],
    reviewCycle: 'asymptotics.c4' },

  { id: 'asymptotics.recorrencia-sem-base', label: 'Escrever a recorrência sem o caso base',
    socraticQuestion: 'Aplique a sua relação a uma entrada de tamanho 1. Ela devolve um número, ou volta a chamar a si mesma?',
    escalation: [
      'Uma relação sem caso base não descreve procedimento que pare. Qual o menor tamanho de entrada que o seu procedimento resolve sem se chamar de novo?',
    ],
    reviewCycle: 'asymptotics.c3' },
]

export const asymptoticsExercises: Exercise[] = [
  {
    kind: 'trace', id: 'asymptotics.e7',
    prompt:
      'A relação é T(n) = 2·T(n/2) + n, com n = 8. Desenhe a árvore: uma linha por nível, ' +
      'do topo até as chamadas de tamanho 1. Para cada nível, quantas chamadas existem, de que ' +
      'tamanho é cada uma, quanto custa o nível inteiro, e quanto já foi gasto até ali.',
    pseudocode: `função custo(n)
    se n ≤ 1 então
        retorne c
    retorne 2 × custo(n / 2) + n`,
    invariant: 'Em cada nível, o número de chamadas dobra e o tamanho de cada uma cai pela metade.',
    columns: [
      { key: 'step', label: 'nível' },
      { key: 'calls', label: 'quantas chamadas', placeholder: 'um número' },
      { key: 'size', label: 'tamanho de cada', placeholder: 'um número' },
      { key: 'levelCost', label: 'custo do nível', placeholder: 'chamadas × tamanho' },
      { key: 'accumulated', label: 'gasto até aqui', placeholder: 'um número' },
    ],
    conventions: [
      { notation: '0', rule: 'o primeiro nível', why: 'A chamada de cima é o nível 0, não o 1: o número do nível é quantas vezes a entrada já foi dividida.' },
      { notation: '4 × 2', rule: 'o custo de um nível', why: 'Quantas chamadas existem naquele nível, vezes o tamanho de cada uma. Escreva o resultado, não a conta.' },
      { notation: '(última linha)', rule: 'onde a árvore para', why: 'No nível em que o tamanho chega a 1, é o caso base, e é ele que decide quantos níveis existem.' },
    ],
    reference: 'asymptotics.recursion-tree-trace',
    misconceptionByStep: { '3': 'asymptotics.custo-por-nivel-cresce' },
  },
  {
    kind: 'choice', id: 'asymptotics.e0',
    prompt: '"Essa busca é O(1)." A frase não é falsa. O que falta nela para sobreviver a uma revisão?',
    choices: [
      { correct: true, text: 'O regime, as hipóteses, a amortização e o que n conta',
        why: 'São quatro qualificadores independentes, e a frase omite os quatro.' },
      { correct: false, text: 'Nada: O(1) é a informação inteira, e o resto é formalidade acadêmica', misconceptionId: 'asymptotics.sem-regime' },
      { correct: false, text: 'Só o regime, as outras três não mudam a decisão de quem lê', misconceptionId: 'asymptotics.sem-regime' },
    ],
  },
  {
    kind: 'choice', id: 'asymptotics.e1',
    prompt: 'Duas implementações de um mesmo filtro: uma custa cerca de 1000·n, outra cerca de n². As coleções reais têm entre 20 e 200 elementos. Qual afirmação decide a escolha?',
    choices: [
      { correct: true, text: 'Elas empatam perto de n = 1000, e todo o intervalo real está abaixo disso',
        why: 'A assintótica não decide aqui, e a constante decide' },
      { correct: false, text: 'A primeira, porque O(n) domina O(n²) e a constante é ignorada na notação', misconceptionId: 'asymptotics.constante-nao-importa' },
      { correct: false, text: 'A segunda, porque n² com n pequeno é sempre menor que qualquer coisa linear', misconceptionId: 'asymptotics.constante-nao-importa' },
    ],
  },
  {
    kind: 'choice', id: 'asymptotics.e2',
    prompt: 'Uma função procura uma chave numa lista de n URLs, comparando strings. A conta deu O(n). O que essa conta assumiu sem declarar?',
    choices: [
      { correct: true, text: 'Que comparar duas URLs custa sempre o mesmo',
        why: 'N conta elementos e ignora o tamanho de cada um. Com strings de comprimentos diferentes, a operação somada como unitária não é unitária.' },
      { correct: false, text: 'Que a lista está desordenada; ordenada seria O(log n)', misconceptionId: 'asymptotics.sem-unidade' },
      { correct: false, text: 'Nada: comparar duas strings é uma operação, e uma operação é O(1)', misconceptionId: 'asymptotics.sem-unidade' },
    ],
  },
  {
    kind: 'choice', id: 'asymptotics.e3',
    prompt: 'Um procedimento divide a entrada ao meio e se chama nas duas metades, gastando tempo linear para juntar. Como escrever o custo dele?',
    choices: [
      { correct: true, text: 'T(n) = 2·T(n/2) + n, com T(1) constante',
        why: 'E sem essa segunda parte a relação não descreve nada que pare' },
      { correct: false, text: 'T(n) = 2·T(n/2) + n, que já é a relação completa', misconceptionId: 'asymptotics.recorrencia-sem-base' },
      { correct: false, text: 'T(n) = n·log n, porque é assim que essa recorrência sempre resolve', misconceptionId: 'asymptotics.recorrencia-sem-base' },
    ],
  },
  {
    kind: 'choice', id: 'asymptotics.e4',
    prompt: 'Para n itens, um algoritmo costuma fazer cerca de n comparações, mas algumas entradas válidas fazem n². Como qualquer cliente pode enviar essas entradas, qual custo serve para garantir o tempo máximo de uma requisição?',
    choices: [
      { correct: true, text: 'n², porque a garantia precisa cobrir toda entrada válida',
        why: 'Se o cliente escolhe a entrada, ele também pode produzir o caso que exige mais trabalho.' },
      { correct: false, text: 'n, porque ele descreve o comportamento que costuma acontecer', misconceptionId: 'asymptotics.pior-caso-e-raro' },
      { correct: false, text: 'A média entre n e n², porque ela aproxima o comportamento real', misconceptionId: 'asymptotics.sem-regime' },
    ],
  },
  {
    kind: 'bug', id: 'asymptotics.e5',
    prompt: 'Este comentário documenta o custo da função. Marque a linha em que a afirmação está errada e escolha a consequência.',
    language: 'javascript',
    code: `// Insere no fim: O(1) em média.
push(value) {
  if (this.size === this.capacity) this.grow()
  this.data[this.size] = value
  this.size = this.size + 1
}`,
    faultyLines: [1],
    consequences: [
      { correct: true, text: 'O qualificador está trocado: não há sorteio nenhum aqui',
        why: 'O custo alto acontece em posições conhecidas e é espalhado pelas inserções baratas. Isso é amortizado, e a frase deveria dizer O(1) amortizado no pior caso.' },
      { correct: false, text: 'A afirmação está correta: na média das inserções o custo é constante, e é isso que "em média" quer dizer', misconceptionId: 'asymptotics.amortizado-e-caso-medio' },
      { correct: false, text: 'O defeito é o limite, não o qualificador: com o redimensionamento a inserção é O(n) e nunca O(1)', misconceptionId: 'asymptotics.amortizado-e-caso-medio' },
    ],
  },
  {
    kind: 'choice', id: 'asymptotics.e6',
    prompt: 'Um laço percorre n pedidos e, a cada rodada, insere um no fim de um array que dobra de capacidade quando enche. Contar as rodadas é a técnica do laço. O que essa contagem não decide sozinha?',
    choices: [
      { correct: true, text: 'O custo de cada inserção, que pede agregar a sequência',
        why: 'A contagem só vale se toda operação somada custar o mesmo, e aqui algumas inserções copiam o array inteiro. Somar a sequência e dividir pelas n inserções é o que dá o custo de cada uma, e é a única técnica das três que produz a parte da amortização.' },
      { correct: false, text: 'Nada: toda inserção custa o mesmo, então basta multiplicar pelas n rodadas', misconceptionId: 'asymptotics.amortizado-e-caso-medio' },
      { correct: false, text: 'O caso médio da inserção, que pede sortear entradas e tirar a média', misconceptionId: 'asymptotics.amortizado-e-caso-medio' },
    ],
  },
]
