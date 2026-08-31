import { tokenize, TOKEN_COLORS, TOKEN_WEIGHT } from '@/lib/pseudocode'

export function Pseudocode({ source }: { source: string }) {
  const tokens = tokenize(source)
  return (
    <pre className="pseudocode">
      <code>
        {tokens.map((t, i) => (
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
  )
}
