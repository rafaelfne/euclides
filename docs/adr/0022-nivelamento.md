# ADR-0022: Nivelamento que recomenda, e estado que não sobe pelo relógio

**Status:** Aceito
**Data:** 2026-08-29
**Decisores:** Rafael Neves

## Contexto

A trilha tem oito unidades em ordem, e a ordem é real: cada uma usa o vocabulário que a
anterior estabeleceu. Isso serve a quem chega sem base e atrapalha quem já programa há anos,
que abre a unidade 01 e passa vinte minutos confirmando o que já sabe.

E o app não tinha nenhuma noção de "onde eu estou": o progresso existia por exercício e
nunca era agregado em nada que o aluno pudesse ler.

## Decisão

### A sondagem recomenda, não mede

Seis perguntas, uma por unidade das seis primeiras, e o resultado é **uma frase**. Não há
nota, não há percentual, e nada fica bloqueado.

Um número aqui viraria a coisa que o aluno persegue, e o que ele deve perseguir é a unidade
certa. Um percentual de conclusão seria pior ainda: ele mediria quanto foi visitado, e
visitar não é a coisa que este app afirma medir.

**Uma unidade vencida na sondagem entra marcada para revisita, não para estudo**, e a tela
diz por quê: dominada exige os exercícios do critério na primeira tentativa, e a sondagem
fez uma pergunta por unidade. Vencer a sonda é evidência de que vale começar adiante, não
certificado de nada.

### As respostas da sondagem CONTAM

É a decisão menos óbvia e a mais importante. São **os mesmos exercícios** que moram nos
ciclos, e tratá-los como simulado criaria duas verdades sobre o mesmo exercício: uma no
painel de lacunas e outra na sondagem. Errar aqui ativa a armadilha, exatamente como
ativaria lá, e a tela avisa isso antes de começar.

O custo é real: a sondagem gasta seis exercícios. Aceito, porque a alternativa é o app
saber duas coisas diferentes sobre a mesma pergunta.

Não há devolutiva durante a sondagem. A devolutiva mora no ciclo, junto do conteúdo que a
explica, e entregá-la numa tela de quatro minutos seria entregar a escada socrática fora do
lugar onde ela funciona.

### As sondas são dado declarado, com checagem

`src/content/placement.ts` declara qual exercício sonda qual unidade, e a checagem
`sonda` reprova sonda que aponta para o nada, sonda repetida na mesma unidade, e sonda
que não seja `choice`. As duas primeiras quebram em silêncio; a terceira estoura os quatro
minutos prometidos sem que nada avise.

### Quatro estados, todos derivados, nenhum subindo pelo relógio

`nao-visitada` · `em-curso` · `dominada` · `consolidada`. Nenhum campo novo: tudo sai do
progresso que já existe.

`dominada` exige os exercícios do critério **na primeira tentativa**, então quem resolveu na
quarta continua em curso. É o teste do princípio 2 aplicado ao estado, e há uma asserção em
`scripts/test-level.ts` que existe só para isso.

**`consolidada` não é `dominada` mais tempo.** Esperar não é estudar, e um estado que sobe
pelo relógio é exatamente a gamificação que o princípio 2 proíbe. O que consolida é ter
voltado depois do intervalo e saído limpo de novo.

### A faixa nomeia quem a pessoa consegue ser, e a regra anda junto

code reader → code tracer → complexity analyst → code reviewer → design reviewer. "nível 3"
não diz nada e convida a subir por subir.

A primeira escada era Leitor → Traçador → Analista → Revisor → Árbitro, e foi trocada em
29/08/2026. Três daqueles nomes existiam no mundo e dois não: "traçador" em pt-BR é um
instrumento de marcação e "árbitro" é de esporte, e os dois eram substantivo de agente em
inglês traduzido.

O formato de agente ficou; o idioma mudou. Em inglês `-er` e `-ist` são produtivos, então
"code tracer" se lê sem esforço mesmo não sendo cargo que alguém tenha, e "traçador" não se
lê — vira o instrumento. Era essa a diferença, e não o formato.

Os cinco rótulos em inglês seguem a regra do glossário, não a exceção dela: a forma
canônica é a que o aluno encontra no mundo, e é o mesmo motivo pelo qual `bucket` e `open
addressing` aparecem em inglês na tela. O ADR-0007 governa prosa autorada, não termo
canônico.

"big-O analyst" foi descartado para a terceira faixa. O glossário já registra `big O` como
apelido de `notação O`, e uma palavra pertence a uma coisa só (ADR-0029). "complexity
analyst" nomeia a pessoa sem disputar a palavra da notação.

A regra da faixa alcançada e o que falta para a próxima aparecem **sempre**, lado a lado.
Nome sem regra é um número disfarçado: o aluno vê a palavra, não sabe o que fez para chegar
nem o que falta para sair, e a única coisa que sobra é a sensação de posição.

code reviewer exige hash e ordenação nominalmente, e não quatro unidades quaisquer: a faixa afirma
uma capacidade, e essas duas são o que ela afirma.

## Opções consideradas

### A — Sondagem com nota e corte
**Descartada.** Nota é o que o aluno passa a perseguir, e a trilha inteira foi desenhada para
que a coisa perseguida seja julgar código.

### B — Sondagem como simulado, sem gravar
**Descartada.** Duas verdades sobre o mesmo exercício, e a que aparece no painel de lacunas
deixaria de descrever o que a pessoa fez.

### C — Destravar unidades pela sondagem
**Descartada.** Nada é travado hoje, e travar para depois destravar é inventar um problema
para vender a solução.

### D — Percentual de conclusão por unidade
**Descartada.** Mede visita. Visitar não é a coisa que este app afirma medir, e um número que
sobe por rolar a página é a definição do que o princípio 2 proíbe.

### E — Sondagem que recomenda, com respostas que contam
Adotada.

## Análise de trade-off

O custo é que a sondagem consome seis exercícios reais, e eles são justamente os mais
diagnósticos de cada unidade. Quem faz a sondagem chega no ciclo com aquele exercício já
respondido.

O risco é a faixa virar o placar que ela nega ser. A defesa é a regra ao lado do nome, e ela
tem de continuar lá: se um dia a faixa aparecer sozinha em algum canto, virou XP.

## Consequências

- **Fica mais fácil:** entrar no lugar certo, e saber onde se está sem número nenhum.
- **Fica mais difícil:** adicionar estado agregado. Todo agregado novo tem de passar no teste
  do princípio 2 antes de existir.
- **Fica exposto:** `placement` é escrito uma vez e nunca revisto. Alguém que estude seis
  meses continua com a recomendação do primeiro dia guardada.
- **A observar:** se alguém faz a sondagem. Ela é oferecida na home e no fim do
  `/como-funciona`, e o convite some depois de respondida, porque repetir oferta é cobrança.

## Itens de ação

1. [x] `probes` em `src/content/placement.ts`, e a checagem `sonda`
2. [x] `/sondagem`, sem nota, sem devolutiva, gravando o resultado uma vez no fim
3. [x] `unitState` com os quatro estados; `consolidada` exige volta limpa, não tempo
4. [x] `level` com as cinco faixas, sempre com a regra e o que falta
5. [x] Estado no rail, na home, no mapa e no perfil; faixa no rail e no perfil
6. [x] `scripts/test-level.ts`, com a asserção do princípio 2 em primeiro lugar
7. [ ] Reofertar a sondagem quando o progresso mudar muito depois dela
