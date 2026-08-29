import Link from 'next/link'
import { units } from '@/content'
import { allTerms } from '@/content/glossary'
import { APP } from '@/content/glossary'
import { Panel, PanelBody, PanelHeader, PanelTitle } from './ui/panel'

/**
 * A rampa de entrada, e ela é DERIVADA.
 *
 * Nenhum número desta página é digitado: ciclos, exercícios, armadilhas e
 * termos vêm do conteúdo registrado. Uma página de boas-vindas com contagem
 * escrita à mão envelhece na próxima unidade e ninguém percebe. ADR-0019.
 */
export function HowItWorks() {
  const cycles = units.flatMap((u) => u.cycles)
  const traps = units.flatMap((u) => u.misconceptions)
  const exercises = units.flatMap((u) => u.exercises)
  const vocabulary = allTerms.filter((t) => t.introducedIn === APP)

  const numbers = [
    { n: units.length, label: 'unidades' },
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
          Você lê pouco, escreve bastante, e erra de propósito.
        </h1>
        <p className="m-0 text-[15px] leading-relaxed text-fg-2">
          Esta trilha existe para uma coisa só: conseguir olhar um trecho de código que você não
          escreveu — de um colega ou de uma IA — e dizer o que ele custa, sem rodar. Não é
          preparação para entrevista e não é revisão de faculdade.
        </p>
        <p className="m-0 text-[15px] leading-relaxed text-fg-2">
          O jeito de estudar aqui é diferente do de assistir a um curso, e vale saber disso antes
          de começar: em cada ciclo você lê dois ou três parágrafos e depois <strong className="font-semibold text-fg">escreve</strong>{' '}
          alguma coisa — uma tabela de execução, uma escolha justificada, a linha do defeito. É
          isso que o app mede. Ler sem escrever não avança nada.
        </p>
      </div>

      <ul className="m-0 flex flex-wrap list-none gap-x-8 gap-y-3 p-0">
        {numbers.map((x) => (
          <li key={x.label} className="flex items-baseline gap-2">
            <span className="font-mono text-[22px] text-contract">{x.n}</span>
            <span className="text-[13px] text-fg-3">{x.label}</span>
          </li>
        ))}
      </ul>

      <Panel className="max-w-[820px]">
        <PanelHeader>
          <PanelTitle>As seis palavras que o app usa o tempo todo</PanelTitle>
        </PanelHeader>
        <PanelBody className="flex flex-col gap-3.5">
          {vocabulary.slice(0, 6).map((t) => (
            <div key={t.id} className="border-l-2 border-rule pl-4">
              <div className="font-mono text-[13.5px] font-semibold text-contract">{t.canonical}</div>
              <p className="m-0 mt-0.5 text-[13.5px] leading-relaxed text-fg-2">{t.definition}</p>
              <p className="m-0 mt-0.5 text-[12.5px] leading-relaxed text-fg-4">{t.isNot[0]}</p>
            </div>
          ))}
          <Link href="/glossary" className="font-mono text-[12px] text-fg-4 hover:text-contract">
            as outras {allTerms.length - 6} no glossário →
          </Link>
        </PanelBody>
      </Panel>

      <Panel className="max-w-[820px]">
        <PanelHeader>
          <PanelTitle>Três coisas que costumam assustar, e não deveriam</PanelTitle>
        </PanelHeader>
        <PanelBody className="flex flex-col gap-3.5 text-[13.5px] leading-relaxed text-fg-2">
          <p className="m-0">
            <strong className="font-semibold text-fg">O código está em pseudocódigo, em português.</strong>{' '}
            De propósito: a trilha é sobre a ideia, não sobre a linguagem. `inserir(tabela, chave, valor)`
            é a mesma coisa que o `insert` que você escreve no trabalho, sem a sintaxe no caminho.
          </p>
          <p className="m-0">
            <strong className="font-semibold text-fg">Errar é o método, não o acidente.</strong>{' '}
            As {traps.length} armadilhas do catálogo foram escritas antes de você chegar. Quando
            você ativa uma, o app não dá a resposta — ele dá a tarefa que produz a resposta, no
            máximo três vezes, e depois manda parar.
          </p>
          <p className="m-0">
            <strong className="font-semibold text-fg">O tom é seco.</strong>{' '}
            Se uma resposta está superficial, o app diz. Não é severidade: elogio vago não ajuda
            quem precisa julgar código de verdade daqui a uma semana.
          </p>
        </PanelBody>
      </Panel>

      <div className="flex max-w-[820px] flex-col gap-2.5">
        <span className="lbl">Por onde começar</span>
        <Link
          href={`/units/${units[0]!.id}`}
          className="m-tap flex flex-col gap-1 border border-contract-rule bg-contract-bg px-4 py-3.5 text-inherit hover:bg-panel-hover"
        >
          <span className="text-[17px] font-semibold">{units[0]!.title}</span>
          <span className="text-[13px] leading-snug text-fg-3">{units[0]!.learningObjective}</span>
        </Link>
        <p className="m-0 text-[12.5px] text-fg-4">
          As unidades têm ordem. Cada uma usa o vocabulário que a anterior estabeleceu.
        </p>
      </div>
    </div>
  )
}
