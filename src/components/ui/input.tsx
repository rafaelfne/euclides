import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'w-full border border-rule-control bg-shell px-2.5 py-1.5 font-mono text-[13.5px] text-fg',
        // Foco por contorno, não por fundo: o fundo mudava 1,14:1 e ninguém via
        // em qual célula estava digitando. WCAG 2.4.7. ADR-0031.
        'placeholder:text-fg-4 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-contract',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
