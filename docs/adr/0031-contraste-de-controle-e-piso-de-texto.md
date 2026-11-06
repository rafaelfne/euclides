# ADR-0031: Contraste de controle, foco visível e piso de texto

**Status:** Proposto
**Data:** 2026-11-06
**Decisores:** Rafael Neves

**Complementa o ADR-0015** (direção visual de IDE) e o **ADR-0019** (a rampa de texto em 4,5:1).
**Estende a todo `.lbl`** o que o ADR-0020 fez com `nav .lbl` e `header .lbl`: sans, caixa mista.

## Contexto

Uma revisão de design com três lentes (heurística, linguagem e WCAG 2.1 AA) achou quatro
problemas que nascem da paleta e dos primitivos, não de uma tela:

- **Borda de controle quase invisível.** Input e botão `outline` usavam `--rule` (#2E343E),
  que fica em 1,35:1 contra `--panel`. O WCAG 1.4.11 pede 3:1 para o limite de um
  componente. A régua foi escolhida suave de propósito, para separar painéis, e servia mal
  para dizer "aqui se digita".
- **Foco por fundo.** A célula do trace com foco só trocava o fundo para `--panel-hover`,
  1,14:1 contra o fundo anterior. Numa tabela de 30 células, o aluno não via onde estava
  digitando (WCAG 2.4.7).
- **Texto de controle pequeno demais.** Botões em mono 10,5px versal, rótulos em 11px, e
  53 ocorrências de 10 a 11,5px em componentes. O app é para sessões longas de estudo.
- **A versal reescrevia a notação.** `.lbl` aplicava `text-transform: uppercase`, e
  "posições (m)" chegava ao aluno como "POSIÇÕES (M)". Num app cujo nome é "nada é
  assumido que não esteja declarado", trocar m por M sem declarar é o defeito que o
  projeto existe para pegar.

Também: `--fg-5` passava em 4,5:1 contra quatro superfícies, mas não contra `--panel-hover`
(4,19:1), onde ele aparece em toda linha de lista com hover.

## Decisão

1. **Token novo `--rule-control: #6B7585`** para a borda de tudo que recebe clique ou
   digitação: input, botão `outline`, filtro, botão de busca. Passa 3:1 contra as cinco
   superfícies (3,18:1 no pior caso, `--panel-hover`). `--rule` e `--rule-soft` continuam
   como réguas decorativas.
2. **Foco por contorno.** `focus-visible:outline-2` na cor de contrato, 6,76:1. Input usa
   contorno interno (`outline-offset: -2px`) para não estourar a célula da tabela.
3. **Piso de 12px para qualquer texto, 13 a 14px para controle.** Botão em sans 14px
   semibold, 40px de altura; `sm` em 13px e 36px. Nenhum `text-[10px]` a `text-[11.5px]`
   sobra em `src/components`.
4. **`.lbl` em caixa mista.** Sans 12,5px, peso 500, `--fg-4`. O que separa cromo de
   conteúdo passa a ser peso e cor, não a caixa.
5. **`--fg-5` sobe para #868F9C**, 4,53:1 contra `--panel-hover`, e a rampa do ADR-0019
   passa a valer contra as cinco superfícies.

## Opções consideradas

- **Manter a versal e escrever os rótulos com símbolo à mão em caixa baixa.** Descartada:
  depende de cada autor lembrar, e o defeito é silencioso. Uma regra que só funciona se
  ninguém esquecer é a deriva 4 com outro nome.
- **Escurecer o fundo do input em vez de clarear a borda.** Descartada: o fundo mais escuro
  que existe na paleta (`--shell`) dá 1,1:1 contra `--panel`. Não há contraste de fundo
  disponível sem inventar uma superfície nova.
- **Subir `--rule` inteiro para 3:1.** Descartada: toda divisória de painel ficaria pesada,
  e a direção de IDE do ADR-0015 depende de réguas que não competem com o conteúdo.

## Consequências

- **Fica mais difícil:** a tela ganha densidade de contorno. Uma tabela de trace com 30
  inputs bordados é mais pesada que a de antes. Foi o preço aceito por saber onde se digita.
- `--fg-4` e `--fg-5` ficaram próximos (#8A94A3 e #868F9C). A rampa tem cinco nomes e,
  na prática, quatro tons. Se precisar de um quinto distinto, ele sobe, não desce.
- Figuras com legenda apertada passaram de 10 a 11,5px para 12px. Algumas podem quebrar
  linha onde antes não quebravam.

## O que revisitar

- Se uma figura quebrar a legenda em mais de duas linhas por causa do piso, a figura muda
  de tamanho; o piso não volta.
- Se aparecer modo claro, `--rule-control` precisa de par próprio, contra papel, não só
  inversão.

## Itens de ação

- [x] `--rule-control` e `--fg-5` em `app/globals.css`
- [x] `src/components/ui/input.tsx` e `src/components/ui/button.tsx` com borda, foco e tamanhos novos
- [x] `.lbl` em caixa mista
- [x] piso de 12px nos componentes
- [ ] conferir no celular e com leitor de tela, que a revisão não cobriu
