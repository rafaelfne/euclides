'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { units } from '@/content'
import type { Profile } from '@/content/schema'
import {
  clearAll, cycleStatus, exportProfile, importProfile, read, readProfile, resetTrail, saveProfile,
  PROGRESS_EVENT, type CycleStatus,
} from '@/lib/progress'
import { humanMinutes, unitMinutes } from '@/lib/duration'
import { cn } from '@/lib/utils'
import { Panel, PanelBody, PanelHeader, PanelTitle } from './ui/panel'
import { BandBadge } from './BandBadge'
import { CountersRow } from './Counters'
import { PlacementRevisit } from './PlacementRevisit'
import { SealRow } from './MasterySeal'
import { RevisitQueue } from './RevisitQueue'
import { UnitStateDot } from './UnitStateDot'

/**
 * O perfil, e as três ações que o tornam honesto.
 *
 * Sem conta e sem servidor, portabilidade e apagamento não são cortesias: são a
 * contrapartida. Exportar é o que permite trocar de navegador sem perder nada,
 * e apagar é o que permite ir embora sem pedir licença a ninguém. As duas são
 * locais e imediatas. Ver ADR-0021.
 */
const STATUS_LABEL: Record<CycleStatus, string> = {
  pending: 'não visitado',
  attempted: 'em curso',
  clean: 'de primeira',
  review: 'para revisitar',
}

export function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | undefined>()
  const [byUnit, setByUnit] = useState<Array<{ id: string; title: string; done: number; total: number }>>([])
  const [message, setMessage] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sync = () => {
      setProfile(readProfile())
      const p = read()
      setByUnit(units.map((u) => ({
        id: u.id,
        title: u.title,
        total: u.cycles.length,
        done: u.cycles.filter(
          (c) => cycleStatus(p, u.id, c.exerciseId, u.mastery.revisitIntervalDays) !== 'pending',
        ).length,
      })))
    }
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [])

  const download = () => {
    const blob = new Blob([exportProfile()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'euclides-perfil.json'
    a.click()
    URL.revokeObjectURL(a.href)
    setMessage('Perfil exportado.')
  }

  const upload = async (file: File) => {
    const result = importProfile(await file.text())
    setMessage(result.ok ? 'Perfil importado.' : `Não deu para importar: ${result.reason}.`)
  }

  return (
    <div className="flex max-w-[860px] flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="lbl">Perfil</span>
        <h1 className="m-0 text-[30px] font-semibold leading-tight">
          {profile?.name ? profile.name : 'Sem nome'}
        </h1>
        <div className="mt-1"><BandBadge /></div>
        <p className="m-0 text-[13.5px] leading-relaxed text-fg-3">
          Tudo aqui fica neste navegador. Não há conta, não há servidor, e nada é enviado para
          lugar nenhum. O app funciona idêntico sem nome.
        </p>
      </div>

      <PlacementRevisit />

      <Panel>
        <PanelHeader><PanelTitle>Selos de domínio</PanelTitle></PanelHeader>
        <PanelBody className="flex flex-col gap-3">
          <SealRow units={units} />
          <span className="text-[12.5px] leading-relaxed text-fg-4">
            Um selo acende quando os exercícios do critério saem na primeira tentativa, e
            ganha a marca em ocre quando a revisita é honrada. Não há selo de participação.
          </span>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader><PanelTitle>O que o app mede</PanelTitle></PanelHeader>
        <PanelBody><CountersRow /></PanelBody>
      </Panel>

      <Panel>
        <PanelHeader><PanelTitle>Como você lê</PanelTitle></PanelHeader>
        <PanelBody className="flex flex-col gap-4">
          <Toggle
            label="Modo"
            options={[['iniciante', 'Guiado'], ['revisao', 'Conciso']]}
            value={profile?.mode ?? 'revisao'}
            onPick={(v) => setProfile(saveProfile({ mode: v as Profile['mode'] }).profile)}
            hint="Guiado mostra o contexto, abre o exemplo e percorre a figura. Conciso mostra o núcleo e mantém o exemplo recolhido."
          />
          <Toggle
            label="Código"
            options={[['pseudo', 'Pseudocódigo'], ['typescript', 'TypeScript']]}
            value={profile?.codeLanguage ?? 'pseudo'}
            onPick={(v) => setProfile(saveProfile({ codeLanguage: v as Profile['codeLanguage'] }).profile)}
            hint="O pseudocódigo é a forma canônica. A versão em TypeScript é derivada dele."
          />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader><PanelTitle>As oito unidades</PanelTitle></PanelHeader>
        <PanelBody className="flex flex-col gap-2">
          {byUnit.map((u, i) => (
            <Link
              key={u.id}
              href={`/units/${u.id}`}
              className="m-tap flex items-baseline gap-3 border-l-2 border-rule py-1 pl-3 text-inherit hover:border-contract"
            >
              <span className="font-mono text-[12px] text-fg-5">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[14px] text-fg-2">{u.title}</span>
              <UnitStateDot unit={units[i]!} withLabel />
              <span className="ml-auto font-mono text-[12px] text-fg-4">
                {u.done} de {u.total} ciclos · {humanMinutes(unitMinutes(units[i]!))}
              </span>
            </Link>
          ))}
          <p className="m-0 mt-1 text-[12px] text-fg-4">
            {Object.values(STATUS_LABEL).join(' · ')} são os estados de cada ciclo, e eles aparecem
            no mapa da unidade.
          </p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader><PanelTitle>Recomeçar a trilha</PanelTitle></PanelHeader>
        <PanelBody className="flex flex-col gap-3.5">
          <p className="m-0 text-[13px] leading-relaxed text-fg-3">
            Zera tentativas, lacunas, revisitas, selos e sondagem. Seu nome, modo de leitura e
            preferência de código continuam iguais.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {confirmingReset ? (
              <>
                <button
                  onClick={() => {
                    resetTrail()
                    setConfirmingReset(false)
                    setMessage('Trilha reiniciada. Você voltou a code reader.')
                  }}
                  className="m-tap cursor-pointer border border-implementation bg-implementation-bg px-3 py-1.5 text-[13px] text-fg"
                >
                  Sim, recomeçar
                </button>
                <button
                  onClick={() => setConfirmingReset(false)}
                  className="m-tap cursor-pointer px-2 text-[13px] text-fg-4 hover:text-fg-2"
                >
                  cancelar
                </button>
              </>
            ) : (
              <Action onClick={() => setConfirmingReset(true)}>Recomeçar</Action>
            )}
          </div>

          {message?.startsWith('Trilha reiniciada') && (
            <p className="m-0 m-rise text-[13px] text-contract">{message}</p>
          )}
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader><PanelTitle>Levar embora, ou apagar</PanelTitle></PanelHeader>
        <PanelBody className="flex flex-col gap-3.5">
          <div className="flex flex-wrap gap-2">
            <Action onClick={download}>Exportar como JSON</Action>
            <Action onClick={() => fileInput.current?.click()}>Importar de um arquivo</Action>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f) }}
            />
            {confirming ? (
              <>
                <button
                  onClick={() => { clearAll(); setConfirming(false); setMessage('Tudo apagado.') }}
                  className="m-tap cursor-pointer border border-implementation bg-implementation-bg px-3 py-1.5 text-[13px] text-fg"
                >
                  Apagar mesmo, sem volta
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="m-tap cursor-pointer px-2 text-[13px] text-fg-4 hover:text-fg-2"
                >
                  cancelar
                </button>
              </>
            ) : (
              <Action onClick={() => setConfirming(true)}>Apagar tudo</Action>
            )}
          </div>

          {message && !message.startsWith('Trilha reiniciada') && (
            <p className="m-0 m-rise text-[13px] text-contract">{message}</p>
          )}

          <p className="m-0 text-[12.5px] leading-relaxed text-fg-4">
            O arquivo exportado contém o seu progresso, as armadilhas que você ativou e o perfil.
            Importar substitui o que está neste navegador.
          </p>
        </PanelBody>
      </Panel>
    </div>
  )
}

function Action({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="m-tap cursor-pointer border border-rule bg-panel-head px-3 py-1.5 text-[13px] text-fg-2 hover:text-fg"
    >
      {children}
    </button>
  )
}

function Toggle({
  label, options, value, onPick, hint,
}: {
  label: string
  options: Array<[string, string]>
  value: string
  onPick: (v: string) => void
  hint: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="lbl">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map(([id, text]) => (
          <button
            key={id}
            onClick={() => onPick(id)}
            className={cn(
              'm-tap cursor-pointer border px-3 py-1.5 text-[13px]',
              value === id
                ? 'border-contract-rule bg-contract-bg text-fg'
                : 'border-rule bg-panel-head text-fg-3 hover:text-fg-2',
            )}
          >
            {text}
          </button>
        ))}
      </div>
      <span className="text-[12.5px] leading-relaxed text-fg-4">{hint}</span>
    </div>
  )
}
