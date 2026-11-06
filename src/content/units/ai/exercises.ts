import type { Exercise, Misconception } from '../../schema'

/*
  O catálogo, e de onde cada armadilha veio.

  Seis vêm da lista proposta no spec. Duas nascem do `whenOmitted` do critério,
  que o spec já escreve: sem o loss, "o modelo errou" vira opinião, e o jeito
  concreto de isso acontecer é somar erros com sinal; sem a direção do passo, o
  gradient "é usado com o sinal trocado", palavra do próprio spec. Nenhuma das
  oito foi observada em aluno do público da trilha; o spec diz isso, e é a
  condição para a unidade sair de `allUnits` e entrar em `units`.
*/
export const aiMisconceptions: Misconception[] = [
  { id: 'ai.decisao-binaria', label: 'Procurar o if dentro da conta, em vez de ler a saída como pontuação',
    socraticQuestion: 'Pegue duas saídas que um sim ou não trataria igual e escreva o número de cada uma. O que a diferença entre os dois números informa, que o sim ou não apagava?',
    escalation: [
      'Escreva a conta linha por linha, da entrada até a saída. Em qual dessas linhas aparece um se, e quem escreveu essa linha?',
      'Procure no sistema onde a pontuação vira bloqueio ou liberação. Essa comparação faz parte da conta, ou é uma regra de quem lê o número?',
    ],
    reviewCycle: 'ai.c0' },

  { id: 'ai.erros-se-cancelam', label: 'Somar os erros com sinal, e um erro para cima apagar um erro para baixo',
    socraticQuestion: 'Invente um modelo que erra 3 para cima num pedido e 3 para baixo no outro. Quanto dá a soma dos dois erros, e esse número diz que o modelo acertou?',
    escalation: [
      'Refaça a soma elevando cada erro ao quadrado antes de somar. O que o quadrado faz com o sinal de cada erro?',
      'Compare com um modelo que erra 1 para cima nos dois pedidos. Qual dos dois a soma com sinal declara melhor, e qual dos dois você colocaria em produção?',
    ],
    reviewCycle: 'ai.c2' },

  { id: 'ai.valor-como-gradient', label: 'Ler o impacto de um número no valor dele, e não na conta em que ele entra',
    socraticQuestion: 'Suba esse número em 1, deixe todos os outros parados e refaça só a conta em que ele entra. Quanto o resultado dela mudou, e qual outro número da conta apareceu nessa mudança?',
    escalation: [
      'Faça o mesmo com o número que está do outro lado da mesma multiplicação. A mudança de cada um saiu igual ao valor de quem?',
      'Dobre o valor do primeiro número e repita o empurrão de 1. A mudança que você mediu dobrou junto?',
    ],
    reviewCycle: 'ai.c3' },

  { id: 'ai.impacto-local-como-gradient', label: 'Parar no impacto local e não multiplicar pelo gradient de quem vem depois',
    socraticQuestion: 'Suba este número em 1 e acompanhe a mudança conta por conta até o total. Ela chega ao total do mesmo tamanho com que saiu da primeira conta?',
    escalation: [
      'Escreva o caminho deste número até o total como uma lista de contas, com o impacto local de cada uma ao lado. O que você faz com esses impactos para saber o efeito no total?',
      'O nó de cima já tem gradient. O que esse número diz sobre o total, e em que conta deste nó ele precisa entrar?',
    ],
    reviewCycle: 'ai.c4' },

  { id: 'ai.grad-sobrescrito', label: 'Escrever o gradient com = e apagar a contribuição de outro uso do mesmo número',
    socraticQuestion: 'Faça a passada para trás de y = a × a com a = 3, escrevendo o gradient com = em vez de somar. Que gradient a recebe, e quanto y muda de verdade quando a sobe de 3 para 3,01?',
    escalation: [
      'O nó a entra na multiplicação duas vezes, uma como cada fator. Escreva as duas contribuições, uma por linha: o que o = faz com a primeira quando a segunda chega?',
      'Procure um peso que entra em duas contas, duas saídas da rede, por exemplo. Com =, de qual das duas ele deixaria de receber gradient?',
    ],
    reviewCycle: 'ai.c5' },

  { id: 'ai.passo-maior-converge-antes', label: 'Supor que learning rate maior chega antes ao ponto em que o loss é mínimo',
    socraticQuestion: 'Dê o passo com o learning rate maior e calcule o loss no ponto onde o peso parou. Ele ficou menor ou maior do que antes do passo?',
    escalation: [
      'Marque numa reta o peso antes do passo, o peso depois e o ponto em que o loss é zero. O passo parou antes desse ponto, nele, ou passou dele?',
      'Dê mais um passo a partir de onde você parou, com o mesmo learning rate, medindo o gradient ali. O peso se aproxima do ponto em que o loss é zero, ou se afasta mais?',
    ],
    reviewCycle: 'ai.c6' },

  { id: 'ai.passo-com-sinal-trocado', label: 'Somar o gradient ao peso, e andar para o lado em que o loss sobe',
    socraticQuestion: 'Suba o peso um pouco e recalcule o loss. Ele subiu ou desceu, e o passo que você propôs vai para esse lado ou para o oposto?',
    escalation: [
      'Faça o passo das duas formas, somando e subtraindo learning rate vezes gradient, e calcule o loss nos dois pontos. Em qual dos dois ele desceu?',
    ],
    reviewCycle: 'ai.c6' },

  { id: 'ai.grad-acumula-entre-rodadas', label: 'Zerar o gradient uma vez só, antes do laço, e deixar as rodadas se somarem',
    socraticQuestion: 'Rode de cabeça duas rodadas de treino com o mesmo exemplo, sem zerar entre elas. Que valor o gradient de um peso tem depois da segunda passada para trás, comparado com o da primeira?',
    escalation: [
      'Abra a linha da passada para trás que escreve o gradient. Ela soma ao que já estava lá, ou substitui? Com isso, a segunda rodada começa de qual valor?',
      'Na rodada 10, quantas passadas para trás estão somadas dentro do gradient que o passo usa, e o que isso faz com o tamanho do passo?',
    ],
    reviewCycle: 'ai.c7' },
]

export const aiExercises: Exercise[] = [
  {
    kind: 'choice', id: 'ai.e0',
    prompt:
      'Um filtro antifraude dá a cada compra a pontuação p = 0,5 × v + 3 × n − 4. O v é o valor ' +
      'da compra em centenas de reais, e n vale 1 quando o cliente nunca comprou daquele país e 0 ' +
      'quando já comprou. Uma compra de 600 reais chega de um país novo para o cliente. O que essa ' +
      'conta devolve?',
    choices: [
      { correct: true, text: 'O número 2',
        why: '0,5 × 6 + 3 × 1 − 4. A conta devolve uma pontuação; bloquear ou liberar é uma comparação que outra regra faz com esse número, fora da conta. Os pesos 0,5 e 3 dizem quanto cada entrada pesa, e o −4 é o bias, que entra em toda compra.' },
      { correct: false, text: 'Bloquear', misconceptionId: 'ai.decisao-binaria' },
      { correct: false, text: 'O número 6, porque o −4 só entra quando a compra não é suspeita', misconceptionId: 'ai.decisao-binaria' },
      { correct: false, text: 'Sim ou não, conforme a soma passe de zero dentro da conta', misconceptionId: 'ai.decisao-binaria' },
    ],
  },
  {
    kind: 'choice', id: 'ai.e1',
    prompt:
      'Um neurônio passa a soma por uma regra de saída. Na versão A, um if seco devolve 1 quando a ' +
      'soma passa de zero e −1 quando não passa. Na versão B, a regra é a tanh: tanh(0,2) ≈ 0,197 e ' +
      'tanh(0,3) ≈ 0,291. Um peso do neurônio sobe um pouco, e a soma vai de 0,2 para 0,3. Em qual ' +
      'versão a saída registra que o peso mexeu?',
    choices: [
      { correct: true, text: 'Só na versão B, a da tanh',
        why: 'O if devolve 1 para 0,2 e para 0,3, e uma saída que não muda quando o peso mexe não diz para que lado mexer. A tanh se comporta como o if longe de zero, perto de 1 ou de −1, e perto de zero devolve um grau, não um veredito.' },
      { correct: false, text: 'Em nenhuma: as duas continuam dizendo sim, e é a decisão que importa', misconceptionId: 'ai.decisao-binaria' },
      { correct: false, text: 'Na A: é o if que decide', misconceptionId: 'ai.decisao-binaria' },
    ],
  },
  {
    kind: 'choice', id: 'ai.e2',
    prompt:
      'Dois modelos preveem o prazo de entrega, em dias, de dois pedidos que chegaram em 2 e em 4 ' +
      'dias. O modelo A previu 5 e 1; o modelo B previu 3 e 5. O time somou (previsto − real) dos ' +
      'dois pedidos e concluiu que A é perfeito, com erro 0. Com o loss calculado como a soma dos ' +
      'quadrados dos erros, qual modelo erra menos?',
    choices: [
      { correct: true, text: 'B, com loss 2 contra 18',
        why: 'A erra 3 para cima e 3 para baixo: 9 + 9. B erra 1 para cima duas vezes: 1 + 1. Somar com sinal dá 0 para A porque um erro apaga o outro, e o quadrado existe para que isso não aconteça.' },
      { correct: false, text: 'A, com loss 0', misconceptionId: 'ai.erros-se-cancelam' },
      { correct: false, text: 'Empatam, porque os dois erraram o prazo dos dois pedidos', misconceptionId: 'ai.decisao-binaria' },
    ],
  },
  {
    kind: 'choice', id: 'ai.e3',
    prompt:
      'Uma pontuação é p = w1 × x1 + w2 × x2 + b, com w1 = 4, x1 = 1, w2 = 0,5, x2 = 10 e b = 2, ' +
      'o que dá p = 11. Para medir o gradient de cada número, você empurra cada um 0,1 para cima, ' +
      'um de cada vez, com os outros parados, e refaz a conta. Qual dos três, w1, w2 ou b, move p mais?',
    choices: [
      { correct: true, text: 'w2, que leva p a 12',
        why: 'Empurrado 0,1, w2 leva p de 11 para 12, e w1 e b levam só a 11,1. Por unidade, o gradient de w2 é 10, o x2 que ele multiplica; o de w1 é 1, o x1. O tamanho do próprio peso não entra nessa conta.' },
      { correct: false, text: 'w1, o maior peso', misconceptionId: 'ai.valor-como-gradient' },
      { correct: false, text: 'Os três igual, porque o empurrão foi o mesmo para todos', misconceptionId: 'ai.valor-como-gradient' },
    ],
  },
  {
    kind: 'choice', id: 'ai.e4',
    prompt:
      'Num app de corrida, tarifa = km × 2 e, no horário de pico, total = tarifa × 1,5. Uma corrida ' +
      'de 8 km dá tarifa 16 e total 24. Se a corrida tivesse 1 km a mais, com o resto parado, quanto ' +
      'o total subiria?',
    choices: [
      { correct: true, text: '3 reais, de 24 para 27',
        why: 'O impacto local de km na tarifa é 2, e o da tarifa no total é 1,5. O impacto atravessa as duas contas multiplicado: 2 × 1,5. Conferindo pela conta inteira, 9 km dão tarifa 18 e total 27.' },
      { correct: false, text: '2 reais, o quanto a tarifa sobe por km', misconceptionId: 'ai.impacto-local-como-gradient' },
      { correct: false, text: '1,5 real', misconceptionId: 'ai.impacto-local-como-gradient' },
    ],
  },
  {
    kind: 'trace', id: 'ai.e5',
    prompt:
      'O carrinho calcula total = (preço × quantidade + frete) × fator, com preço 4, quantidade 5, ' +
      'frete 6 e fator 3. A conta tem dois nós no meio: subtotal = preço × quantidade e ' +
      'soma = subtotal + frete. Faça a passada para frente e depois a passada para trás, na ordem ' +
      'das linhas: para cada nó, o valor, o impacto local e o gradient.',
    pseudocode: `função retropropagar(saída)
    saída.grad ← 1
    para cada nó em ordem_reversa(saída) faça
        para cada entrada em nó.entradas faça
            entrada.grad ← entrada.grad + impacto_local(nó, entrada) × nó.grad`,
    invariant: 'Quando chega a vez de um nó, o gradient dele já está completo, porque todo nó que usa o valor dele já passou.',
    columns: [
      { key: 'step', label: 'passo' },
      { key: 'key', label: 'nó' },
      { key: 'value', label: 'valor', placeholder: 'número' },
      { key: 'local', label: 'impacto local', placeholder: 'número' },
      { key: 'grad', label: 'gradient', placeholder: 'número' },
    ],
    conventions: [
      { notation: '0', rule: 'toda célula', why: 'Todas as contas deste carrinho dão número inteiro. Escreva só o número, sem R$ e sem unidade.' },
      { notation: 'valor', rule: 'a passada para frente', why: 'O que o nó vale com as entradas do enunciado. Um nó de cima depende dos de baixo, então faça estas contas antes de começar a passada para trás.' },
      { notation: 'impacto local', rule: 'só a conta que usa este nó', why: 'Quanto o nó de cima muda se este subir 1, com os outros números daquela conta parados. O total não tem nó de cima, e por convenção o impacto local dele é 1.' },
      { notation: 'gradient', rule: 'até o total', why: 'Quanto o total muda se este nó subir 1, com as outras entradas paradas. É o que a última linha do pseudocódigo escreve.' },
    ],
    reference: 'ai.cart-backward-trace',
    /*
      Passos 2 e 3, fator e soma: os dois fatores da última conta. O erro que
      aparece primeiro ali é escrever o próprio valor como impacto local, e o
      impacto de um fator é o OUTRO. Passos 4 e 5, frete e subtotal: os
      primeiros nós em que impacto local e gradient diferem, e quem esquece de
      multiplicar diverge ali e não antes. Passos 6 e 7, quantidade e preço:
      outra vez fatores de um produto, e quem chegou até aqui multiplicando
      erra pelo valor trocado, não pela multiplicação esquecida.
    */
    misconceptionByStep: {
      '2': 'ai.valor-como-gradient',
      '3': 'ai.valor-como-gradient',
      '4': 'ai.impacto-local-como-gradient',
      '5': 'ai.impacto-local-como-gradient',
      '6': 'ai.valor-como-gradient',
      '7': 'ai.valor-como-gradient',
    },
  },
  {
    kind: 'choice', id: 'ai.e6',
    prompt:
      'Com loss = (w − 3)² e w = 5, o loss vale 4 e o gradient de w ali é 4. Com learning rate 0,1, ' +
      'o passo w ← w − 0,1 × 4 leva w a 4,6 e o loss a 2,56. Um colega propõe learning rate 1,5, ' +
      'para chegar ao mínimo em menos passos. O que acontece no primeiro passo?',
    choices: [
      { correct: true, text: 'w cai para −1, e o loss vai a 16',
        why: '5 − 1,5 × 4 = −1, e (−1 − 3)² = 16. O passo atravessou o ponto em que o loss é zero e parou mais longe dele do que começou. O tamanho do passo é learning rate vezes gradient, e o gradient só descreve o trecho perto de onde foi medido.' },
      { correct: false, text: 'w chega mais perto de 3 do que com 0,1, porque o passo é 15 vezes maior', misconceptionId: 'ai.passo-maior-converge-antes' },
      { correct: false, text: 'w para em 3, e o loss zera', misconceptionId: 'ai.passo-maior-converge-antes' },
      { correct: false, text: 'w sobe para 11, e o loss vai a 64', misconceptionId: 'ai.passo-com-sinal-trocado' },
    ],
  },
  {
    kind: 'bug', id: 'ai.e7',
    prompt:
      'Este laço de treino chegou num pull request com a descrição "zera os gradients uma vez só, ' +
      'fora do laço, para economizar chamadas". Os testes passam. Marque a linha defeituosa e ' +
      'escolha a consequência.',
    language: 'javascript',
    code: `function train(model, examples, steps, learningRate) {
  model.zeroGrad()
  for (let step = 0; step < steps; step++) {
    const loss = model.loss(examples)
    loss.backward()
    for (const p of model.parameters()) {
      p.data -= learningRate * p.grad
    }
  }
}`,
    faultyLines: [2],
    // O pull request move a chamada para fora do laço: a linha 2 é a que ele acrescenta.
    addedLines: [2],
    consequences: [
      { correct: true, text: 'Cada passo usa o gradient somado de todos os passos anteriores',
        why: 'backward soma ao que já está em p.grad, porque é assim que um peso usado em duas contas recebe as duas contribuições. Sem zerar a cada passo, o gradient do passo 10 carrega as dez passadas para trás, e o passo cresce mesmo com o loss já perto do mínimo.' },
      { correct: false, text: 'Nenhuma: backward recalcula o gradient do zero a cada chamada', misconceptionId: 'ai.grad-acumula-entre-rodadas' },
      { correct: false, text: 'O certo é backward escrever o gradient com = em vez de somar, e aí zerar uma vez basta', misconceptionId: 'ai.grad-sobrescrito' },
    ],
  },
  {
    kind: 'choice', id: 'ai.e8',
    prompt:
      'No chamado, o pedido de 3 itens de 10 reais com frete de 5 custava 70 com fator 2 e passou a ' +
      '91 com fator 2,6. O financeiro tinha fechado 77 para esse pedido, e o ajuste noturno desce o ' +
      'loss (total − 77)². O que esses números dizem sobre o ajuste daquela noite?',
    choices: [
      { correct: true, text: 'A direção estava certa e o passo foi grande demais',
        why: 'Para o total dar 77 o fator precisa ir a 2,2, porque 77 ÷ 35 = 2,2. Subir era o lado certo; subir 0,6 passou do ponto, e o loss foi de 49 para 196. Cada 0,1 no fator move o total em 3,5 reais, porque o fator multiplica o pedido inteiro.' },
      { correct: false, text: 'O ajuste funcionou: um passo grande chega antes, e a noite seguinte corrige', misconceptionId: 'ai.passo-maior-converge-antes' },
      { correct: false, text: 'O sinal estava trocado: para bater com o financeiro, o fator devia ter descido', misconceptionId: 'ai.passo-com-sinal-trocado' },
      { correct: false, text: 'Foi um passo pequeno, de 0,6 num fator 2', misconceptionId: 'ai.valor-como-gradient' },
    ],
  },
]
