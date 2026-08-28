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
motor revela onde o raciocínio quebrou em três degraus sem nunca revelar o valor.

## O validador pedagógico

`npm run build` roda `npm run validate` antes do `next build`. Onze checagens,
cada uma um princípio do projeto virado em erro de compilação:

| checagem | o que protege |
|---|---|
| schema | o content model inteiro |
| distractor | toda alternativa errada nomeia uma ideia errada existente |
| órfã | nenhuma ideia errada é declarada e não exercitada |
| socrática | toda pergunta termina em `?` — é pergunta, não explicação |
| carga | nenhum ciclo passa de 4 termos novos |
| espinha | todo ciclo declara sua banda e a unidade abre pelo contrato |
| custo | toda implementação declara custo de toda operação do contrato |
| vocabulário | nenhuma abstração vaga fora do glossário |
| convenção | todo pseudocódigo respeita a folha de notação |
| referência | todo traço é gerado por implementação que roda |
| glossário | ids únicos e pontos de introdução válidos |

Não há nível de aviso. Um aviso é uma regra que ninguém cumpre.

## Fronteira de idioma

| camada | idioma |
|---|---|
| código e rotas | inglês |
| conteúdo autorado | pt-BR |
| pseudocódigo | pt-BR |
| código do sandbox | inglês |

## Comandos

```
npm run dev        desenvolvimento
npm run validate   só o validador pedagógico
npm run typecheck  tsc --strict
npm test           implementação de referência e motor socrático
npm run build      validador + export estático em out/
```
