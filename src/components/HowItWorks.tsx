import Link from 'next/link'
import { allUnits, trailUnits } from '@/content'
import { allTerms } from '@/content/glossary'
import { APP } from '@/content/glossary'
import { Panel, PanelBody, PanelHeader, PanelTitle } from './ui/panel'
import { ProfileForm } from './ProfileForm'
import { PlatformSearchShortcut } from './CommandPalette'

/**
 * A rampa de entrada, e ela é DERIVADA.
 *
 * Nenhum número desta página é digitado: ciclos, exercícios, armadilhas e
 * termos vêm do conteúdo registrado. Uma página de boas-vindas com contagem
 * escrita à mão envelhece na próxima unidade e ninguém percebe. ADR-0019.
 */
export function HowItWorks() {
  const cycles = trailUnits.flatMap((u) => u.cycles)
  const traps = trailUnits.flatMap((u) => u.misconceptions)
  const exercises = trailUnits.flatMap((u) => u.exercises)
  const vocabulary = allTerms.filter((t) => t.introducedIn === APP)
  const onboardingTerms = ['app.cycle', 'app.trap', 'app.gap', 'app.revisit']
    .map((id) => vocabulary.find((term) => term.id === id))
    .filter((term): term is NonNullable<typeof term> => Boolean(term))

  const numbers = [
    { n: trailUnits.length, label: 'unidades na trilha' },
    { n: cycles.length, label: 'ciclos' },
    { n: exercises.length, label: 'exercícios' },
    { n: traps.length, label: 'armadilhas catalogadas' },
    { n: allTerms.length, label: 'termos no glossário' },
  ]

  return (
    <div className="flex flex-col gap-7">
      <div className="flex max-w-[760px] flex-col gap-3.5">
        <span className="lbl">Como funciona</span>
        <h1 className="m-0 text-[32px] font-semibold leading-tight">
          Você lê pouco, prevê antes de avançar e escreve para conferir.
        </h1>
        <p className="m-0 text-[15px] leading-relaxed text-fg-2">
          Esta trilha existe para uma coisa só: conseguir olhar um trecho de código que você não
          escreveu, de um colega ou de uma IA, e dizer o que ele faz, quanto trabalho e memória
          exige e onde pode quebrar, sem rodar. Não é preparação para entrevista e não é revisão
          de faculdade.
        </p>
        <p className="m-0 text-[15px] leading-relaxed text-fg-2">
          O jeito de estudar aqui é diferente do de assistir a um curso, e vale saber disso antes
          de começar: em cada ciclo você lê dois ou três parágrafos e depois <strong className="font-semibold text-fg">escreve</strong>{' '}
          alguma coisa, uma tabela de execução, uma escolha justificada, a linha do defeito. É
          isso que o app mede. Ler sem escrever não avança nada.
        </p>
      </div>

      <Panel className="max-w-[820px]">
        <PanelHeader>
          <PanelTitle>O que acontece em um ciclo</PanelTitle>
        </PanelHeader>
        <PanelBody className="grid gap-3 sm:grid-cols-3">
          {[
            ['1', 'Leia um caso', 'Um problema do trabalho e poucos parágrafos apresentam a ideia.'],
            ['2', 'Preveja antes de avançar', 'Nos exemplos que avançam por estado, diga o que vem a seguir antes de continuar.'],
            ['3', 'Produza uma resposta', 'Preencha um trace, justifique uma escolha ou localize a linha do defeito.'],
          ].map(([number, title, body]) => (
            <div key={number} className="border border-rule bg-panel-head p-3.5">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center border border-contract-rule font-mono text-[12px] text-contract">
                  {number}
                </span>
                <span className="text-[13.5px] font-semibold text-fg">{title}</span>
              </div>
              <p className="m-0 text-[12.5px] leading-relaxed text-fg-3">{body}</p>
            </div>
          ))}
          <p className="m-0 sm:col-span-3 text-[12.5px] leading-relaxed text-fg-4">
            Se a resposta ativar uma armadilha, o app não revela o gabarito: ele propõe uma tarefa
            menor para você refazer o raciocínio.
          </p>
        </PanelBody>
      </Panel>

      <div className="flex flex-col gap-2">
        <span className="lbl">A trilha inteira, não o que você precisa fazer hoje</span>
        <ul className="m-0 flex flex-wrap list-none gap-x-8 gap-y-3 p-0">
          {numbers.map((x) => (
            <li key={x.label} className="flex items-baseline gap-2">
              <span className="font-mono text-[22px] text-contract">{x.n}</span>
              <span className="text-[13px] text-fg-3">{x.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <Panel className="max-w-[820px]">
        <PanelHeader>
          <PanelTitle>Quatro palavras para começar</PanelTitle>
        </PanelHeader>
        <PanelBody className="flex flex-col gap-3.5">
          {onboardingTerms.map((t) => (
            <div key={t.id} className="border-l-2 border-rule pl-4">
              <div className="font-mono text-[13.5px] font-semibold text-contract">{t.canonical}</div>
              <p className="m-0 mt-0.5 text-[13.5px] leading-relaxed text-fg-2">{t.definition}</p>
              <p className="m-0 mt-0.5 text-[12.5px] leading-relaxed text-fg-4">{t.isNot[0]}</p>
            </div>
          ))}
          <Link href="/glossary" className="font-mono text-[12px] text-fg-4 hover:text-contract">
            as outras {allTerms.length - onboardingTerms.length} no glossário →
          </Link>
        </PanelBody>
      </Panel>

      <Panel className="max-w-[820px]">
        <PanelHeader>
          <PanelTitle>Três escolhas deste app</PanelTitle>
        </PanelHeader>
        <PanelBody className="flex flex-col gap-3.5 text-[13.5px] leading-relaxed text-fg-2">
          <p className="m-0">
            <strong className="font-semibold text-fg">O código está em pseudocódigo, em português.</strong>{' '}
            De propósito: a trilha é sobre a ideia, não sobre a linguagem.{' '}
            <code className="font-mono text-[12.5px] text-fg">inserir(tabela, chave, valor)</code> é a mesma
            coisa que o <code className="font-mono text-[12.5px] text-fg">insert</code> que você escreve no
            trabalho, sem a sintaxe no caminho.
          </p>
          <p className="m-0">
            <strong className="font-semibold text-fg">Você não precisa escolher uma resposta errada de propósito.</strong>{' '}
            Responda o que acredita. As {traps.length} armadilhas foram escritas antes de você
            chegar; quando uma aparece, o app registra a primeira tentativa e oferece a tarefa que
            produz a resposta, no máximo três vezes. Uma revisita limpa mostra que o raciocínio ficou.
          </p>
          <p className="m-0">
            <strong className="font-semibold text-fg">O tom é seco.</strong>{' '}
            Se uma resposta está superficial, o app diz. Não é severidade: elogio vago não ajuda
            quem precisa julgar código de verdade daqui a uma semana.
          </p>
        </PanelBody>
      </Panel>

      <ProfileForm />

      <Panel className="max-w-[820px]">
        <PanelHeader>
          <PanelTitle>Atalhos, para quando o mouse virar o gargalo</PanelTitle>
        </PanelHeader>
        <PanelBody className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1.5">
          {[
            ['j / k', 'próximo ciclo, ciclo anterior'],
            ['1 … 9', 'escolher a alternativa'],
            ['Enter', 'verificar o trace'],
            ['esc', 'fechar'],
          ].map(([key, what]) => (
            <div key={key} className="contents">
              <span className="font-mono text-[12.5px] whitespace-nowrap text-contract">{key}</span>
              <span className="text-[13px] text-fg-3">{what}</span>
            </div>
          ))}
          <div className="contents">
            <span className="font-mono text-[12.5px] whitespace-nowrap text-contract">
              <PlatformSearchShortcut />
            </span>
            <span className="text-[13px] text-fg-3">buscar um termo, ciclo, armadilha ou tela</span>
          </div>
        </PanelBody>
      </Panel>

      <div className="flex max-w-[820px] flex-col gap-2.5">
        <span className="lbl">Por onde começar</span>
        <Link
          href={`/units/${allUnits[0]!.id}`}
          className="m-tap flex flex-col gap-1 border border-contract-rule bg-contract-bg px-4 py-3.5 text-inherit hover:bg-panel-hover"
        >
          <span className="text-[17px] font-semibold">{allUnits[0]!.title}</span>
          <span className="text-[13px] leading-snug text-fg-3">{allUnits[0]!.learningObjective}</span>
        </Link>
        <p className="m-0 text-[12.5px] text-fg-4">
          Se esta é sua primeira visita, comece pelo primeiro ciclo da pré-trilha. Depois, a unidade 01 usa o vocabulário que ela estabeleceu.{' '}
          <Link href="/sondagem" className="underline decoration-rule underline-offset-2 hover:text-fg-2">
            Se você já programa há um tempo, seis perguntas dizem por onde começar.
          </Link>
        </p>
      </div>
    </div>
  )
}
