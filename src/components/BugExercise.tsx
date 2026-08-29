'use client'

import { useState } from 'react'
import type { BugHuntExercise, Unit } from '@/content/schema'
import { cn } from '@/lib/utils'
import { ChoiceExercise } from './ChoiceExercise'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'

/**
 * O exercício de caça ao defeito, que até aqui nunca existiu na tela.
 *
 * `kind: 'bug'` era roteado para o componente de escolha, então `code` e
 * `faultyLines` eram dados obrigatórios que nenhuma tela lia: o enunciado dizia
 * "marque a linha defeituosa" e não havia código nem linha para marcar. O
 * validador não pega isso — ele checa o dado, não a renderização.
 *
 * São dois estágios, porque é o que os enunciados já prometiam: marcar a linha
 * certa pela razão errada não conta. As consequências só aparecem depois que a
 * linha está certa, e uma linha errada não diz qual é a certa.
 */
export function BugExercise({ unit, exercise }: { unit: Unit; exercise: BugHuntExercise }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [tries, setTries] = useState(0)

  const lines = exercise.code.split('\n')
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

          <div className="overflow-x-auto border border-rule bg-[#101218]">
            <table className="w-full border-collapse font-mono text-[12.5px]">
              <tbody>
                {lines.map((line, i) => {
                  const n = i + 1
                  const isPicked = picked === n
                  const isFound = found && exercise.faultyLines.includes(n)
                  return (
                    <tr
                      key={n}
                      onClick={() => pick(n)}
                      className={cn(
                        'cursor-pointer',
                        isFound && 'bg-implementation-bg',
                        isPicked && !isFound && 'bg-panel-hover',
                        !isPicked && !isFound && 'hover:bg-panel-head',
                      )}
                    >
                      <td className="w-10 select-none border-r border-rule px-2.5 py-0.5 text-right align-top text-fg-5">
                        {n}
                      </td>
                      <td className="w-full whitespace-pre px-3 py-0.5 text-fg-2">{line || ' '}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="text-[12px] italic text-fg-4">
            {picked === null && `Clique na linha que você acha defeituosa. A linguagem é ${exercise.language}.`}
            {picked !== null && !found && 'Essa linha faz o que ela promete. Releia o que cada linha garante, e procure a que garante algo diferente do que o comentário ou o nome dela promete.'}
            {found && 'Linha certa. Agora a consequência — e marcar a linha certa pela razão errada não conta.'}
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
