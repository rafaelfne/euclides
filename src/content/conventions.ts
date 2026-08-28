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
 * Como se preenche um traço. Mesma razão da tabela acima, um nível adiante: a
 * notação do pseudocódigo estava declarada e a de PREENCHIMENTO não, então o
 * aluno inventava a sua e divergia do gabarito sem ter errado o raciocínio.
 */
export const traceConventions = [
  { notation: '0:[12,20]', rule: 'uma posição ocupada', why: 'O número da posição, dois-pontos, e as chaves que estão nela. Só as chaves — o valor guardado não entra no traço.' },
  { notation: '0:[12,20] 5:[45]', rule: 'a tabela inteira', why: 'Só as posições que têm alguma chave, da menor para a maior, separadas por espaço.' },
  { notation: '—', rule: 'tabela vazia', why: 'Nenhuma posição ocupada ainda.' },
  { notation: 'sim / não', rule: 'houve rehash', why: 'Responda as duas linhas. Deixar em branco não é dizer não.' },
  { notation: '0,75', rule: 'a carga', why: 'Vírgula decimal, e a casa a mais não muda nada: 0,75 e 0,750 valem igual.' },
]

/** Language boundary, declared because leaving it implicit is how drift starts. */
export const languageBoundary = {
  pseudocode: 'pt' as const,   // é conteúdo: inserir(tabela, chave, valor)
  executableCode: 'en' as const, // é código: insert(table, key, value)
}
