# Euclides

Trilha de fundamentos de computação para reconstruir base técnica com um fim
explícito: julgar código gerado por IA sem executá-lo.

O nome é o princípio de design. Nos *Elementos*, nada é assumido que não esteja
declarado — e aqui a mesma regra vale no código: complexidade não existe sem
regime e hipóteses, termo não existe sem o que ele não é, notação não existe sem
sua convenção.

## Arquitetura

Export estático puro (`output: 'export'`). Sem servidor, sem função serverless,
sem banco, sem auth. Custo marginal por leitor: zero — que é a condição para
publicar.

Não há LLM em runtime. A correção socrática é **antecipação em tempo de
autoria**: as ideias erradas são catalogadas, cada distractor aponta uma, e o
motor revela onde o raciocínio quebrou em três degraus sem nunca revelar o valor — e,
esgotada a escalada da armadilha, encerra o exercício em vez de repetir a última dica.

## O validador pedagógico

`npm run build` roda `npm run validate` antes do `next build`. Cada checagem é um
princípio do projeto virado em erro de compilação:

| checagem | o que protege |
|---|---|
| registro | existe unidade registrada, e o gate lê o mesmo registro que o app |
| schema | o content model inteiro |
| distractor | toda alternativa errada nomeia uma ideia errada existente |
| órfã | nenhuma ideia errada é declarada e não exercitada |
| socrática | toda pergunta termina em `?` — é pergunta, não explicação |
| carga | nenhum ciclo passa de 4 termos novos |
| exercício | todo ciclo tem exercício, e todo exercício fecha um ciclo |
| domínio | o critério de domínio referencia exercícios que existem |
| revisão | toda ideia errada aponta um ciclo de revisão que existe |
| espinha | a banda pertence ao kind da unidade, e a unidade abre pela banda de abertura |
| custo | toda implementação declara custo de toda operação do contrato |
| cobertura | toda parte do critério é produzida por alguma técnica |
| vocabulário | nenhuma abstração vaga fora do glossário |
| convenção | todo pseudocódigo respeita a folha de notação |
| referência | todo traço é gerado por implementação que roda, da própria unidade |
| glossário | ids únicos, e a introdução de um termo declarada dos dois lados |
| sobrecarga | todo termo sobrecarregado declara seus falsos amigos |

A lista viva é `CHECKS`, no topo de `scripts/validate-content.ts`; o relatório é derivado
dela, e por isso esta tabela não traz um total — o número na prosa foi a primeira coisa a
ficar desatualizada. Não há nível de aviso. Um aviso é uma regra que ninguém cumpre.

`npm run docs:check` é o gate irmão, para o que fica fora de `src/content/`: todo caminho
de arquivo citado em `docs/` e `.claude/` precisa existir. Ver ADR-0011.

## A ponte com o Claude

O progresso mora no navegador (ADR-0009). O painel de lacunas em `/gaps` mostra o que está
aberto sem percentual nenhum — resolver em quatro tentativas e resolver na primeira são
coisas diferentes — e copia um markdown para colar num projeto do Claude.

O que ele carrega: tentativas, o que saiu limpo, as armadilhas que dispararam e a pergunta
que cada uma já fez na tela. O que ele nunca carrega: uma entrada de `escalation` não
alcançada, ou o texto de uma alternativa correta. O princípio 3 não deixa de valer porque
o texto saiu do app, e o teste do export checa as duas ausências.

## Fronteira de idioma

| camada | idioma |
|---|---|
| código e rotas | inglês |
| conteúdo autorado | pt-BR |
| pseudocódigo | pt-BR |
| código do sandbox | inglês |

## Comandos

```
npm run dev         desenvolvimento
npm run validate    só o validador pedagógico
npm run docs:check  caminhos citados em docs/ e .claude/
npm run typecheck   tsc --strict
npm test            todas as suítes em scripts/test-*.ts
npm run build       validador + docs:check + export estático em out/
```
