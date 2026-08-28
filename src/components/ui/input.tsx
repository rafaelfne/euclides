import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'w-full border-0 bg-transparent px-2.5 py-1.5 font-mono text-[12.5px] text-fg',
        'placeholder:text-fg-5 focus:bg-panel-hover focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
