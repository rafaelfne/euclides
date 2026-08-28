import { tokenize, TOKEN_COLORS, TOKEN_WEIGHT } from '@/lib/pseudocode'

/**
 * Renders pseudocode with semantic colouring.
 *
 * The `convention` tokens — ←, =, mod, |…| — carry a native `title`, so the
 * declared meaning is one hover away from the notation itself. That is the
 * whole reason this component exists instead of a generic highlighter: the
 * conventions panel in the rail and the symbol in the code are the same fact,
 * and separating them is how a student silently reads `=` as assignment.
 */
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
