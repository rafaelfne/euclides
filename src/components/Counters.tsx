'use client'

import { useEffect, useState } from 'react'
import { units } from '@/content'
import { read, readProfile, saveProfile, PROGRESS_EVENT } from '@/lib/progress'
import { counters, judgment, JUDGMENT_FORMULA, type Counters as C } from '@/lib/counters'

/**
 * Os três contadores, e o índice atrás de um interruptor.
 *
 * Nenhum dos três sobe por insistência, por tempo ou por leitura, e cada um
 * traz a própria definição embaixo: um número sem a regra que o move é uma
 * pontuação disfarçada. Ver ADR-0023.
 */
export function CountersRow({ showIndex = true }: { showIndex?: boolean }) {
  const [c, setC] = useState<C | null>(null)
  const [open, setOpen] = useState(false)
  const [j, setJ] = useState<{ value: number; max: number } | null>(null)

  useEffect(() => {
    const sync = () => {
      const p = read()
      setC(counters(units, p))
      setJ(judgment(units, p))
      setOpen(readProfile()?.showJudgmentIndex ?? false)
    }
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [])

  if (!c) return null

  const toggle = () => {
    const next = !open
    setOpen(next)
    saveProfile({ showJudgmentIndex: next })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-x-9 gap-y-4">
        <Counter
          value={`${c.firstTry.clean} de ${c.firstTry.attempted}`}
          label="de primeira"
          rule="resolvidos na primeira tentativa, sobre tentados. Tentar de novo não move este número."
        />
        <Counter
          value={`${c.disarmed.count} de ${c.disarmed.total}`}
          label="armadilhas desarmadas"
          rule="ativadas e depois resolvidas de novo, limpas, numa revisita. Ler a explicação não desarma."
        />
        <Counter
          value={String(c.honoredRevisits)}
          label="revisitas honradas"
          rule="voltas depois do intervalo que saíram limpas. Voltar no mesmo dia não conta."
        />
      </div>

      {showIndex && (
        <div className="border-t border-rule pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-fg-3">
            <input type="checkbox" checked={open} onChange={toggle} className="accent-[var(--contract)]" />
            mostrar o índice de julgamento
          </label>

          {open && j && (
            <div className="m-rise mt-3 flex flex-col gap-2.5">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[24px] text-contract">
                  {j.value.toFixed(1).replace('.', ',')}
                </span>
                <span className="text-[13px] text-fg-4">de {j.max} possíveis</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="lbl">A fórmula, inteira</span>
                {JUDGMENT_FORMULA.map((f) => (
                  <span key={f.when} className="text-[12.5px] text-fg-3">
                    {f.when} <span className="font-mono text-fg-2">{f.worth}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Counter({ value, label, rule }: { value: string; label: string; rule: string }) {
  return (
    <div className="flex max-w-[260px] flex-col gap-0.5">
      <span className="font-mono text-[22px] text-contract">{value}</span>
      <span className="lbl">{label}</span>
      <span className="text-[12px] leading-relaxed text-fg-4">{rule}</span>
    </div>
  )
}
