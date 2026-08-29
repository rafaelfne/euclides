'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { GlossaryTerm } from '@/content/schema'
import { PLANNED, APP } from '@/content/glossary'
import { units } from '@/content'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'
import { Panel, PanelBody, PanelHeader, PanelMeta, PanelTitle } from './ui/panel'

/**
 * O glossário navegável.
 *
 * Ele já arbitrava cada termo uma vez — forma canônica, o que o termo NÃO é, e
 * os falsos amigos que fazem uma palavra significar quatro coisas. O que
 * faltava era o aluno poder consultá-lo sem estar dentro do ciclo que o
 * introduz. `isNot` é o campo que mais rende aqui, e era o menos visível.
 */
export function Glossary({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState('')

  const unitOf = useMemo(() => {
    const map = new Map<string, { id: string; number: number; title: string }>()
    for (const u of units) {
      for (const c of u.cycles) map.set(c.id, { id: u.id, number: u.number, title: u.title })
    }
    return map
  }, [])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return terms
    return terms.filter((t) =>
      [t.canonical, t.definition, ...t.alsoKnownAs, ...t.isNot].some((s) => s.toLowerCase().includes(q)),
    )
  }, [terms, query])

  const groups = useMemo(() => {
    const by = new Map<string, GlossaryTerm[]>()
    for (const t of shown) {
      const key = t.introducedIn === PLANNED || t.introducedIn === APP
        ? t.introducedIn
        : (unitOf.get(t.introducedIn)?.id ?? 'outros')
      by.set(key, [...(by.get(key) ?? []), t])
    }
    return by
  }, [shown, unitOf])

  // O vocabulário do app abre a lista: é o que o aluno precisa para ler o resto.
  const ordered = [APP, ...units.map((u) => u.id), PLANNED, 'outros'].filter((k) => groups.has(k))

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="filtrar por termo, definição ou pelo que ele não é"
          className="w-full max-w-[420px] border border-rule bg-panel px-3 py-2 text-[13px] text-fg placeholder:text-fg-5 focus:outline-none focus:ring-1 focus:ring-contract"
        />
        <span className="text-[12.5px] text-fg-4">
          {shown.length} de {terms.length} termos
        </span>
      </div>

      {ordered.map((key) => {
        const rows = groups.get(key)!
        const unit = units.find((u) => u.id === key)
        return (
          <Panel key={key} className="max-w-[900px]">
            <PanelHeader>
              <PanelTitle className="text-fg-2">
                {unit
                  ? unit.title
                  : key === APP
                    ? 'O vocabulário desta trilha'
                    : key === PLANNED
                      ? 'Termos de unidades futuras'
                      : 'Outros'}
              </PanelTitle>
              {unit && <PanelMeta>Unidade {String(unit.number).padStart(2, '0')}</PanelMeta>}
            </PanelHeader>
            <PanelBody className="flex flex-col gap-4">
              {rows.map((t) => (
                <div key={t.id} id={t.id} className="scroll-mt-6 border-l-2 border-rule pl-4">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-[13.5px] font-semibold text-contract">{t.canonical}</span>
                    {t.alsoKnownAs.length > 0 && (
                      <span className="text-[12px] text-fg-4">também: {t.alsoKnownAs.join(', ')}</span>
                    )}
                    {t.introducedIn !== PLANNED && t.introducedIn !== APP && (
                      <Link
                        href={`/units/${unitOf.get(t.introducedIn)?.id}/cycles/${t.introducedIn}`}
                        className="ml-auto font-mono text-[12px] text-fg-4 hover:text-contract"
                      >
                        nasce em {t.introducedIn}
                      </Link>
                    )}
                  </div>

                  <p className="m-0 mt-1 text-[13.5px] leading-relaxed text-fg-2">{t.definition}</p>

                  <ul className="m-0 mt-1.5 list-none p-0">
                    {t.isNot.map((n) => (
                      <li key={n} className="text-[12.5px] leading-relaxed text-fg-3">
                        <span className="text-implementation">não é</span> {n.replace(/^não é /, '').replace(/^não /, '')}
                      </li>
                    ))}
                  </ul>

                  {t.falseFriends.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                      <span className="lbl">Falsos amigos</span>
                      {t.falseFriends.map((f) => (
                        <div key={f.context} className="text-[12.5px] leading-relaxed text-fg-3">
                          <Badge tone="cost">{f.context}</Badge> <span className="ml-1">{f.meaning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </PanelBody>
          </Panel>
        )
      })}

      {shown.length === 0 && (
        <p className={cn('max-w-[640px] text-[14px] leading-relaxed text-fg-2')}>
          Nenhum termo casa com “{query}”. O glossário arbitra cada termo uma vez; se a palavra
          que você procura não está aqui, ela não é vocabulário desta trilha.
        </p>
      )}
    </div>
  )
}
