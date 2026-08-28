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
  // vagueza comparativa — sem eixo declarado não afirma nada
  'mais rápido', 'mais lento', 'muito eficiente', 'melhor desempenho',
]

/**
 * The escape hatch, and why it exists: the first run of this check flagged the
 * sentence that QUOTES "hash é mais rápido" as an example of bad prose. A
 * checker that cannot tell citation from use would push an author to soften
 * the very example that teaches the point.
 */
export const VOCAB_ESCAPE = 'vocab-ok:'
