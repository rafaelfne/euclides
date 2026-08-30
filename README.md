# Euclides

Euclides é uma trilha de fundamentos de computação para quem quer reconstruir a
base técnica e julgar código gerado por IA sem executá-lo.

O conteúdo parte de problemas concretos e chega à abstração. Cada ciclo combina
uma explicação curta, um exemplo trabalhado, uma figura visual e um exercício que
produz uma evidência verificável. O app não mede leitura nem tempo de tela: uma
unidade só avança quando o raciocínio aparece no exercício.

## O que existe

- 8 unidades, 62 ciclos, 62 exercícios e 52 armadilhas catalogadas.
- Pseudocódigo em português como forma canônica; TypeScript aparece quando pode ser
  derivado sem criar uma segunda fonte de verdade.
- Figuras interativas com a mesma linguagem visual: execução passo a passo,
  estruturas lineares, hashing, grafos, árvores, ordenação e crescimento assintótico.
- Modo **Guiado** para ver contexto e exemplos abertos, e modo **Conciso** para
  revisar o núcleo do conceito.
- Busca rápida por termo, ciclo, armadilha ou tela com `⌘K` no macOS e `Ctrl+K` no
  Windows/Linux.
- Progresso salvo apenas neste navegador, sem conta, servidor, banco ou coleta de
  dados.
- Painéis de lacunas, armadilhas e revisitas. Exercícios resolvidos também podem
  receber uma frase de revisão para levar a uma revisão de código com um assistente
  de IA.

## Comece pelo app

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A página inicial leva à unidade
01; a [sondagem](/sondagem/) oferece seis perguntas opcionais para recomendar por
onde começar.

Rotas principais:

| rota | propósito |
|---|---|
| `/` | início da trilha e retomada |
| `/como-funciona/` | método de estudo e convenções |
| `/sondagem/` | nivelamento opcional |
| `/units/[unit]/` | mapa de uma unidade |
| `/units/[unit]/cycles/[cycle]` | leitura, figura e exercício de um ciclo |
| `/glossary/` | termos canônicos, falsos amigos e definições |
| `/traps/` | caderno de armadilhas ativadas |
| `/revisitas/` | exercícios que venceram o intervalo de revisão |
| `/gaps/` | lacunas e exportação de uma sessão para um assistente de IA |
| `/perfil/` | preferências, progresso, exportação e recomeço |

## Como o método funciona

1. Um caso do trabalho apresenta o problema.
2. A pessoa observa uma figura ou exemplo e prevê o próximo estado quando isso é
   parte do argumento.
3. O exercício pede uma tabela, uma escolha justificada ou a linha onde o código
   quebra.
4. Se uma resposta ativa uma armadilha, o app aponta onde o raciocínio divergiu e
   faz uma pergunta menor. Ele nunca revela a alternativa correta como devolutiva.
5. Uma resolução de primeira tentativa conta para domínio; uma revisita limpa,
   depois do intervalo, conta para consolidação.

## Arquitetura

O projeto é um export estático do Next.js (`output: 'export'`). Não há API, função
serverless, banco, autenticação ou LLM em runtime. O progresso é mantido no
navegador e pode ser exportado manualmente pelo perfil ou pelo painel de lacunas.

O conteúdo autorado é a fonte de verdade. As figuras recebem dados declarados pelo
ciclo e os componentes derivam a representação visual. Os traces de referência são
gerados por implementações registradas, e o feedback socrático é produzido pelo
motor a partir do catálogo de armadilhas.

Arquivos de entrada mais importantes:

```text
src/content/schema.ts             modelo das unidades, ciclos e figuras
src/content/index.ts              registro das unidades
src/content/glossary.ts           vocabulário canônico
src/content/units/<id>/           conteúdo e exercícios de cada unidade
src/lib/validate.ts               checagens pedagógicas chamáveis
src/lib/reference/                geradores dos traces de referência
src/lib/socratic.ts               três degraus de devolutiva
src/components/                  telas, figuras e primitivas visuais
docs/specs/                       specs versionados das unidades
docs/adr/                         decisões arquiteturais
```

## Qualidade e comandos

O validador pedagógico é a autoridade do conteúdo. Ele confere registro, schema,
exercícios, armadilhas, carga cognitiva, terminologia, convenções, traces,
traduções, figuras, cobertura e fechamento do incidente de cada unidade. A lista
viva está em `CHECKS`, no topo de `scripts/validate-content.ts`.

```bash
npm run dev         # servidor de desenvolvimento
npm run validate    # gate pedagógico
npm run docs:check  # caminhos citados na documentação
npm run typecheck   # TypeScript em modo strict
npm test            # suítes em scripts/test-*.ts
npm run build       # validação + checagem de docs + export em out/
```

O build não deve rodar ao mesmo tempo que o servidor de desenvolvimento, porque
ambos usam o cache do Next.js. Pare o servidor antes de executar `npm run build`.

## Autoria e documentação

O design pedagógico nasce em `docs/specs/`, passa pelo fluxo de implementação e é
auditado contra terminologia, armadilhas e carga cognitiva. As decisões que não
devem ser refeitas por preferência visual estão em `docs/adr/`. O contrato completo
do projeto e o mapa dos arquivos estão em [`CLAUDE.md`](CLAUDE.md); as instruções
para agentes e ferramentas locais ficam em [`AGENTS.md`](AGENTS.md).

## Fronteira de idioma

| camada | idioma |
|---|---|
| código, rotas e identificadores | inglês |
| conteúdo autorado e pseudocódigo | pt-BR |
| código do sandbox | inglês |
