'use client'

import { useEffect, useState } from 'react'
import type { Unit, Choice } from '@/content/schema'
import { misconceptionById } from '@/content'
import { Badge } from './ui/badge'
import { exerciseState, recordAttempt } from '@/lib/progress'
import { seededShuffle } from '@/lib/shuffle'
import { cn } from '@/lib/utils'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'
import { TrapNote } from './TrapNote'

/**
 * The distractor mechanic. Feedback never contains the answer, it contains
 * the TASK that produces the answer, taken from the misconception the wrong
 * choice named. That mapping is enforced by the schema, so a lazy distractor
 * cannot exist.
 */
export function ChoiceExercise({
  unit, exerciseId, prompt, choices,
}: { unit: Unit; exerciseId: string; prompt: string; choices: Choice[] }) {
  // A ordem é sorteada pelo id do exercício: estável entre recargas, e sem
  // relação nenhuma com a ordem em que o autor escreveu.
  const shown = seededShuffle(choices, exerciseId)

  const [picked, setPicked] = useState<number | null>(null)
  const [attempts, setAttempts] = useState(0)

  // Sem isto o exercício voltava para "sem tentativa" a cada recarga, embora o
  // painel de lacunas já tivesse registrado o resultado. O progresso existia e
  // a tela não o lia.
  useEffect(() => {
    const st = exerciseState(unit.id, exerciseId)
    if (!st) return
    setAttempts(st.attempts)

    // A alternativa escolhida não é guardada, e não precisa ser: ela é DERIVÁVEL
    // do que o progresso já sabe. Resolvido devolve a correta; não resolvido
    // devolve a alternativa da última armadilha ativada. Sem isto o exercício
    // voltava com o contador de tentativas e sem a explicação, o aluno perdia
    // o melhor conteúdo do ciclo exatamente ao voltar para revisar. ADR-0019.
    if (st.solved) {
      const i = shown.findIndex((c) => c.correct)
      if (i >= 0) setPicked(i)
      return
    }
    const last = st.misconceptionsTriggered[st.misconceptionsTriggered.length - 1]
    if (!last) return
    const i = shown.findIndex((c) => !c.correct && c.misconceptionId === last)
    if (i >= 0) setPicked(i)
    // `shown` é estável: seededShuffle é função pura do id do exercício.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit.id, exerciseId])

  const chosen = picked === null ? null : shown[picked]!
  const misconception = chosen && !chosen.correct
    ? misconceptionById(unit, chosen.misconceptionId)
    : undefined
  const escalation = misconception?.escalation ?? []
  const escalationIndex = attempts - 2
  const exhausted = misconception ? escalationIndex >= escalation.length : false

  const onPick = (i: number) => {
    const c = shown[i]!
    setPicked(i)
    setAttempts((a) => a + 1)
    recordAttempt(unit.id, exerciseId, {
      solved: c.correct,
      misconception: c.correct ? undefined : c.misconceptionId,
    })
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Exercício</PanelTitle>
        <PanelMeta>
          {attempts === 0
            ? 'sem tentativa'
            : misconception
              ? `tentativa ${attempts} · ${
                  exhausted
                    ? 'escada esgotada'
                    : escalationIndex < 0
                      ? 'pergunta socrática'
                      : `tarefa ${escalationIndex + 1} de ${escalation.length}`
                }`
              : `tentativa ${attempts}`}
        </PanelMeta>
      </PanelHeader>
      <PanelBody className="flex flex-col gap-4">
        <p className="m-0 text-[15px] leading-relaxed text-fg">{prompt}</p>

        <div className="flex flex-col gap-1.5">
          {shown.map((c, i) => {
            const isPicked = picked === i
            return (
              <button
                key={i}
                onClick={() => onPick(i)}
                className={cn(
                  'm-tap cursor-pointer border px-4 py-3 text-left text-[13.5px] leading-relaxed',
                  !isPicked && 'border-rule bg-panel-head text-fg-2 hover:bg-panel-hover hover:text-fg',
                  isPicked && c.correct && 'border-contract-rule bg-contract-bg text-fg',
                  isPicked && !c.correct && 'border-implementation-rule bg-implementation-bg text-fg',
                )}
              >
                {c.text}
              </button>
            )
          })}
        </div>

        {chosen && !chosen.correct && misconception && !exhausted && (
          <div className="m-rise border-l-2 border-implementation pl-4">
            <div className="mb-2">
              <TrapNote unit={unit} />
            </div>
            <div className="mb-1.5 text-[14.5px] font-semibold text-implementation">
              {misconception.socraticQuestion}
            </div>
            {escalationIndex >= 0 && (
              <div className="text-[13.5px] leading-relaxed text-fg-2">{escalation[escalationIndex]}</div>
            )}
          </div>
        )}

        {chosen && !chosen.correct && misconception && exhausted && (
          <div className="m-rise border-l-2 border-rule pl-4">
            <div className="mb-1.5 text-[14.5px] font-semibold text-fg">Vamos parar aqui.</div>
            <div className="text-[13.5px] leading-relaxed text-fg-3">
              Releia o ciclo {misconception.reviewCycle.split('.')[1]} e volte a este exercício amanhã.
              Insistir agora treina a tentativa, não o raciocínio.
            </div>
            <div className="mt-2">
              <TrapNote unit={unit} />
            </div>
          </div>
        )}

        {chosen?.correct && (
          <div className="m-rise flex flex-col gap-3.5">
            <div className="border-l-2 border-contract pl-4 text-[13.5px] leading-relaxed text-fg-2">
              {attempts === 1
                ? 'Resolvido na primeira tentativa, sem ativar nenhuma ideia errada. Isto conta para o critério de domínio.'
                : `Resolvido em ${attempts} tentativas. Chegar lá não é o mesmo que dominar, este exercício volta na revisita.`}
            </div>

            {/*
              O acerto não ensinava nada: o aluno saía sem saber por que as
              outras falham, e é ali que as distratoras deste app rendem, cada
              uma nomeia uma armadilha real. Revelado só depois de resolver, o
              princípio 3 continua de pé.
            */}
            <div className="border border-rule bg-panel-head px-4 py-3.5">
              <div className="lbl mb-2.5">Por que cada uma</div>
              <div className="flex flex-col gap-2.5">
                {shown.map((c, i) => {
                  const m = c.correct ? undefined : misconceptionById(unit, c.misconceptionId)
                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        <Badge tone={c.correct ? 'contract' : 'implementation'}>
                          {c.correct ? 'certa' : 'armadilha'}
                        </Badge>
                        <span className="text-[12.5px] leading-snug text-fg-3">{c.text}</span>
                      </div>
                      <span className="pl-1 text-[12.5px] leading-relaxed text-fg-2">
                        {c.correct ? c.why : m?.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}
