# Proposta — densidade, jargão e a ordem em que um nome entra

Escrita a partir dos achados A4 e A5. **Não aplicada:** mexe em conteúdo de unidade, e o
ADR-0010 diz que escopo de unidade nasce em spec. O que está aqui é a regra proposta e um
trecho reescrito para julgar a regra pelo resultado, não pelo enunciado.

## O que não muda

O ADR-0005 continua de pé: a forma canônica é a que o aluno vai encontrar em documentação,
código e Stack Overflow. `bucket` e não balde, `chaining` e não encadeamento. Trocar isso
protegeria o aluno hoje e o deixaria mudo na primeira code review — é o custo declarado no
próprio ADR, e ele continua valendo.

O problema não é *qual* palavra. É **quando** ela entra e **quantas** entram juntas.

## A regra proposta: o fenômeno antes do nome

Um termo técnico só aparece depois que o aluno viu a coisa que ele nomeia. Não é uma
preferência de estilo; é a diferença entre uma palavra que ancora e uma que ocupa memória.

Hoje o c3 abre assim:

> Cada bucket guarda a lista dos pares que colidiram ali.

`bucket`, `par` e `colidir` na primeira frase, todos como pressuposto. A versão com a regra
aplicada mostra primeiro e nomeia depois:

> Duas chaves diferentes chegaram à mesma posição da tabela. A posição não pode guardar as
> duas por cima uma da outra, então ela guarda uma lista com as duas — e a busca, depois de
> calcular a posição, percorre essa lista comparando chave por chave.
>
> Essa posição tem nome: **bucket**. E a política de guardar uma lista dentro dela tem outro:
> **chaining**.

Mesmo termo canônico, mesma precisão. O que muda é que ele chega como rótulo de algo já
entendido, e não como pré-requisito.

**Teste, para ser verificável:** leia a primeira frase de cada parágrafo. Se ela só faz
sentido para quem já sabe o que a palavra técnica significa, o parágrafo está invertido.

## A regra proposta: letra é abreviação, não conceito

Nenhuma letra aparece antes da palavra que ela abrevia, e a palavra continua disponível
depois. `α` entra como *a carga*, e `α` fica sendo o jeito curto de escrever carga — não o
nome dela.

- Prosa e interface: palavra. "carga", "posições", "pares guardados".
- Pseudocódigo e invariante: letra, porque compactar é o ponto ali.
- E a ponte entre os dois, que agora existe: a legenda `symbols` na barra lateral.

`α = n/m` sem nada em volta pede três traduções simultâneas de quem ainda não automatizou
nenhuma delas. `carga = pares guardados ÷ posições` pede zero — e o `α` logo em seguida passa
a ser reconhecimento, não decifração.

## O c5 reescrito, para julgar pelo resultado

**Hoje** (dois parágrafos, 62 palavras):

> Quando α passa do limite, a tabela dobra e reinsere. Reinsere, não copia: mudar m quebra a
> invariante de posição para todos os pares ao mesmo tempo.
>
> O rehash custa O(n+m) pontualmente. Como ele acontece a cada duplicação, o custo por
> inserção continua constante quando espalhado ao longo da sequência.

**Proposto:**

> A tabela tem quatro posições e três pares guardados. Chega o quarto. Ela está cheia demais
> para continuar respondendo rápido: as listas dentro de cada posição crescem, e percorrer
> lista é exatamente o custo que a tabela existia para evitar.
>
> A saída é dobrar o número de posições. Só que dobrar, sozinho, não resolve — a posição de
> cada chave foi calculada com o tamanho antigo. Com o tamanho novo a mesma chave dá outra
> conta, e todas as chaves guardadas passam a estar, ao mesmo tempo, no lugar errado. Por isso
> a tabela não copia o que já está lá: ela recalcula a posição de cada par e guarda de novo.
> Isso tem nome: **rehash**.
>
> Recalcular tudo custa caro, na ordem do número de pares mais o número de posições. Mas
> repare em quando isso acontece: só quando a tabela dobra. Entre uma dobra e a próxima cabem
> cada vez mais inserções baratas, então esse custo, dividido pelas inserções que ele atende,
> não cresce. Olhando a sequência inteira em vez de uma inserção isolada, cada inserção volta
> a custar o mesmo de sempre. Esse "olhando a sequência inteira" também tem nome: custo
> **amortizado** — e ele não é a mesma coisa que caso médio.

Três vezes o volume e nenhum conceito novo. O que entrou foi a cadeia causal que estava
implícita, e os dois nomes chegam no fim, cada um colado no fenômeno que acabou de acontecer.

## O exemplo trabalhado vira tabela, e deixa de ser o exercício

Hoje o exemplo usa 3, 7, 11, 4 e **conta em prosa** o que acontece; o exercício pede 3, 7, 11,
4, 8 — a mesma sequência com um passo a mais. O aluno recebe a conclusão e é cobrado do
processo, sem nunca ter visto o processo.

Proposta: o exemplo mostra a tabela preenchida, no formato exato que o exercício vai pedir, e
com **outras chaves**. Com quatro posições e limite de 0,75, inserindo 5, 9, 2 e 6:

| passo | chave | rehash? | pares (n) | posições (m) | carga (α) | onde cada chave está |
|---|---|---|---|---|---|---|
| 1 | 5 | não | 1 | 4 | 0,25 | `1:[5]` |
| 2 | 9 | não | 2 | 4 | 0,50 | `1:[5,9]` |
| 3 | 2 | não | 3 | 4 | 0,75 | `1:[5,9] 2:[2]` |
| 4 | 6 | sim | 4 | 8 | 0,50 | `1:[9] 2:[2] 5:[5] 6:[6]` |

O que observar: no passo 4 o 5 e o 9, que dividiam a posição 1, se separaram. E o exercício
que vem depois mostra o caso oposto — 3 e 11 continuam juntos depois do rehash. Redistribuir
não é eliminar colisão, e agora o aluno viu as duas metades disso em vez de ler a frase.

## O que isso custa

- O c5 triplica de tamanho, e c1–c4 pedem o mesmo tratamento para não ficarem destoando.
  Provavelmente algum ciclo se divide em dois, o que é o comportamento certo segundo o próprio
  guia ("se não couber, divida, não comprima").
- O exemplo trabalhado passa a precisar de gabarito computado também — ou ele é digitado à
  mão e volta o defeito que o `guia-de-unidade.md` descreve. Sugestão: `workedExample` ganha
  um `reference` opcional, e a tabela do exemplo sai do mesmo gerador do exercício com outra
  entrada.
- Nenhuma checagem do validador cobre "o nome veio depois do fenômeno". É julgamento, e o
  lugar dele é o `/audit-unit` — com a pergunta escrita lá em voz ativa, porque hoje o auditor
  procura deriva de terminologia e não densidade de introdução.

## O que precisa da sua decisão

1. A regra do fenômeno-antes-do-nome entra no `guia-de-unidade.md` e no `content-author.md`?
2. O c5 (ou c1–c8 inteiro) é reescrito nessa linha, e isso vira uma revisão do
   `docs/specs/hash.md` antes de virar conteúdo?
3. `workedExample` ganha gabarito computado?
