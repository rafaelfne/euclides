import type { Exercise, Misconception } from '../../schema'

export const synthesisMisconceptions: Misconception[] = [
  { id: 'synthesis.escolha-por-reconhecimento', label: 'Escolher pela categoria do problema, sem contar a carga',
    socraticQuestion: 'Você disse "isso é um cache, então tabela hash". Quais operações o enunciado pede, e com que frequência cada uma?',
    escalation: [
      'Escreva as operações numa coluna e a frequência relativa na outra. Alguma delas o contrato que você escolheu não responde?',
      'Se a lista tem uma operação que ele não responde, a resposta não é trocar de estrutura — é somar uma segunda. Qual?',
    ],
    reviewCycle: 'synthesis.c0' },

  { id: 'synthesis.custo-sem-alternativa', label: 'Justificar com o custo de uma estrutura só',
    socraticQuestion: 'Você afirmou O(1) para a operação dominante. Qual é o custo da mesma operação na segunda candidata, e com que regime?',
    escalation: [
      'Sem o outro lado não há comparação, e sem comparação não há escolha — há preferência. Escreva as duas afirmações com regime e hipóteses e coloque uma ao lado da outra.',
    ],
    reviewCycle: 'synthesis.c1' },

  { id: 'synthesis.dominante-por-intuicao', label: 'Supor qual operação domina sem ler a frequência',
    socraticQuestion: 'O enunciado diz quantas vezes cada operação acontece. Qual das operações roda mais, e quantas vezes mais que a segunda?',
    escalation: [
      'Uma operação que roda uma vez por minuto e outra que roda mil vezes por segundo não pesam igual na escolha. Qual das duas você usou para decidir?',
    ],
    reviewCycle: 'synthesis.c0' },

  { id: 'synthesis.composicao-nao-considerada', label: 'Assumir que a resposta é uma estrutura só',
    socraticQuestion: 'Nenhuma das candidatas responde as duas operações que o enunciado pede. Qual delas responde a primeira, e qual responde a segunda?',
    escalation: [
      'Se são duas estruturas diferentes, o que impede de manter as duas apontando para os mesmos dados? Qual passa a ser o custo de inserir?',
    ],
    reviewCycle: 'synthesis.c3' },

  { id: 'synthesis.escolha-sem-validade', label: 'Não dizer sob qual condição a escolha deixa de valer',
    socraticQuestion: 'A sua escolha está justificada para a carga de hoje. O que teria de mudar na carga para a outra candidata passar a ganhar?',
    escalation: [
      'Uma escolha sem essa condição não é revisável: ninguém sabe quando ela expirou. Escreva o número — a frequência, o tamanho, o regime — a partir do qual ela vira errada.',
    ],
    reviewCycle: 'synthesis.c4' },

  { id: 'synthesis.ausencia-ignorada', label: 'Escolher pela operação dominante e ignorar o que o contrato não promete',
    socraticQuestion: 'Liste o que o contrato escolhido explicitamente não responde. Alguma dessas ausências aparece no enunciado, mesmo que de passagem?',
    escalation: [
      'Uma ausência que o enunciado menciona de passagem é a que vai aparecer em produção como requisito. Qual das ausências você está aceitando de propósito?',
    ],
    reviewCycle: 'synthesis.c2' },
]

export const synthesisExercises: Exercise[] = [
  {
    kind: 'choice', id: 'synthesis.e0',
    prompt: '"Preciso guardar sessões ativas, responder se uma sessão existe a cada requisição, e expirar as vinte mais antigas por minuto." Qual é o primeiro passo da escolha?',
    choices: [
      { correct: true, text: 'Listar as operações do enunciado com a frequência de cada uma: existe é por requisição, as vinte mais antigas é por minuto — a diferença entre as duas é de ordens de grandeza' },
      { correct: false, text: 'Reconhecer que é um cache de sessão e usar tabela hash, que é a estrutura para isso', misconceptionId: 'synthesis.escolha-por-reconhecimento' },
      { correct: false, text: 'Escolher pela operação que parece mais custosa — expirar as vinte mais antigas — e otimizar para ela', misconceptionId: 'synthesis.dominante-por-intuicao' },
    ],
  },
  {
    kind: 'choice', id: 'synthesis.e1',
    prompt: 'Alguém justifica assim: "usei tabela hash porque contém é O(1)". O que falta para isso ser uma escolha e não uma preferência?',
    choices: [
      { correct: true, text: 'O custo da mesma operação na candidata descartada, com regime e hipóteses — sem o outro lado não há comparação' },
      { correct: false, text: 'Nada: O(1) é o melhor custo possível, e nenhuma alternativa pode superá-lo', misconceptionId: 'synthesis.custo-sem-alternativa' },
      { correct: false, text: 'A medição em produção que confirme o O(1)', misconceptionId: 'synthesis.custo-sem-alternativa' },
    ],
  },
  {
    kind: 'choice', id: 'synthesis.e2',
    prompt: 'A operação dominante é obter por chave, e a tabela hash ganha com folga. O enunciado menciona, numa frase, um relatório mensal "por ordem de criação". O que fazer com essa frase?',
    choices: [
      { correct: true, text: 'Registrá-la como a ausência que se está aceitando: o Map não promete ordem, e essa é a operação que vai custar caro quando alguém pedir o relatório' },
      { correct: false, text: 'Ignorá-la: uma vez por mês não pesa contra milhões de consultas por dia', misconceptionId: 'synthesis.ausencia-ignorada' },
      { correct: false, text: 'Trocar para árvore balanceada, já que ela responde as duas', misconceptionId: 'synthesis.escolha-por-reconhecimento' },
    ],
  },
  {
    kind: 'choice', id: 'synthesis.e3',
    prompt: 'Um cache precisa responder "esse item está aqui?" em tempo constante e "qual o item usado há mais tempo?" também em tempo constante. Nenhuma estrutura isolada responde as duas. O que isso indica?',
    choices: [
      { correct: true, text: 'Que a resposta é composição: tabela hash da chave para o nó, e lista ligada mantendo a ordem de uso — cada uma responde uma das perguntas, e as duas apontam para os mesmos dados' },
      { correct: false, text: 'Que uma das duas exigências precisa ser relaxada, porque nenhuma estrutura oferece as duas garantias', misconceptionId: 'synthesis.composicao-nao-considerada' },
      { correct: false, text: 'Que a estrutura certa é a árvore balanceada, que fica entre as duas', misconceptionId: 'synthesis.composicao-nao-considerada' },
    ],
  },
  {
    kind: 'choice', id: 'synthesis.e4',
    prompt: 'Você escolheu varredura linear sobre um array para uma coleção de até duzentos itens. Como escrever a condição que torna essa escolha revisável?',
    choices: [
      { correct: true, text: '"Vale enquanto a coleção couber em algumas centenas e a consulta for por igualdade; acima disso, ou se aparecer consulta por faixa, a escolha muda" — com o número escrito' },
      { correct: false, text: '"Vale por enquanto; revisar quando começar a ficar lento"', misconceptionId: 'synthesis.escolha-sem-validade' },
      { correct: false, text: 'Não é preciso: a escolha foi justificada pelo custo, e o custo não muda', misconceptionId: 'synthesis.escolha-sem-validade' },
    ],
  },
  {
    kind: 'bug', id: 'synthesis.e5',
    prompt: 'Este código foi gerado por uma ferramenta de IA e aprovado numa revisão. A saída está correta. Marque a linha que denuncia a escolha errada e diga o porquê.',
    language: 'javascript',
    code: `// devolve o pedido mais antigo ainda pendente
function maisAntigoPendente(pedidos) {
  const pendentes = pedidos.filter(p => p.status === 'pendente')
  pendentes.sort((a, b) => a.criadoEm - b.criadoEm)
  return pendentes[0]
}`,
    faultyLines: [4],
    consequences: [
      { correct: true, text: 'Ordena a coleção inteira para ler um elemento: a pergunta era o mínimo, que uma varredura responde em n − 1 comparações, e a ordenação cobra n log n para devolver a mesma resposta' },
      { correct: false, text: 'O defeito é o comparador, que deveria desempatar por identificador para o resultado ser determinístico', misconceptionId: 'synthesis.dominante-por-intuicao' },
      { correct: false, text: 'Nada de grave: a saída está certa, e ordenar é a forma legível de achar o mínimo', misconceptionId: 'synthesis.escolha-por-reconhecimento' },
    ],
  },
]
