---
description: Audita uma unidade contra os princípios, sem editar nada
argument-hint: <id-da-unidade>
allowed-tools: Read, Glob, Grep, Bash, Task
---

Audite a unidade `$1`. **Somente leitura** — produza um relatório, não um patch.

Rode `npm run validate` e `npm run docs:check` primeiro: se algum reprova, o resto da
auditoria é secundário, relate a violação e pare.

Passando o validador, o trabalho começa — porque o validador checa o que é mecanizável
e esta auditoria existe para o que não é. Delegue ao `terminology-auditor` e some a ele:

1. **Princípio 5, do concreto ao abstrato.** Cada ciclo abre pelo problema ou pela
   estrutura? Um ciclo que abre pela estrutura passa no validador e falha no propósito.
2. **Princípio 4, complexidade sempre.** Cada `CostClaim` tem hipóteses de verdade, ou
   `assumptions: []` foi preguiça? Array vazio é permitido e precisa ser deliberado.
3. **Princípio 6, âncora cotidiana.** `everydayAnchor` cita algo que um dev de dois anos
   já viu, ou é genérico?
4. **Princípio 3.** Leia toda `escalation`. Alguma entrega a resposta em vez da tarefa
   que produz a resposta? E cada entrada é uma tarefa nova, ou a anterior reformulada?
5. **Densidade real.** Termos novos por ciclo contra o tamanho da prosa. Quatro termos
   com dois parágrafos é diferente de quatro termos com oito.
6. **O exercício fecha o ciclo?** O exercício do ciclo verifica o que aquele ciclo
   ensinou, ou é um exercício genérico da unidade?

## Formato

Achados ordenados por gravidade, cada um com arquivo, trecho e a correção proposta.
Depois, uma linha de veredito: a unidade está pronta para o aluno, ou não, e o que falta.

Honestidade de nível vale para a auditoria também. "Está bom" sem achado nenhum é um
relatório suspeito; se realmente não houver nada, diga o que você procurou e não achou.
