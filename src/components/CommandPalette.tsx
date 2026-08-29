'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { units } from '@/content'
import { allTerms } from '@/content/glossary'
import { cn } from '@/lib/utils'

/**
 * O salto rápido, em ⌘K.
 *
 * O app tem 62 ciclos, 95 termos e 52 armadilhas, e chegar em qualquer um deles
 * custava três cliques e uma rolagem. Isso pesa mais para quem já sabe o que
 * procura, que é exatamente o leitor que a trilha serve bem.
 *
 * A busca é sobre o índice que já existe: nenhum dado novo, nenhuma estrutura
 * nova, e nada que precise ser mantido em paralelo ao conteúdo. Ver ADR-0026.
 */
type Item = { id: string; kind: string; label: string; hint: string; href: string }

const KIND_LABEL: Record<string, string> = {
  unidade: 'unidade',
  ciclo: 'ciclo',
  termo: 'termo',
  armadilha: 'armadilha',
  tela: 'tela',
}

const SCREENS: Item[] = [
  { id: 's-home', kind: 'tela', label: 'Trilha', hint: 'a home', href: '/' },
  { id: 's-como', kind: 'tela', label: 'Como funciona', hint: 'a rampa de entrada', href: '/como-funciona' },
  { id: 's-sond', kind: 'tela', label: 'Sondagem', hint: 'por onde começar', href: '/sondagem' },
  { id: 's-traps', kind: 'tela', label: 'Armadilhas', hint: 'o bestiário', href: '/traps' },
  { id: 's-gloss', kind: 'tela', label: 'Glossário', hint: 'os termos', href: '/glossary' },
  { id: 's-gaps', kind: 'tela', label: 'Lacunas', hint: 'o painel', href: '/gaps' },
  { id: 's-rev', kind: 'tela', label: 'Revisitas', hint: 'a fila', href: '/revisitas' },
  { id: 's-perf', kind: 'tela', label: 'Perfil', hint: 'faixa, selos e dados', href: '/perfil' },
]

function buildIndex(): Item[] {
  const out: Item[] = [...SCREENS]

  for (const u of units) {
    out.push({
      id: u.id, kind: 'unidade',
      label: `${String(u.number).padStart(2, '0')} · ${u.title}`,
      hint: u.learningObjective.slice(0, 80),
      href: `/units/${u.id}`,
    })
    for (const c of u.cycles) {
      out.push({
        id: c.id, kind: 'ciclo', label: c.title,
        hint: `${c.id} · ${u.title}`,
        href: `/units/${u.id}/cycles/${c.id}`,
      })
    }
    for (const m of u.misconceptions) {
      out.push({
        id: m.id, kind: 'armadilha', label: m.label,
        hint: `desfaz em ${m.reviewCycle}`,
        href: `/units/${u.id}/cycles/${m.reviewCycle}`,
      })
    }
  }

  for (const t of allTerms) {
    out.push({
      id: t.id, kind: 'termo', label: t.canonical,
      hint: t.definition.slice(0, 80),
      href: `/glossary#${t.id}`,
    })
  }

  return out
}

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [at, setAt] = useState(0)

  const index = useMemo(buildIndex, [])

  const results = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return index.slice(0, 12)
    return index
      .filter((i) => normalize(`${i.label} ${i.id} ${i.hint}`).includes(q))
      .slice(0, 40)
  }, [index, query])

  const go = useCallback((item: Item | undefined) => {
    if (!item) return
    setOpen(false)
    setQuery('')
    router.push(item.href)
  }, [router])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
        setAt(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { setAt(0) }, [query])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="m-rise flex w-full max-w-[620px] flex-col border border-rule bg-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setAt((i) => Math.min(results.length - 1, i + 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setAt((i) => Math.max(0, i - 1)) }
            if (e.key === 'Enter') { e.preventDefault(); go(results[at]) }
          }}
          placeholder="ciclo, termo, armadilha ou tela"
          className="border-b border-rule bg-panel-head px-4 py-3 text-[15px] text-fg placeholder:text-fg-5 focus:outline-none"
        />

        <div className="max-h-[46vh] overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={r.id + r.kind}
              onMouseEnter={() => setAt(i)}
              onClick={() => go(r)}
              className={cn(
                'flex w-full items-baseline gap-3 px-4 py-2 text-left',
                i === at ? 'bg-contract-bg' : 'hover:bg-panel-head',
              )}
            >
              <span className="lbl w-[74px] shrink-0">{KIND_LABEL[r.kind]}</span>
              <span className="text-[13.5px] text-fg">{r.label}</span>
              <span className="ml-auto truncate pl-3 text-[12px] text-fg-4">{r.hint}</span>
            </button>
          ))}
          {!results.length && (
            <p className="m-0 px-4 py-6 text-[13.5px] text-fg-3">Nada com esse nome.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 border-t border-rule px-4 py-2 font-mono text-[11px] text-fg-4">
          <span>↑ ↓ navegar</span>
          <span>enter abrir</span>
          <span>esc fechar</span>
        </div>
      </div>
    </div>
  )
}
