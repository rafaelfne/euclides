'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-contract",
  {
    variants: {
      variant: {
        default: 'bg-contract text-shell hover:bg-[#9CBCEB]',
        outline: 'border border-rule bg-panel text-fg-2 hover:bg-panel-hover hover:text-fg',
        ghost: 'text-fg-3 hover:bg-panel-hover hover:text-fg',
      },
      size: {
        default: 'h-9 px-4',
        sm: 'h-7 px-3',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className, variant, size, asChild = false, ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
