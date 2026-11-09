import type { Unit } from '../../schema'
import { tracingExercises, tracingMisconceptions } from './exercises'

export const tracingUnit: Unit = {
  kind: 'method',
  runnable: 'typescript',
  id: 'tracing',
  number: 1,
  title: 'Lógica e execution trace',
  learningObjective:
    'Dizer o que um trecho de código faz, quantas vezes o laço dele roda e o que ele devolve ' +
    'nas entradas de fronteira, sem executar, e sabendo dizer de onde cada afirmação veio.',
  prerequisites: [
    'Ler uma atribuição, uma condição e um laço em qualquer linguagem',
    'Saber o que é um índice e o que é o tamanho de uma coleção',
  ],
  motivatingProblem:
    'Um pull request de trinta linhas, gerado por IA, que passa nos testes existentes. A ' +
    'pergunta do revisor não é "compila?", é "o que isto faz quando a lista tem um elemento ' +
    'só, e o que faz quando ela está vazia?". Rodar responde a primeira pergunta e não ' +
    'responde a segunda: em revisão não há execução. Como se sabe o que um laço faz sem rodá-lo?',

  symbols: [
    { symbol: 'A', means: 'a coleção que o código percorre' },
    { symbol: '|A|', means: 'quantos elementos a coleção tem' },
    { symbol: 'A[i]', means: 'o elemento que está na posição i' },
    { symbol: 'i', means: 'a posição que o laço está examinando' },
    { symbol: 'j', means: 'a posição que o segundo laço está examinando' },
    { symbol: 'total', means: 'o valor que vai sendo acumulado entre as rodadas' },
  ],

  criterion: {
    id: 'execution-trace',
    name: 'Execution trace',
    produces: 'o estado do programa a cada rodada, e o que ele devolve no fim',
    parts: [
      { id: 'variables', name: 'variáveis observadas',
        guarantee: 'quais nomes carregam o estado que decide o resultado' },
      { id: 'state-per-step', name: 'estado por rodada',
        guarantee: 'o valor de cada uma delas ao fim de cada rodada' },
      { id: 'guard', name: 'condição que governa',
        guarantee: 'a expressão que decide se existe uma próxima rodada' },
      { id: 'output', name: 'saída',
        guarantee: 'o que a função devolve, e sob qual condição ela devolve isso' },
    ],
    whenOmitted: [
      { partId: 'guard', reads: 'o laço roda n vezes' },
      { partId: 'state-per-step', reads: 'no fim, total é a soma de tudo' },
      { partId: 'variables', reads: 'o índice vai de 0 até o fim, então percorre a coleção' },
      { partId: 'output', reads: 'funciona' },
    ],
  },

  techniques: [
    {
      id: 'step-simulation',
      name: 'Simulação passo a passo',
      derivesCriterion: 'execution-trace',
      summary: 'Escrever a tabela do estado, uma linha por rodada, derivando cada linha da anterior.',
      produces: ['variables', 'state-per-step', 'guard', 'output'],
      wrongWhen: [
        { scenario: 'O número de rodadas depende da entrada e passa de algumas dezenas',
          useInstead: 'raciocínio por invariante, que descreve todas as rodadas de uma vez' },
        { scenario: 'A pergunta é sobre uma classe de entradas, não sobre uma entrada concreta',
          useInstead: 'raciocínio por invariante' },
      ],
      everydayAnchor:
        'É o que duas pessoas fazem no quadro branco quando discordam sobre um laço, e a ' +
        'discordância acaba na terceira linha da tabela.',
      invariant: 'Cada linha é derivada da anterior. Uma linha adivinhada invalida todas as seguintes.',
    },
    {
      id: 'invariant-reasoning',
      name: 'Raciocínio por invariante',
      derivesCriterion: 'execution-trace',
      summary: 'Declarar a propriedade que vale antes e depois de cada rodada, e mostrar que a rodada a preserva.',
      produces: ['variables', 'guard', 'output'],
      wrongWhen: [
        { scenario: 'Você ainda não consegue enunciar a propriedade',
          useInstead: 'simulação passo a passo, a invariante quase sempre aparece da tabela' },
        { scenario: 'A pergunta é "qual o valor na rodada 4", e não "o que vale sempre"',
          useInstead: 'simulação passo a passo' },
      ],
      everydayAnchor:
        'É o que um comentário como "aqui a parte à esquerda de i já está ordenada" está ' +
        'tentando dizer, e é por isso que esse comentário, quando está certo, vale mais que ' +
        'o laço inteiro.',
      invariant: 'A propriedade tem de valer na entrada do laço, com zero rodadas executadas.',
    },
  ],

  cycles: [
    { id: 'tracing.c0', title: 'O que é saber o que um código faz', layer: 'essential', band: 'criterion',
      introducesTerms: ['execution-trace'],
      oneLine: "Entender um código é saber dizer o valor de cada nome a cada rodada.",
      plainly:
        'Um pull request passa nos testes, e nenhum teste usa a lista vazia. Revisar é dizer o ' +
        'que ele faz nesse caso sem apertar executar, e este ciclo mostra o que essa resposta ' +
        'precisa conter.',
      body: [
        '"Eu li e entendi" não é uma afirmação verificável. Ela vira uma quando carrega 4 coisas: quais nomes guardam o estado, o valor de cada um a cada rodada, a condição que decide se há próxima rodada, e o que a função devolve.',
        'Cada uma dessas quatro partes, quando falta, produz uma frase que soa certa. Sem a condição, sai "o laço roda n vezes". Sem o estado por rodada, sai "no fim, total é a soma de tudo", uma afirmação sobre o fim, derivada de nada. Guarde essas frases: elas são as armadilhas desta unidade, e você vai reencontrá-las nas unidades seguintes da trilha.',
      ],
      workedExample: {
        problem: "Um cadastro precisa contar três documentos recebidos: [sim, não, sim]. Comece com i = 0 e total = 0. As rodadas produzem (i=1, total=1), (i=2, total=1) e (i=3, total=2); então i < 3 fica falso e o cadastro tem 2 documentos.",
        whatToNotice: "A conclusão nasce de estados observáveis: documentos iniciais, três transformações, primeira condição falsa e total devolvido. Remova um elo e outra pessoa já não consegue conferir a contagem.",
      },
      figure: {
        kind: 'execution-trace',
        caption: 'A condição decide se existe uma rodada; só então o elemento é lido e o estado muda.',
        values: [4, 7, 3],
        initialIndex: 0,
        indexStep: 1,
        initialAccumulator: 0,
        operation: 'sum',
      },
      exerciseId: 'tracing.e0' },

    { id: 'tracing.c1', title: 'A condição que decide se há próxima rodada', layer: 'essential', band: 'criterion',
      introducesTerms: ['guard'],
      oneLine: "Um laço para por causa da condição, não por causa do tamanho da coleção.",
      plainly:
        'Um job percorre a lista de pendências e apaga as concluídas enquanto anda. No fim sobram ' +
        'concluídas que ele nunca olhou, e o código parece certo na primeira leitura.',
      body: [
        'Um laço sobre 10 elementos não roda necessariamente 10 vezes. Um laço testa uma condição, executa um corpo, e testa de novo. Que isso acabe percorrendo a coleção é consequência de como o corpo mexe no índice, não é a definição.',
        'A diferença importa no momento em que o corpo mexe em outra coisa além do índice. Se ele remove um elemento da própria coleção, os dois lados da condição mudam na mesma rodada: o índice sobe e o tamanho desce. O percurso deixa de ser o que a leitura ingênua supõe, e nada no código avisa.',
      ],
      workedExample: {
        problem: 'Percorrer [a, b, c, d] removendo b, com i avançando de um em um.',
        whatToNotice: 'Depois de remover b, c ocupa a posição 1 e i já foi para 2. c nunca é examinado, e a coleção final parece só ter perdido um elemento.',
      },
      exerciseId: 'tracing.e1' },

    { id: 'tracing.c2', title: 'Simular passo a passo', layer: 'essential', band: 'technique', elaborates: 'step-simulation',
      introducesTerms: [],
      oneLine: "Escreva uma coluna por nome que muda e uma linha por rodada.",
      plainly:
        'Duas pessoas discordam sobre o resultado de um laço numa revisão, e cada uma repete a ' +
        'própria intuição. A discussão só acaba quando alguém vai ao quadro e escreve quanto vale ' +
        'cada nome.',
      body: [
        'A primeira técnica é escrever a tabela: 1 coluna por nome que muda, 1 linha por rodada. A regra é uma só, e ela é o que separa a tabela de um chute: cada linha é derivada da anterior.',
        'A parte difícil não é a conta, é decidir quais colunas existem. Um nome que muda dentro do laço e não está na tabela é um valor que você vai adivinhar quando precisar dele, e o trace inteiro passa a depender desse chute.',
      ],
      pseudocode: `função contar_pares(A)
    total ← 0
    i ← 0
    enquanto i < |A| faça
        se A[i] mod 2 = 0 então
            total ← total + 1
        i ← i + 2
    retorne total`,
      invariant: 'Ao começar cada rodada, total conta os elementos pares entre as posições já visitadas.',
      workedExample: {
        problem: 'Com A = [4, 7, 3] e passo i ← i + 1: (i=0, lê 4, total=1) → (i=1, lê 7, total=1) → (i=2, lê 3, total=1) → i=3 para.',
        whatToNotice: 'Cada estado vem do anterior e de uma linha do código. Trocar o passo para i ← i + 2 remove a rodada de i = 1; não existe salto que a tabela possa adivinhar.',
      },
      figure: {
        kind: 'execution-trace',
        caption: 'O exemplo avança de um em um. No exercício, o passo muda para dois e o trace precisa mudar com ele.',
        values: [4, 7, 3],
        initialIndex: 0,
        indexStep: 1,
        initialAccumulator: 0,
        operation: 'count-even',
      },
      exerciseId: 'tracing.e2' },

    { id: 'tracing.c3', title: 'A propriedade que sobrevive a cada rodada', layer: 'essential', band: 'technique', elaborates: 'invariant-reasoning',
      introducesTerms: ['loop-invariant'],
      oneLine: "A invariante é a frase que já é verdade antes da primeira rodada.",
      plainly:
        'Você quer saber se um laço acumula o resultado certo, e a coleção tem cem mil itens. ' +
        'Nenhuma tabela chega lá: é preciso uma frase que valha para todas as rodadas de uma vez.',
      body: [
        'A tabela responde sobre uma entrada. A invariante responde sobre todas: é uma propriedade que vale antes de cada rodada e continua valendo depois dela.',
        'O teste que separa uma invariante de uma conclusão é este: ela precisa valer **antes da primeira rodada**, com o laço ainda sem ter feito nada. "No fim, total é a soma de tudo" não passa nesse teste, é a conclusão. "Ao começar a rodada de i, total é a soma das posições 0 até i − 1" passa, e é dela que a conclusão sai.',
        'Ela também não dispensa a tabela. Quando você não consegue enunciar a propriedade, simule três rodadas: ela quase sempre está escrita ali, esperando ser lida.',
      ],
      workedExample: {
        problem: 'Para achar o maior de [8, 3, 11], inicialize maior = 8 e i = 1. Antes de cada rodada, maior é o maior valor entre as posições 0 e i − 1: primeiro 8, depois 8, por fim 11.',
        whatToNotice: 'A propriedade já vale antes da primeira comparação porque maior veio da posição 0. Inicializar maior com 0 quebraria a mesma afirmação numa coleção só de números negativos.',
      },
      exerciseId: 'tracing.e3' },

    { id: 'tracing.c4', title: 'A fronteira, e a entrada que ninguém testou', layer: 'essential', band: 'failure',
      introducesTerms: ['off-by-one'],
      oneLine: "Numa coleção de 5 elementos, a última posição é 4, e o vazio é o outro caso.",
      plainly:
        'O código passou em todos os testes, e todos usavam listas de cinco itens. Ele quebra com ' +
        'a lista vazia e com a leitura logo depois do último item, os dois casos que ninguém ' +
        'escreveu.',
      body: [
        'Duas famílias de erro moram na fronteira, e as duas passam em teste feito com a entrada típica.',
        'A primeira é a posição: numa coleção de n elementos, a última posição válida é n − 1, e o primeiro valor que a condição precisa recusar é n. Trocar `<` por `≤` move essa linha em uma casa, e uma casa é o suficiente.',
        'A segunda é a coleção vazia. Todo laço tem um comportamento para zero rodadas, e ele é o valor que estava lá antes do laço começar. Se o código lê alguma coisa antes de testar a condição, o caso vazio não chega nem a esse valor.',
      ],
      workedExample: {
        problem: "Numa coleção de 5 elementos, `i < 5` faz a última rodada com i = 4 e recusa i = 5. Trocando para `i ≤ 5`, a rodada extra lê a posição 5, que não existe.",
        whatToNotice: "A troca move a fronteira em uma casa e só. Agora rode as duas versões com a coleção vazia: uma faz zero rodadas, a outra faz uma.",
      },
      exerciseId: 'tracing.e4' },

    { id: 'tracing.c5', title: 'O laço não roda n vezes', layer: 'essential', band: 'failure',
      introducesTerms: [],
      oneLine: "Quantas rodadas acontecem depende da condição e do passo, nunca só do tamanho.",
      plainly:
        '"A lista tem mil itens, então o laço roda mil vezes" soa como conta e não é: basta o ' +
        'índice andar de dois em dois, ou dobrar a cada rodada, para o número mudar.',
      body: [
        'Volte ao critério do primeiro ciclo. A parte que falta com mais frequência é a condição que governa, e a frase que ela produz quando falta é a mais comum de todas: "o laço roda n vezes". Sobre 7 elementos, andando de 2 em 2, ele roda 4.',
        'Quantas rodadas acontecem é decidido por duas coisas juntas, a condição de parada e o passo com que o índice anda. O tamanho da coleção aparece numa das duas, e sozinho não responde nada.',
        'Este é o ciclo que a unidade inteira prepara, e é o que transfere: na unidade de análise de custo, contar rodadas é contar custo, e contar errado aqui é errar lá com convicção.',
      ],
      workedExample: {
        problem: "Sobre 7 elementos, começando com `i ← 0` e andando com `i ← i + 2`, o laço faz 4 rodadas, não 7. Sobre os mesmos 7, começando com `i ← 1` e andando com `i ← i × 2`, faz 3.",
        whatToNotice: "Nenhum dos dois roda 7 vezes. O 7 aparece só na condição de parada; quem decide a contagem é o passo, junto com o valor inicial: começando em 0, `i ← i × 2` nunca sai do 0, e o laço não para.",
      },
      exerciseId: 'tracing.e5' },

    { id: 'tracing.c6', title: 'O que não chega a ser avaliado', layer: 'essential', band: 'failure',
      introducesTerms: ['short-circuit'],
      oneLine: "Se o primeiro lado de um \"e\" é falso, o segundo não chega a ser avaliado.",
      plainly:
        'Uma validação pergunta se o usuário existe e se ele pode editar. Quando ele não existe, ' +
        'a segunda pergunta quebraria, e o programa só sobrevive porque nunca chega a fazê-la.',
      body: [
        'Numa condição composta, o segundo lado nem sempre é avaliado. Se o primeiro lado de um "e" já é falso, o resultado está decidido, e a linguagem não avalia o resto. Numa coleção de 0 elementos, é essa regra que separa um código que roda de um que quebra.',
        'Isso deixa de ser detalhe no momento em que avaliar o segundo lado quebraria, um acesso fora da coleção, uma divisão por zero, uma chamada em algo ausente. A ordem dos dois lados deixa de ser estilo e passa a ser a diferença entre funcionar e falhar.',
        'É a última família de leitura desta unidade, e a mais silenciosa: ela produz código que roda por anos e falha na primeira entrada vazia.',
      ],
      workedExample: {
        problem: "Com uma coleção de 0 elementos, `i < |A| e A[i] > 3` é seguro: o primeiro lado é falso e o segundo não roda. Invertendo para `A[i] > 3 e i < |A|`, a mesma coleção vazia falha na primeira leitura.",
        whatToNotice: "As duas condições são logicamente equivalentes e só uma delas roda. Repare que a versão quebrada passa em qualquer teste com pelo menos 1 elemento.",
      },
      postmortem: {
        incident: "Volte ao pull request de trinta linhas que passava nos testes. O laço tinha uma condição composta que lia o item no primeiro lado e só conferia a posição no segundo. Com a coleção vazia, a leitura acontecia antes da conferência e quebrava.",
        trapId: "tracing.curto-circuito",
        missingClaim: "Para a coleção vazia, a função não lê posição nenhuma e devolve um valor decidido de propósito. Ninguém escreveu essa frase, e quem tentasse escrevê-la teria achado o defeito.",
        whatWouldCatch: "O trace das três primeiras rodadas mais o caso de zero rodadas. Dois minutos de tabela, sem executar nada.",
      },
      exerciseId: 'tracing.e6' },
  ],

  misconceptions: tracingMisconceptions,

  exercises: tracingExercises,

  mastery: {
    statement:
      'O aluno domina esta unidade quando, diante de um laço de até vinte linhas que nunca ' +
      'viu, consegue sem executar: nomear as variáveis que carregam o estado, dizer quantas ' +
      'rodadas acontecem a partir da condição e do passo, não do tamanho da coleção, ' +
      'produzir o trace das três primeiras rodadas, e dizer o que a função devolve para a ' +
      'coleção vazia.',
    requiresClean: ['tracing.e2', 'tracing.e5'],
    revisitIntervalDays: 7,
  },
}
