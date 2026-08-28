# Spec — Unidade 3: Estruturas lineares

**Status:** spec — não implementada, **e com um conflito estrutural a resolver antes**
**Kind:** `structure`.

## O conflito, primeiro

O schema permite **um** `adt` por unidade. "Estruturas lineares" nomeia três contratos
diferentes — Lista, Pilha e Fila — e eles não são o mesmo contrato com implementações
diferentes: são contratos distintos, com operações distintas e ausências distintas.

O glossário já assume que esta unidade existe e que a pilha mora nela: o termo `stack` tem
`plannedIn: 'linear.c2'` em `src/content/glossary.ts`. Ou seja, a decisão de empacotar
pilha aqui já foi tomada de fato, sem ter sido tomada de direito.

Três saídas, e a escolha é sua:

**A — Uma unidade, contrato `Lista`.** Pilha e fila entram como *restrições* da lista:
"o que sobra quando você só pode mexer numa ponta". Cabe no schema sem mudança. Custo: a
pilha deixa de ter contrato próprio, e o movimento "tudo que o contrato não promete é onde
ele falha" fica difuso — o `cannotAnswer` seria da lista, não da pilha.

**B — Três unidades: Lista, Pilha, Fila.** Cada uma com contrato próprio e o movimento
final intacto. Custo: pilha e fila viram unidades muito pequenas, com uma implementação e
meia cada, e a regra de duas implementações concorrentes (ADR-0011) fica forçada.

**C — Uma unidade com vários contratos, e o schema muda.** `adt` vira `adts`, e a banda
`contract` passa a ter um ciclo por contrato. Custo: mexe na espinha do ADR-0003, e o
mesmo problema volta em árvores (ver `docs/specs/trees.md`). Se for esta, é ADR próprio.

**Recomendo A**, e o motivo é o `cannotAnswer` da lista ser genuinamente forte: uma lista
não promete busca melhor que O(n), e é isso que motiva a unidade 4 inteira. Mas a decisão
tem consequência em árvores, então decida as duas juntas.

O resto deste spec assume A.

## Problema motivador

Uma fila de jobs em memória. Chegam eventos, um worker consome do começo. Alguém usou um
array e `remover(0)`, e com dez mil pendentes a fila começou a atrasar sem que a carga de
trabalho tivesse mudado.

O que o aluno já tem: sabe que array tem acesso O(1) por índice. O que ele não tem: saber
que remover do começo é O(n) *porque tudo que está à direita anda uma casa* — e que a
estrutura que resolve isso paga em outro lugar.

A pergunta que abre a unidade: **por que remover do começo custa diferente de remover do
fim?**

## Contrato

`Lista` — sequência de elementos em posições.

| operação | garantia |
|---|---|
| `obter(i)` | o elemento na posição i |
| `inserir(i, x)` | põe x na posição i; o que estava de i em diante anda uma casa |
| `remover(i)` | tira o elemento da posição i; o que estava à direita anda uma casa |
| `tamanho()` | quantos elementos há |

**Responde:** perguntas por posição.

**Não responde** — e esta é a resposta do último ciclo: onde está um valor (só varrendo);
se um valor existe, melhor que O(n); qual o menor; quais estão numa faixa. É exatamente o
que a unidade 4 vai prometer.

## Implementações comparadas

**Array dinâmico** — bloco contíguo com capacidade e crescimento por duplicação.
Invariante: os elementos ocupam as posições 0 a n−1 do bloco, sem buraco.
Custo: `obter` O(1); `inserir`/`remover` no fim O(1) amortizado; no começo O(n).
Errada quando: inserção e remoção acontecem no começo com frequência.
Âncora: é o `ArrayList`, o `Vec`, a `list` do Python. `append` barato e `insert(0, x)` caro
é a mesma assimetria que derrubou a fila do problema motivador.

**Lista ligada** — cada elemento aponta o próximo.
Invariante: seguindo `próximo` a partir da cabeça, chega-se a todos exatamente uma vez.
Custo: `obter(i)` O(n); inserir/remover **com o nó em mãos** O(1).
Errada quando: o acesso é por índice, ou quando n é grande e a varredura importa — cada
salto é uma falha de cache, e é por isso que ela perde na prática mais do que a tabela de
custos sugere.
Âncora: é o que uma LRU cache usa junto com uma tabela hash, e é por isso que ela consegue
mover um item para a frente sem varrer nada.

**Nota de honestidade que a unidade precisa carregar:** a tabela de custos favorece a lista
ligada em inserção, e na prática o array dinâmico ganha quase sempre. O motivo — localidade
de cache — não aparece em notação O. É o melhor exemplo da trilha inteira de por que
`assumptions` e `measuredIn` existem em `CostClaim`.

## Ciclos (proposta)

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | contrato | O que uma lista promete, e por posição | lista, posição |
| c1 | implementação | Array dinâmico e o custo de andar uma casa | array dinâmico, capacidade |
| c2 | implementação | Pilha: o que sobra quando só uma ponta é acessível | pilha |
| c3 | implementação | Fila, e por que ela não é a pilha ao contrário | fila |
| c4 | implementação | Lista ligada e o ponteiro em mãos | lista ligada, nó |
| c5 | custo | A tabela de custos mente: localidade de cache | localidade de cache |
| c6 | custo | Quando a lista é a escolha errada | *(a definir)* |

**A DEFINIR** — c2 e c3 na banda `implementation` é um desvio: pilha e fila não são
implementações da lista, são restrições dela. A banda existe para "como se entrega o
contrato". Se ficarem em `contract`, a checagem `espinha` reprova (a banda do meio exige
`elaborates`). Isso é evidência a favor da saída C lá em cima.

## Armadilhas conhecidas

- `insercao-no-comeco-e-barata` — a que o problema motivador ativa
- `lista-ligada-e-sempre-melhor` — a tabela de custos lida sem `assumptions`
- `capacidade-e-tamanho` — confundir o bloco alocado com os elementos presentes
- `pilha-e-fila-invertidas` — supor que basta ler ao contrário
- `ponteiro-em-maos` — supor que remover de uma lista ligada é O(1) *sem já ter o nó*

A última é a mais valiosa e a menos óbvia: "remoção é O(1)" é verdade só depois que alguém
pagou O(n) para achar o nó. É o mesmo tipo de omissão que `sem-hipoteses` na unidade 2.

**A DEFINIR** — sua leitura de quais o aluno erra.

## Critério de domínio (proposta)

Diante de um trecho que usa uma coleção linear: nomear qual implementação o custo observado
denuncia, apontar a operação dominante, e construir a carga de trabalho que inverte a
escolha entre array e lista ligada.

## Perguntas em aberto

1. **A saída A, B ou C do conflito lá em cima.** É a decisão que trava o spec.
2. **`stack` já tem `plannedIn: 'linear.c2'` no glossário.** Se a saída for B, esse valor
   muda de unidade. Se for A, `c2` precisa mesmo introduzir `stack`, e a proposta acima faz
   isso — mas por coincidência, não por decisão.
3. **Localidade de cache é conteúdo desta unidade ou da unidade 2?** Ela é um argumento
   sobre hipóteses de custo, e a unidade 2 é sobre isso. Aqui ela tem o exemplo concreto.
4. **Deque entra?** Ele resolve o problema motivador melhor que as duas, e não está no
   escopo declarado em `docs/discovery/00-problema.md`.
