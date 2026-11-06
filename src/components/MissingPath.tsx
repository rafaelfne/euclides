'use client'

import { useEffect, useState } from 'react'

/** O caminho pedido, lido no navegador: o 404 é um arquivo estático só. */
export function MissingPath() {
  const [path, setPath] = useState<string | null>(null)
  useEffect(() => setPath(window.location.pathname), [])
  return <code className="font-mono text-fg">{path ?? 'pedido'}</code>
}
