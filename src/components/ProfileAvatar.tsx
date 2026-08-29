'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { readProfile, PROGRESS_EVENT } from '@/lib/progress'
import { cn } from '@/lib/utils'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  const first = parts[0]![0]!
  const last = parts.length > 1 ? parts[parts.length - 1]![0]! : ''
  return (first + last).toUpperCase()
}

export function ProfileAvatar({ size = 32 }: { size?: number }) {
  const [name, setName] = useState<string>()

  useEffect(() => {
    const sync = () => setName(readProfile()?.name)
    sync()
    window.addEventListener(PROGRESS_EVENT, sync)
    return () => window.removeEventListener(PROGRESS_EVENT, sync)
  }, [])

  const mark = name ? initials(name) : ''

  return (
    <Link
      href="/perfil"
      title={name ? `Perfil de ${name}` : 'Perfil'}
      aria-label={name ? `Perfil de ${name}` : 'Perfil'}
      className={cn(
        'm-tap flex shrink-0 items-center justify-center rounded-full border border-rule',
        'bg-panel-head text-[12px] font-semibold text-fg-3',
        'hover:border-contract-rule hover:text-fg',
      )}
      style={{ width: size, height: size }}
    >
      {mark || <User size={15} aria-hidden />}
    </Link>
  )
}
