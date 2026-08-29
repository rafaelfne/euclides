import type { Token } from './pseudocode'
import { tokenizeJavaScript } from './javascript'

export type Tokenizer = (source: string) => Token[]

/**
 * Qual linguagem tem realce de verdade.
 *
 * `BugExercise` chamava `tokenizeJavaScript` em qualquer exercício de defeito,
 * qualquer que fosse a `language` declarada. Um exercício em outra linguagem
 * sairia colorido pelas regras erradas, e realce errado num exercício que pede
 * para achar o defeito ensina o oposto do que a unidade treina. ADR-0028.
 *
 * A checagem `realce` reprova conteúdo que declare linguagem fora deste
 * registro, e a tela cai para texto sem cor se acontecer mesmo assim: sem cor é
 * omissão, com a cor errada é afirmação falsa.
 */
export const TOKENIZERS: Record<string, Tokenizer> = {
  javascript: tokenizeJavaScript,
}
