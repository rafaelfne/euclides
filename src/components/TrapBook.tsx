'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Unit } from '@/content/schema'
import { read, PROGRESS_EVENT } from '@/lib/progress'
import { trapBook, TRAP_STATE_LABEL, TRAP_STATE_RULE, type TrapEntry, type TrapState } from '@/lib/traps'
import { cn } from '@/lib/utils'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'

/**
 * O bestiário: todas as frases que soam certas, com o estado de cada uma.
 *
 * Três estados, e o do meio é o que importa. `ativada` não é uma marca de
 * vergonha nem um item de lista para riscar lendo: ela só sai dali quando o
 * mesmo exercício voltar limpo depois do intervalo. Ver ADR-0024.
 *
 * A regra de cada estado vai na tela junto do rótulo, pela mesma razão dos
 * contadores: estado sem regra convida a supor que ele sobe sozinho.
 */
const TONE: Record<TrapState, { border: string; text: string; bg: string }> = {
  'nao-encontrada': { border: 'border-rule', text: 'text-fg-4', bg: '' },
  ativada: { border: 'border-implementation', text: 'text-implementation', bg: 'bg-implementation-bg' },
  desarmada: { border: 'border-contract', text: 'text-contract', bg: '' },
}

const FILTERS: Array<[TrapState | 'todas', string]> = [
  ['todas', 'todas'],
  ['ativada', 'ativadas'],
  ['desarmada', 'desarmadas'],
  ['nao-encontrada', 'não encontradas'],
]

export function TrapBook({ units }: { units: Unit[] }) {
  const [entries, setEntries] = useState<TrapEntry[]>([])
  const [filter, setFilter] = useState<TrapState | 'todas'>('todas')
  const [recent, setRecent] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const sync = () => {
      const rows = trapBook(units, read())
      setEntries(rows)
      setHydrated(true)

      /*
        A mais recém-ativada ganha o destaque que decai.
        Ele existe para achar a linha nova num caderno de 52, e some sozinho
        depois de achada. Reaproveita `m-decay` do ADR-0019.
      */
      const last = rows
        .filter((r) => r.state === 'ativada' && r.lastTriggered)
        .sort((a, b) => (a.lastTriggered! < b.lastTriggered! ? 1 : -1))[0]
      const fresh = last && Date.now() - new Date(last.lastTriggered!).getTime() < 60_000
      setRecent(fresh ? last.misconception.id : null)
    }
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [units])

  if (!hydrated) return <p className="text-[14px] text-fg-3">Lendo o estado das armadilhas…</p>

  const count = (s: TrapState) => entries.filter((e) => e.state === s).length
  const shown = entries.filter((e) => filter === 'todas' || e.state === filter)

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-1 flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[22px] text-contract">
            {count('desarmada')} de {entries.length}
          </span>
          <span className="lbl">desarmadas</span>
        </div>
        <span className="max-w-[560px] text-[12.5px] leading-relaxed text-fg-4">
          {TRAP_STATE_RULE.desarmada}. Ler a explicação não desarma nenhuma.
        </span>

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={cn(
                'm-tap h-9 cursor-pointer border px-3 text-[13px]',
                filter === id
                  ? 'border-contract-rule bg-contract-bg text-fg'
                  : 'border-rule-control bg-panel text-fg-3 hover:text-fg',
              )}
            >
              {label}
              {id !== 'todas' && <span className="ml-1.5 text-fg-4">{count(id as TrapState)}</span>}
            </button>
          ))}
        </div>
      </div>

      {units.map((unit) => {
        const rows = shown.filter((e) => e.unit.id === unit.id)
        if (!rows.length) return null
        return (
          <Panel key={unit.id} className="max-w-[900px]">
            <PanelHeader>
              <PanelTitle className="text-fg-2">{unit.title}</PanelTitle>
              <PanelMeta>Unidade {String(unit.number).padStart(2, '0')}</PanelMeta>
            </PanelHeader>
            <PanelBody className="flex flex-col gap-3.5">
              {rows.map(({ misconception: m, state }) => {
                const tone = TONE[state]
                return (
                  <div
                    key={m.id}
                    className={cn(
                      'border-l-2 py-1 pl-4',
                      tone.border,
                      tone.bg,
                      recent === m.id && 'm-decay border',
                    )}
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[13.5px] font-semibold text-fg">{m.label}</span>
                      <span className={cn('lbl', tone.text)} title={TRAP_STATE_RULE[state]}>
                        {TRAP_STATE_LABEL[state]}
                      </span>
                    </div>
                    <div className="mt-1 text-[13px] leading-relaxed text-fg-2">
                      “{m.socraticQuestion}”
                    </div>
                    <Link
                      href={`/units/${unit.id}/cycles/${m.reviewCycle}`}
                      className="m-tap mt-1 inline-block font-mono text-[12px] text-contract"
                    >
                      desfaz em {m.reviewCycle}
                    </Link>
                  </div>
                )
              })}
            </PanelBody>
          </Panel>
        )
      })}

      {!shown.length && (
        <p className="max-w-[640px] text-[14px] leading-relaxed text-fg-2">
          {filter === 'ativada'
            ? 'Nenhuma armadilha ativada neste navegador. Isso não quer dizer que você não as tem, quer dizer que você ainda não encontrou o exercício que as ativa.'
            : 'Nenhuma armadilha neste estado ainda.'}
        </p>
      )}
    </div>
  )
}
