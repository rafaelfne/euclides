import type { Unit } from '../../schema'
import { aiExercises, aiMisconceptions } from './exercises'

/*
  A unidade fica FORA de `units` e dentro de `allUnits`, como a pré-trilha
  (spec, decisão 7). Ela não entra no nivelamento, nas faixas nem nos
  contadores; promover custa uma linha em `src/content/index.ts`, e a condição
  é ter armadilhas observadas em alunos, não só propostas.

  A banda de c1 diverge do spec: ele lista c1 como técnica, e c1 não elabora
  nenhuma das duas técnicas. A tanh é parte da saída do critério, então c1 mora
  na banda critério.
*/
export const aiUnit: Unit = {
  kind: 'method',
  id: 'ai',
  number: 9,
  title: 'Como uma IA decide',
  learningObjective:
    'Diante de uma conta com pesos, dizer o que ela devolve, quanto errou, quanto cada número ' +
    'pesa no erro e para que lado cada peso precisa mexer, sem executar, e saber quando medir ' +
    'empurrando um número e quando voltar do resultado até as entradas.',
  prerequisites: [
    'Escrever o execution trace de um laço curto, rodada por rodada (unidade 01)',
    'Contar quantas vezes um procedimento refaz uma conta, e dizer o que essa contagem mede (unidade 02)',
    'Somar e multiplicar números com vírgula',
  ],
  motivatingProblem:
    'Uma transportadora mostra ao cliente quantos dias a entrega vai levar, com uma conta ' +
    'simples: prazo = distância × peso + base. A distância vai em centenas de km, e a base é ' +
    '1 dia fixo de separação. Por anos, o prazo saiu de uma tabela da transportadora, e quando ' +
    'as entregas começavam a atrasar alguém de operações somava um dia a mais na mão. O time ' +
    'trocou a tabela por essa conta, e o peso, que começou em 0,4 (a média de um trimestre: ' +
    'cada 100 km somavam 0,4 dia), agora é ajustado por um job toda noite: ele compara as ' +
    'previsões com as entregas do dia e empurra o peso para o lado que diminui o erro. Numa ' +
    'rota de 500 km, distância 5, a ' +
    'previsão era 5 × 0,4 + 1 = 3 dias, e a entrega real levou 4. Numa noite, o job levou o ' +
    'peso a 1,0, e a mesma rota passou a prever 5 × 1,0 + 1 = 6 dias. Toda rota de 500 km ou ' +
    'mais passou a prever pelo menos o dobro. Ninguém mexeu no código, e nenhuma entrega mudou: ' +
    'mudou o número dentro da conta. O chamado pergunta qual número o job mexeu, por que ' +
    'aquele, e por que tanto de uma vez. E a pergunta por trás dele: quando uma estimativa ' +
    'erra, como se descobre qual número mexer, e para que lado, sem tentar um por um?',

  symbols: [
    { symbol: 'i', means: 'a posição da entrada que o laço está somando' },
    { symbol: 'w', means: 'um peso do neurônio, o número que o ajuste mexe' },
    { symbol: 'x', means: 'a entrada que o peso multiplica' },
    { symbol: 'b', means: 'o bias, o número somado no fim da conta' },
    { symbol: 'w1, w2', means: 'dois pesos do neurônio, um para cada entrada' },
    { symbol: 'x1, x2', means: 'as duas entradas, na mesma ordem dos pesos' },
    { symbol: 'p', means: 'a pontuação que a conta devolve' },
    { symbol: 'y', means: 'o resultado da conta do exemplo' },
    { symbol: 'a', means: 'um número que a mesma conta usa duas vezes' },
    { symbol: 'tanh', means: 'a curva que leva qualquer soma para um número entre menos um e um' },
  ],

  criterion: {
    id: 'weight-adjustment',
    name: 'Ajuste de um peso',
    produces:
      'para uma conta com pesos e uma entrada: o que ela devolve, quanto errou, quanto cada ' +
      'número pesa no erro, e para que lado e quanto cada peso mexe',
    parts: [
      { id: 'output', name: 'saída',
        guarantee: 'o valor que a conta devolve para uma entrada, conta por conta' },
      { id: 'loss', name: 'loss',
        guarantee: 'um número só que mede o quanto a saída errou' },
      { id: 'gradient', name: 'gradient por nó',
        guarantee: 'quanto o loss muda se aquele número subir um pouco, com os outros parados' },
      { id: 'step', name: 'direção do passo',
        guarantee: 'para que lado cada peso mexe para o loss cair, e o tamanho do passo' },
    ],
    whenOmitted: [
      { partId: 'output', reads: 'o modelo decidiu que é fraude' },
      { partId: 'loss', reads: 'o modelo errou um pouco' },
      { partId: 'gradient', reads: 'vamos mexer no peso da distância e ver se melhora' },
      { partId: 'step', reads: 'o gradient do peso no loss é positivo, então o peso sobe' },
    ],
  },

  techniques: [
    {
      id: 'numeric-gradient',
      name: 'Gradient numérico',
      derivesCriterion: 'weight-adjustment',
      summary:
        'Empurrar um número um pouco, refazer a conta inteira e dividir a diferença do ' +
        'resultado pelo tamanho do empurrão. Uma conta de referência, mais uma por número medido. ' +
        'Ela não ajusta peso nenhum: o passo consome o gradient que ela mede.',
      produces: ['output', 'loss', 'gradient', 'step'],
      wrongWhen: [
        { scenario: 'A conta tem mais de um punhado de pesos: com 1 milhão deles, um único ajuste custa 1 milhão e uma execuções da conta inteira',
          useInstead: 'backpropagation, que entrega o gradient de todos os números em duas passadas' },
        { scenario: 'O empurrão é grande para o trecho, e a conta faz curva entre o valor e o valor empurrado',
          useInstead: 'um empurrão menor, ou backpropagation, que não depende do tamanho de empurrão nenhum' },
      ],
      everydayAnchor:
        'É o que um dev faz por instinto diante de um número de configuração que ninguém ' +
        'documentou: muda esse valor, roda de novo e vê o que acontece. Serve para um timeout; ' +
        'não serve para cem parâmetros de uma vez.',
      invariant: 'O empurrão é pequeno o bastante para a conta se comportar como reta naquele trecho.',
    },
    {
      id: 'backpropagation',
      name: 'Backpropagation',
      derivesCriterion: 'weight-adjustment',
      summary:
        'Uma passada para frente guardando o valor de cada nó, e uma para trás que sai do ' +
        'resultado e multiplica os impactos locais pela regra da cadeia, até as entradas. Ela ' +
        'não ajusta peso nenhum: o passo consome o gradient que ela entrega.',
      produces: ['output', 'loss', 'gradient', 'step'],
      wrongWhen: [
        { scenario: 'A conta tem um ciclo, um valor que depende de si mesmo: não existe ordem em que todo nó venha depois dos que usam o valor dele',
          useInstead: 'gradient numérico, que só refaz a conta e não depende de ordem nenhuma' },
        { scenario: 'Você precisa conferir se uma implementação de backpropagation está certa',
          useInstead: 'gradient numérico, número por número, comparado com o que ela entregou' },
      ],
      everydayAnchor:
        'É o motivo de treinar um modelo ser viável. Sem ela, um único ajuste num modelo de ' +
        '1 milhão de pesos custaria 1 milhão e uma execuções da conta inteira; com ela, custa duas, ' +
        'e o preço passa a ser a memória que guarda cada valor intermediário.',
      invariant: 'Quando chega a vez de um nó, o gradient dele já está completo, porque todo nó que usa o valor dele já passou.',
    },
  ],

  cycles: [
    { id: 'ai.c0', title: 'Uma decisão é uma soma com pesos', layer: 'essential', band: 'criterion',
      introducesTerms: ['neuron', 'neuron-weight', 'bias'],
      oneLine: 'Uma IA não escolhe sim ou não: ela soma informações, cada uma multiplicada pelo seu peso.',
      plainly:
        'Quando um sistema decide se um alerta acorda o plantão, a parte que aprende não tem if. ' +
        'Ela pega cada informação do alerta, multiplica pelo peso dela, soma tudo e devolve uma ' +
        'pontuação. O peso é um número: 0,01 para cada ms de latência, 2 para estar em produção. ' +
        'Quem decide acordar ou não é uma ' +
        'regra separada, que compara a pontuação com um limite.',
      body: [
        'A pergunta que vem primeiro é onde fica o if. Num filtro de fraude, num classificador de chamados ou num modelo de 1 bilhão de números, a parte que aprende é a mesma conta repetida: cada entrada multiplicada por um número, os produtos somados, mais um número somado no fim. Essa conta é o **neurônio**, e muitos deles ligados, a saída de um entrando em outro, formam uma rede.',
        'O número que multiplica uma entrada é o **peso do neurônio**: quanto aquela entrada conta na soma. O número somado no fim é o **bias**: entra em toda conta, inclusive quando todas as entradas valem 0, e decide de onde a pontuação parte. Nenhum dos dois foi escolhido por alguém. Quem os produz é um laço que ajusta esses números até a saída acertar, e é por isso que um modelo pronto mostra pesos como 1,0 e 2,0 sem dizer de onde vieram.',
        'A conta devolve uma pontuação, não um veredito. O if existe, mas mora fora dela: outra regra compara a pontuação com um limite. Ler a saída como sim ou não joga fora a única coisa que ela informa a mais, o quanto.',
      ],
      pseudocode: `função pontuar(entradas, pesos, bias)
    soma ← bias
    para i de 0 até |entradas| − 1 faça
        soma ← soma + pesos[i] × entradas[i]
    retorne soma`,
      invariant: 'A soma começa pelo bias, e cada rodada acrescenta exatamente um produto de peso por entrada.',
      workedExample: {
        problem:
          'Um alerta chega com latência de 700 ms, vindo de produção. Com peso 0,01 para a latência, ' +
          'peso 2 para produção e bias −1, a conta faz 0,01 × 700 = 7, mais 2 × 1 = 2, mais −1: a ' +
          'pontuação é 8. Um alerta de homologação, onde a entrada de produção vale 0, com latência ' +
          'de 900 ms, faz 9 + 0 − 1 e pontua o mesmo 8.',
        whatToNotice:
          'A conta devolveu 8 nos dois casos, e nenhum deles é sim ou não: acordar o plantão é uma ' +
          'comparação que outra regra faz com o 8. E o −1 entrou nas duas contas, porque o bias não ' +
          'depende de entrada nenhuma.',
      },
      figure: {
        kind: 'concept-flow',
        caption: 'A conta termina na pontuação. O if que acorda o plantão é de quem lê o número, e mora fora da conta.',
        nodes: [
          { id: 'latency', label: 'latência 700 × peso 0,01', tone: 'neutral' },
          { id: 'production', label: 'produção 1 × peso 2', tone: 'neutral' },
          { id: 'bias', label: 'bias −1', tone: 'neutral' },
          { id: 'score', label: 'pontuação 8', tone: 'contract' },
          { id: 'rule', label: 'regra de fora: passa de 7?', tone: 'cost' },
        ],
        edges: [
          { from: 'latency', to: 'score' },
          { from: 'production', to: 'score' },
          { from: 'bias', to: 'score' },
          { from: 'score', to: 'rule' },
        ],
      },
      exerciseId: 'ai.e0' },

    { id: 'ai.c1', title: 'tanh, o if que não é seco', layer: 'essential', band: 'criterion',
      introducesTerms: ['activation-function'],
      oneLine: 'Um if devolve sim ou não e fica igual quando um peso mexe pouco; uma curva suave muda.',
      plainly:
        'Um sistema que só responde sim ou não esconde se a situação mudou um pouco. Se uma ' +
        'informação muda e a resposta continua igual, ninguém sabe se a mudança ajudou ou piorou. ' +
        'Uma curva suave troca o sim ou não por um grau: perto do meio ela responde a cada ' +
        'pequena mudança, e longe do meio quase vira sim ou não.',
      body: [
        'Um if seco que devolve 1 quando a soma passa de 0 e −1 quando não passa trata uma soma de 1,0 e uma de 1,1 do mesmo jeito: as duas viram 1. Se um peso subiu e levou a soma de uma para a outra, a saída não registrou nada, e uma saída que não muda não diz para que lado o peso deveria ir.',
        'A **activation function** é a regra que transforma a soma na saída do neurônio, e a tanh é a mais usada para explicar o mecanismo. Ela devolve um número entre −1 e 1. Longe de zero ela se comporta como o if: tanh(2) ≈ 0,964 e tanh(−2) ≈ −0,964. Perto de zero ela devolve um grau, e o grau muda quando a soma muda.',
        'É o if que você procurava no ciclo anterior, sem a quina. Quem precisa de sim ou não continua comparando a saída com um limite, fora da conta. Dentro dela, a curva suave é o que permite medir, adiante, quanto cada peso move o resultado.',
      ],
      pseudocode: `função degrau(soma)
    se soma > 0 então
        retorne 1
    retorne −1

função ativar(soma)
    retorne tanh(soma)`,
      workedExample: {
        problem:
          'Um peso sobe e a soma vai de 1,0 para 1,1. Com o if seco, a saída era 1 e continua 1. ' +
          'Com a tanh, ela vai de 0,762 para 0,800, quase 0,04 a mais.',
        whatToNotice:
          'As duas regras concordam no sinal: as duas dizem positivo. Só a tanh registrou que a soma ' +
          'andou, e é essa diferença de quase 0,04 que vai dizer, mais adiante, para que lado o peso ' +
          'deve mexer.',
      },
      exerciseId: 'ai.e1' },

    { id: 'ai.c2', title: 'Loss: um número para o quanto errou', layer: 'essential', band: 'criterion',
      introducesTerms: ['loss'],
      oneLine: 'Para corrigir um erro, primeiro ele vira um número só, e o sinal não pode apagar nada.',
      plainly:
        'Um modelo que erra um pedido para cima e outro para baixo pode parecer perfeito se os ' +
        'erros forem somados com sinal: um apaga o outro. Para saber quanto ele erra de verdade, ' +
        'cada erro tem de contar como erro, para qualquer lado, e o total precisa ser um número ' +
        'só, para dar para comparar dois modelos e saber se uma mudança melhorou.',
      body: [
        'Um modelo prevê o tempo de build de dois pipelines que levaram 30 e 40 minutos, e previu 39 e 31. Somando os erros com sinal, +9 e −9, o resultado é 0, e o relatório diz que o modelo acertou. Ele errou os dois por 9 minutos.',
        'O **loss** é o número único que mede o quanto a saída errou, e a forma mais comum soma o quadrado de cada erro. O quadrado faz duas coisas: tira o sinal, e faz um erro de 9 contar 81 enquanto um erro de 1 continua contando 1. Um erro grande pesa mais que vários pequenos.',
        'Sem um loss, "o modelo errou" é opinião, e não há para onde descer. Com ele, ajustar vira uma pergunta que tem resposta: que mudança nos pesos faz este número cair? É a pergunta que o resto da unidade responde.',
      ],
      pseudocode: `função loss(previstos, reais)
    total ← 0
    para i de 0 até |previstos| − 1 faça
        erro ← previstos[i] − reais[i]
        total ← total + erro × erro
    retorne total`,
      workedExample: {
        problem:
          'Dois modelos para os builds de 30 e 40 minutos. A previu 39 e 31: erros +9 e −9, soma com ' +
          'sinal 0, loss 81 + 81 = 162. B previu 31 e 48: erros +1 e +8, soma com sinal 9, loss ' +
          '1 + 64 = 65.',
        whatToNotice:
          'A soma com sinal declara A perfeito e B pior. O loss inverte a ordem, 65 contra 162, e é ' +
          'essa a ordem que você usaria para escolher qual dos dois colocar em produção.',
      },
      exerciseId: 'ai.e2' },

    { id: 'ai.c3', title: 'Mexer um pouco e medir', layer: 'essential', band: 'technique', elaborates: 'numeric-gradient',
      introducesTerms: ['gradient'],
      oneLine: 'Para saber quanto um número pesa no resultado, mexa nele um pouco e veja o resultado andar.',
      plainly:
        'Quando você não sabe o que um número de configuração faz, você muda um pouco o valor, ' +
        'roda de novo e vê o resultado mudar. Isso mede quanto aquele número pesa no resultado. ' +
        'Funciona para qualquer conta, mas custa rodar tudo de novo para cada número que você quer ' +
        'medir. Com poucos números, tudo bem. Com um milhão, não.',
      body: [
        'Volte ao alerta que pontuou 8, com pesos 0,01 e 2 e bias −1. Suba o peso da latência de 0,01 para 0,011, deixe o resto parado e refaça a conta: a pontuação vai de 8 para 8,7. Faça o mesmo com o peso de produção, de 2 para 2,001: a pontuação vai a 8,001.',
        'Dividindo a mudança pelo empurrão de 0,001, sai o **gradient** de cada número na pontuação: quanto o resultado muda se ele subir um pouco, com os outros parados. O do peso da latência é 700; o do peso de produção é 1. O peso menor move a pontuação 700 vezes mais, porque o que ele multiplica é a latência, 700. O tamanho do próprio peso não entra na conta.',
        'É o que um dev faz por instinto, muda esse valor e vê o que acontece, e cobra uma conta inteira refeita por número medido, mais a conta de referência. Para os três números do alerta, quatro execuções da conta inteira. Para um modelo de 1 milhão de pesos, 1.000.001 execuções para um único ajuste. A técnica continua útil para conferir: se outra técnica entregar um gradient diferente deste, uma das duas está errada.',
      ],
      pseudocode: `função medir_gradient(conta, números, nome, empurrão)
    referência ← conta(números)
    números[nome] ← números[nome] + empurrão
    empurrada ← conta(números)
    números[nome] ← números[nome] − empurrão
    retorne (empurrada − referência) / empurrão`,
      invariant: 'O empurrão é pequeno o bastante para a conta se comportar como reta naquele trecho.',
      workedExample: {
        problem:
          'Com o alerta em 8, o bias sobe de −1 para −0,999. A pontuação vai a 8,001: a mudança foi ' +
          '0,001, e dividida pelo empurrão de 0,001 dá gradient 1. O bias é somado direto, e a ' +
          'pontuação acompanha qualquer mudança nele, um para um.',
        whatToNotice:
          'O gradient do bias é 1 qualquer que seja a entrada, porque o bias não multiplica nada. O ' +
          'do peso da latência é 700 porque ele multiplica 700: num alerta de 300 ms, seria 300.',
      },
      exerciseId: 'ai.e3' },

    { id: 'ai.c4', title: 'Regra da cadeia: o impacto atravessa as contas', layer: 'essential', band: 'technique', elaborates: 'backpropagation',
      introducesTerms: ['chain-rule', 'local-impact'],
      oneLine: 'Quando uma conta alimenta outra, o efeito de um número atravessa as duas, multiplicado.',
      plainly:
        'Num sistema, uma conta costuma alimentar outra. Se cada requisição gera várias consultas ' +
        'e cada consulta leva um tempo, uma requisição a mais mexe no tempo através das consultas. ' +
        'Para saber quanto, multiplique quanto cada conta muda por unidade da anterior. Não é ' +
        'preciso refazer tudo: basta saber o efeito de cada conta no caminho.',
      body: [
        'Uma requisição faz 8 consultas ao banco, de 2 ms cada: 10 requisições dão 80 consultas e 160 ms. Uma requisição a mais traz 8 consultas e sobe o tempo em 16 ms, 8 × 2.',
        'O **impacto local** de uma conta é quanto ela muda se um número que ela usa subir 1, com o resto parado: 8 de requisições em consultas, 2 de consultas em tempo. A **regra da cadeia** diz que o impacto de um número no resultado final é o produto dos impactos locais do caminho.',
        'Numa soma, cada parcela tem impacto local 1. Num produto, o de um fator é o valor do outro fator, não o dele.',
        'Cada conta é um nó, e o nó que usa o resultado de outro é o nó de cima. Parar no impacto local da primeira conta diz quanto as consultas sobem, não o tempo. E nenhum nó refaz o caminho: multiplica o próprio impacto local pelo gradient do nó de cima, que já o carrega até o fim.',
      ],
      workedExample: {
        problem:
          'Com 10 requisições, 8 consultas por requisição e 2 ms por consulta, o tempo é 160 ms. Todo ' +
          'gradient aqui é no tempo. O do próprio tempo é 1, por convenção. O de consultas é o impacto ' +
          'local 2 vezes esse 1: 2. O de requisições é o impacto local 8 vezes o gradient de consultas: ' +
          '16. Conferindo pela conta inteira, 11 requisições dão 88 consultas e 176 ms, 16 a mais.',
        whatToNotice:
          'O 16 de requisições não foi recalculado do zero. Saiu do gradient de consultas, que já ' +
          'estava pronto, multiplicado pelo impacto local de uma conta só.',
      },
      exerciseId: 'ai.e4' },

    { id: 'ai.c5', title: 'Backpropagation em ordem', layer: 'essential', band: 'technique', elaborates: 'backpropagation',
      introducesTerms: ['backpropagation', 'forward-pass', 'backward-pass'],
      oneLine: 'Faça a conta para frente guardando cada valor, e volte do resultado até as entradas, uma vez só.',
      plainly:
        'Medir número por número custa rodar a conta inteira para cada um. Existe um jeito de ' +
        'obter o efeito de todos de uma vez: fazer a conta uma vez guardando cada resultado ' +
        'intermediário, e depois voltar do fim para o começo, passando para cada número o efeito ' +
        'que já foi calculado para o nó de cima dele. Duas passadas, qualquer que seja a ' +
        'quantidade de números.',
      body: [
        'O gradient numérico refaz a conta para cada número; a **backpropagation** faz duas passadas. A **passada para frente** calcula e guarda o valor de cada nó. A **passada para trás** sai do resultado com gradient 1 e aplica a regra da cadeia nó a nó, até as entradas. Com 1 milhão de pesos, 2 passadas no lugar de 1.000.001.',
        'Um nó só passa o gradient adiante depois de recebê-lo inteiro, de todo nó que usa o valor dele, e a ordem reversa garante isso. Numa conta com ciclo essa ordem não existe; as desta unidade não têm.',
        'A última linha soma em vez de escrever por causa do número usado duas vezes. Em y = a × a, o a é os dois fatores, e cada uso manda a sua contribuição; com =, a segunda apagaria a primeira.',
        'O preço é memória: o impacto local de um produto é o valor do outro fator, calculado na ida e guardado até a volta terminar. Duas passadas de tempo, um valor guardado por nó.',
      ],
      pseudocode: `função retropropagar(saída)
    saída.grad ← 1
    para cada nó em ordem_reversa(saída) faça
        para cada operando em nó.operandos faça
            operando.grad ← operando.grad + impacto_local(nó, operando) × nó.grad`,
      invariant: 'Quando chega a vez de um nó, o gradient dele já está completo, porque todo nó que usa o valor dele já passou.',
      workedExample: {
        problem:
          'O neurônio do primeiro ciclo com uma entrada só: y = w × x + b, com w = 2, x = 7 e b = 9. ' +
          'A ida guarda w × x = 14 e y = 23. A volta: y recebe 1. O b, parcela de uma soma, recebe ' +
          '1 × 1 = 1, e o produto w × x também. O w, fator de um produto, recebe x × 1 = 7; o x recebe ' +
          'w × 1 = 2. E em y = a × a com a = 8, as duas contribuições somam 8 + 8 = 16: subir a para ' +
          '8,01 leva y de 64 para 64,16, 16 por unidade.',
        whatToNotice:
          'Cada gradient saiu de uma multiplicação só, impacto local vezes o gradient do nó de cima, ' +
          'e o nó de cima sempre estava pronto. Com = no lugar da soma, o a do quadrado ficaria com ' +
          '8, a metade do que a conta mede.',
      },
      exerciseId: 'ai.e5' },

    { id: 'ai.c6', title: 'O passo: learning rate', layer: 'essential', band: 'technique', elaborates: 'backpropagation',
      introducesTerms: ['learning-rate', 'gradient-descent'],
      oneLine: 'Saber para que lado mexer não diz quanto mexer, e passo maior não chega antes.',
      plainly:
        'Saber para que lado mexer não diz quanto mexer. Um passo pequeno chega devagar; um passo ' +
        'grande pode passar do ponto e parar mais longe do que começou. O tamanho do passo é um ' +
        'número que alguém escolhe, e escolher maior não garante chegar antes.',
      body: [
        'Um peso vale 14, e o loss, o quadrado da distância entre o peso e 10, vale 16. Com o peso em 14,001 o loss vai a 16,008: o gradient do peso no loss é 8, o dobro da distância. Positivo: subir o peso aumenta o erro, e o passo vai para o lado oposto. Falta decidir quanto.',
        'O **learning rate** multiplica o gradient para dar o tamanho do passo: w ← w − learning rate × gradient. Repetir isso, usando o gradient onde o peso parou, é a **gradient descent**, o laço de todo treino. Com 0,1 o passo é 0,8, o peso vai a 13,2 e o loss a 10,24.',
        'Maior não chega antes: o gradient só descreve o trecho perto de onde foi calculado. Com 1,2 o passo é 9,6, o peso cai para 4,4, do outro lado do 10, e o loss vai a 31,36, quase o dobro.',
        'Somar o gradient em vez de subtrair anda para o lado em que o loss sobe, e o código roda sem erro.',
      ],
      pseudocode: `procedimento descer(pesos, learning_rate)
    para cada peso em pesos faça
        peso.valor ← peso.valor − learning_rate × peso.grad`,
      invariant: 'O passo vai sempre contra o sinal do gradient, e o tamanho dele, learning rate vezes gradient, só é confiável perto de onde o gradient foi calculado.',
      workedExample: {
        problem:
          'Com loss (w − 10)² e o peso em 14, o gradient do peso no loss é 8. Learning rate 0,1: ' +
          '14 − 0,1 × 8 = 13,2, e o loss cai de 16 para 10,24. Learning rate 1,2: 14 − 1,2 × 8 = 4,4, ' +
          'e o loss sobe de 16 para 31,36.',
        whatToNotice:
          'Os dois passos foram para o lado certo, para baixo. O que mudou foi o tamanho: o de 1,2 ' +
          'passou do 10 e terminou mais longe dele do que começou. Para saber qual dos dois serviu, ' +
          'basta calcular o loss onde o peso parou.',
      },
      exerciseId: 'ai.e6' },

    { id: 'ai.c7', title: 'O gradient que acumula sem zerar', layer: 'essential', band: 'failure',
      introducesTerms: [],
      oneLine: 'Quem soma sem zerar carrega a conta de ontem para hoje, e o passo cresce sem motivo.',
      plainly:
        'Um contador que ninguém zera continua somando de onde parou. No treino acontece o mesmo: ' +
        'a conta que calcula a direção do ajuste soma ao valor que já estava lá. Se nada zera esse ' +
        'valor de uma rodada para outra, cada ajuste carrega os anteriores, e o passo cresce mesmo ' +
        'quando já devia estar diminuindo.',
      body: [
        'A última linha da passada para trás soma, e precisa somar: é o que deixa um peso usado em duas contas receber as duas contribuições. O efeito colateral é que ela soma também ao que sobrou da rodada anterior, porque nada nela distingue a contribuição desta rodada da que ficou de antes.',
        'Com o loss do ciclo anterior, (w − 10)², o peso em 14 e learning rate 0,1, a primeira rodada calcula gradient 8, e o passo leva o peso a 13,2. Ali o gradient do peso no loss é 6,4, mas o acumulado chega a 8 + 6,4 = 14,4, e o passo sai quase do dobro do tamanho.',
        'O defeito engana porque as primeiras rodadas parecem melhores: na terceira o peso chega a 9,968, quase em cima do 10. Na quarta, o gradient calculado já pede para subir, e o acumulado ainda manda descer, porque as rodadas antigas continuam somadas dentro dele. O código roda, e o loss cai no começo.',
      ],
      workedExample: {
        problem:
          'O peso em 14, learning rate 0,1, sem zerar. Rodada 1: calculado 8, acumulado 8, peso 13,2. ' +
          'Rodada 2: calculado 6,4, acumulado 14,4, peso 11,76. Rodada 3: calculado 3,52, acumulado ' +
          '17,92, peso 9,968. Rodada 4: calculado −0,064, acumulado 17,856, peso 8,18. Depois do passo ' +
          'da rodada 5, o loss é 10,5, mais que os 10,24 que a primeira rodada tinha deixado.',
        whatToNotice:
          'Na rodada 4 o gradient calculado é negativo e pede para o peso subir. O acumulado ainda é ' +
          '17,856 e manda descer, para longe do 10. Sem o acumulado, cada passo usaria só o gradient ' +
          'do ponto onde o peso está.',
      },
      exerciseId: 'ai.e7' },

    { id: 'ai.c8', title: 'Postmortem: o peso que saltou numa noite', layer: 'essential', band: 'failure',
      introducesTerms: [],
      oneLine: 'Ninguém mexeu no código: um número ajustado sozinho mudou numa noite, e a conta dele explica o que houve.',
      plainly:
        'Voltando ao chamado do começo: um número ajustado sozinho toda noite fez uma rota que ' +
        'previa 3 dias passar a prever 6, quando a entrega real tinha levado 4. Com o que a ' +
        'unidade mostrou, dá para refazer a conta daquele ajuste à mão e dizer se ele foi para o ' +
        'lado certo e se andou demais. Nenhum código mudou; quem errou foi um número que o laço ' +
        'produziu.',
      body: [
        'Volte à rota do chamado: distância 5, base 1, peso da distância 0,4, previsão 5 × 0,4 + 1 = 3 dias, e a entrega real em 4. O peso faz o papel do número que, numa versão escrita à mão, alguém chutaria, como o 300 de prazo = km / 300 + 1. O ajuste noturno é gradient descent sobre um peso só, e o loss é o quadrado da diferença entre o previsto e o real: (3 − 4)² = 1.',
        'As quatro partes do critério viram quatro perguntas sobre aquela noite. A saída: 3 dias antes do ajuste, 6 depois. O loss: 1 antes, (6 − 4)² = 4 depois. O gradient do peso: na previsão é 5, a distância, porque o peso multiplica a distância, e por isso cada 0,1 no peso soma meio dia; no loss, é 5 × 2 × (3 − 4) = −10, negativo, então o peso tinha de subir. O passo: learning rate 0,06 vezes esse 10, de 0,4 direto para 1,0.',
        'O ajuste mexeu no peso porque é o único número que ele pode mexer: a base é fixa. Foi para o lado certo, e a previsão, que estava 1 dia abaixo do real, terminou 2 acima; em toda rota de 500 km ou mais, a previsão pelo menos dobrou. Nenhuma linha de código mudou e nenhum teste quebrou. Para julgar um número que o laço produziu, refaça a conta dele: para que lado o loss mandava ir, e se o passo parou antes ou depois do ponto em que o loss é zero.',
      ],
      workedExample: {
        problem:
          'Outro centro de distribuição da mesma transportadora separa em 2 dias, e uma rota dele tem ' +
          '1.000 km, distância 10. Com peso 0,5 a previsão é 10 × 0,5 + 2 = 7 dias, a entrega real ' +
          'levou 11, e o loss é (7 − 11)² = 16. Na previsão, o gradient do peso é 10; no loss, ' +
          '10 × 2 × (7 − 11) = −80, negativo, então o peso sobe. Um ajuste que leva o peso a 0,85 ' +
          'prevê 10,5 dias, e o loss cai de 16 para 0,25. Um que leva a 1,5 prevê 17 dias, e o loss ' +
          'sobe de 16 para 36.',
        whatToNotice:
          'Os dois ajustes subiram o peso, e subir era o lado certo. O primeiro parou antes do ponto; ' +
          'o segundo passou dele e terminou mais longe dos 11 dias do que a previsão de partida. ' +
          'Direção certa não basta: o tamanho do passo também é parte do julgamento.',
      },
      postmortem: {
        incident: 'Volte ao peso da distância que o ajuste noturno levou de 0,4 para 1,0, e à rota de 500 km que previa 3 dias, levou 4 e amanheceu prevendo 6, sem ninguém mexer no código.',
        trapId: 'ai.passo-maior-converge-antes',
        missingClaim: 'nenhuma de custo de tempo: o ajuste mexe num peso só, e o gradient dele sai em duas passadas. O que faltava era a frase "depois do passo, o loss caiu", e ela era falsa: foi de 1 para 4.',
        whatWouldCatch: 'Registrar o loss antes e depois de cada ajuste noturno e recusar o passo que o fez subir. É uma conta de uma linha, feita na hora, sem esperar a próxima entrega para descobrir.',
      },
      exerciseId: 'ai.e8' },
  ],

  misconceptions: aiMisconceptions,

  exercises: aiExercises,

  mastery: {
    statement:
      'O aluno domina esta unidade quando, diante de uma conta de até seis nós que nunca viu, ' +
      'consegue sem executar: calcular a saída, produzir o gradient de cada nó na ordem da ' +
      'passada para trás, dizer para que lado cada peso precisa mexer para o loss cair, e dizer ' +
      'se um passo dado parou antes ou passou do ponto em que o loss é zero.',
    requiresClean: ['ai.e5', 'ai.e6'],
    revisitIntervalDays: 7,
  },
}
