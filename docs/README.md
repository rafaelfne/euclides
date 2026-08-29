# Documentação

Três camadas, com propósitos diferentes:

**`discovery/`**, por que este projeto existe e como ele pensa. Leia antes de escrever
qualquer conteúdo; é o que separa uma decisão de uma preferência.

**`adr/`**, as decisões arquiteturais, com as alternativas descartadas e as
consequências. Se você quer mudar algo estrutural, o ADR correspondente diz o que foi
considerado e por que perdeu.

**`authoring/`**, o procedimento operacional de autoria. É o que os agentes em
`.claude/agents/` seguem.

**`specs/`**, o spec de cada unidade. O design pedagógico nasce fora do repositório e
aterrissa aqui versionado; `/implement-unit` trabalha contra ele. `specs/README.md` tem o
currículo do primeiro módulo e as decisões que travam a escrita.

## Ordem de leitura para quem chega

1. `discovery/00-problema.md`, quem é o aluno e o que conta como sucesso
2. `discovery/01-principios.md`, os sete inegociáveis
3. `discovery/02-motor-socratico.md`, como corrigir sem entregar a resposta
4. `../CLAUDE.md`, o contrato operacional
5. `authoring/guia-de-unidade.md`, o procedimento
