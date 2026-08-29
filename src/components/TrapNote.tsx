import Link from 'next/link'
import type { Unit } from '@/content/schema'

/**
 * A nota que enquadra o erro como terreno previsto.
 *
 * Não há acolhimento autorado aqui, e não pode haver: a única frase que esta
 * nota diz é uma AFIRMAÇÃO VERIFICÁVEL sobre dado que o app já tem — esta
 * armadilha estava no catálogo da unidade antes de o aluno chegar, e o catálogo
 * tem tamanho conhecido. Ver ADR-0018.
 */
export function TrapNote({ unit }: { unit: Unit }) {
  return (
    <div className="lbl">
      armadilha prevista · uma das {unit.misconceptions.length} desta unidade ·{' '}
      <Link href="/traps" className="underline decoration-rule underline-offset-2 hover:text-fg-2">
        caderno
      </Link>
    </div>
  )
}
