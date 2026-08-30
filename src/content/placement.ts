export interface Probe {
  unitId: string
  exerciseId: string
  label: string
  whatItProbes: string
}

export const MAX_PROBE_PROMPT_WORDS = 40
export const MAX_PROBE_LABEL_WORDS = 6

export const probes: Probe[] = [
  {
    unitId: 'tracing',
    exerciseId: 'tracing.e4',
    label: 'Entrada sem elementos',
    whatItProbes: 'testar a entrada vazia antes de confiar no caso típico',
  },
  {
    unitId: 'asymptotics',
    exerciseId: 'asymptotics.e4',
    label: 'Custo em entradas diferentes',
    whatItProbes: 'usar o pior caso quando qualquer entrada válida pode chegar ao sistema',
  },
  {
    unitId: 'linear',
    exerciseId: 'linear.e2',
    label: 'Custo escondido numa fila',
    whatItProbes: 'ver o custo que uma implementação de fila esconde',
  },
  {
    unitId: 'hash',
    exerciseId: 'hash.e5',
    label: 'Consulta que precisa de ordem',
    whatItProbes: 'reconhecer quando uma tabela hash não responde a pergunta pedida',
  },
  {
    unitId: 'trees',
    exerciseId: 'trees.e2',
    label: 'Forma criada pela ordem de chegada',
    whatItProbes: 'reconhecer a entrada que degrada uma árvore sem balanceamento',
  },
  {
    unitId: 'graphs',
    exerciseId: 'graphs.e5',
    label: 'Caminho com menos etapas',
    whatItProbes: 'separar menos arestas de menor custo',
  },
]
