import type { TraceStep } from '../socratic'

/**
 * A conta com pesos, e as duas maneiras de saber quanto cada número pesa nela.
 *
 * Existe para GERAR o gabarito de `ai.e5`, e para que `scripts/test-ai.ts`
 * confira as duas técnicas da unidade uma contra a outra: o gradient que a
 * passada para trás produz tem de bater com o que se mede empurrando cada
 * número um pouco e refazendo a conta inteira. Se as duas discordam, quem está
 * errado é este arquivo, e o gabarito junto.
 *
 * A conta é um grafo de nós de soma e de produto. São as duas únicas contas de
 * que a regra da cadeia precisa, e é por isso que a unidade não tem outras.
 */

export type Op = 'input' | 'add' | 'mul'

export interface GraphNode {
  name: string
  op: Op
  /** Nomes dos nós que esta conta lê. Um nó pode aparecer duas vezes: `a × a`. */
  inputs: string[]
}

export type Graph = GraphNode[]
export type Values = Record<string, number>

const nodeOf = (graph: Graph, name: string): GraphNode => {
  const n = graph.find((x) => x.name === name)
  if (!n) throw new Error(`nó desconhecido: "${name}"`)
  return n
}

/** A passada para frente: o valor de cada nó, guardado. */
export function forward(graph: Graph, inputs: Values): Values {
  const values: Values = {}
  const valueOf = (name: string): number => {
    if (name in values) return values[name]!
    const n = nodeOf(graph, name)
    let v: number
    if (n.op === 'input') {
      if (!(name in inputs)) throw new Error(`entrada sem valor: "${name}"`)
      v = inputs[name]!
    } else if (n.op === 'add') {
      v = n.inputs.reduce((acc, i) => acc + valueOf(i), 0)
    } else {
      v = n.inputs.reduce((acc, i) => acc * valueOf(i), 1)
    }
    values[name] = v
    return v
  }
  for (const n of graph) valueOf(n.name)
  return values
}

/**
 * A ordem da passada para trás: a ordem topológica, invertida.
 *
 * É o procedimento do micrograd: uma busca em profundidade a partir da saída
 * que só anota um nó depois de anotar tudo o que ele lê, e a lista ao
 * contrário. As entradas são visitadas na ordem em que a conta as declara.
 * O que importa, e o que o teste confere, é a invariante: todo nó aparece
 * DEPOIS de todos os nós que usam o valor dele.
 */
export function backwardOrder(graph: Graph, output: string): string[] {
  const topo: string[] = []
  const seen = new Set<string>()
  const visit = (name: string) => {
    if (seen.has(name)) return
    seen.add(name)
    for (const i of nodeOf(graph, name).inputs) visit(i)
    topo.push(name)
  }
  visit(output)
  return topo.reverse()
}

/**
 * Quanto `node` muda se a entrada na posição `position` subir 1, com as
 * outras paradas. Na soma é 1; no produto é o produto das OUTRAS entradas.
 * É por posição, e não por nome, porque em `a × a` cada uso de `a` tem o seu.
 */
export function localImpact(graph: Graph, values: Values, node: string, position: number): number {
  const n = nodeOf(graph, node)
  if (n.op === 'add') return 1
  if (n.op === 'mul') {
    return n.inputs.reduce((acc, name, j) => (j === position ? acc : acc * values[name]!), 1)
  }
  throw new Error(`"${node}" é entrada e não tem entradas para receber impacto`)
}

export interface BackwardOptions {
  /**
   * Gradient que já estava nos pesos antes desta passada. É o laço de treino de
   * `ai.c7`, em que nada zera o gradient entre as rodadas: a passada soma ao que
   * encontra.
   * Só as entradas carregam, porque num treino a conta é refeita a cada rodada
   * e os nós do meio nascem de novo, com gradient zero; os pesos são os mesmos.
   */
  carry?: Values
  /**
   * Escreve com `=` em vez de somar. É a armadilha `ai.grad-sobrescrito`, e
   * existe aqui só para o teste provar que ela muda o resultado num nó usado
   * duas vezes e não muda nada no carrinho, que é por que ela sobrevive.
   */
  overwrite?: boolean
}

/** A passada para trás: `entrada.grad ← entrada.grad + impacto_local × nó.grad`. */
export function backward(
  graph: Graph, values: Values, output: string, options: BackwardOptions = {},
): { order: string[]; grad: Values } {
  const grad: Values = {}
  for (const n of graph) grad[n.name] = n.op === 'input' ? options.carry?.[n.name] ?? 0 : 0
  grad[output] = 1
  const order = backwardOrder(graph, output)
  for (const name of order) {
    const n = nodeOf(graph, name)
    n.inputs.forEach((input, position) => {
      const contribution = localImpact(graph, values, name, position) * grad[name]!
      grad[input] = options.overwrite ? contribution : grad[input]! + contribution
    })
  }
  return { order, grad }
}

/**
 * O gradient numérico: empurrar um número um pouco, refazer a conta INTEIRA,
 * medir a diferença e dividir pelo empurrão. Uma passada por número medido,
 * mais a de referência; é o custo que a unidade compara com o da passada para
 * trás, que são duas qualquer que seja o número de pesos.
 */
export function numericGradient(
  graph: Graph, inputs: Values, output: string, name: string, nudge = 1e-6,
): number {
  const reference = forward(graph, inputs)[output]!
  const pushed = forward(graph, { ...inputs, [name]: inputs[name]! + nudge })[output]!
  return (pushed - reference) / nudge
}

/** Número em pt-BR, sem ruído de ponto flutuante: 0,1 × 3 é 0,3 e não 0,30000000000000004. */
export const ptNumber = (n: number): string => String(Number(n.toFixed(6))).replace('.', ',')

// ---------------------------------------------------------------------------
// O carrinho de `ai.e5`.
// ---------------------------------------------------------------------------

/** total = (preço × quantidade + frete) × fator, com os dois nós do meio nomeados. */
export const cartGraph: Graph = [
  { name: 'preço', op: 'input', inputs: [] },
  { name: 'quantidade', op: 'input', inputs: [] },
  { name: 'frete', op: 'input', inputs: [] },
  { name: 'fator', op: 'input', inputs: [] },
  { name: 'subtotal', op: 'mul', inputs: ['preço', 'quantidade'] },
  { name: 'base', op: 'add', inputs: ['subtotal', 'frete'] },
  { name: 'total', op: 'mul', inputs: ['base', 'fator'] },
]

/**
 * As entradas do exercício. Nem as do problema motivador (10, 3, 5, 2), nem as
 * do exemplo trabalhado de c5, que usa outra conta.
 */
export const CART_INPUTS: Values = { 'preço': 4, quantidade: 5, frete: 6, fator: 3 }

/**
 * Uma linha por nó, na ordem da passada para trás.
 *
 * `local` é o impacto local do nó na conta que o usa, o "nó de cima". O
 * carrinho é uma árvore, então cada nó tem exatamente um nó de cima, e a
 * coluna é bem definida; num nó usado duas vezes ela não seria, e o gerador
 * se recusa em vez de escolher um dos dois em silêncio. O total não tem nó de
 * cima, e por convenção o impacto local dele é 1.
 */
export function backwardTrace(graph: Graph, inputs: Values, output: string): TraceStep[] {
  const values = forward(graph, inputs)
  const { order, grad } = backward(graph, values, output)
  return order.map((name, i) => {
    const uses = graph.flatMap((n) => n.inputs.map((input, position) => ({ node: n.name, input, position })))
      .filter((u) => u.input === name)
    if (name !== output && uses.length !== 1) {
      throw new Error(`"${name}" é usado ${uses.length} vezes, e a coluna de impacto local precisa de um nó de cima só`)
    }
    const local = name === output ? 1 : localImpact(graph, values, uses[0]!.node, uses[0]!.position)
    return {
      step: String(i + 1),
      key: name,
      value: ptNumber(values[name]!),
      local: ptNumber(local),
      grad: ptNumber(grad[name]!),
    }
  })
}

export const cartBackwardTrace = (): TraceStep[] => backwardTrace(cartGraph, CART_INPUTS, 'total')

/** Ids prefixados pela unidade, como todo registro de gerador. */
export const aiReferenceGenerators: Record<string, () => TraceStep[]> = {
  'ai.cart-backward-trace': cartBackwardTrace,
}
