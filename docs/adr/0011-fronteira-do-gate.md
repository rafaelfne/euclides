# ADR-0011: A fronteira entre o que é gate e o que é relatório

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

O ADR-0006 tornou o validador pedagógico um gate de build sobre `src/content/`. A primeira
leitura externa do repositório — feita por um agente com a tarefa de escrever uma unidade
nova — encontrou o efeito colateral disso: **tudo que define como escrever conteúdo ficou
fora do gate, e derivou primeiro.**

Três derivas em um repositório de dois commits, todas em documento e nenhuma em conteúdo:

1. `docs/discovery/02-motor-socratico.md` escrevia a devolutiva-modelo com "balde" no
   lugar de `bucket` — a forma não canônica que o ADR-0005 usa como *o* exemplo de deriva.
   E é o documento que o `exercise-designer` é mandado ler antes de escrever.
2. `.claude/agents/terminology-auditor.md` mandava ler um "03-taxonomia-e-terminologia.md"
   que nunca existiu — o arquivo é `docs/discovery/03-taxonomia-e-didatica.md`. Era a
   primeira instrução do agente. (Sem crase de propósito: o checador que este ADR institui
   não distingue citação de referência, e citar o caminho morto reprovaria o build. É o
   mesmo limite que a fronteira 3 declara, um nível acima.)
3. `docs/discovery/01-principios.md` afirmava que sete princípios tinham checagem
   correspondente, num texto cujo próprio corpo marca dois como não mecanizados.

A mesma leitura encontrou um defeito de outra natureza no relatório do validador: uma
regra publicava `ok` e `FALHA` na mesma saída, porque a linha de aprovação e a de falha
eram duas strings casadas à mão.

## Decisão

Três fronteiras, declaradas.

**1. O relatório do validador é derivado, não escrito.** As checagens são uma lista
(`CHECKS` em `scripts/validate-content.ts`); `fail` só aceita um id dessa lista; o
relatório imprime `ok` para todo id sem falha. Nenhum documento cita mais um número de
checagens — cita a lista. A contagem à mão é o que produziu "doze checagens" num validador
que aplicava treze regras.

**2. Caminho citado em documento é gate.** `npm run docs:check` verifica que todo caminho
de arquivo citado em `docs/` e `.claude/` existe. Roda no `npm run build` e em passo
próprio no CI. É exato, resolve relativo ao documento que cita, e ignora placeholder
(`<id>`, `$1`) e nome sem diretório — um `index.ts` solto em prosa é um nome, não um local.

**3. Terminologia em prosa é relatório, não gate.** Fica no `/audit-unit`, com escopo
ampliado para `docs/` e `.claude/`. O motivo é o próprio "balde": a forma não canônica é
legítima quando é citação, menção ou `alsoKnownAs`, e um gate que não distingue uso de
menção empurraria o autor a apagar exatamente os exemplos que ensinam a distinção. Foi o
mesmo raciocínio que criou a escotilha do vocabulário, e ele vale aqui inteiro.

A metade exata de "termo usado antes de introduzido" **é** mecanizada, e entrou no gate de
conteúdo: `introducedIn` e o `introducesTerms` do ciclo têm de concordar nos dois sentidos.
O que sobra para a auditoria é a prosa, onde referência antecipada deliberada e deriva não
se distinguem por regra.

## Opções consideradas

### A — Nada muda; documento se corrige na revisão
**Descartada.** É a opção C do ADR-0006 com outro nome, e pelo mesmo motivo: é o mesmo
humano que escreveu as regras que as quebrou. Três derivas em dois commits são a medida.

### B — Estender o validador pedagógico a `docs/`
**Descartada.** Contradiz o escopo que o ADR-0006 define e mistura duas perguntas
diferentes numa saída só. Uma falha de caminho morto num agente não é "o conteúdo viola um
princípio", e ler as duas coisas na mesma lista de `ok` reduz o sinal das duas.

### C — Script separado para o que é exato, auditoria para o que é julgamento
Adotada. Duas perguntas, dois scripts, dois passos no CI.

### D — Gate também sobre terminologia em prosa
**Descartada**, com a ressalva de que é tentador. Custaria os exemplos: o ADR-0005 precisa
escrever "balde" para dizer que ninguém diz balde. Um gate cego a isso transformaria o
projeto em algo que não consegue ensinar a própria regra.

## Consequências

- **Fica mais fácil:** confiar num caminho citado em documento sem abrir o arquivo.
- **Fica mais difícil:** renomear um documento sem atualizar quem o cita — que é o ponto.
- **Fica exposto:** a fronteira D é uma escolha, não uma limitação técnica. Se um dia
  houver um jeito barato de distinguir uso de menção, ela merece ser reaberta.
- **A observar:** `docs:check` cobre caminho, não conteúdo. Um documento pode citar um
  arquivo que existe e descrever errado o que há dentro dele — foi o caso do
  `exercise-designer` mandando escrever três degraus onde o motor já os escreve. Isso
  continua sendo trabalho de leitura humana.

## Itens de ação

1. [x] `CHECKS` declarado, `fail` tipado pelo id, relatório derivado
2. [x] `scripts/check-docs.ts` e `npm run docs:check`, no build e no CI
3. [x] `/audit-unit` e `terminology-auditor` com escopo em `docs/` e `.claude/`
4. [x] As três derivas corrigidas
