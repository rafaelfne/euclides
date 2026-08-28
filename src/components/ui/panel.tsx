import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * O painel do ADR-0015: um bloco com cabeçalho fino, do jeito que um editor
 * separa regiões. É onde as bandas taxonômicas moram na direção IDE.
 */
function Panel({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('border border-rule bg-panel', className)} {...props} />
}

function PanelHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      className={cn('flex items-center gap-2.5 border-b border-rule bg-panel-head px-3.5 py-2', className)}
      {...props}
    />
  )
}

function PanelTitle({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('lbl', className)} {...props} />
}

function PanelMeta({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('lbl ml-auto text-fg-5', className)} {...props} />
}

function PanelBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('px-4 py-3.5', className)} {...props} />
}

export { Panel, PanelHeader, PanelTitle, PanelMeta, PanelBody }
