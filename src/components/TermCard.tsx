'use client'

import Link from 'next/link'
import type { GlossaryTerm } from '@/content/schema'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

/**
 * O card de desambiguação, item aberto desde o ADR-0005.
 *
 * O `title` nativo do navegador entrega uma linha de texto puro, sem estrutura
 * e sem link, e é justamente a estrutura que faz o glossário deste projeto
 * valer: a definição, o que o termo NÃO é, e os contextos em que a mesma
 * palavra significa outra coisa. Num `title` os três viram uma frase só.
 */
export function TermCard({
  term, children, className,
}: { term: GlossaryTerm; children: React.ReactNode; className?: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className}>{children}</span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[13px] font-semibold text-contract">{term.canonical}</span>
              {term.alsoKnownAs.length > 0 && (
                <span className="text-[12px] text-fg-4">também: {term.alsoKnownAs.join(', ')}</span>
              )}
            </div>

            <p className="m-0 text-[13px] leading-relaxed text-fg-2">{term.definition}</p>

            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {term.isNot.map((n) => (
                <li key={n} className="text-[12.5px] leading-relaxed text-implementation">{n}</li>
              ))}
            </ul>

            {term.falseFriends.length > 0 && (
              <div className="flex flex-col gap-1 border-t border-rule pt-2">
                <span className="lbl">A mesma palavra, em outro lugar</span>
                {term.falseFriends.map((f) => (
                  <p key={f.context} className="m-0 text-[12px] leading-relaxed text-fg-3">
                    <span className="font-mono text-cost">{f.context}</span> — {f.meaning}
                  </p>
                ))}
              </div>
            )}

            <Link href={`/glossary#${term.id}`} className="font-mono text-[12px] text-fg-4 hover:text-contract">
              ver no glossário →
            </Link>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
