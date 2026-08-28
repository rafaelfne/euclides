# Euclides — contrato do projeto

Trilha de fundamentos de computação para um desenvolvedor júnior reconstruir base
técnica com um fim explícito: **julgar código gerado por IA sem executá-lo**.

O nome é o método. Nos *Elementos*, nada é assumido que não esteja declarado. Aqui
vale igual: complexidade não existe sem regime e hipóteses, termo não existe sem o
que ele não é, notação não existe sem sua convenção.

## Princípios inegociáveis

1. **Agnóstico a linguagem.** Conceitos em pseudocódigo, diagramas e invariantes. A
   implementação é exercício, não é o conteúdo.
2. **Prática deliberada acima de consumo.** Toda unidade termina em exercício com
   critério objetivo de verificação.
3. **Nunca entregue a resposta de um exercício.** Aponte onde o raciocínio quebrou e
   faça a pergunta que leva à correção.
4. **Complexidade sempre.** Para cada estrutura: custo de tempo, custo de espaço, e o
   cenário em que aquela escolha é a errada.
5. **Do concreto ao abstrato.** Primeiro o problema que a estrutura resolve, depois a
   estrutura.
6. **Ancorar no cotidiano.** Ligue o conceito a algo do trabalho real: consulta lenta,
   cache, fila, índice.
7. **Honestidade de nível.** Se uma resposta está superficial, diga. Elogio vago
   atrapalha o objetivo desta trilha.

## As regras operacionais

**O validador é a autoridade, não o seu julgamento.** `npm run validate` roda antes de
todo build e são onze checagens. Não há nível de aviso — aviso é regra que ninguém
cumpre. Se o validador reprova, o conteúdo está errado; não relaxe a checagem.

**Terminologia: a forma canônica é a que o aluno vai encontrar no mundo.** Documentação,
código-fonte, Stack Overflow. O glossário em `src/content/glossary.ts` arbitra cada caso
uma vez. Nunca invente um termo; se precisar de uma palavra que não está lá, registre-a
com `isNot` e ponto de introdução antes de usá-la.

**Fronteira de idioma:**

| camada | idioma | exemplo |
|---|---|---|
| código, rotas, identificadores | inglês | `ExecutionTrace`, `/units/hash` |
| conteúdo autorado | pt-BR | enunciados, prosa, rubricas |
| pseudocódigo | pt-BR | `inserir(tabela, chave, valor)` |
| código do sandbox | inglês | `insert(table, key, value)` |

Valor de enum é código; rótulo de tela é conteúdo. Nunca renderize um enum direto.

**Nenhuma devolutiva contém a resposta.** Ela contém a *tarefa que produz* a resposta.
`buildFeedback` em `src/lib/socratic.ts` tem três degraus e nenhum revela o valor
correto. Não adicione um quarto degrau.

## Como o conteúdo nasce

Fluxo híbrido, decidido em ADR-0010:

1. O design pedagógico de cada unidade é discutido fora do repo e vira um **spec**
   versionado em `docs/specs/`.
2. Dentro do repo, `/implement-unit <id>` escreve conteúdo, exercícios e implementação
   de referência **contra aquele spec**.
3. `/audit-unit <id>` audita terminologia, carga cognitiva e cobertura de armadilhas.

Não invente escopo de unidade sem spec. Se o spec estiver incompleto, diga o que falta
em vez de preencher a lacuna sozinho.

## Onde as coisas moram

```
src/content/schema.ts        content model em zod — o contrato pedagógico
src/content/glossary.ts      termos canônicos, com isNot e falsos amigos
src/content/units/<id>/      conteúdo de uma unidade
src/lib/socratic.ts          divergência de traço e a escada de três degraus
src/lib/reference/           implementações que GERAM o gabarito (nunca digitado)
src/lib/pseudocode.ts        tokenizador semântico do pseudocódigo
scripts/validate-content.ts  o validador pedagógico
docs/discovery/              por que este projeto existe e como ele pensa
docs/adr/                    as decisões, com as alternativas descartadas
docs/authoring/              o procedimento de autoria que os agentes seguem
docs/specs/                  o spec de cada unidade, insumo de /implement-unit
```

## Como este projeto costuma ser quebrado

Quatro derivas reais observadas durante o desenho. Elas se repetem; leia antes de
escrever conteúdo.

1. **Bilinguismo sem regra.** Um mesmo documento com "encadeamento" e "chaining".
   Escolha pelo glossário, nunca pela intuição da frase.
2. **Armadilha declarada e nunca exercitada.** Uma misconception no catálogo sem
   exercício que a ative é conteúdo morto — e o validador reprova.
3. **Substantivo abstrato no lugar de operação.** "Promete presença e recuperação" no
   lugar de `contém(chave)` e `obter(chave)`. Soa preciso e não é. A lista de palavras
   proibidas está em `src/content/vocabulary.ts`; para usar uma, registre-a.
4. **Enum em inglês vazando para a tela.** `BANDA · IMPLEMENTATION`. Todo enum
   renderizado precisa de mapa de rótulos exaustivo por tipo.

## Comandos

```
npm run dev        desenvolvimento
npm run validate   só o validador pedagógico
npm run typecheck  tsc --strict
npm test           implementação de referência e motor socrático
npm run build      validador + export estático em out/
```

## O que este projeto não é

Não é preparação para entrevista de big tech, não é curso de linguagem, não é revisão
de faculdade. Não use ferramenta de IA como atalho para um exercício, e não sugira isso
ao aluno. Não invente bibliografia, autor, capítulo ou link — se não tiver certeza da
fonte, diga que precisa ser verificada.
