# Decisões arquiteturais

| # | Decisão | Por que importa |
|---|---|---|
| [0001](0001-motor-estatico.md) | Motor 100% estático, sem LLM em runtime | A intenção de publicar torna o número de leitores incontrolável; custo marginal precisa ser zero |
| [0002](0002-correcao-socratica-deterministica.md) | Correção socrática por antecipação em tempo de autoria | Como cumprir o princípio 3 sem modelo de linguagem |
| [0003](0003-espinha-taxonomica.md) | Contrato → implementação → custo vira tipo | Torna inexprimível a confusão mais estrutural da área |
| [0004](0004-costclaim.md) | Complexidade é `CostClaim`, nunca string | "Hash é O(1)" omite quatro qualificadores |
| [0005](0005-terminologia-canonica.md) | A forma canônica é a que o aluno encontra no mundo | Terminologia que não transfere sabota o objetivo |
| [0006](0006-validador-como-gate.md) | Validador é gate de build, sem nível de aviso | As regras foram quebradas quatro vezes por quem as escreveu |
| [0007](0007-fronteira-de-idioma.md) | Fronteira de idioma entre código e conteúdo | Enum em inglês vazou para a tela do aluno |
| [0008](0008-css-puro.md) | CSS puro com custom properties | Os tokens são o design system; página pública paga por kB |
| [0009](0009-persistencia-local.md) | Progresso em localStorage | Backend derrubaria o export estático |
| [0010](0010-fluxo-hibrido-de-autoria.md) | Design fora do repo, autoria dentro | O gargalo é conteúdo, e as duas fases têm naturezas diferentes |
| [0011](0011-fronteira-do-gate.md) | O que é gate, o que é relatório, e por quê | Os documentos ficaram fora do gate e derivaram antes do conteúdo |
| [0012](0012-espinha-de-metodo.md) | Duas espinhas: estrutura e método, discriminadas por `kind` | Um terço do currículo não era exprimível no modelo de estrutura |
| [0013](0013-notacao-declarada.md) | Nada que o aluno precise reproduzir fica sem declaração | O traço reprovava por casa decimal e mandava o aluno voltar amanhã |
| [0014](0014-mapa-e-trilha.md) | O mapa mostra a taxonomia; a trilha mostra a ordem | O mapa levava ao rehash antes da carga, e o ciclo não tinha saída |

## Como escrever o próximo

Formato em qualquer um dos arquivos acima. O que não pode faltar:

- **as alternativas que perderam**, com a razão. Um ADR sem opção descartada é um
  comunicado, não uma decisão.
- **o que fica mais difícil.** Toda decisão custa alguma coisa; se você não consegue
  nomear o custo, não entendeu a decisão.
- **o que revisitar, e sob qual condição.** "Reavaliar se passar de ~15 telas" é útil;
  "reavaliar no futuro" não é.
