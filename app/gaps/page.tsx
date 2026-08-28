import Link from 'next/link'
import { units } from '@/content'
import { GapPanel } from '@/components/GapPanel'

export const metadata = { title: 'Lacunas — Euclides' }

export default function GapsPage() {
  return (
    <main className="shell">
      <header className="masthead">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <Link href="/" className="display" style={{ fontSize: 30, fontWeight: 700, color: 'var(--ink)' }}>
            Euclides
          </Link>
          <span className="lbl" style={{ color: 'var(--ink-3)' }}>Lacunas</span>
        </div>
      </header>

      <div style={{ padding: '30px 48px 72px' }}>
        <p style={{ maxWidth: 760, fontSize: 15.5, color: 'var(--ink-2)', marginTop: 0, marginBottom: 10 }}>
          O que está aberto, e por quê. Não há percentual aqui de propósito: resolver em quatro
          tentativas e resolver na primeira são coisas diferentes, e um número só esconderia a
          diferença.
        </p>
        <p style={{ maxWidth: 760, fontSize: 14, color: 'var(--ink-3)', marginTop: 0, marginBottom: 28 }}>
          O progresso mora neste navegador e não sai dele sozinho. O botão abaixo copia um
          markdown com suas lacunas para você colar num projeto do Claude — ele carrega suas
          tentativas e as armadilhas que você ativou, nunca a resposta de um exercício.
        </p>

        <GapPanel units={units} />
      </div>
    </main>
  )
}
