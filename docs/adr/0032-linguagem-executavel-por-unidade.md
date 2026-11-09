# ADR-0032: A linguagem executável é da unidade, e a unidade 09 é Python

**Status:** Aceito
**Data:** 2026-11-06
**Decisores:** Rafael Neves

**Complementa o ADR-0019** (a alternância pseudocódigo e código derivado) e o **ADR-0028**
(realce semântico por linguagem).

## Contexto

Toda unidade derivava o pseudocódigo para TypeScript. Na unidade 09, "Como uma IA decide",
isso destoava: o código de rede neural que o aluno vai encontrar fora daqui é Python, do
micrograd ao PyTorch, e o autor estuda a unidade junto com um micrograd escrito em Python.
O exercício de defeito da unidade também estava em JavaScript.

A tradução para TypeScript ainda tinha um defeito que nesta unidade aparecia em todo bloco:
o pseudocódigo atribui sem declarar (`total ← 0`), e a versão derivada saía como
`total = 0`, sem `let`, que não é TypeScript estrito. Python não tem esse problema, porque
atribuir é declarar, e o bloco é marcado por indentação como no pseudocódigo.

## Decisão

1. **Campo obrigatório `runnable: 'typescript' | 'python'` em toda unidade.** Obrigatório,
   para nenhuma unidade herdar a escolha de outra por omissão. As oito unidades da trilha e a
   pré-trilha declaram `typescript`; a unidade 09 declara `python`.
2. **`src/lib/transliterate-python.ts`**, tradutor por dicionário no mesmo modelo do de
   TypeScript, reaproveitando `IDENTIFIERS` com nomes em snake_case. `para i de 0 até X − 1`
   vira `range(X)`, e `math.tanh` traz o `import math`.
3. **A checagem `tradução` usa o tradutor da unidade.** A regra não muda: o bloco atravessa
   inteiro ou declara `pseudocodeIsProse`.
4. **`src/lib/python.ts`**, realce semântico de Python registrado em `TOKENIZERS`, com `=`,
   `==` e `+=` na cor de convenção. O exercício `ai.e7` passa a ser Python.
5. **O perfil continua guardando `codeLanguage: 'pseudo' | 'typescript'`.** O valor
   `typescript` passa a significar "a versão executável", e a aba mostra o nome da linguagem
   da unidade. Renomear o valor pediria migração do progresso salvo no navegador por um ganho
   só de nome.

## Opções consideradas

- **Preferência do leitor, como já é pseudocódigo contra TypeScript.** Descartada: a
  linguagem que importa é a que o assunto usa no mundo, não a que o leitor usa no trabalho.
  Um aluno que lê TypeScript ainda encontra Python quando abre código de rede neural.
- **Escrever o Python à mão ao lado do pseudocódigo.** Descartada pelo mesmo motivo do
  ADR-0019: duas fontes divergem na primeira correção.
- **Consertar o `let` no tradutor de TypeScript e manter TypeScript.** Não resolve a razão
  principal, e fica como item à parte (abaixo).

## Consequências

- A unidade 09 mostra Python na alternância e no exercício de defeito.
- O tradutor de Python cobre os idiomas do pseudocódigo de toda a trilha, mas só é
  conferido nos blocos da unidade 09. Usar `python` em outra unidade pede rodar
  `npm run validate`, que já cobre.
- Fica aberto: a versão TypeScript das outras unidades continua sem `let` nas atribuições.
  É o defeito que o ADR-0019 diz querer evitar, "algo que parece TypeScript e não é".
