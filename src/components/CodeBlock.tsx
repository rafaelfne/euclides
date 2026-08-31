'use client'

import { useEffect, useState } from 'react'
import { toTypeScriptOrNull } from '@/lib/transliterate'
import { tokenizeJavaScript } from '@/lib/javascript'
import { TOKEN_COLORS, TOKEN_WEIGHT } from '@/lib/pseudocode'
import { readProfile, saveProfile, PROGRESS_EVENT } from '@/lib/progress'
import { cn } from '@/lib/utils'
import { Pseudocode } from './Pseudocode'

type Lang = 'pseudo' | 'typescript'

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

  // A escolha vive no perfil, não numa chave solta: duas chaves para um estado
  // só é a garantia de que exportar o perfil leva metade dele. ADR-0021.
  useEffect(() => {
    const sync = () => setLang(readProfile()?.codeLanguage ?? 'pseudo')
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [])

  const choose = (next: Lang) => {
    setLang(next)
    saveProfile({ codeLanguage: next })
  }

  const tabs: Array<[Lang, string]> = [['pseudo', 'pseudocódigo'], ['typescript', 'TypeScript']]

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
            {lang === 'typescript' ? 'derivado do pseudocódigo' : 'a forma canônica'}
          </span>
        </div>
      )}

      {lang === 'typescript' && typescript !== null ? (
        /*
          O mesmo realce dos exercícios de caça ao defeito, e pela mesma razão:
          `←` do pseudocódigo virou `=`, e `=` virou `===`. Sem a cor, a
          alternância mostra a tradução e esconde justamente a coisa que ela
          traduz. ADR-0028.
        */
        <pre className="pseudocode">
          <code>
            {tokenizeJavaScript(typescript).map((t, i) => (
              <span
                key={i}
                className={t.kind === 'convention' ? 'tok-convention' : undefined}
                style={{ color: TOKEN_COLORS[t.kind], fontWeight: TOKEN_WEIGHT[t.kind] }}
                title={t.declares}
              >
                {t.text}
              </span>
            ))}
          </code>
        </pre>
      ) : (
        <Pseudocode source={source} />
      )}
    </div>
  )
}
