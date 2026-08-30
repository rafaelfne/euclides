# Estado do Euclides em 30/08/2026

Arquivo de passagem para abrir sessão nova. Descreve o que existe, o que está aberto e as
decisões que não devem ser refeitas sem motivo.

## Onde o trabalho está

`main` contém todo o trabalho anterior, até `0eda143`. Esta nova etapa está na branch
`codex/rampa-cotidiana`. Os dois arquivos locais `.codex/` e `AGENTS.md` não pertencem ao
repositório e devem continuar fora do controle de versão.

O gate passa inteiro: `npm run validate` (31 checagens), `npm run docs:check`,
`npm run typecheck`, `npm test` (13 suítes), `npm run build` (82 páginas).

**O build derruba o servidor de desenvolvimento.** Existe um guard que recusa `npm run build`
com a porta 3000 ocupada, porque rodar os dois ao mesmo tempo corrompe o cache do Next. Pare
o dev antes e avise antes de parar.

## O que existe

8 unidades, 62 ciclos, 62 exercícios, 52 armadilhas, 100 termos no glossário, 11 figuras.
Todo ciclo tem frase de abertura, número concreto na abertura e exemplo trabalhado.

Rotas: `/`, `/como-funciona`, `/sondagem`, `/perfil`, `/revisitas`, `/traps`, `/glossary`,
`/gaps`, `/units/[unit]`, `/units/[unit]/cycles/[cycle]`.

Nenhuma dependência de desenho. `@xyflow/react` e `dagre` entraram e saíram no mesmo dia:
as duas figuras de grafo que iam justificar os 78 KB nasceram sem tocar neles, e a árvore de
recursão foi reescrita em SVG. As 11 figuras são SVG inline.

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
marca d'água do React Flow, autorizada e depois cancelada. A segunda deixou de existir quando
o React Flow saiu (ADR-0025).

## O que está aberto

### Precisa de você, e não dá para delegar

**Eu escrevi as 52 armadilhas a partir de erros que aparecem em livro e em fórum. Ninguém
observou uma pessoa usando este app e errando.** Elas são previsões minhas.

Isso tem duas consequências que ninguém consegue ver de dentro do app. Uma armadilha que
ninguém comete ocupa um exercício sem medir nada. E um erro que alguém comete e não está no
catálogo não é registrado em lugar nenhum: o painel de lacunas não mostra, e o app não sabe.

Está aberto no ADR-0018 (a fronteira do tom) e no ADR-0019 (a rampa medida). Nenhuma das 31
checagens alcança isso: elas conferem que a armadilha está bem escrita e é exercitada, não
que alguém a comete.

Ofereci construir o instrumento para levantar isso — um registro por exercício do que foi
respondido e em qual tentativa, exportável — e a oferta segue de pé.

### O que fechou em 29/08/2026

As três checagens de ponto cego: `acesa` confere `lineByColumn` contra o pseudocódigo do
ciclo (ADR-0026), `realce` confere a linguagem do exercício de defeito contra o registro de
tokenizadores (ADR-0028), e podar `revisits` foi fechado por medição — são 31 anos de uso
até 1 MB, e podar sem mentir exigiria migração de schema (ADR-0023).

As cinco figuras da lista, e uma delas já existia: a cadeia da tabela hash sempre foi
animada chave a chave. As outras quatro são `rotation` em `trees.c3`, `visited` em
`graphs.c4`, `insertion` em `sorting.c2`, e o controle de n no gráfico de crescimento de
`asymptotics.c1`.

A reoferta da sondagem, que vence por progresso e nunca por data, e mora só no `/perfil`
(ADR-0022). E a regra de cada faixa passou a dizer capacidade, com o checklist em campo
próprio.

### O que fechou em 30/08/2026

Todo ciclo agora tem uma tradução em linguagem cotidiana, exibida só no modo Iniciante entre
a frase de abertura e a prosa canônica. São 62 textos; o ADR-0016 registra que essa é uma
decisão de produto e que a qualidade deles continua dependendo de revisão pedagógica, não de
checagem automática.

### Itens que dependem de uso, não de código

Remedir a direção visual depois de um mês escrevendo conteúdo nela (ADR-0015), e revisar os
intervalos de revisita de 3, 10 e 30 dias depois de alguém passar por eles algumas vezes
(ADR-0024). Os números foram escolhidos sem evidência de que 3, 10 e 30 sejam melhores que
outros três. Os dois esperam alguém usar o app, não trabalho meu.

## Vocabulário de trabalho

`deriva`, `espinha`, `degrau`, `gate` e `sonda` vieram do scaffold e do `CLAUDE.md` original,
então são do projeto e podem ser usados. Evite palavras criadas para explicar o projeto:
`andaime` virou scaffold, `amarração` virou conferência e `fresta` virou ponto cego. Prefira
uma descrição concreta a metáforas para falhas ou checagens.

## Onde ler mais

`CLAUDE.md` tem o contrato do projeto e o mapa dos arquivos. `docs/adr/README.md` tem as 29
decisões com o motivo de cada uma. `docs/specs/` tem o design pedagógico de cada unidade, que
é o insumo de `/implement-unit`.
