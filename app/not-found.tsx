import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { MissingPath } from '@/components/MissingPath'

/*
  Endereço que não existe diz que não existe.

  Antes, um ciclo digitado errado (`/units/hash/cycles/c4`) caía na tela
  inicial sem aviso, e o aluno não sabia se o ciclo sumiu, se o link estava
  errado ou se tinha feito alguma coisa. O export estático gera `404.html` a
  partir deste arquivo; o servidor precisa servi-lo em vez de devolver a home.
*/
export default function NotFound() {
  return (
    <AppShell>
      <div className="flex flex-grow flex-col gap-4 overflow-y-auto px-4 py-10 sm:px-7">
        <h1 className="m-0 text-[26px] font-semibold">Esta página não existe</h1>
        <p className="m-0 max-w-[640px] text-[15px] leading-relaxed text-fg-2">
          O endereço <MissingPath /> não leva a nenhuma unidade, ciclo ou tela. Se veio de um link
          antigo, os ciclos agora usam o id completo, como <code className="font-mono text-fg">hash.c5</code>.
        </p>
        <div className="flex flex-wrap items-center gap-5 text-[14px]">
          <Link href="/">Voltar para o início</Link>
          <span className="text-fg-3">ou use a busca no topo para achar um termo, ciclo ou armadilha.</span>
        </div>
      </div>
    </AppShell>
  )
}
