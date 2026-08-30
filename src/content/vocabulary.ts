/**
 * Euclid's rule applied to prose: you may use a technical-sounding word, but
 * you must declare it. A word here is rejected in authored content unless it
 * is a registered glossary term.
 *
 * The list is seeded from real failures. "Promete presença e recuperação"
 * survived a reading because it SOUNDS precise; the operations are `contém`
 * and `obter`, and neither noun appears in any API the student will ever read.
 */
export const vagueAbstractions = [
  // substantivos que substituem uma operação
  'presença', 'recuperação', 'obtenção',
  // qualidades sem unidade
  'performance', 'eficiência', 'robustez', 'escalabilidade', 'otimização',
  'flexibilidade', 'previsibilidade', 'confiabilidade', 'manutenibilidade',
  'expressividade', 'elegância',
  // vagueza comparativa, sem eixo declarado não afirma nada
  'mais rápido', 'mais lento', 'muito eficiente', 'melhor desempenho',
]

export interface VagueUseException {
  unit: string
  word: string
  /** Distinctive fragment of the sentence. Keyed on the prose, not on an index. */
  quote: string
  reason: string
}

/**
 * The escape hatch, and why it exists: the first run of this check flagged the
 * sentence that QUOTES "hash é mais rápido" as an example of bad prose. A
 * checker that cannot tell citation from use would push an author to soften
 * the very example that teaches the point.
 *
 * The reason lives here rather than inside the string because a marker inside
 * the string reaches the student, no renderer strips it. Keyed by `quote`
 * rather than by a walk path so that moving a paragraph does not invalidate
 * every exception below it; rewriting the sentence, which is when the licence
 * should be reconfirmed, still orphans the entry and fails the build.
 */
export const allowedVagueUses: VagueUseException[] = []


export interface ForwardCitation {
  /** O ciclo que cita. */
  cycle: string
  /** O id do termo, que estreia depois deste ciclo. */
  term: string
  reason: string
}

/**
 * Citação para a frente, declarada.
 *
 * A checagem `estreia` reprova um termo que aparece na prosa antes do ciclo
 * que o estreia. Ela nasceu de uma deriva real: `pior caso`, `caso médio` e
 * `amortizado` eram vocabulário de trabalho da unidade 02 e diziam nascer na
 * unidade 04, duas unidades depois de o aluno já estar usando os três.
 *
 * Mas nem todo uso antecipado é deriva. A trilha cita para a frente de
 * propósito, e citar é o oposto de assumir: "é a mesma família de problema que
 * a unidade de tabelas hash chama de hash flooding" prepara o terreno em vez de
 * pressupor que ele já existe.
 *
 * Nenhuma checagem separa as duas mecanicamente, e uma que tentasse seria
 * nível de aviso disfarçado. Então a citação fica declarada aqui, com razão, do
 * mesmo jeito que `allowedVagueUses`. Reescrever o parágrafo órfã a entrada e
 * reprova o build, que é quando a licença deve ser reconfirmada.
 */
export const forwardCitations: ForwardCitation[] = [
  { cycle: 'asymptotics.c0', term: 'hash',
    reason: '"Hash é O(1)" é a frase que abre a unidade inteira. O exemplo precisa da palavra antes de a estrutura existir.' },
  { cycle: 'asymptotics.c0', term: 'amortized',
    reason: 'A lista das cinco partes de uma afirmação de custo nomeia a amortização; o ciclo c6 é quem a define.' },
  { cycle: 'asymptotics.c2', term: 'list',
    reason: '"Procurar numa lista de 1000" usa a palavra no sentido comum, antes de a unidade 03 declarar o contrato.' },
  { cycle: 'asymptotics.c6', term: 'hash',
    reason: '"O(1) amortizado no caso médio" é a frase que a unidade 04 usa, e este ciclo a cita como exemplo de dois qualificadores juntos.' },
  { cycle: 'asymptotics.c5', term: 'quicksort',
    reason: 'O pior caso do quicksort com pivô no primeiro elemento é o exemplo que desfaz a confusão. Sem ele o ciclo vira definição.' },
  { cycle: 'asymptotics.c5', term: 'pivot',
    reason: 'Vem junto com o exemplo do quicksort, e a unidade 07 é quem define a escolha do pivô.' },
  { cycle: 'asymptotics.c6', term: 'dynamic-array',
    reason: 'O array dinâmico é o exemplo canônico de amortização, e é ele que torna a conta concreta.' },
  { cycle: 'asymptotics.c6', term: 'capacity',
    reason: 'Dobrar de capacidade é a operação que produz a amortização; a unidade 03 detalha a distinção entre capacidade e tamanho.' },
  { cycle: 'linear.c6', term: 'hash',
    reason: 'O último ciclo aponta para a unidade seguinte pelo nome, que é o movimento de fechamento de toda unidade desta trilha.' },
  { cycle: 'tracing.c4', term: 'position',
    reason: '"A primeira é a posição" usa a palavra no sentido comum de índice, não no do contrato da unidade 03.' },
  { cycle: 'hash.c3', term: 'rehash',
    reason: 'A invariante de posição só rende se o ciclo disser para que ela serve, e o rehash é a resposta. c5 é quem o define.' },
  { cycle: 'trees.c1', term: 'binary-search',
    reason: 'A árvore de busca É a busca binária guardada em ponteiros. Nomear a origem é o que dá referente ao aluno.' },
  { cycle: 'trees.c5', term: 'sorting',
    reason: '"Serve para igualdade, faixa e ordenação" usa a palavra no sentido comum, antes de a unidade 07 declarar o contrato.' },
  { cycle: 'trees.c6', term: 'workload',
    reason: 'A leitura da carga de trabalho é o critério de escolha, e a unidade 08 é quem o formaliza.' },
  { cycle: 'sorting.c0', term: 'comparator',
    reason: 'O contrato precisa dizer que o empate é decidido por um comparador antes de c1 detalhar as obrigações dele.' },
  { cycle: 'sorting.c8', term: 'composition',
    reason: 'O ciclo mostra a composição de dois algoritmos; a unidade 08 é quem a nomeia como movimento de projeto.' },
]
