/**
 * As seis sondas do nivelamento, uma por unidade das seis primeiras.
 *
 * Cada uma é um exercício que já existe, escolhido pelo julgamento central da
 * unidade: acertá-la de primeira é evidência de que aquele terreno já foi
 * andado. Não são necessariamente os exercícios do critério de domínio, e a
 * distinção importa — o critério mede domínio, a sonda mede se vale começar
 * ali.
 *
 * Só `choice` entra. A sondagem promete quatro minutos, e um traço de oito
 * rodadas não cabe em quatro minutos. A checagem `sondagem` reprova qualquer
 * outra forma.
 *
 * `whatItProbes` é o que a tela mostra ao devolver o resultado. Ele descreve a
 * CAPACIDADE, nunca a resposta, porque a sondagem também é conteúdo e o
 * princípio 3 vale aqui igual.
 */
export interface Probe {
  unitId: string
  exerciseId: string
  whatItProbes: string
}

export const probes: Probe[] = [
  {
    unitId: 'tracing',
    exerciseId: 'tracing.e5',
    whatItProbes: 'contar rodadas pela condição e pelo passo, não pelo tamanho da coleção',
  },
  {
    unitId: 'asymptotics',
    exerciseId: 'asymptotics.e4',
    whatItProbes: 'saber quando o regime declarado muda a conclusão',
  },
  {
    unitId: 'linear',
    exerciseId: 'linear.e2',
    whatItProbes: 'ver o custo que uma implementação de fila esconde',
  },
  {
    unitId: 'hash',
    exerciseId: 'hash.e5',
    whatItProbes: 'escolher pela operação que domina a carga, e não pela mais interessante',
  },
  {
    unitId: 'trees',
    exerciseId: 'trees.e2',
    whatItProbes: 'reconhecer a entrada que degrada uma árvore sem balanceamento',
  },
  {
    unitId: 'graphs',
    exerciseId: 'graphs.e5',
    whatItProbes: 'separar menos arestas de menor custo',
  },
]
