import type { Unit } from '../../schema'
import { synthesisExercises, synthesisMisconceptions } from './exercises'

export const synthesisUnit: Unit = {
  kind: 'method',
  runnable: 'typescript',
  id: 'synthesis',
  number: 8,
  title: 'Síntese: escolher a estrutura',
  learningObjective:
    'Diante de um requisito escrito em português, sem estrutura sugerida, produzir a ' +
    'justificativa de escolha completa: operação dominante, custo em duas candidatas, ' +
    'condição que inverte a escolha, e a ausência que se está aceitando.',
  prerequisites: [
    'As sete unidades anteriores, esta é a única que depende de todas',
    'Afirmação de custo com regime, hipóteses e unidade de medida',
    'A lista do que cada contrato explicitamente não promete',
  ],
  motivatingProblem:
    'Uma tarefa nova, sem estrutura declarada: "preciso guardar as sessões ativas, responder se ' +
    'uma sessão existe a cada requisição, e expirar as vinte mais antigas por minuto". Você ' +
    'sabe o custo de cada estrutura isolada. A pergunta é outra: como se chega à escolha a ' +
    'partir da frase, sem reconhecer um padrão e sem medir nada?',

  symbols: [
    { symbol: 'n', means: 'quantos itens a coleção guarda' },
    { symbol: 'k', means: 'quantos itens uma consulta devolve' },
    { symbol: 'f', means: 'quantas vezes por unidade de tempo uma operação acontece' },
  ],

  criterion: {
    id: 'structure-choice',
    name: 'Justificativa de escolha',
    produces: 'o argumento que sustenta uma estrutura numa revisão, e que outra pessoa consegue contestar',
    parts: [
      { id: 'dominant', name: 'operação dominante',
        guarantee: 'qual operação roda mais, e quantas vezes mais que a segunda' },
      { id: 'compared', name: 'custo nas candidatas',
        guarantee: 'o custo dessa operação em pelo menos duas estruturas, com regime e hipóteses' },
      { id: 'inverting', name: 'condição que inverte',
        guarantee: 'o que teria de mudar na carga para a outra candidata ganhar' },
      { id: 'accepted-absence', name: 'ausência aceita',
        guarantee: 'o que o contrato escolhido não promete, e por que isso é aceitável aqui' },
    ],
    whenOmitted: [
      { partId: 'dominant', reads: 'usei hash porque é rápido' },
      { partId: 'compared', reads: 'contém é O(1), então tabela hash' },
      { partId: 'inverting', reads: 'essa é a estrutura certa para esse caso' },
      { partId: 'accepted-absence', reads: 'atende todos os requisitos' },
    ],
  },

  techniques: [
    {
      id: 'load-profile',
      name: 'Perfil de carga primeiro',
      derivesCriterion: 'structure-choice',
      summary: 'Contar as operações que o enunciado pede, com a frequência de cada uma, antes de nomear qualquer estrutura, e levar a conta até o número em que a outra candidata passa a ganhar.',
      produces: ['dominant', 'compared', 'inverting'],
      wrongWhen: [
        { scenario: 'A carga é desconhecida, sistema novo, uso não medido, requisito ainda em discussão',
          useInstead: 'eliminação por ausência, que decide pelo contrato e não pela frequência' },
        { scenario: 'Todas as operações têm a mesma frequência e nenhuma domina',
          useInstead: 'eliminação por ausência: sem operação dominante, o que decide é o que cada contrato deixa de fora' },
      ],
      everydayAnchor:
        'É o que um plano de execução mostra depois, e que dava para prever antes: qual consulta ' +
        'roda mil vezes por segundo e qual roda uma vez por mês.',
      invariant: 'A contagem é de operações do contrato, não de nomes de estrutura. Contar "buscas no cache" já assumiu a resposta.',
    },
    {
      id: 'absence-elimination',
      name: 'Eliminação por ausência',
      derivesCriterion: 'structure-choice',
      summary: 'Listar o que o problema exige, cortar todo contrato que não promete alguma dessas coisas, e só então comparar custo entre os que sobraram.',
      produces: ['accepted-absence', 'compared', 'inverting'],
      wrongWhen: [
        { scenario: 'Nada sobrevive ao corte',
          useInstead: 'composição: a resposta é somar duas estruturas, cada uma respondendo uma parte' },
        { scenario: 'Tudo sobrevive ao corte, porque o problema exige pouco',
          useInstead: 'perfil de carga, sem restrição de contrato, o que decide é a frequência' },
      ],
      everydayAnchor:
        'É o raciocínio que o último ciclo de cada unidade desta trilha treinou: tudo que o ' +
        'contrato não promete é onde a estrutura falha.',
      invariant: 'Cortar por contrato, nunca por custo. Custo só compara o que já promete o que você precisa.',
    },
  ],

  cycles: [
    { id: 'synthesis.c0', title: 'A carga antes da estrutura', layer: 'essential', band: 'criterion',
      introducesTerms: ['workload', 'dominant-operation'],
      oneLine: "Conte quantas vezes cada operação roda antes de nomear qualquer estrutura.",
      plainly:
        'Não comece pelo nome da estrutura favorita. Primeiro conte o que o sistema faz e quantas ' +
        'vezes faz cada coisa.',
      body: [
        'A escolha começa numa lista, e a lista sai do enunciado: quais operações são pedidas, e quantas vezes cada uma acontece, 2000 por segundo é diferente de 1 por minuto. Nada de estrutura ainda.',
        'A operação dominante não é a mais custosa nem a mais interessante, é a que roda mais. No problema desta unidade, "essa sessão existe?" acontece a cada requisição e "as vinte mais antigas" acontece uma vez por minuto. A diferença é de ordens de grandeza, e é ela que pesa.',
        'Contar operações do contrato, e não nomes de estrutura, é a disciplina difícil aqui. Quem escreve "buscas no cache" na lista já decidiu a resposta antes de começar.',
      ],
      figure: {
        kind: 'concept-flow',
        nodes: [
          { id: 'problem', label: 'problema', tone: 'contract' },
          { id: 'operations', label: 'operações', tone: 'contract' },
          { id: 'counts', label: 'contagens', tone: 'implementation' },
          { id: 'dominant', label: 'operação dominante', tone: 'cost' },
          { id: 'choice', label: 'escolha', tone: 'contract' },
        ],
        edges: [
          { from: 'problem', to: 'operations' },
          { from: 'operations', to: 'counts' },
          { from: 'counts', to: 'dominant' },
          { from: 'dominant', to: 'choice' },
        ],
        caption: 'A estrutura só entra depois de listar as operações, contar sua frequência e identificar qual delas domina a carga.',
      },
      workedExample: {
        problem: "Numa catraca digital, verificar se uma pulseira existe acontece 2000 vezes por segundo. Expirar as 20 pulseiras mais antigas acontece 1 vez por minuto.",
        whatToNotice: "A diferença é de 5 ordens de grandeza. A lista ainda não tem nome de estrutura: só operações, frequência e a carga que realmente domina.",
      },
      exerciseId: 'synthesis.e0' },

    { id: 'synthesis.c1', title: 'Custo de um lado só não é comparação', layer: 'essential', band: 'criterion',
      introducesTerms: ['candidate'],
      oneLine: "Um custo sozinho não é comparação: sem a segunda candidata não há escolha.",
      plainly:
        'Dizer que uma opção é rápida não é comparação. Para escolher, ponha pelo menos duas opções ' +
        'diante da mesma operação, a que mais acontece, e escreva o custo de cada uma.',
      body: [
        '"Usei tabela hash porque contém é O(1)" é uma afirmação verdadeira que não justifica nada. Sem o custo da mesma operação numa segunda candidata, não há escolha, há preferência com número ao lado.',
        'A comparação precisa das duas afirmações completas, com regime e hipóteses, do jeito que a unidade 2 ensinou a escrever. É comum que o regime seja o que decide: O(1) no caso médio contra O(log n) garantido são coisas diferentes quando quem escolhe as chaves está do lado de fora.',
      ],
      workedExample: {
        problem: "\"Contém é O(1) na tabela hash\" contra \"contém é O(log n) garantido na árvore balanceada\". Com 1 milhão de chaves, são 1 comparação em média contra 20 no pior caso.",
        whatToNotice: "Só com as duas afirmações lado a lado a pergunta certa aparece: quem escolhe as chaves?",
      },
      exerciseId: 'synthesis.e1' },

    { id: 'synthesis.c2', title: 'A ausência que você está aceitando', layer: 'essential', band: 'criterion',
      introducesTerms: [],
      oneLine: "Escolher um contrato é aceitar por escrito a lista do que ele não promete.",
      plainly:
        'Uma opção pode ser barata para a operação mais frequente e ainda assim ser inviável porque ' +
        'não responde uma pergunta obrigatória. Antes de comparar custo, corte as opções que não ' +
        'oferecem o que o sistema precisa. Não adianta responder rápido se a sessão existe quando ' +
        'você também precisa remover as vinte mais antigas.',
      body: [
        'Toda escolha de contrato é a aceitação de uma lista de ausências. São 3 exemplos das unidades anteriores: o Map não promete ordem; a Lista não promete busca; o Grafo não promete alcançabilidade. Escolher é dizer qual dessas ausências não vai doer.',
        'A parte prática: releia o enunciado procurando as frases de passagem. "Um relatório mensal por ordem de criação" é uma linha inteira, e é exatamente a ausência do contrato que você acabou de escolher. Ela não invalida a escolha, ela precisa aparecer escrita, como custo aceito, para que a próxima pessoa saiba que foi decisão e não descuido.',
        'Aceitar só vale para o que o enunciado não exige. Quando a ausência é requisito, ela não se aceita por escrito: ela tira o contrato da disputa.',
        'É o movimento que o último ciclo de todas as sete unidades anteriores treinou, agora aplicado antes de escolher em vez de depois.',
      ],
      workedExample: {
        problem: "Escolhendo só um Map para o cache de sessão, a lista de ausências é: sem ordem, sem faixa, sem mínimo. O enunciado pede \"expirar as vinte mais antigas por minuto\", e achar as 20 mais antigas é pedir ordem de criação, 1 vez por minuto.",
        whatToNotice: "Essa ausência não pode ser aceita por escrito, porque o enunciado a exige: o Map sozinho sai do corte. O próximo ciclo mostra o que fazer quando nenhum contrato sobra sozinho.",
      },
      exerciseId: 'synthesis.e2' },

    { id: 'synthesis.c3', title: 'Quando nenhuma serve: compor duas', layer: 'essential', band: 'technique', elaborates: 'absence-elimination',
      introducesTerms: ['composition'],
      oneLine: "Se nenhum contrato sobrevive ao corte, a resposta são duas estruturas.",
      plainly:
        'Às vezes nenhuma estrutura isolada responde a todas as perguntas do sistema. Uma acha a ' +
        'sessão pela chave; outra mantém a ordem. Em vez de forçar uma a fazer o trabalho da outra, ' +
        'use as duas sobre os mesmos dados.',
      body: [
        'Corte os contratos que não prometem o que o problema exige. Se nada sobrevive ao corte, a conclusão não é relaxar o requisito, é que a resposta são 2 estruturas, não 1.',
        'Uma LRU cache é o exemplo canônico e junta duas unidades desta trilha: a tabela hash leva da chave ao nó em tempo constante, e a lista ligada mantém a ordem de uso. Para mover um nó do meio para a frente sem varrer nada, cada nó aponta também para o anterior: com o nó em mãos, tirá-lo do lugar é religar 2 vizinhos. Numa lista em que o nó só aponta para o próximo, ter o nó não dá o anterior, e tirá-lo do meio volta a ser varredura. Cada uma das duas estruturas responde a pergunta que a outra não responde, e as duas apontam para os mesmos dados.',
        'O preço da composição é a manutenção: toda inserção e toda remoção precisam acontecer nas duas, e um esquecimento aí produz duas fontes de verdade que discordam. É um custo real, e ele entra na justificativa.',
      ],
      workedExample: {
        problem: 'Numa LRU cache, a tabela hash localiza o nó pela chave em O(1) no caso médio; a lista ligada, com cada nó apontando para o próximo e para o anterior, move esse nó para a frente e mantém o menos recente na outra ponta, em O(1) no pior caso.',
        whatToNotice: 'Nenhuma das duas responde sozinha. As duas apontam para o mesmo item, e toda atualização precisa manter ambas coerentes.',
      },
      figure: {
        kind: 'lru-composition',
        caption: 'O mapa não mantém ordem e a lista não procura por chave. A composição funciona porque os dois lados apontam para os mesmos nós.',
        items: ['sessão A', 'sessão B', 'sessão C', 'sessão D'],
        accesses: ['sessão C', 'sessão B'],
      },
      exerciseId: 'synthesis.e3' },

    { id: 'synthesis.c4', title: 'A condição que faz a escolha expirar', layer: 'essential', band: 'technique', elaborates: 'load-profile',
      introducesTerms: [],
      oneLine: "A justificativa termina no número em que a escolha deixa de valer.",
      plainly:
        'Uma escolha pode estar certa para cem sessões e errada para dez milhões. Uma justificativa ' +
        'completa não termina em "use isto": ela diz em que número a outra opção passa a ganhar.',
      body: [
        'O primeiro ciclo contou as operações para achar a dominante. A técnica de perfil de carga leva a mesma conta até o fim: sob qual condição a escolha deixa de valer. É a parte da justificativa que quase nunca é escrita, e ela termina num número, 500 itens, 2 mil por segundo, e não numa intenção.',
        'Sem ela, uma escolha correta hoje vira uma decisão que ninguém sabe quando revisar. Com ela, a revisão tem gatilho e o gatilho tem número: "vale enquanto a coleção tiver até 500 itens e a consulta for por igualdade; acima de 500, ou se aparecer consulta por faixa, a escolha muda".',
        'Escrever o número é o que separa a condição de uma intenção. "Revisar quando ficar lento" não é gatilho, porque ninguém mede o mesmo "lento" duas vezes.',
      ],
      workedExample: {
        problem: 'Uma lista simples foi escolhida para até 80 feature flags consultadas só por nome: "revisar acima de 500 flags ou quando houver consulta por prefixo".',
        whatToNotice: 'O gatilho tem um número e uma mudança de operação. "Revisar quando ficar lento" não permite que duas pessoas reconheçam o mesmo momento.',
      },
      exerciseId: 'synthesis.e4' },

    { id: 'synthesis.c5', title: 'Julgar a escolha de outra pessoa', layer: 'essential', band: 'failure',
      introducesTerms: [],
      oneLine: "Saída correta e escolha errada é o caso que a revisão não pega.",
      plainly:
        'Um código pode devolver a resposta certa hoje e ter escolhido uma estrutura que falha ' +
        'quando a carga muda. Revisar não é só conferir a saída do exemplo.',
      body: [
        'É para isto que a trilha inteira existe: 1 trecho gerado por IA, aprovado numa revisão, cuja saída está correta e cuja escolha está errada.',
        'Um padrão que se repete é ordenar para responder o que era uma varredura. A saída confere, os testes passam, e o custo pulou de n para n log n numa operação que talvez rode a cada requisição. Nada no código avisa, porque nada no código está errado.',
        'A pergunta que expõe isso é a mesma quatro vezes: qual operação domina, qual o custo nas duas candidatas, o que inverte a escolha, e qual ausência foi aceita. Quando alguma das quatro não tem resposta, não há escolha registrada, há uma estrutura que apareceu.',
      ],
      workedExample: {
        problem: "Um trecho que ordena 50 mil registros para devolver o menor, a cada requisição: cerca de 780 mil comparações onde 49.999 bastavam. Todos os testes passam.",
        whatToNotice: "As 4 perguntas expõem isso e nenhuma delas olha para a saída. Comece por qual operação domina.",
      },
      postmortem: {
        incident: "Volte às sessões ativas do começo da unidade: responder se uma sessão existe a cada requisição e expirar as vinte mais antigas por minuto. A escolha feita por reconhecimento é um Map de sessões, e ela passa na revisão porque a operação dominante fica em tempo constante.",
        trapId: "synthesis.ausencia-ignorada",
        missingClaim: "Expirar as vinte mais antigas num Map custa O(n) por minuto no pior caso, medido em sessões ativas, porque o Map não promete ordem e achar as mais antigas é varrer todas. E faltava a da composição ao lado dela: com uma fila em ordem de criação sobre as mesmas sessões, cada expiração custa O(1) no caso médio, contando a remoção do Map.",
        whatWouldCatch: "Eliminação por ausência antes do custo. \"As vinte mais antigas\" exige ordem, o Map não promete ordem, e ele sozinho sai do corte. Como nenhum contrato sobra sozinho, a resposta é compor, como na LRU cache.",
      },
      exerciseId: 'synthesis.e5' },
  ],

  misconceptions: synthesisMisconceptions,

  exercises: synthesisExercises,

  mastery: {
    statement:
      'O aluno domina esta unidade quando, diante de um requisito escrito em português e sem ' +
      'estrutura sugerida, produz sem executar: a operação dominante e a frequência dela; o ' +
      'custo dessa operação em duas candidatas, com regime e hipóteses; a condição numérica que ' +
      'inverte a escolha; e a ausência do contrato escolhido que alguém vai sentir em produção.',
    requiresClean: ['synthesis.e3', 'synthesis.e5'],
    revisitIntervalDays: 14,
  },
}
