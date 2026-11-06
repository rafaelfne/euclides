'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-[14px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-contract",
  {
    variants: {
      variant: {
        default: 'bg-contract text-shell hover:bg-[#9CBCEB]',
        outline: 'border border-rule-control bg-panel text-fg-2 hover:bg-panel-hover hover:text-fg',
        ghost: 'text-fg-3 hover:bg-panel-hover hover:text-fg',
      },
      size: {
        // 40 e 36 px. O sm era 28 px, abaixo do alvo que um dedo acerta. ADR-0031.
        default: 'h-10 px-5',
        sm: 'h-9 px-3.5 text-[13px] font-medium',
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
