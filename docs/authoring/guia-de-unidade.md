# Guia de autoria de unidade

O procedimento que `/implement-unit` executa e que os agentes em `.claude/agents/`
seguem. Leia `../discovery/01-principios.md` antes.

## Ordem, e por que ela é essa

**Exercícios antes do conteúdo.** O instinto é escrever a prosa e depois pensar em como
avaliar. Invertido de propósito: a prosa existe para preparar o exercício, e escrever o
exercício primeiro revela o que a prosa precisa cobrir. Um conceito que não aparece em
nenhum exercício é conteúdo que ninguém vai usar.

Sequência:

1. **O contrato.** Que operações, que garantias, e — mais importante — o que ele
   explicitamente **não** promete. A lista de ausências é a resposta do último ciclo.
2. **As implementações concorrentes.** No mínimo duas. O trade-off vive na diferença
   entre elas; uma implementação sozinha não ensina escolha.
3. **O catálogo de armadilhas.** O que um dev de dois anos erra aqui. Cada uma ganha
   `socraticQuestion` e escada.
4. **Os exercícios.** Um por ciclo. Espaço de erro fechado, sempre.
5. **Os ciclos.** Teto de quatro termos novos, cada um fechando no seu exercício.
6. **A implementação de referência**, para todo exercício de traço.
7. **O critério de domínio**, operacional.

## O teste de cada peça

**Problema motivador:** um dev de dois anos reconhece a situação como algo que já viveu?
Se for abstrato ("imagine que você precisa armazenar dados"), refaça.

**Contrato:** as operações estão escritas como chamadas, com garantia semântica e nenhuma
complexidade? Se aparecer substantivo abstrato — "presença", "recuperação" — está errado;
as operações são `contém(chave)` e `obter(chave)`.

**Implementação:** `wrongWhen` tem cenário concreto e alternativa nomeada?
`everydayAnchor` cita algo específico — um índice de banco, um cache, uma fila — e não uma
generalidade?

**Armadilha:** a pergunta socrática termina em `?` e descreve uma **tarefa**, não uma
explicação? Teste: se o aluno pode ler a pergunta e não fazer nada, é explicação.

**Exercício:** você consegue listar as maneiras de errar? Se não, o exercício está mal
posto — não é o aluno que está.

**Ciclo:** abre pelo problema ou pela estrutura? Quatro termos novos com dois parágrafos é
diferente de quatro termos com oito; o validador só conta os termos.

**Critério de domínio:** é verificável sem julgamento? "Entende tabelas hash" não é.
"Diante de uma implementação que nunca viu, em menos de cinco minutos e sem executar,
nomeia a política de colisão e constrói uma entrada que a leve a O(n)" é.

## O gabarito é computado, nunca digitado

Todo exercício de traço aponta uma função em `src/lib/reference/`. Se você digitou o
resultado esperado à mão, refaça — foi assim que a primeira versão da unidade de hash
afirmou que o rehash disparava na inserção do 8, quando o próprio pseudocódigo dizia que
era na do 4.

## Ao terminar

```
npm run validate    as doze checagens
npm run typecheck
npm test            referência e motor socrático
npm run build
```

Depois `/audit-unit <id>`, que cobre o que não é mecanizável.

E relate o que faltou no spec. O spec da próxima unidade melhora com isso; sem o relato,
a mesma lacuna volta.
