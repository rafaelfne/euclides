# ADR-0016: A rampa de entrada é mecanizada onde dá, e declarada onde não dá

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

Uma leitura do app inteiro na pele de quem está começando encontrou um padrão que os
princípios não previam. O conteúdo é denso e correto; o que falta é **rampa** — e a frase
que resume o achado é dura o bastante para ficar registrada:

> o que falta não é mais material — é a rampa de acesso, e a correção do desenho dos
> exercícios, que hoje permite acertar tudo sem aprender nada.

Dois defeitos dessa leitura eram fatais para a tese do projeto, e os dois foram medidos
antes de corrigidos:

1. **A alternativa correta era a primeira em 54 de 54 exercícios**, e a mais longa em 50.
   O painel de lacunas mede se o aluno aprendeu; um exercício que se acerta pelo formato
   zera esse sinal.
2. **Os oito exercícios de caça ao defeito nunca mostraram o código.** `kind: 'bug'` era
   roteado para o componente de escolha; `code` e `faultyLines` eram dados obrigatórios que
   nenhuma tela lia, desde o scaffold.

O segundo é o mais instrutivo: o validador checa o dado, não a renderização, e é a segunda
vez nesta linha do tempo que um defeito mora exatamente nessa fresta.

## Decisão

**Toda peça da rampa que puder ser cobrada por checagem vira checagem.** O ADR-0006 já
tinha dito que aviso é regra que ninguém cumpre; aqui o mesmo argumento se aplica a
conteúdo pedagógico, e não só a consistência de dados.

Quatro checagens novas, e cada uma nasceu de um defeito medido:

| checagem | cobra | nasceu de |
|---|---|---|
| `equilíbrio` | a correta não é a mais longa | 50 de 54 exercícios |
| `exemplo` | toda técnica estreia com exemplo trabalhado | 15 de 19 estreias sem |
| `ênfase` | asterisco emparelhado, e só na prosa do ciclo | `**assim**` literal em 5 unidades |
| `formato` | placeholder em coluna editável, e nunca um valor do gabarito | traço sem formato declarado |

A ordem das alternativas passou a ser embaralhada por id do exercício — determinística, para
o export estático bater com o cliente e para o aluno não rerrolar até reconhecer uma
disposição. A justificativa da correta saiu do texto dela e virou `why`, revelado depois de
resolver: conserta o viés de comprimento e o fato de o acerto não ensinar nada, de uma vez.

**O que não dá para mecanizar fica declarado como dívida, não como pendência vaga.** A
rampa tem partes que são julgamento pedagógico — quanto de tradução em linguagem chã, quanto
de tom, quantas visualizações — e essas não ganham checagem. Elas ficam nas Consequências
abaixo, com nome.

## Opções consideradas

### A — Corrigir os defeitos e seguir
**Descartada.** Os três defeitos de formato (posição, comprimento, exemplo ausente) são o
tipo que volta na próxima unidade escrita, porque nenhum autor os percebe enquanto escreve.
Corrigir sem mecanizar é pagar duas vezes.

### B — Checagem com tolerância estatística
Reprovar quando *a maioria* dos exercícios de uma unidade tem a correta mais longa.
**Descartada:** é nível de aviso disfarçado de número. Ou a alternativa se denuncia pelo
formato, ou não.

### C — Mecanizar o que é exato, declarar o resto
Adotada.

### D — Também mecanizar a rampa textual
Exigir um bloco "em outras palavras" por ciclo, ou um teto de densidade aforística.
**Descartada por ora.** Nenhuma das duas é verificável sem julgamento, e uma checagem que
depende de julgamento é a porta pela qual o nível de aviso volta. Fica no `/audit-unit`.

## Análise de trade-off

O custo é atrito na autoria: escrever uma unidade agora exige um exemplo trabalhado por
técnica, e exige balancear o comprimento das alternativas. As duas coisas são trabalho real
e as duas são o produto.

O risco é o inverso do ADR-0006: mecanizar demais, e empurrar o autor a satisfazer a
checagem em vez do aluno. Um exemplo trabalhado escrito para passar no `exemplo` é conteúdo
morto do mesmo jeito que uma armadilha nunca cometida. **Nenhuma dessas quatro checagens
sabe se a peça é boa** — só que ela existe.

## Consequências

- **Fica mais fácil:** confiar que o sinal do painel de lacunas mede aprendizado, e não
  habilidade de reconhecer o formato da alternativa certa.
- **Fica mais difícil:** escrever uma unidade. São 21 checagens.
- **Fica exposto:** o validador continua cego a renderização. `code` e `faultyLines` foram
  obrigatórios e ignorados por muito tempo, e a mesma coisa pode acontecer com qualquer
  campo novo. `scripts/test-traces.ts` é a resposta parcial, e ela cobre só traço.
- **Dívida declarada, sem checagem:** a rampa textual continua faltando — "como funciona"
  na primeira visita, tradução em linguagem cotidiana por ciclo, estimativa de duração,
  visualizações nos cinco pontos em que uma imagem faz o trabalho de três parágrafos, e a
  alternância entre pseudocódigo e linguagem real. Nenhuma delas é bug; todas são produto.
- **A observar, e agora decidido:** a severidade do tom. O princípio 7 é inegociável e não
  é o mesmo que ausência de acolhimento. A fronteira ficou no ADR-0018: acolhimento é
  afirmação verificável sobre dado que o app já tem, ou não entra.

## Itens de ação

1. [x] `equilíbrio`, `exemplo`, `ênfase` e `formato` no validador
2. [x] Alternativas embaralhadas por id; justificativa em `why`, revelada ao resolver
3. [x] `BugExercise` com código, medianiz e linha clicável
4. [x] `/glossary` e `/traps`, sobre o dado que já existia
5. [ ] Decidir a rampa textual — é produto, e não entra por checagem
