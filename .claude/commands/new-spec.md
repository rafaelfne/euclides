---
description: Cria o esqueleto do spec de uma unidade nova em docs/specs/
argument-hint: <id-da-unidade> <tema>
allowed-tools: Read, Write, Glob, Bash
---

Crie `docs/specs/$1.md` para o tema: $2

Use `docs/specs/hash.md` como modelo de estrutura. **Preencha apenas o que você pode
sustentar**; deixe explicitamente marcado como `A DEFINIR` tudo que depende de decisão
pedagógica que ainda não foi tomada.

O spec não é conteúdo — é o contrato que o conteúdo vai cumprir. Ele precisa de:

- o problema motivador, concreto e do trabalho real
- o contrato (TAD) e o que ele explicitamente não promete
- as implementações concorrentes que a unidade vai comparar
- os ciclos, com os termos que cada um introduz
- as armadilhas conhecidas — o que um dev de dois anos erra aqui
- o critério de domínio, operacional e verificável

Ao terminar, liste as perguntas em aberto. Um spec honesto sobre suas lacunas vale mais
que um spec completo e inventado.
