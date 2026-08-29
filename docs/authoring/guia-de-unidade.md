# Guia de autoria de unidade

O procedimento que `/implement-unit` executa e que os agentes em `.claude/agents/`
seguem. Leia `../discovery/01-principios.md` antes.

## Ordem, e por que ela é essa

**Exercícios antes do conteúdo.** O instinto é escrever a prosa e depois pensar em como
avaliar. Invertido de propósito: a prosa existe para preparar o exercício, e escrever o
exercício primeiro revela o que a prosa precisa cobrir. Um conceito que não aparece em
nenhum exercício é conteúdo que ninguém vai usar.

A ordem é estrutural, não só textual: exercícios e armadilhas moram em
`src/content/units/<id>/exercises.ts` e o `index.ts` os importa. Quem escreve a prosa não
tem por que abrir o outro arquivo, e a sobrescrita aparece no diff.

Sequência:

0. **O kind.** A unidade é sobre uma estrutura ou sobre um método? Estrutura promete
   operações que se pode chamar; método promete um julgamento que o aluno tem de produzir.
   Ordenação é estrutura, o contrato é `ordenar(coleção)` e a estabilidade mora no que ele
   não promete. Análise assintótica é método. ADR-0012 decide, e o resto da sequência lê
   igual nos dois: promessa, formas concorrentes de entregar, onde a escolha é a errada.

1. **O contrato, ou o critério.** Estrutura: que operações, que garantias, e, mais
   importante, o que ele explicitamente **não** promete. Método: qual a forma canônica do
   julgamento, quais partes ela exige, e como a frase soa quando cada parte é omitida
   (`whenOmitted`). Nos dois casos a lista de ausências é a resposta do último ciclo, e,
   na unidade de método, ela também é o catálogo de armadilhas.
2. **As implementações concorrentes, ou as técnicas.** No mínimo duas, o schema exige,
   não é recomendação. E o ciclo em que cada uma **estreia** carrega um `workedExample`:
   depois dele o aluno tem referente, antes dele a definição é taxonomia sem chão. A
   checagem `exemplo` cobra, e o ADR-0016 diz por quê. O trade-off vive na diferença entre elas; uma implementação sozinha não
   ensina escolha, e o `useInstead` de todo `wrongWhen` apontaria para fora da unidade,
   onde o aluno não pode conferir nada.
3. **O catálogo de armadilhas.** O que um dev de dois anos erra aqui. Cada uma ganha
   `socraticQuestion` e `escalation`, de uma a três tarefas, uma por tentativa depois que
   a pergunta já foi feita. Os três degraus do motor são outra coisa e você não os escreve.
4. **Os exercícios.** Um por ciclo, exatamente um, nos dois sentidos: nenhum exercício
   fecha dois ciclos e nenhum exercício fica sem ciclo. O validador checa os dois. Espaço
   de erro fechado, sempre.
5. **Os ciclos.** Teto de quatro termos novos, cada um fechando no seu exercício.
6. **A legenda das letras.** Toda letra que aparece no pseudocódigo, na invariante ou numa
   coluna de traço entra em `symbols`, com o significado em palavras e sem outra letra
   dentro. `m` é "quantas posições a tabela tem", não "o tamanho da tabela, ou seja n/α".
   O schema exige, e a razão está no ADR-0013: para quem está reconstruindo base, cada
   letra não explicada é uma variável a mais para segurar enquanto tenta seguir o
   raciocínio, e o raciocínio é a única coisa que a trilha treina.
7. **A implementação de referência**, para todo exercício de traço.
8. **O critério de domínio**, operacional.

## O teste de cada peça

**Problema motivador:** um dev de dois anos reconhece a situação como algo que já viveu?
Se for abstrato ("imagine que você precisa armazenar dados"), refaça.

**Contrato:** as operações estão escritas como chamadas, com garantia semântica e nenhuma
complexidade? Se aparecer substantivo abstrato, "presença", "recuperação", está errado;
as operações são `contém(chave)` e `obter(chave)`.

**Implementação:** `wrongWhen` tem cenário concreto e alternativa nomeada?
`everydayAnchor` cita algo específico, um índice de banco, um cache, uma fila, e não uma
generalidade?

**Armadilha:** a pergunta socrática termina em `?` e descreve uma **tarefa**, não uma
explicação? Teste: se o aluno pode ler a pergunta e não fazer nada, é explicação. E cada
entrada da `escalation` é uma tarefa nova? Se você não sabe dizer o que a segunda faz que
a primeira não fez, ela não existe.

**Exercício:** você consegue listar as maneiras de errar? Se não, o exercício está mal
posto, não é o aluno que está. E a alternativa correta se distingue das outras só pelo
conteúdo? Se ela é a mais longa, ou a única com justificativa colada, o aluno acerta pelo
formato, mova a justificativa para `why`, que é onde ela é revelada depois.

**Traço:** um aluno que entendeu a matéria e nunca viu este exercício sabe COMO escrever a
resposta? Toda coluna editável declara `placeholder` com o formato, nunca com um valor do
gabarito, e o formato bate com o que o gerador emite. Teste: cubra o gerador e tente
preencher a primeira linha. Se você hesitou sobre vírgula, casas decimais ou como se escreve
uma posição ocupada, o aluno também vai hesitar, e ele vai receber uma devolutiva socrática
por um erro de digitação.

**Ciclo:** abre pelo problema ou pela estrutura? Quatro termos novos com dois parágrafos é
diferente de quatro termos com oito; o validador só conta os termos.

**Critério de domínio:** é verificável sem julgamento? "Entende tabelas hash" não é.
"Diante de uma implementação que nunca viu, em menos de cinco minutos e sem executar,
nomeia a política de colisão e constrói uma entrada que a leve a O(n)" é.

## O gabarito é computado, nunca digitado

Todo exercício de traço aponta uma função em `src/lib/reference/`. Se você digitou o
resultado esperado à mão, refaça, foi assim que a primeira versão da unidade de hash
afirmou que o rehash disparava na inserção do 8, quando o próprio pseudocódigo dizia que
era na do 4.

E o gabarito computado não autoriza comparação cega: `sameCell` compara número por valor,
porque `0,75` e `0,750` são a mesma resposta. Se um exercício novo precisar de um tipo de
célula que não é número nem texto exato, decida a comparação antes de escrever o exercício, 
não depois de o aluno divergir.

## Ao terminar

```
npm run validate    as checagens declaradas em CHECKS
npm run docs:check  nenhum caminho citado em documento está morto
npm run typecheck
npm test            todas as suítes em scripts/test-*.ts
npm run build
```

`npm test` descobre as suítes por glob de propósito: a versão anterior listava um arquivo
e um terceiro teste ficou dois commits existindo, passando e nunca rodando.

**O build se recusa a rodar com o `npm run dev` de pé**, e `scripts/check-no-dev-server.ts`
explica por quê: os dois escrevem em `.next`, e o build por cima do dev corrompe o cache, 
a página volta sem CSS nenhum e o console acusa módulo faltando. Se você chegou nesse estado
por outro caminho, `rm -rf .next` e suba o servidor de novo; não é defeito do seu conteúdo.

Depois `/audit-unit <id>`, que cobre o que não é mecanizável.

E relate o que faltou no spec. O spec da próxima unidade melhora com isso; sem o relato,
a mesma lacuna volta.
