'use client'

import { tokenize, TOKEN_COLORS, TOKEN_WEIGHT } from '@/lib/pseudocode'
import type { TraceStep } from '@/lib/socratic'
import { cn } from '@/lib/utils'
import { Stepper } from './Stepper'

/**
 * O painel de execução, com cara de depurador.
 *
 * Ele existe DEPOIS de verificar, nunca antes, pela mesma razão que o traço
 * rodando: preencher a tabela passo a passo é entregar a resposta. Fechado o
 * exercício, a mesma animação vira a explicação que o aluno veio buscar.
 *
 * A ligação entre linha de código e coluna da tabela é `lineByColumn`, declarado
 * no exercício. Sem ele o painel não aparece, e o traço rodando sozinho aparece
 * no lugar: um depurador que acende a linha errada ensina o oposto do que a
 * unidade inteira treina. ADR-0026.
 */
export function ExecutionPanel({
  pseudocode, reference, columns, lineByColumn,
}: {
  pseudocode: string
  reference: TraceStep[]
  columns: Array<{ key: string; label: string }>
  lineByColumn: Record<string, number>
}) {
  const codeLines = pseudocode.split('\n')
  const watched = columns.filter((c) => lineByColumn[c.key] !== undefined)

  return (
    <div className="border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">Execução, passo a passo</span>
      </div>

      <Stepper
        count={reference.length}
        labelFor={(k) => `rodada ${k + 1} de ${reference.length}`}
      >
        {(at) => {
          const row = reference[at]!
          /*
            Qual linha está acesa: a da última coluna que MUDOU nesta rodada.
            Acender a linha da primeira coluna sempre mostraria o topo do laço a
            cada passo, que é verdade e não é informação.
          */
          const previous = at > 0 ? reference[at - 1]! : undefined
          const changed = watched.filter((c) => !previous || previous[c.key] !== row[c.key])
          const active = changed.length
            ? lineByColumn[changed[changed.length - 1]!.key]!
            : lineByColumn[watched[0]!.key]!

          return (
            <div className="flex flex-col gap-0 lg:flex-row">
              <div className="min-w-0 flex-1 overflow-x-auto border-b border-rule lg:border-r lg:border-b-0">
                <pre className="m-0 bg-[#101218] py-2 font-mono text-[12.5px] leading-[1.85]">
                  <code>
                    {codeLines.map((line, i) => {
                      const n = i + 1
                      const on = n === active
                      return (
                        <div
                          key={n}
                          className={cn('flex gap-3 px-3', on && 'bg-contract-bg')}
                          aria-current={on ? 'step' : undefined}
                        >
                          <span className={cn('w-4 shrink-0 select-none text-right', on ? 'text-contract' : 'text-fg-5')}>
                            {n}
                          </span>
                          <span className="whitespace-pre">
                            {tokenize(line).map((t, k) => (
                              <span
                                key={k}
                                style={{ color: TOKEN_COLORS[t.kind], fontWeight: TOKEN_WEIGHT[t.kind] }}
                              >
                                {t.text}
                              </span>
                            ))}
                          </span>
                        </div>
                      )
                    })}
                  </code>
                </pre>
              </div>

              <div className="flex w-full shrink-0 flex-col lg:w-[300px]">
                <span className="lbl border-b border-rule px-3 py-1.5">Variáveis observadas</span>
                {watched.map((c) => {
                  const moved = changed.some((x) => x.key === c.key)
                  return (
                    <div
                      key={c.key}
                      className={cn(
                        'flex items-baseline justify-between gap-3 border-b border-rule-soft px-3 py-1.5',
                        moved && 'bg-contract-bg',
                      )}
                    >
                      <span className="font-mono text-[11.5px] text-fg-4">{c.label}</span>
                      <span className={cn('font-mono text-[13px]', moved ? 'text-contract' : 'text-fg-2')}>
                        {row[c.key]}
                      </span>
                    </div>
                  )
                })}
                <div className="px-3 py-2 text-[11.5px] leading-relaxed text-fg-4">
                  A linha acesa é a que escreveu o valor destacado nesta rodada.
                </div>
              </div>
            </div>
          )
        }}
      </Stepper>
    </div>
  )
}
