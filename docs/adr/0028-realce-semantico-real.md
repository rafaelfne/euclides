# ADR-0028: O realce do JavaScript é a folha de notação atravessada

**Status:** Aceito
**Data:** 2026-08-29
**Decisores:** Rafael Neves

## Contexto

Os oito exercícios de caça ao defeito mostravam JavaScript em cinza chapado, enquanto o
pseudocódigo ao lado tinha realce semântico desde o ADR-0013. O contraste era o pior
possível: a linguagem que o aluno **não** vai encontrar no trabalho estava colorida, e a que
ele vai encontrar estava apagada.

## Decisão

**O realce do JavaScript usa os mesmos tokens e as mesmas cores do pseudocódigo, e é
escrito à mão.**

O tokenizador de pseudocódigo já dizia por que ele existe: o colorido lá é **semântico, não
decorativo**. Um realçador de prateleira pinta por categoria léxica e trata `=` e `===` como
o mesmo tom de operador. Neste app eles não são a mesma coisa: metade do catálogo de
armadilhas mora exatamente na diferença entre atribuir e comparar, entre `<` e `<=`, entre
curto-circuito e avaliação completa.

Então `convention` recebe os operadores que o aluno lê errado, no mesmo azul que a folha de
notação usa, com o significado no hover. **O aluno vê o mesmo azul nos dois lugares, e a
ponte entre a notação declarada e a linguagem real é a cor.** `←` de lá é `=` daqui; `=` de
lá é `===` daqui.

`&&` e `||` declaram o curto-circuito, porque `tracing.c6` existe por causa dele. `==` e
`===` declaram coisas diferentes, e o teste confere que declaram.

### Sem dependência

90 linhas contra ~90 KB de um Prism ou Shiki, para oito blocos de uma linguagem só. O
ADR-0025 acabou de aceitar 78 KB por uma razão que aqui não existe.

### A garantia que o teste protege

`scripts/test-javascript.ts` percorre **as 60 linhas dos oito exercícios** e afirma que o
realce devolve cada linha intacta, caractere por caractere. Um bloco de caça ao defeito que
perde um caractere no realce é um exercício com um defeito a mais, e seria o pior lugar
possível para esse defeito estar.

O teste também trava os casos que fatiariam operador: `===` não pode virar `==` mais `=`,
`!==` não pode virar `!=` mais `=`, `<=` não pode virar `<` mais `=`.

E dois casos em que colorir por dentro mentiria: um `=` dentro de um comentário não é
atribuição, e um `===` dentro de uma string não é comparação. Comentário e string saem
inteiros, num token só.

## Opções consideradas

### A — Shiki ou Prism
**Descartada.** Peso, e pinta por categoria léxica. `=` e `===` sairiam do mesmo tom, que é
precisamente a distinção que o app existe para ensinar.

### B — Sem realce, como estava
**Descartada.** A linguagem que o aluno vai revisar de verdade não pode ser a apagada.

### C — Realce próprio, com a paleta do pseudocódigo
Adotada.

## Análise de trade-off

O custo é que o tokenizador é incompleto de propósito: ele não entende regex literal, nem
template com interpolação, nem JSX. Se um exercício futuro usar qualquer um deles, o realce
sai errado — e o teste de integridade **não** pega isso, porque ele confere que nada se
perde, não que tudo está no tom certo.

A defesa é o escopo: são oito blocos de JavaScript simples, escritos para serem lidos por
quem está aprendendo, e essa é a forma que eles vão continuar tendo.

## Consequências

- **Fica mais fácil:** ler o código do exercício, e reconhecer o operador que a folha de
  notação declarou.
- **Fica mais difícil:** usar uma segunda linguagem nos exercícios. Ela precisaria do seu
  tokenizador, ou de aceitar o realce errado.
- **Fica exposto:** construções que o tokenizador não conhece saem sem cor certa e nada
  avisa.
- **A observar:** se alguém usa o hover do operador. Se ninguém usar, ele é peso morto no
  markup, ainda que barato.

## Itens de ação

1. [x] `src/lib/javascript.ts`, com `convention` nos operadores que a folha declara
2. [x] `BugExercise` renderizando com a paleta do pseudocódigo e o hover do significado
3. [x] `CodeBlock` na alternância para TypeScript, pelo mesmo realce: sem a cor, a
   alternância mostra a tradução e esconde justamente a coisa que ela traduz
4. [x] `scripts/test-javascript.ts`: integridade linha a linha nos oito exercícios E no
   pseudocódigo transliterado dos 62 ciclos, mais os operadores compostos que não podem ser
   fatiados
5. [ ] Checagem que reprove exercício de defeito numa linguagem sem tokenizador
