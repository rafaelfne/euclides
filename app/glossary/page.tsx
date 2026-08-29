import { allTerms } from '@/content/glossary'
import { AppShell } from '@/components/AppShell'
import { Glossary } from '@/components/Glossary'

export const metadata = { title: 'Glossário, Euclides' }

export default function GlossaryPage() {
  return (
    <AppShell>
      <div className="flex-grow overflow-y-auto px-4 py-8 sm:px-7">
        <h1 className="m-0 mb-3 text-[26px] font-semibold leading-tight">Glossário</h1>
        <p className="m-0 mb-2 max-w-[760px] text-[14.5px] leading-relaxed text-fg-2">
          A forma canônica de cada termo é a que você vai encontrar no mundo, em documentação, em
          código-fonte, numa resposta de fórum. É por isso que a tabela é bilíngue de propósito:
          traduções consagradas ficam em português, termos de ofício ficam em inglês.
        </p>
        <p className="m-0 mb-7 max-w-[760px] text-[13px] leading-relaxed text-fg-3">
          A linha <span className="text-implementation">não é</span> costuma valer mais que a
          definição: ela é o espaço negativo que impede uma palavra de significar quatro coisas.
        </p>
        <Glossary terms={allTerms} />
      </div>
    </AppShell>
  )
}
