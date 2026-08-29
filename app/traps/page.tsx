import { units } from '@/content'
import { AppShell } from '@/components/AppShell'
import { TrapBook } from '@/components/TrapBook'

export const metadata = { title: 'Armadilhas, Euclides' }

export default function TrapsPage() {
  return (
    <AppShell>
      <div className="flex-grow overflow-y-auto px-4 py-8 sm:px-7">
        <h1 className="m-0 mb-3 text-[26px] font-semibold leading-tight">Caderno de armadilhas</h1>
        <p className="m-0 mb-2 max-w-[760px] text-[14.5px] leading-relaxed text-fg-2">
          Todas as frases que soam certas, num lugar só. Cada uma é uma ideia que um dev de dois
          anos tem, que passa numa revisão, e que a trilha desfaz num ciclo específico.
        </p>
        <p className="m-0 mb-7 max-w-[760px] text-[13px] leading-relaxed text-fg-3">
          A pergunta ao lado de cada armadilha é a que o app faz quando você a ativa. Ela não é a
          resposta, é a tarefa que produz a resposta, e ela funciona igual lida aqui.
        </p>
        <TrapBook units={units} />
      </div>
    </AppShell>
  )
}
