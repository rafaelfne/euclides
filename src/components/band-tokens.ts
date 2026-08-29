import type { Cycle } from '@/content/schema'

/**
 * A apresentação de cada banda, exaustiva por tipo, deriva 4 do CLAUDE.md.
 * Uma banda nova não compila até ser nomeada aqui, e o rótulo é conteúdo em
 * pt-BR enquanto o valor do enum continua sendo código.
 */
export const BAND_LABEL: Record<Cycle['band'], string> = {
  contract: 'Contrato',
  implementation: 'Implementação',
  cost: 'Custo',
  criterion: 'Critério',
  technique: 'Técnica',
  failure: 'Falha',
}

export type BandTone = 'contract' | 'implementation' | 'cost'

/**
 * As duas espinhas do ADR-0012 compartilham a paleta por POSIÇÃO: a banda de
 * abertura é azul nas duas, a do meio é vermelha, a da consequência é ocre.
 * Quem aprendeu a ler o mapa numa unidade lê a outra sem reaprender.
 */
export const BAND_TONE: Record<Cycle['band'], BandTone> = {
  contract: 'contract',
  implementation: 'implementation',
  cost: 'cost',
  criterion: 'contract',
  technique: 'implementation',
  failure: 'cost',
}

export const TONE_TEXT: Record<BandTone, string> = {
  contract: 'text-contract',
  implementation: 'text-implementation',
  cost: 'text-cost',
}

export const TONE_BORDER: Record<BandTone, string> = {
  contract: 'border-contract-rule',
  implementation: 'border-implementation-rule',
  cost: 'border-cost-rule',
}

export const TONE_SURFACE: Record<BandTone, string> = {
  contract: 'bg-contract-bg',
  implementation: 'bg-implementation-bg',
  cost: 'bg-cost-bg',
}

/**
 * `null` diz que a ausência de rótulo é escolha, não esquecimento: um ciclo
 * essencial não ganha selo, e a banda dele nunca é escondida por causa disso.
 */
export const LAYER_LABEL: Record<Cycle['layer'], string | null> = {
  essential: null,
  'deep-dive': 'Aprofundamento',
}
