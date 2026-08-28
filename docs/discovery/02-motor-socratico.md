# O motor socrático determinístico

## A tese

Correção socrática não é inteligência em runtime. É **antecipação em tempo de autoria**.
Um professor experiente não improvisa a pergunta — ele já viu os oito jeitos de errar
aquilo. O LLM só é necessário quando o espaço de erro é aberto.

Consequência de design, e é a decisão central deste projeto:

> **Todo exercício desta trilha tem espaço de erro fechado.**

Isso impõe uma disciplina desconfortável: trocar "escreva sobre os trade-offs de hash"
(espaço aberto, precisa de LLM) por "nomeie a operação dominante, o custo dela nas duas
estruturas, e a condição que inverte a escolha" (espaço fechado, verificável).

O ponto não-óbvio: **restringir o formato aumenta o rigor**. Texto livre deixa o aluno
se esconder atrás de vagueza — "hash é mais rápido" <!-- vocab-ok: citação de prosa ruim, não uso --> passa num ensaio e não passa num
formulário que exige nomear a operação dominante e seu custo assintótico nas duas
estruturas. A restrição não é uma concessão à ausência de LLM; é pedagogicamente melhor.

## Os cinco mecanismos

### M1 — Divergência de traço
O aluno preenche o estado passo a passo. Uma implementação de referência gera o traço
correto. O app compara e revela **apenas o índice do primeiro passo divergente**.

    Seu traço diverge no passo 4. Os passos 1 a 3 estão corretos.
    Reexecute a condição do laço no passo 3 e veja o que ela produz.

Escalonamento por tentativa: 2ª revela *qual campo* divergiu; 3ª dispara a pergunta da
misconception ligada àquele passo. Nenhuma delas revela o valor.

### M2 — Distractor com misconception mapeada
Cada alternativa errada é uma armadilha nomeada com pergunta pré-escrita que ataca a raiz.
O feedback nunca contém a resposta; contém **a tarefa que produz a resposta**.

    Você respondeu O(1) para o pior caso. Construa uma sequência de cinco chaves
    que caem no mesmo balde. Qual o custo da busca depois disso?

É isto que transforma a seção "armadilhas comuns" — que o formato do projeto já exige —
em código executável. O schema torna `misconceptionId` obrigatório em toda opção
incorreta: não é possível escrever um distractor preguiçoso.

### M3 — Contraexemplo mínimo (property-based)
O aluno implementa; o app roda propriedades contra uma implementação de referência com
entradas geradas e *shrinking*. A falha mostra o menor contraexemplo, nunca o diff.

    Sua tabela diverge da referência em:
      inserir("a", 1); inserir("a", 2); tamanho()
    O que sua implementação faz quando a chave já existe?

É o mecanismo mais socrático dos cinco e é 100% determinístico. Ensina também o hábito
profissional certo: quando o teste falha, a pergunta é "que suposição minha esse input
viola?", não "como faço passar?".

### M4 — Justificativa por composição
O argumento é montado a partir de slots tipados, cada slot com distractors mapeados.
Ao acertar, o aluno vê a frase completa — que é literalmente a justificativa que ele
precisa saber dizer numa code review.

### M5 — Autoexplicação com rubrica diferida
Texto livre que o app **não corrige**. O aluno escreve, salva, e só então vê a rubrica
dos pontos que uma boa resposta cobre, e marca quais cobriu.

Honestidade sobre este: é o mecanismo mais fraco. O aluno pode se auto-enganar. Mas o
texto fica salvo e exportável — e aí entra a divisão de ferramentas que já está definida
no projeto.

## A ponte com o Claude

Botão **exportar sessão**: gera um markdown com os exercícios errados, as tentativas, as
misconceptions ativadas e as autoexplicações. O aluno cola no projeto do Claude e a
correção socrática real acontece ali, com dado em vez de memória.

Custo zero, princípio 3 preservado, e o app não precisa fazer tudo.

## Trade-off que precisa ser declarado

**Num app estático o gabarito está no bundle.** Qualquer um abre o devtools. Mitigação
parcial: comparar hashes em vez de valores nos exercícios de resposta exata. Mas M1 e M3
precisam da implementação de referência rodando no cliente, então a resposta é derivável.

Posição: **aceitar e não fingir**. O público é auto-motivado; quem abre o devtools está
enganando a si mesmo, e ler uma implementação de referência correta é aprendizado, não
trapaça. O que não se deve fazer é gastar engenharia obfuscando conteúdo educacional.


## Onde isto vive no código

| peça | arquivo |
|---|---|
| divergência de traço e a escada | `src/lib/socratic.ts` |
| implementações que geram o gabarito | `src/lib/reference/` |
| catálogo de armadilhas de uma unidade | `src/content/units/<id>/index.ts` |
| checagens que impedem distractor preguiçoso | `scripts/validate-content.ts` |

A escada tem exatamente três degraus e `buildFeedback` não tem um quarto. Um aluno que
esgota a escada recebe "vamos parar aqui, releia a invariante e volte amanhã" — que é um
desfecho melhor do que uma resposta.
