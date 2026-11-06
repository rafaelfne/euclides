import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[12px] leading-normal',
  {
    variants: {
      tone: {
        neutral: 'border-rule bg-panel-head text-fg-3',
        contract: 'border-contract-rule bg-contract-bg text-contract',
        implementation: 'border-implementation-rule bg-implementation-bg text-implementation',
        cost: 'border-cost-rule bg-cost-bg text-cost',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

function Badge({ className, tone, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}

export { Badge, badgeVariants }
