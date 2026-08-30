import { units } from '@/content'
import { AppShell } from '@/components/AppShell'
import { GapPanel } from '@/components/GapPanel'

export const metadata = { title: 'Lacunas, Euclides' }

export default function GapsPage() {
  return (
    <AppShell>
      <div className="flex-grow overflow-y-auto px-4 py-8 sm:px-7">
        <h1 className="m-0 mb-3 text-[26px] font-semibold leading-tight">Lacunas</h1>
        <p className="m-0 mb-2 max-w-[760px] text-[14.5px] leading-relaxed text-fg-2">
          O que está aberto, e por quê. Não há percentual aqui de propósito: resolver em quatro
          tentativas e resolver na primeira são coisas diferentes, e um número só esconderia a
          diferença.
        </p>
        <p className="m-0 mb-7 max-w-[760px] text-[13px] leading-relaxed text-fg-3">
          O progresso mora neste navegador e não sai dele sozinho. O botão abaixo copia um markdown
          com suas lacunas para você colar no seu assistente de IA, ele carrega suas tentativas e as
          armadilhas que você ativou, nunca a resposta de um exercício.
        </p>
        <GapPanel units={units} />
      </div>
    </AppShell>
  )
}
