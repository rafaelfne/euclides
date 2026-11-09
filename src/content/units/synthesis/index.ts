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
      summary: 'Contar as operações que o enunciado pede, com a frequência de cada uma, antes de nomear qualquer estrutura.',
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
        'Um sistema precisa guardar sessões, responder se uma sessão existe a cada requisição e ' +
        'expirar as vinte mais antigas por minuto. Não comece pelo nome da estrutura favorita. ' +
        'Primeiro conte o que o sistema realmente faz, quantas vezes faz cada coisa e qual dessas ' +
        'ações domina o custo diário.',
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
        'Dizer que uma opção é rápida não é uma comparação. Para escolher, coloque pelo menos duas ' +
        'opções diante da operação que mais acontece. Uma pode responder existência muito bem e ' +
        'falhar na expiração das mais antigas; outra pode fazer o contrário. A escolha aparece ' +
        'quando os custos respondem à mesma carga.',
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
        'não responde uma pergunta obrigatória. Antes de comparar velocidade, corte as opções que não ' +
        'oferecem o que o sistema precisa. Não adianta uma resposta rápida para existência se você ' +
        'também precisa remover as vinte mais antigas.',
      body: [
        'Toda escolha de contrato é a aceitação de uma lista de ausências. São 3 exemplos das unidades anteriores: o Map não promete ordem; a Lista não promete busca; o Grafo não promete alcançabilidade. Escolher é dizer qual dessas ausências não vai doer.',
        'A parte prática: releia o enunciado procurando as frases de passagem. "Um relatório mensal por ordem de criação" é uma linha inteira, e é exatamente a ausência do contrato que você acabou de escolher. Ela não invalida a escolha, ela precisa aparecer escrita, como custo aceito, para que a próxima pessoa saiba que foi decisão e não descuido.',
        'É o movimento que o último ciclo de todas as sete unidades anteriores treinou, agora aplicado antes de escolher em vez de depois.',
      ],
      workedExample: {
        problem: "Escolhendo Map para o cache de sessão, você aceitou: sem ordem, sem faixa, sem mínimo. A linha \"um relatório mensal por ordem de criação\" no enunciado é exatamente 1 dessas 3.",
        whatToNotice: "A ausência não invalida a escolha. Ela precisa estar escrita para a próxima pessoa saber que foi decisão.",
      },
      exerciseId: 'synthesis.e2' },

    { id: 'synthesis.c3', title: 'Quando nenhuma serve: compor duas', layer: 'essential', band: 'technique', elaborates: 'absence-elimination',
      introducesTerms: ['composition'],
      oneLine: "Se nenhum contrato sobrevive ao corte, a resposta são duas estruturas.",
      plainly:
        'Nenhuma estrutura isolada responde bem a todas as perguntas do sistema. Uma encontra a ' +
        'sessão rapidamente; outra mantém a ordem de uso. Em vez de forçar uma delas a fazer o ' +
        'trabalho da outra, use as duas e mantenha a ligação entre elas. Às vezes a resposta correta ' +
        'não é escolher uma vencedora.',
      body: [
        'Corte os contratos que não prometem o que o problema exige. Se nada sobrevive ao corte, a conclusão não é relaxar o requisito, é que a resposta são 2 estruturas, não 1.',
        'Uma LRU cache é o exemplo canônico e junta duas unidades desta trilha: a tabela hash leva da chave ao nó em tempo constante, e a lista ligada mantém a ordem de uso, movendo um nó para a frente sem varrer nada. Cada uma responde a pergunta que a outra não responde, e as duas apontam para os mesmos dados.',
        'O preço da composição é a manutenção: toda inserção e toda remoção precisam acontecer nas duas, e um esquecimento aí produz duas fontes de verdade que discordam. É um custo real, e ele entra na justificativa.',
      ],
      workedExample: {
        problem: 'Numa LRU cache, a tabela hash localiza o nó pela chave em O(1); a lista ligada move esse nó para a frente e mantém o menos recente na outra ponta, também em O(1).',
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
        'completa não termina em “use isto”; ela diz qual mudança de carga faria a outra opção ' +
        'ganhar. Assim, quando o sistema cresce, ninguém precisa rediscutir tudo do zero para saber ' +
        'que a decisão venceu.',
      body: [
        'A última parte da justificativa é a que quase nunca é escrita: sob qual condição a escolha deixa de valer. Ela termina num número, 500 itens, 2 mil por segundo, e não numa intenção.',
        'Sem ela, uma escolha correta hoje vira uma decisão que ninguém sabe quando revisar. Com ela, a revisão tem gatilho e o gatilho tem número: "vale enquanto a coleção couber em algumas centenas e a consulta for por igualdade, acima disso, ou se aparecer consulta por faixa, a escolha muda".',
        'Escrever o número é o que separa a condição de uma intenção. "Revisar quando ficar lento" não é gatilho, porque ninguém mede o mesmo "lento" duas vezes.',
      ],
      workedExample: {
        problem: 'Uma lista simples foi escolhida para até 80 feature flags consultadas só por nome: “revisar acima de 500 flags ou quando houver consulta por prefixo”.',
        whatToNotice: 'O gatilho tem um número e uma mudança de operação. “Revisar quando ficar lento” não permite que duas pessoas reconheçam o mesmo momento.',
      },
      exerciseId: 'synthesis.e4' },

    { id: 'synthesis.c5', title: 'Julgar a escolha de outra pessoa', layer: 'essential', band: 'failure',
      introducesTerms: [],
      oneLine: "Saída correta e escolha errada é o caso que a revisão não pega.",
      plainly:
        'Um código pode devolver a resposta certa hoje e ainda ter escolhido uma estrutura que vai ' +
        'falhar quando a carga mudar. Revisar não é só conferir a saída do exemplo. É perguntar qual ' +
        'operação sustenta a escolha, o que ela custa nas alternativas e qual cenário torna essa ' +
        'decisão uma má ideia.',
      body: [
        'É para isto que a trilha inteira existe: 1 trecho gerado por IA, aprovado numa revisão, cuja saída está correta e cuja escolha está errada.',
        'O padrão mais comum é ordenar para responder o que era uma varredura. A saída confere, os testes passam, e o custo pulou de n para n log n numa operação que talvez rode a cada requisição. Nada no código avisa, porque nada no código está errado.',
        'A pergunta que expõe isso é a mesma quatro vezes: qual operação domina, qual o custo nas duas candidatas, o que inverte a escolha, e qual ausência foi aceita. Quando alguma das quatro não tem resposta, não há escolha registrada, há uma estrutura que apareceu.',
      ],
      workedExample: {
        problem: "Um trecho que ordena 50 mil registros para devolver o menor, a cada requisição: cerca de 780 mil comparações onde 49.999 bastavam. Todos os testes passam.",
        whatToNotice: "As 4 perguntas expõem isso e nenhuma delas olha para a saída. Comece por qual operação domina.",
      },
      postmortem: {
        incident: "Volte ao trecho que ordenava 50 mil registros para devolver o menor, a cada requisição, com todos os testes passando.",
        trapId: "synthesis.dominante-por-intuicao",
        missingClaim: "o custo das duas candidatas lado a lado. Varrer custa n − 1 comparações; ordenar custa n log n, e ninguém escreveu as duas.",
        whatWouldCatch: "As quatro perguntas, e nenhuma delas olha para a saída. Comece por qual operação domina.",
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
