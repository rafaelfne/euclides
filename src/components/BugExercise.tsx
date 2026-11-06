'use client'

import { useState } from 'react'
import type { BugHuntExercise, Unit } from '@/content/schema'
import { TOKENIZERS } from '@/lib/highlight'
import { TOKEN_COLORS, TOKEN_WEIGHT } from '@/lib/pseudocode'
import { cn } from '@/lib/utils'
import { ChoiceExercise } from './ChoiceExercise'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'

export function BugExercise({ unit, exercise }: { unit: Unit; exercise: BugHuntExercise }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [tries, setTries] = useState(0)

  const lines = exercise.code.split('\n')
  const tokenize = TOKENIZERS[exercise.language]
  const isDiff = Boolean(exercise.addedLines?.length)
  const found = picked !== null && exercise.faultyLines.includes(picked)

  const pick = (n: number) => {
    if (found) return
    setPicked(n)
    setTries((t) => t + 1)
  }

  return (
    <div className="flex flex-col gap-3">
      <Panel>
        <PanelHeader>
          <PanelTitle>Exercício · caça ao defeito</PanelTitle>
          <PanelMeta>{tries === 0 ? 'nenhuma linha marcada' : `${tries} ${tries === 1 ? 'linha marcada' : 'linhas marcadas'}`}</PanelMeta>
        </PanelHeader>
        <PanelBody className="flex flex-col gap-3.5">
          <p className="m-0 text-[14.5px] leading-relaxed text-fg">{exercise.prompt}</p>

          <div className="border border-rule bg-[#101218]">
            {isDiff && (
              <div className="flex flex-wrap items-baseline gap-3 border-b border-rule bg-panel-head px-3 py-1.5">
                <span className="lbl">Revisão de pull request</span>
                <span className="font-mono text-[12px] text-contract">
                  +{exercise.addedLines!.length}
                </span>
                <span className="font-mono text-[12px] text-fg-4">{exercise.language}</span>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-[12.5px]">
                <tbody>
                  {lines.map((line, i) => {
                    const n = i + 1
                    const isPicked = picked === n
                    const isFound = found && exercise.faultyLines.includes(n)
                    const added = exercise.addedLines?.includes(n) ?? false
                    return (
                      <tr
                        key={n}
                        onClick={() => pick(n)}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(n) } }}
                        aria-label={`linha ${n}${added ? ', acrescentada' : ''}`}
                        className={cn(
                          'cursor-pointer focus:outline focus:outline-1 focus:outline-contract',
                          isFound && 'bg-implementation-bg',
                          isPicked && !isFound && 'bg-panel-hover',
                          !isPicked && !isFound && added && 'bg-contract-bg/40',
                          !isPicked && !isFound && 'hover:bg-panel-head',
                        )}
                      >
                        {isDiff && (
                          <td className="w-6 select-none py-0.5 pl-2.5 align-top text-contract">
                            {added ? '+' : ' '}
                          </td>
                        )}
                        <td className="w-10 select-none border-r border-rule px-2.5 py-0.5 text-right align-top text-fg-5">
                          {n}
                        </td>
                        <td className="w-full whitespace-pre px-3 py-0.5">
                          {line && tokenize
                            ? tokenize(line).map((t, k) => (
                                <span
                                  key={k}
                                  className={t.kind === 'convention' ? 'tok-convention' : undefined}
                                  style={{ color: TOKEN_COLORS[t.kind], fontWeight: TOKEN_WEIGHT[t.kind] }}
                                  title={t.declares}
                                >
                                  {t.text}
                                </span>
                              ))
                            : line || ' '}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[12px] italic text-fg-4">
            {picked === null && (isDiff
              ? `Clique na linha que você recusaria nesta revisão. A linguagem é ${exercise.language}.`
              : `Clique na linha que você acha defeituosa. A linguagem é ${exercise.language}.`)}
            {picked !== null && !found && 'Essa linha faz o que ela promete. Releia o que cada linha garante, e procure a que garante algo diferente do que o comentário ou o nome dela promete.'}
            {found && 'Linha encontrada. Agora escolha o que ela provoca.'}
          </div>
        </PanelBody>
      </Panel>

      {found && (
        <ChoiceExercise
          unit={unit}
          exerciseId={exercise.id}
          prompt="O que essa linha provoca?"
          choices={exercise.consequences}
        />
      )}
    </div>
  )
}
