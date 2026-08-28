# Specs do primeiro módulo

O escopo está em `docs/discovery/00-problema.md`, numa linha. Aqui ele está aberto em oito
specs. Um está implementado; sete estão escritos até onde dava para sustentar, com
`A DEFINIR` em cada ponto que depende de decisão pedagógica ainda não tomada — que é o que
`.claude/commands/new-spec.md` manda fazer.

| # | spec | kind | status |
|---|---|---|---|
| 1 | [tracing](tracing.md) — Lógica e teste de mesa | `method` | spec |
| 2 | [asymptotics](asymptotics.md) — Análise assintótica | `method` | spec |
| 3 | [linear](linear.md) — Estruturas lineares | `structure` | spec, **bloqueado** |
| 4 | [hash](hash.md) — Tabelas hash | `structure` | implementada |
| 5 | [trees](trees.md) — Árvores | `structure` | spec, **bloqueado** |
| 6 | [graphs](graphs.md) — Grafos | `structure` | spec |
| 7 | [sorting](sorting.md) — Ordenação e busca | `structure` | implementada |
| 8 | [synthesis](synthesis.md) — Síntese | `method` *(a confirmar)* | spec |

## As três decisões que travam a escrita

**1. Um contrato por unidade, e duas unidades com mais de um.** O schema permite um `adt`
por unidade. "Estruturas lineares" nomeia Lista, Pilha e Fila; "Árvores" carrega árvore de
busca e heap, que implementam contratos diferentes. Cada spec lista as saídas e recomenda
uma; as duas decisões são a mesma e devem ser tomadas juntas. Se a saída for mudar o
schema, é ADR próprio — é mexer na espinha do ADR-0003.

O glossário já assume as duas: `stack` tem `plannedIn: 'linear.c2'` e `heap` tem
`plannedIn: 'trees.c4'`. A decisão foi tomada de fato e não de direito.

**2. Onde moram algoritmos escritos *sobre* um contrato.** Em grafos, busca em largura e em
profundidade não são operações do TAD nem implementações dele — e são o conteúdo da unidade.
É a primeira vez que o valor não está nas implementações concorrentes. Pode ser informação
sobre o modelo, não só sobre a unidade.

**3. Se `kind: 'method'` cabe na síntese.** O ADR-0012 classificou por eliminação e mandou
observar. O spec 8 tenta fazer caber e diz onde estica.

## O que muda em quem já está escrito

A unidade 4 foi escrita primeiro de propósito e depende das unidades 1 e 2. Três termos —
`pior caso`, `caso médio`, `amortizado` — estão no glossário com `introducedIn` apontando
ciclos de hash, e passam a nascer na unidade 2. Trocar os valores é mecânico e a checagem
`glossário` reprova até que os dois lados concordem; decidir que hash passa a *usar* termo
introduzido depois dela é editorial.

## O que estes specs não são

Não são conteúdo, e nenhum deles autoriza `/implement-unit` como está. Um spec com
`A DEFINIR` no catálogo de armadilhas produz, se implementado assim, distractor plausível e
pedagogicamente vazio — exatamente o que o validador não consegue pegar, porque a checagem
`órfã` confere que a armadilha é exercitada e não que ela é real.

O catálogo de armadilhas é antecipação em tempo de autoria (ADR-0002): ele vale pelo que
você já viu um aluno errar. As listas nestes specs são candidatas conhecidas da área, não
observação — e a diferença entre as duas coisas é a tese do projeto.
