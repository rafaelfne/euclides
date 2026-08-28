# ADR-0015: Direção visual de IDE, com Tailwind e shadcn/ui

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

**Substitui o ADR-0008** (CSS puro com custom properties, sem framework de utilitários).

## Contexto

O ADR-0008 escolheu CSS puro por dois motivos: a direção visual era a edição de Oliver
Byrne dos *Elementos*, 1847 — papel creme, serifa, cinco cores com função semântica — e
numa página pública estática cada kB conta. Ele deixou o gatilho de revisão escrito:
*"reavaliar se passar de ~15 telas ou ganhar um segundo autor"*.

**O gatilho não disparou.** São quatro templates e um autor. O que mudou foi a direção de
produto: a decisão de que o app deve parecer uma ferramenta de trabalho, não material
didático — e o público-alvo é um desenvolvedor que passa o dia inteiro dentro de um editor.

Registrar isso importa. Fingir que o gatilho disparou seria usar o ADR anterior como
carimbo em vez de como decisão, que é o oposto do que `docs/adr/README.md` pede.

## Decisão

Três coisas, e a terceira é a que sustenta as outras duas.

**1. A direção visual é a de um editor de código.** Escuro, denso, painéis com cabeçalho,
rail de navegação com as oito unidades sempre visível, abas para os ciclos. Foi escolhida
entre três alternativas desenhadas lado a lado — terminal puro, blueprint técnico e IDE.

**2. Tailwind v4 e shadcn/ui.** Os primitivos entram copiados para `src/components/ui/`,
que é como o shadcn funciona: o código é do projeto, não da dependência. Entraram só os
que estão em uso — `Button`, `Panel`, `Badge`, `Input`, `Separator`, `Collapsible`.

**3. As cinco cores continuam tendo função semântica, e isso não é decoração.** Azul é
contrato, vermelho é implementação, ocre é custo. Elas foram levantadas para escuro
mantendo a matiz, e continuam sendo lidas por `BAND_TONE` em `src/components/band-tokens.ts`
— exaustivo por tipo, como a deriva 4 do `CLAUDE.md` exige. A forma do nó continua
codificando a **posição na espinha**, não o substantivo, então as duas espinhas do ADR-0012
seguem legíveis pelo mesmo vocabulário.

## Opções consideradas

### A — Terminal
Tudo monoespaçado, inclusive a prosa. Densidade máxima, sem curva, sem sombra.
**Descartada:** esta trilha tem parágrafos de verdade em todo ciclo, e prosa longa em
monoespaçado cansa. O princípio 5 depende de o aluno ler a motivação até o fim.

### B — Blueprint
Grade técnica ao fundo, marcas de canto, tracejado ligando as bandas. Mono nos rótulos,
serifa na prosa.
**Descartada, e foi a decisão difícil:** era a que preservava o DNA de desenho geométrico do
Byrne que dá nome ao projeto. Perdeu porque a grade compete com a tabela do exercício de
traço, que é a tela onde o aluno mais precisa de silêncio visual.

### C — IDE
Adotada. Além da direção visual, ela resolve um problema de navegação que o ADR-0014
resolveu pela metade: aquele ADR deu ordem *dentro* de uma unidade, e entre unidades o aluno
continuava voltando à home. O rail resolve isso sem tela nova.

### D — Manter o ADR-0008
**Descartada por decisão de produto**, não por argumento técnico. O argumento de kB do
ADR-0008 continua de pé e virou o custo declarado abaixo.

## Análise de trade-off

**O custo é peso, e ele é real.** As dependências novas — Tailwind, Radix, cva, clsx,
tailwind-merge, lucide-react — não existiam. O ADR-0008 estava certo sobre isso; a decisão
é aceitar o custo, não negá-lo. O que mitiga: o export continua estático (ADR-0001), o
Tailwind v4 só emite as utilitárias usadas, e os primitivos do shadcn são arquivos do
projeto, então o que não é importado não entra no bundle.

**A perda que não se mitiga é a referência ao Byrne.** O `CLAUDE.md` trata o nome como
método, e o ADR-0005 usa a mesma disciplina para terminologia. A parte que sobrevive é a que
sempre foi a essencial: cor com função declarada, forma codificando posição na espinha,
nada na tela que não esteja declarado em algum lugar. A parte que se perde é a superfície —
papel, serifa de display, a citação de 1847.

## Consequências

- **Fica mais fácil:** telas densas, tabela de traço legível, e navegação entre unidades sem
  passar pela home.
- **Fica mais difícil:** trocar a paleta inteira em um lugar. Agora são as variáveis em
  `:root` **e** o mapa `@theme inline` que as expõe como utilitárias.
- **Fica exposto:** o argumento de kB do ADR-0008 continua verdadeiro e agora é um custo
  aceito. Se a página pública passar a doer, é este ADR que se revisita.
- **A observar:** a detecção automática de fontes do Tailwind v4 não alcançou `src/` a
  partir de `app/globals.css`, e o sintoma é silencioso — o layer base aplica, as utilitárias
  somem, e a página volta sem layout nenhum. Os `@source` estão declarados de propósito.

## Itens de ação

1. [x] Três direções desenhadas e comparadas antes de escrever componente
2. [x] Tailwind v4, `components.json` e os primitivos em `src/components/ui/`
3. [x] `band-tokens.ts` exaustivo por tipo, com a paleta por posição na espinha
4. [x] Rail com as oito unidades e abas por ciclo
5. [x] Medir o custo no momento da troca: o JS compartilhado ficou em 103 kB, igual ao de
   antes; a tela do ciclo foi de 139 kB para 151 kB e o mapa de 123 kB para 132 kB. O CSS
   emitido é o que o Tailwind v4 gera para as classes em uso.
6. [ ] Remedir depois de um mês de conteúdo novo, e revisitar este ADR se a página pública
   passar a doer
