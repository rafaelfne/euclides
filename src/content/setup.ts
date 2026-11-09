import { aiSetup } from './units/ai/setup'

/**
 * A página de preparo da máquina: o que instalar e escrever para rodar, no
 * computador do aluno, o código que uma unidade descreve.
 *
 * Só existe para unidade cujo `runnable` vira código que roda fora do app. É
 * conteúdo como o resto: a tela lê daqui e não escreve frase nenhuma, e
 * `scripts/test-setup.ts` confere que todo número do código sai da referência
 * e que nenhum bloco entrega gabarito de exercício.
 */

/** Um bloco de terminal ou um arquivo inteiro. */
export type SetupBlock =
  | {
      kind: 'shell'
      /** Onde o comando vale. Sem `os`, vale nos dois. */
      os?: 'unix' | 'windows'
      source: string
    }
  | {
      kind: 'file'
      /** Caminho relativo à pasta do projeto. */
      path: string
      /** `new` cria o arquivo; `append` acrescenta ao fim de um que já existe. */
      mode: 'new' | 'append'
      source: string
    }

export interface SetupStep {
  title: string
  /** Por que este passo existe, antes do comando. */
  why: string
  blocks: SetupBlock[]
  /**
   * O que escrever, em ordem, quando o passo é código do aluno. Cada item
   * aponta o ciclo que ensinou aquela parte; o título vem do ciclo, nunca
   * digitado aqui.
   */
  build?: Array<{ text: string; cycle: string }>
  /** Ciclos a reler antes do passo. O título e o número vêm do conteúdo. */
  cycles?: string[]
  /** Exercício que precisa estar resolvido antes do passo. */
  after?: string
  /** O critério objetivo de que o passo terminou. */
  doneWhen: string
}

export interface SetupGuide {
  unitId: string
  title: string
  /** A linha do link no mapa da unidade. */
  summary: string
  lede: string[]
  steps: SetupStep[]
  /** O que fazer quando tudo passa: a leitura do original, com o link. */
  next: { text: string; href: string; label: string }
}

export const setupGuides: SetupGuide[] = [aiSetup]

export const setupFor = (unitId: string): SetupGuide | undefined =>
  setupGuides.find((g) => g.unitId === unitId)
