import type { Exercise, Misconception } from '../../schema'

/*
  O catálogo, e de onde cada armadilha veio.

  Seis vêm da lista proposta no spec. Duas nascem do `whenOmitted` do critério,
  que o spec já escreve: sem o loss, "o modelo errou" vira opinião, e o jeito
  concreto de isso acontecer é somar erros com sinal; sem a direção do passo, o
  gradient "é usado com o sinal trocado", palavra do próprio spec. A nona,
  `ai.zerar-em-qualquer-ponto`, nasce de ai.e7: o ciclo c7 ensina que o
  gradient acumula, e o exercício cobra o passo seguinte, que é ler em que ponto
  da rodada a chamada de zerar está. A décima, `ai.empilhar-sem-ativacao`, nasce
  de ai.e1 depois da revisão externa de 2026-11-09: c1 deixou de ensinar o if
  contra a curva e passou a ensinar que neurônios em sequência, sem activation
  function, colapsam numa conta de multiplicar e somar só. A décima primeira e a
  décima segunda, `ai.passar-do-ponto-e-crescer` e `ai.distancia-uma-vez`, nascem
  de ai.e8 depois da auditoria de 2026-11-09: o exercício passou a perguntar
  acima de que learning rate o passo da rota de 500 km faz o erro crescer, e as
  duas leituras erradas que levam a 0,02 e a 0,2 não cabiam em nenhuma das
  outras. Nenhuma das doze foi observada em aluno do público da trilha; o spec
  diz isso, e é a condição para a unidade sair de `allUnits` e entrar em `units`.
*/
export const aiMisconceptions: Misconception[] = [
  { id: 'ai.decisao-binaria', label: 'Procurar o if dentro da conta, em vez de ler a saída como pontuação',
    socraticQuestion: 'Pegue duas saídas que um sim ou não trataria igual e escreva o número de cada uma. O que a diferença entre os dois números informa, que o sim ou não apagava?',
    escalation: [
      'Escreva a conta linha por linha, da entrada até a saída. Em qual dessas linhas aparece um if, e quem escreveu essa linha?',
      'Procure no sistema onde a pontuação vira bloqueio ou liberação. Essa comparação faz parte da conta, ou é uma regra de quem lê o número?',
    ],
    reviewCycle: 'ai.c0' },

  { id: 'ai.empilhar-sem-ativacao', label: 'Supor que neurônios em sequência, sem activation function entre eles, fazem uma conta que um neurônio só não faz',
    socraticQuestion: 'Escreva a conta do segundo neurônio trocando y pela conta do primeiro, e simplifique. O que sobra tem a forma de um peso vezes x mais um bias, ou outra forma?',
    escalation: [
      'Calcule z para três entradas seguidas e anote quanto ele sobe de uma para a outra. O aumento muda de uma entrada para a seguinte, ou é sempre o mesmo?',
      'Escreva um neurônio só com o peso e o bias que você encontrou e calcule a saída dele para as mesmas três entradas. Em qual delas ele discorda dos dois neurônios em sequência?',
    ],
    reviewCycle: 'ai.c1' },

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

  { id: 'ai.impacto-local-como-gradient', label: 'Parar no impacto local e não multiplicar pelo gradient do nó de cima',
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
      'Procure um número que entra em duas contas, a saída de um neurônio que alimenta dois neurônios ligados a ele, por exemplo. Com =, de qual dos dois ele deixaria de receber gradient?',
    ],
    reviewCycle: 'ai.c5' },

  { id: 'ai.passo-maior-converge-antes', label: 'Supor que learning rate maior chega antes ao ponto em que o loss é mínimo',
    socraticQuestion: 'Dê o passo com o learning rate maior e calcule o loss no ponto onde o peso parou. Ele ficou menor ou maior do que antes do passo?',
    escalation: [
      'Marque numa reta o peso antes do passo, o peso depois e o ponto em que o loss é zero. O passo parou antes desse ponto, nele, ou passou dele?',
      'Dê mais um passo a partir de onde você parou, com o mesmo learning rate, medindo o gradient ali. O peso se aproxima do ponto em que o loss é zero, ou se afasta mais?',
    ],
    reviewCycle: 'ai.c6' },

  { id: 'ai.passar-do-ponto-e-crescer', label: 'Supor que todo passo que passa do ponto em que o loss é zero deixa o erro maior',
    socraticQuestion: 'Escolha um learning rate um pouco acima do que zera o erro num passo, dê o passo e calcule o erro depois dele. O peso passou do ponto? E o erro ficou maior ou menor, em tamanho, do que o de antes?',
    escalation: [
      'Escreva o erro depois do passo como o erro antes vezes um número. Para que valores desse número o erro troca de sinal, e para quais ele fica maior em tamanho?',
      'Aumente o learning rate aos poucos, refazendo a primeira tarefa a cada vez. Em qual valor o erro depois do passo fica exatamente do tamanho do erro de antes?',
    ],
    reviewCycle: 'ai.c8' },

  { id: 'ai.distancia-uma-vez', label: 'Contar a distância uma vez só no passo, e esquecer que ela também decide quanto o peso move a previsão',
    socraticQuestion: 'Suba o peso em 0,1 e refaça a previsão: quantos dias ela andou? Agora escreva quantos dias a previsão anda num passo inteiro, learning rate vezes o gradient do peso no loss: em quantos lugares dessa conta a distância aparece?',
    escalation: [
      'Com o learning rate que você escolheu, dê um passo a partir do peso 0,4 e calcule a previsão e o erro depois dele. O erro ficou menor, em tamanho, do que 1 dia?',
    ],
    reviewCycle: 'ai.c8' },

  { id: 'ai.passo-com-sinal-trocado', label: 'Somar o gradient ao peso, e andar para o lado em que o loss sobe',
    socraticQuestion: 'Suba o peso um pouco e recalcule o loss. Ele subiu ou desceu, e o passo que você propôs vai para esse lado ou para o oposto?',
    escalation: [
      'Faça o passo das duas formas, somando e subtraindo learning rate vezes gradient, e calcule o loss nos dois pontos. Em qual dos dois ele desceu?',
    ],
    reviewCycle: 'ai.c6' },

  { id: 'ai.grad-acumula-entre-rodadas', label: 'Supor que a passada para trás escreve o gradient do zero, e não soma ao que sobrou da rodada anterior',
    socraticQuestion: 'Rode de cabeça duas rodadas de treino com o mesmo exemplo, sem zerar entre elas. Que valor o gradient de um peso tem depois da segunda passada para trás, comparado com o da primeira?',
    escalation: [
      'Abra a linha da passada para trás que escreve o gradient. Ela soma ao que já estava lá, ou substitui? Com isso, a segunda rodada começa de qual valor?',
      'Na rodada 10, quantas passadas para trás estão somadas dentro do gradient que o passo usa, e o que isso faz com o tamanho do passo?',
    ],
    reviewCycle: 'ai.c7' },

  { id: 'ai.zerar-em-qualquer-ponto', label: 'Supor que zerar o gradient em qualquer ponto da rodada dá o mesmo resultado',
    socraticQuestion: 'Siga uma rodada do laço linha por linha e anote o valor de p.grad logo depois de cada chamada. Que valor ele tem quando chega à linha que muda o peso?',
    escalation: [
      'Com o valor que você anotou, calcule o peso depois de três rodadas. Quanto ele andou, e o que isso faz com o loss?',
      'Coloque a chamada de zerar em cada uma das outras posições possíveis da rodada e repita a primeira tarefa. Em qual delas a linha que muda o peso lê o gradient desta rodada, e só ele?',
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
      'Um modelo passa a entrada por dois neurônios em sequência, sem activation function entre ' +
      'eles. O primeiro faz y = 4 × x − 2, e o segundo recebe y e faz z = 0,5 × y + 3. Um colega ' +
      'diz que, com dois neurônios, o modelo faz uma conta que um neurônio só não faz. Calcule z ' +
      'para x = 0, 1 e 2. O que os três valores mostram sobre o que o colega disse?',
    choices: [
      { correct: true, text: 'Valem 2, 4 e 6, como em z = 2 × x + 2, e o colega errou',
        why: 'Com x = 0, 1 e 2, y vale −2, 2 e 6, e z vale 2, 4 e 6: sobe 2 a cada 1 a mais em x, sempre o mesmo tanto. Trocando y pela conta do primeiro, z = 0,5 × (4 × x − 2) + 3 = 2 × x + 2, um neurônio com peso 2 e bias 2. Sem activation function entre os dois, empilhar só alonga a conta. Com a tanh no meio, z deixaria de subir sempre o mesmo tanto, e nenhum neurônio só o reproduziria.' },
      { correct: false, text: 'z dá 2, 4 e 8: dobra, e o colega acertou', misconceptionId: 'ai.empilhar-sem-ativacao' },
      { correct: false, text: 'O colega acertou: z sobe 2 por vez, mas o segundo neurônio nunca vê x, só y', misconceptionId: 'ai.empilhar-sem-ativacao' },
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
      'base = subtotal + frete. Faça a passada para frente e depois a passada para trás, na ordem ' +
      'das linhas: para cada nó, o valor, o impacto local e o gradient.',
    pseudocode: `função retropropagar(saída)
    saída.grad ← 1
    para cada nó em ordem_reversa(saída) faça
        para cada operando em nó.operandos faça
            operando.grad ← operando.grad + impacto_local(nó, operando) × nó.grad`,
    invariant: 'Quando chega a vez de um nó, o gradient dele já está completo, porque todo nó que usa o valor dele já passou.',
    columns: [
      { key: 'step', label: 'ordem' },
      { key: 'key', label: 'nó' },
      { key: 'value', label: 'valor', placeholder: 'número' },
      { key: 'local', label: 'impacto local', placeholder: 'número' },
      { key: 'grad', label: 'gradient', placeholder: 'número' },
    ],
    conventions: [
      { notation: 'número inteiro', rule: 'toda célula', why: 'Todas as contas deste carrinho dão número inteiro. Escreva só o número, sem R$ e sem unidade.' },
      { notation: 'valor', rule: 'a passada para frente', why: 'O que o nó vale com as entradas do enunciado. Um nó de cima depende dos de baixo, então faça estas contas antes de começar a passada para trás.' },
      { notation: 'impacto local', rule: 'só a conta que usa este nó', why: 'Quanto o nó de cima muda se este subir 1, com os outros números daquela conta parados. O total não tem nó de cima, e por convenção o impacto local dele é 1.' },
      { notation: 'gradient', rule: 'até o total', why: 'Quanto o total muda se este nó subir 1, com as outras entradas paradas. É o que a última linha do pseudocódigo escreve.' },
    ],
    reference: 'ai.cart-backward-trace',
    /*
      Linhas 2 e 3, fator e base: os dois fatores da última conta. O erro que
      aparece primeiro ali é escrever o próprio valor como impacto local, e o
      impacto de um fator é o OUTRO. Linhas 4 e 5, frete e subtotal: os
      primeiros nós em que impacto local e gradient diferem, e quem esquece de
      multiplicar diverge ali e não antes. Linhas 6 e 7, quantidade e preço:
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
      'Este laço de treino chegou num pull request que reorganiza o que acontece dentro de cada ' +
      'rodada. O modelo segue o micrograd, uma biblioteca pequena e didática de backpropagation: ' +
      'cada peso e cada bias (o que model.parameters() devolve) guarda o gradient num número, ' +
      'p.grad, e a chamada que zera os gradients escreve 0 em cada um. Assim, o laço roda sem ' +
      'erro. Marque a linha defeituosa e escolha a consequência.',
    language: 'python',
    code: `def train(model, examples, rounds, learning_rate):
    for _ in range(rounds):
        loss = model.loss(examples)
        loss.backward()
        model.zero_grad()
        for p in model.parameters():
            p.data -= learning_rate * p.grad`,
    faultyLines: [5],
    /*
      O pull request traz a função inteira, e o diff marca todas as linhas como
      novas. Marcar só a linha 5 apontaria a resposta: a versão anterior marcava
      exatamente a linha defeituosa, e a metade "marque a linha" do exercício
      não media nada.
    */
    addedLines: [1, 2, 3, 4, 5, 6, 7],
    consequences: [
      { correct: true, text: 'Nenhum peso muda, e o loss fica igual em toda rodada',
        why: 'zero_grad roda depois de backward e antes da linha que muda o peso: quando o passo lê p.grad, ele já é 0, e p.data − learning_rate × 0 é o próprio p.data. Nenhum erro aparece, porque subtrair zero é uma conta válida. A chamada de zerar apaga o que sobrou da rodada anterior só quando vem antes de backward; depois dele, apaga o gradient desta rodada antes de alguém usá-lo.' },
      { correct: false, text: 'O passo usa o gradient da rodada atual, e só ele', misconceptionId: 'ai.zerar-em-qualquer-ponto' },
      { correct: false, text: 'Nenhuma: backward escreve o gradient do zero, e zerar só sobra', misconceptionId: 'ai.grad-acumula-entre-rodadas' },
      { correct: false, text: 'O passo sai certo se backward escrever com = em vez de somar', misconceptionId: 'ai.grad-sobrescrito' },
    ],
  },
  {
    kind: 'choice', id: 'ai.e8',
    prompt:
      'No chamado, o prazo previsto é distância × peso + base, e o job dá o passo ' +
      'peso ← peso − learning rate × gradient do peso no loss. A rota tem distância 5, a base é ' +
      '1 dia, a entrega real levou 4 dias, e com peso 0,4 a previsão era 3. Com learning rate 0,06, ' +
      'o ajuste daquela entrega levou o erro de 1 dia abaixo para 2 acima. Acima de que learning ' +
      'rate esse ajuste deixa o erro maior, em tamanho, do que estava antes do passo?',
    choices: [
      { correct: true, text: '0,04, dois terços do que o job usava',
        why: 'O erro depois do passo é o erro antes vezes (1 − learning rate × 2 × 25). A distância entra duas vezes: uma no gradient do loss, 2 × erro × 5, e outra no quanto o peso move a previsão, 5 dias por unidade de peso. Em 0,04, 2 ÷ 50, o fator vale −1 e o erro só troca de sinal, de 1 dia abaixo para 1 acima. Acima disso o fator fica abaixo de −1 e o erro cresce em tamanho a cada passo; com 0,06 ele é −2. Entre 0,02 e 0,04 o peso passa do ponto e o erro ainda encolhe.' },
      { correct: false, text: '0,06, o que o job usava', misconceptionId: 'ai.passo-maior-converge-antes' },
      { correct: false, text: '0,02, o que leva o erro a zero num passo', misconceptionId: 'ai.passar-do-ponto-e-crescer' },
      { correct: false, text: '0,2, que é 2 ÷ (2 × 5)', misconceptionId: 'ai.distancia-uma-vez' },
    ],
  },
]
