import Link from 'next/link'
import { units } from '@/content'

export default function Home() {
  return (
    <main className="shell" style={{ padding: '72px 48px' }}>
      <div className="display" style={{ fontSize: 56, lineHeight: 1.05, marginBottom: 18 }}>
        Euclides
      </div>
      <p style={{ fontSize: 19, maxWidth: 640, color: 'var(--ink-2)', marginBottom: 40 }}>
        Fundamentos para julgar código sem executá-lo. Nos <em>Elementos</em>, nada é assumido
        que não esteja declarado — aqui também não: toda complexidade vem com regime e
        hipóteses, todo termo vem com o que ele não é.
      </p>
      <div className="lbl" style={{ marginBottom: 14 }}>Unidades</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10, maxWidth: 640 }}>
        {units.map((u) => (
          <li key={u.id}>
            <Link
              href={`/units/${u.id}`}
              style={{
                display: 'block', border: '1.5px solid var(--rule)', padding: '16px 20px',
                color: 'var(--ink)',
              }}
            >
              <span className="lbl" style={{ color: 'var(--ink-4)' }}>Unidade {u.number}</span>
              <div style={{ fontSize: 21, fontWeight: 600, marginTop: 4 }}>{u.title}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 6 }}>
                {u.cycles.length} ciclos · {u.exercises.length} exercícios
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
