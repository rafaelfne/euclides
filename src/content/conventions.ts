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

/** Language boundary, declared because leaving it implicit is how drift starts. */
export const languageBoundary = {
  pseudocode: 'pt' as const,   // é conteúdo: inserir(tabela, chave, valor)
  executableCode: 'en' as const, // é código: insert(table, key, value)
}
