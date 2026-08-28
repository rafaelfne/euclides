/**
 * Notation, declared once. Silent drift here is the fastest way to ruin a trace
 * exercise: a student carrying a 1-based mental model into a 0-based reference
 * diverges on every step and concludes he does not understand hash tables,
 * when what he hit was an undeclared convention.
 */
export const conventions = [
  { notation: 'x ← v', rule: 'atribuição', why: 'Símbolo distinto de igualdade. Em pseudocódigo, `=` é sempre comparação.' },
  { notation: 'a = b', rule: 'comparação', why: 'Igualdade matemática. Nunca `==`, que é sintaxe de linguagem.' },
  { notation: 'A[0]', rule: 'primeiro elemento', why: 'Base 0. Livros clássicos usam base 1 e todo código que você escreve usa base 0 — por isso está declarado.' },
  { notation: 'a mod m', rule: 'resto', why: '`%` é operador de linguagem; `mod` é a operação matemática.' },
  { notation: '|A|', rule: 'tamanho', why: 'Vale para coleção e para chave — e é o que torna visível o custo de hashear uma chave longa.' },
  { notation: 'NULO', rule: 'ausência de valor', why: 'Maiúscula para não confundir com uma variável.' },
]

/**
 * Como se preenche um traço — o que vale para QUALQUER traço da trilha.
 *
 * A notação de cada coluna é do exercício, não daqui: a primeira versão desta
 * lista descrevia bucket, rehash e carga, e apareceu inteira dentro de um
 * exercício de ordenação, onde nenhuma das três existe. Convenção declarada no
 * escopo errado é convenção não declarada. Ver `traceExercise.conventions` em
 * `src/content/schema.ts` e o ADR-0013.
 */
export const traceConventions = [
  { notation: '(em cinza)', rule: 'o texto claro na célula', why: 'É o formato esperado, nunca a resposta. Ele não conta como preenchimento.' },
  { notation: '(vazio)', rule: 'deixar em branco', why: 'Não é uma resposta. Toda linha e toda coluna editável precisam de valor.' },
  { notation: '0,75', rule: 'número', why: 'Vírgula decimal, e a casa a mais não muda nada: 0,75 e 0,750 valem igual.' },
]

/** Language boundary, declared because leaving it implicit is how drift starts. */
export const languageBoundary = {
  pseudocode: 'pt' as const,   // é conteúdo: inserir(tabela, chave, valor)
  executableCode: 'en' as const, // é código: insert(table, key, value)
}
