# Estado do Euclides em 29/08/2026

Arquivo de passagem para abrir sessão nova. Descreve o que existe, o que está aberto e as
decisões que não devem ser refeitas sem motivo.

## Onde o trabalho está

Branch `claude/repo-onboarding-validation-1524ca`, **37 commits à frente de `main`**, nada
mesclado. Um arquivo fora do controle de versão de propósito: `PERGUNTAS-DE-ONBOARDING.md`,
que foi o handoff de onboarding e nunca teve destino decidido.

O gate passa inteiro: `npm run validate` (29 checagens), `npm run docs:check`,
`npm run typecheck`, `npm test` (13 suítes), `npm run build` (82 páginas).

**O build derruba o servidor de desenvolvimento.** Existe um guard que recusa `npm run build`
com a porta 3000 ocupada, porque rodar os dois ao mesmo tempo corrompe o cache do Next. Pare
o dev antes e avise antes de parar.

## O que existe

8 unidades, 62 ciclos, 62 exercícios, 52 armadilhas, 100 termos no glossário, 8 figuras.
Todo ciclo tem frase de abertura, número concreto na abertura e exemplo trabalhado.

Rotas: `/`, `/como-funciona`, `/sondagem`, `/perfil`, `/revisitas`, `/traps`, `/glossary`,
`/gaps`, `/units/[unit]`, `/units/[unit]/cycles/[cycle]`.

Duas dependências entraram nesta sessão e as duas foram autorizadas: `@xyflow/react` e
`dagre`, 78 KB gzip juntas, carregadas por `dynamic` sem SSR e usadas por **uma figura só**
— a árvore de recursão. Se nenhuma segunda figura de grafo nascer, vale reabrir a decisão e
escrever o layout à mão.

## Decisões que não devem ser refeitas

Estão nos ADRs, e o `docs/adr/README.md` tem a tabela com o motivo de cada uma em uma linha.
As que mais restringem trabalho novo:

O validador é a autoridade, sem nível de aviso (ADR-0006, o gate). Figura é dado declarado e
o componente desenha (ADR-0017). Acolhimento só entra como afirmação verificável sobre dado
que o app já tem (ADR-0018). Nenhum número do aluno pode subir por insistência, tempo de
tela ou leitura (ADR-0022 e ADR-0023). A versão em TypeScript é derivada do pseudocódigo,
nunca escrita ao lado (ADR-0019 e ADR-0025).

Duas foram revertidas dentro da própria sessão, e a reversão está escrita nos dois ADRs:
o alternador Iniciante/Revisão, descartado no ADR-0019 e adotado no ADR-0027; e a remoção da
marca d'água do React Flow, autorizada e depois cancelada — **a atribuição fica**, porque
removê-la exige assinatura Pro.

## O que está aberto

### Precisa de você, e não dá para delegar

**As 52 armadilhas são candidatas de campo, não observação de um aluno real.** Eu as escrevi
a partir de erros comuns na literatura; nenhuma veio de ver alguém errando. O painel de
lacunas mede exatamente o que o catálogo descreve, então se o catálogo descreve os erros
errados, ele mede bem a coisa errada. Aparece como item aberto no ADR-0018 e no ADR-0019, e
nenhuma das 29 checagens toca nisso.

Ofereci construir o instrumento para levantar isso — um registro por exercício do que foi
respondido e em qual tentativa, exportável — e a oferta segue de pé.

### Trabalho que eu faria a seguir

**Três checagens que fecham pontos cegos conhecidos.** Meia hora ao todo, cada uma impede um
erro silencioso: `lineByColumn` conferido contra o número de linhas do pseudocódigo, porque
hoje uma linha renumerada deixa o painel de execução acendendo a errada (ADR-0026); exercício
de defeito em linguagem sem tokenizador, que sai com realce errado (ADR-0028); e podar
`revisits`, que cresce sem limite (ADR-0023).

**Cinco figuras da lista original.** Rotação em `trees.c3`, ciclo sem visitados em
`graphs.c4`, a cadeia da tabela hash animada, insertion sort em `sorting.c2`, e o controle
deslizante de n em `asymptotics.c1`. As duas primeiras são as que justificariam o peso do
React Flow.

**Reofertar a sondagem** quando o progresso mudar muito depois dela. Hoje `placement` é
escrito uma vez e nunca revisto (ADR-0022).

**Traduzir cada ciclo em linguagem cotidiana**, que é o que sobrou da rampa do ADR-0016. É
julgamento pedagógico e não entra por checagem.

### Itens que dependem de uso, não de código

Remedir a direção visual depois de um mês de conteúdo novo (ADR-0015) e revisar os intervalos
de revisita de 3, 10 e 30 dias quando houver uso real para olhar (ADR-0024). Os dois estão
parados esperando gente usar o app, não trabalho meu.

## Duas coisas sobre como eu escrevo

O output style **Direto** foi reescrito hoje e está em `~/.claude/output-styles/direto.md`.
A sessão nova carrega a versão nova limpa; nesta ele foi lido e seguido como instrução de
mensagem, convivendo com a versão antiga que já estava no system prompt.

E há uma correção de vocabulário que vale carregar. Eu vinha inventando termo e usando como
se fosse vocabulário estabelecido. Medi e separei: `deriva`, `espinha`, `degrau`, `gate` e
`sonda` vieram do scaffold e do `CLAUDE.md` original, então são do projeto e devem ser
usados. O que era invenção minha foi trocado — `andaime` virou scaffold, `amarração` virou
conferência, `fresta` virou ponto cego. E "a checagem morde", que eu escrevia em conversa,
foi cortado por soar estranho em vez de preciso.

## Onde ler mais

`CLAUDE.md` tem o contrato do projeto e o mapa dos arquivos. `docs/adr/README.md` tem as 29
decisões com o motivo de cada uma. `docs/specs/` tem o design pedagógico de cada unidade, que
é o insumo de `/implement-unit`.
