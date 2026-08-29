'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * O controle de passo, único para todas as figuras que têm passos.
 *
 * Três regras do ADR-0019, e as três estão aqui e não em cada figura:
 *
 * 1. Uma passada e para. Não há laço, e não há como pedir um.
 * 2. Nunca começa sozinho. A figura abre no último passo, inteira, legível,
 *    igual à versão estática que existia antes, e voltar ao passo 1 é uma
 *    escolha do aluno. Autoplay rouba a leitura de quem já entendeu.
 * 3. Quem pediu menos movimento recebe os mesmos passos, sem interpolação.
 *    A informação é a mesma; o que sai é a animação entre um passo e o
 *    seguinte.
 */
export function Stepper({
  count,
  labelFor,
  children,
  autoPlay = false,
}: {
  count: number
  labelFor: (step: number) => string
  children: (step: number) => React.ReactNode
  /**
   * Roda uma passada ao montar. Ligado só no modo iniciante, e nunca no de
   * revisão: quem já julgou aquele conteúdo não quer a animação entre a prosa e
   * o exercício. Continua sendo uma passada e continua parando. ADR-0027.
   */
  autoPlay?: boolean
}) {
  const [step, setStep] = useState(count - 1)
  const [playing, setPlaying] = useState(false)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Quem pediu menos movimento não recebe a passada automática: ele recebe a
    // figura inteira, que é onde o `count - 1` inicial já a deixa.
    if (autoPlay && !reduced.current) { setStep(0); setPlaying(true) }
  }, [autoPlay])

  useEffect(() => {
    if (!playing) return
    if (step >= count - 1) { setPlaying(false); return }
    const t = window.setTimeout(() => setStep((s) => s + 1), reduced.current ? 60 : 420)
    return () => window.clearTimeout(t)
  }, [playing, step, count])

  const play = () => {
    if (playing) { setPlaying(false); return }
    setStep(0)
    setPlaying(true)
  }

  return (
    <div className="flex flex-col">
      <div className="min-w-0">{children(step)}</div>

      <div className="flex flex-wrap items-center gap-2 border-t border-rule px-3 py-2">
        <button
          onClick={play}
          className="m-tap cursor-pointer border border-rule bg-panel-head px-2.5 py-1 font-mono text-[12px] text-fg-2 hover:text-fg"
        >
          {playing ? 'parar' : 'rodar uma vez'}
        </button>
        <button
          onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)) }}
          disabled={step === 0}
          className="m-tap cursor-pointer border border-rule bg-panel-head px-2.5 py-1 font-mono text-[12px] text-fg-2 hover:text-fg disabled:cursor-default disabled:text-fg-5"
        >
          ←
        </button>
        <button
          onClick={() => { setPlaying(false); setStep((s) => Math.min(count - 1, s + 1)) }}
          disabled={step === count - 1}
          className="m-tap cursor-pointer border border-rule bg-panel-head px-2.5 py-1 font-mono text-[12px] text-fg-2 hover:text-fg disabled:cursor-default disabled:text-fg-5"
        >
          →
        </button>

        <div className="flex gap-1">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              onClick={() => { setPlaying(false); setStep(i) }}
              aria-label={`passo ${i + 1}`}
              className={cn(
                'm-tap h-1.5 w-5 cursor-pointer border-0',
                i <= step ? 'bg-contract' : 'bg-rule',
              )}
            />
          ))}
        </div>

        <span className="ml-auto font-mono text-[12px] text-fg-3">{labelFor(step)}</span>
      </div>
    </div>
  )
}
