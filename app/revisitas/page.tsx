import { AppShell } from '@/components/AppShell'
import { RevisitQueue } from '@/components/RevisitQueue'
import { REVISIT_STEPS } from '@/lib/traps'

export const metadata = { title: 'Revisitas, Euclides' }

export default function Page() {
  return (
    <AppShell>
      <div className="flex flex-grow flex-col gap-5 overflow-y-auto px-4 py-8 sm:px-7">
        <div className="flex max-w-[720px] flex-col gap-2">
          <span className="lbl">Revisitas</span>
          <h1 className="m-0 text-[30px] font-semibold leading-tight">
            Voltar depois é o que separa lembrar de ter entendido.
          </h1>
          <p className="m-0 text-[14px] leading-relaxed text-fg-3">
            Um exercício entra na fila {REVISIT_STEPS.join(', ')} dias depois de cada volta
            limpa, e só entra depois de ter saído limpo alguma vez. Errar novamente na revisita devolve o exercício
            para o primeiro degrau. Abrir o app não move nada aqui.
          </p>
        </div>
        <RevisitQueue />
      </div>
    </AppShell>
  )
}
