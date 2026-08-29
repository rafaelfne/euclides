'use client'

import { useEffect, useState } from 'react'
import { toTypeScriptOrNull } from '@/lib/transliterate'
import { cn } from '@/lib/utils'
import { Pseudocode } from './Pseudocode'

const KEY = 'euclides.codeLanguage'
type Lang = 'pseudo' | 'ts'

/**
 * O bloco de código, com a alternância pseudocódigo para TypeScript.
 *
 * O pseudocódigo é canônico e continua sendo a coisa que o autor escreve; a
 * versão em TypeScript é derivada na hora por `toTypeScriptOrNull`. Quando o
 * bloco tem passo em prosa, ela é `null` e a alternância não aparece: meia
 * tradução entrega algo que parece TypeScript e não é, e este app existe para
 * ensinar a detectar exatamente isso.
 *
 * A escolha é persistida porque ela é sobre o leitor, não sobre o ciclo: quem
 * lê TypeScript no trabalho quer TypeScript nos 62 ciclos, não neste. ADR-0019.
 */
export function CodeBlock({ source }: { source: string }) {
  const typescript = toTypeScriptOrNull(source)
  const [lang, setLang] = useState<Lang>('pseudo')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY)
      if (saved === 'ts' || saved === 'pseudo') setLang(saved)
    } catch { /* modo privado */ }
  }, [])

  const choose = (next: Lang) => {
    setLang(next)
    try { window.localStorage.setItem(KEY, next) } catch { /* modo privado */ }
  }

  const tabs: Array<[Lang, string]> = [['pseudo', 'pseudocódigo'], ['ts', 'TypeScript']]

  return (
    <div className="flex flex-col">
      {typescript !== null && (
        <div className="flex items-center gap-0 border border-b-0 border-rule bg-panel-head">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => choose(id)}
              className={cn(
                'm-tap lbl cursor-pointer border-r border-rule px-3 py-2',
                lang === id ? 'bg-panel text-contract' : 'hover:text-fg-2',
              )}
            >
              {label}
            </button>
          ))}
          <span className="lbl ml-auto px-3">
            {lang === 'ts' ? 'derivado do pseudocódigo' : 'a forma canônica'}
          </span>
        </div>
      )}

      {lang === 'ts' && typescript !== null ? (
        <pre className="pseudocode">
          <code className="block px-4 py-3 text-fg-2">{typescript}</code>
        </pre>
      ) : (
        <Pseudocode source={source} />
      )}
    </div>
  )
}
