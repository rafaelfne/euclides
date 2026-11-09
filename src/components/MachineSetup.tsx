'use client'

import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'
import { unitById } from '@/content'
import type { SetupBlock, SetupGuide } from '@/content/setup'
import { tokenizePython } from '@/lib/python'
import { TOKEN_COLORS, TOKEN_WEIGHT } from '@/lib/pseudocode'
import { cn } from '@/lib/utils'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'

type Os = 'unix' | 'windows'

const OS_LABEL: Record<Os, string> = { unix: 'macOS e Linux', windows: 'Windows' }
const MODE_LABEL: Record<'new' | 'append', string> = { new: 'arquivo novo', append: 'acrescente ao fim' }

/** Trechos entre crases viram código; o resto é texto. Nada mais é interpretado. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        i % 2 ? (
          <code key={i} className="font-mono text-[0.92em] text-fg">{part}</code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}

function CopyButton({ source }: { source: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }
  return (
    <button type="button" onClick={copy} className="m-tap lbl ml-auto cursor-pointer px-3 py-1.5 hover:text-fg-2">
      {copied ? 'copiado' : 'copiar'}
    </button>
  )
}

function Block({ block }: { block: SetupBlock }) {
  const header =
    block.kind === 'file' ? (
      <>
        <span className="font-mono text-[12.5px] text-fg-2">{block.path}</span>
        <span className="lbl text-fg-5">{MODE_LABEL[block.mode]}</span>
      </>
    ) : (
      <span className="lbl text-fg-5">terminal</span>
    )
  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-center gap-3 border border-b-0 border-rule bg-panel-head pl-3">
        {header}
        <CopyButton source={block.source.replace(/^\n+/, '')} />
      </div>
      <pre className="pseudocode m-0 overflow-x-auto">
        <code>
          {block.kind === 'file'
            ? tokenizePython(block.source.replace(/^\n+/, '')).map((t, i) => (
                <span key={i} style={{ color: TOKEN_COLORS[t.kind], fontWeight: TOKEN_WEIGHT[t.kind] }} title={t.declares}>
                  {t.text}
                </span>
              ))
            : block.source}
        </code>
      </pre>
    </div>
  )
}

/**
 * A página de preparo da máquina. Não tem frase própria: título, passos,
 * comandos e critérios vêm de `src/content/setup.ts`, e o nome de cada ciclo
 * citado vem do ciclo.
 */
export function MachineSetup({ guide }: { guide: SetupGuide }) {
  const unit = unitById(guide.unitId)!
  const [os, setOs] = useState<Os>('unix')

  // O sistema é adivinhado depois da montagem: o export estático serve o mesmo
  // HTML para todos. O aluno pode trocar, e a troca não é guardada.
  useEffect(() => {
    if (/win/i.test(navigator.platform || navigator.userAgent)) setOs('windows')
  }, [])

  const cycleRef = (cycleId: string) => {
    const index = unit.cycles.findIndex((c) => c.id === cycleId)
    const cycle = unit.cycles[index]!
    return (
      <Link key={cycleId} href={`/units/${unit.id}/cycles/${cycle.id}`} className="text-contract hover:underline">
        ciclo {String(index + 1).padStart(2, '0')} · {cycle.title}
      </Link>
    )
  }

  const exerciseCycle = (exerciseId: string) => unit.cycles.find((c) => c.exerciseId === exerciseId)!.id

  const hasOsChoice = guide.steps.some((s) => s.blocks.some((b) => b.kind === 'shell' && b.os))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-[760px] flex-col gap-3">
        <span className="lbl">Unidade {String(unit.number).padStart(2, '0')}</span>
        <h1 className="m-0 text-[30px] font-semibold leading-tight">{guide.title}</h1>
        {guide.lede.map((p) => (
          <p key={p} className="m-0 text-[15px] leading-relaxed text-fg-2">
            <Inline text={p} />
          </p>
        ))}
      </div>

      {hasOsChoice && (
        <div role="group" aria-label="Sistema operacional" className="flex self-start border border-rule-control">
          {(Object.keys(OS_LABEL) as Os[]).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={os === id}
              onClick={() => setOs(id)}
              className={cn('m-tap cursor-pointer px-3.5 py-2 text-[13px]', os === id ? 'bg-panel-head text-fg' : 'text-fg-3 hover:text-fg-2')}
            >
              {OS_LABEL[id]}
            </button>
          ))}
        </div>
      )}

      <ol className="m-0 flex max-w-[860px] list-none flex-col gap-4 p-0">
        {guide.steps.map((step, i) => (
          <li key={step.title}>
            <Panel>
              <PanelHeader>
                <span className="font-mono text-[12.5px] text-contract">{String(i + 1).padStart(2, '0')}</span>
                <PanelTitle className="text-fg">{step.title}</PanelTitle>
                {step.after && <PanelMeta>depois do exercício</PanelMeta>}
              </PanelHeader>
              <PanelBody className="flex flex-col gap-3.5">
                {step.after && (
                  <p className="m-0 text-[13.5px] leading-relaxed text-fg-3">
                    Resolva antes o exercício do {cycleRef(exerciseCycle(step.after))}.
                  </p>
                )}
                <p className="m-0 text-[14.5px] leading-relaxed text-fg-2">
                  <Inline text={step.why} />
                </p>
                {step.cycles && (
                  <p className="m-0 text-[13.5px] leading-relaxed text-fg-3">
                    Releia, se precisar:{' '}
                    {step.cycles.map((c, j) => (
                      <Fragment key={c}>
                        {j > 0 && '; '}
                        {cycleRef(c)}
                      </Fragment>
                    ))}
                    .
                  </p>
                )}
                {step.build && (
                  <ol className="m-0 flex list-decimal flex-col gap-2 pl-5 text-[14px] marker:font-mono marker:text-fg-4 leading-relaxed text-fg-2">
                    {step.build.map((item) => (
                      <li key={item.text}>
                        <Inline text={item.text} />{' '}
                        <span className="text-[13px] text-fg-4">({cycleRef(item.cycle)})</span>
                      </li>
                    ))}
                  </ol>
                )}
                {step.blocks
                  .filter((b) => b.kind !== 'shell' || !b.os || b.os === os)
                  .map((b, j) => (
                    <Block key={j} block={b} />
                  ))}
                <div className="flex flex-col gap-1 border border-contract-rule bg-contract-bg px-3.5 py-2.5">
                  <span className="lbl text-contract">Pronto quando</span>
                  <span className="text-[14px] leading-relaxed text-fg">
                    <Inline text={step.doneWhen} />
                  </span>
                </div>
              </PanelBody>
            </Panel>
          </li>
        ))}
      </ol>

      <p className="m-0 max-w-[760px] text-[14.5px] leading-relaxed text-fg-2">
        <Inline text={guide.next.text} />{' '}
        <a href={guide.next.href} target="_blank" rel="noreferrer" className="text-contract hover:underline">
          {guide.next.label}
        </a>
      </p>
    </div>
  )
}
