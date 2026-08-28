# ADR-0001: Motor 100% estático, sem LLM em runtime

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

O princípio 3 do projeto — nunca entregar a resposta de um exercício, apontar onde o
raciocínio quebrou e fazer a pergunta que leva à correção — parece exigir um modelo de
linguagem em runtime. Correção socrática soa como julgamento, e julgamento soa como IA.

A intenção declarada é publicar o app. Isso torna o número de usuários **incontrolável**,
o que muda a função de custo: com LLM, custo cresce linearmente com leitores que não se
pode prever; com estático, o custo marginal por leitor é zero.

O custo absoluto por aluno é irrelevante nas duas hipóteses. Modelado com 96 sessões de
exercício de quatro turnos para o Módulo 1 inteiro: US$ 2,01 com Haiku 4.5, US$ 5,22 com
Sonnet 5, US$ 13,04 com Opus 5. A decisão não é sobre esses números — é sobre o
multiplicador que eles ganham quando o app sai do círculo de um aluno.

## Decisão

Export estático puro (`output: 'export'`). Nenhuma chamada de LLM em runtime. A correção
socrática é resolvida por antecipação em tempo de autoria (ADR-0002).

## Opções consideradas

### A — Híbrido: conteúdo estático + tutor LLM para exercício aberto

| Dimensão | Avaliação |
|---|---|
| Complexidade | Média — route handler, chave no servidor, limite de turnos |
| Custo | Linear no número de leitores; imprevisível se publicado |
| Superfície de risco | Chave de API exposta se a chamada sair do cliente |
| Qualidade da correção | Alta em exercício de resposta aberta |

**Prós:** aceita texto livre; a correção se adapta ao que o aluno escreveu.
**Contras:** exige backend, o que derruba o export estático inteiro; custo por leitor
desconhecido; e a qualidade da devolutiva deixa de ser auditável entre sessões.

### B — 100% estático com correção determinística

| Dimensão | Avaliação |
|---|---|
| Complexidade | Baixa em runtime, **alta em autoria** |
| Custo | Zero marginal; free tier indefinidamente |
| Superfície de risco | Nenhuma — não há segredo a vazar |
| Qualidade da correção | Alta em espaço de erro fechado, nula em texto livre |

**Prós:** publicável sem teto; devolutiva idêntica e auditável para todo aluno; a
disciplina vira código.
**Contras:** exige desenhar exercícios de espaço de erro fechado; texto livre passa a ser
autoexplicação com rubrica, não correção.

### C — Full LLM em runtime

Descartada cedo: conteúdo não reproduzível entre sessões, impossível de auditar, e perda
de controle sobre a progressão pedagógica.

## Análise de trade-off

A troca real é **custo variável por custo de autoria**. O custo de autoria é pago uma vez,
por quem projeta o curso, com ajuda de IA no processo de escrita — não em runtime, por
leitor.

O que se perde é a correção de resposta aberta. Isso foi mitigado, não resolvido: o app
guarda a autoexplicação do aluno e exporta a sessão em markdown para correção fora dele.

## Consequências

- **Fica mais fácil:** publicar, hospedar, versionar conteúdo, auditar a qualidade da
  devolutiva, rodar offline.
- **Fica mais difícil:** escrever exercício. Cada armadilha precisa ser antecipada e ter
  pergunta própria. Oito unidades com esta densidade não saem numa tarde.
- **A revisitar:** se um dia houver orçamento e público fechado, um tutor opcional para
  exercício aberto pode entrar sem desfazer nada — o conteúdo estático continua válido.

## Itens de ação

1. [x] Content model que sustenta correção determinística
2. [x] Motor de divergência com escada de três degraus
3. [ ] Botão de exportar sessão em markdown
