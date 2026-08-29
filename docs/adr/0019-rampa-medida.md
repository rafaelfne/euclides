# ADR-0019: Instância antes de abstração, e movimento que é argumento

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

Uma segunda leitura externa mediu o app em vez de descrevê-lo, e o achado é
diferente do que o ADR-0016 tinha assumido:

> o problema não é o tamanho da frase

A média é de 128 palavras por ciclo e 12 a 17 palavras por frase. Isso é curto. O que pesa
é **categoria sem caso**: prosa que fala de "a operação dominante" e "a ausência aceita"
sem nunca mostrar uma instância. Para quem já tem referente, categoria é economia de tempo;
para quem não tem, é palavra sem referente.

Conferi as medidas antes de agir, e uma estava otimista: ciclos sem nenhum número na prosa
eram **44 de 62**, não 36. As outras batiam.

A mesma leitura mediu o CSS: zero `@keyframes`, zero `prefers-reduced-motion`, 8 declarações
de `transition` em 26 KB. Procede.

## Decisão

### 1. Nenhum ciclo publica sem número real nos dois primeiros parágrafos

A checagem `número`. É a intervenção que resolve mais com menos: ataca os 44 ciclos com
um movimento só, sem tocar na voz do produto. "Remover do começo custa mais" vira "tirar o
primeiro de 5 elementos obriga 4 escritas; tirar o último, nenhuma".

### 2. Todo ciclo abre com uma frase, e ela tem teto

`oneLine`, no máximo 20 palavras, cobrado pela checagem `abertura`. Vem **antes** da prosa e
nunca depois: quem não tem referente decide ali se continua lendo, e quem tem passa o olho.

### 3. `workedExample` é obrigatório

36 ciclos iam do aforismo direto ao exercício.

### 4. Movimento é argumento, e argumento se lê no ritmo de quem lê

Um componente, `Stepper`, serve as quatro figuras com passos. As três regras moram nele:

- **Uma passada e para.** Não há laço e não há como pedir um.
- **Nunca começa sozinho.** A figura abre no último passo, inteira, idêntica à versão
  estática de antes. Voltar ao passo 1 é escolha do aluno.
- **`prefers-reduced-motion` não desliga informação, desliga interpolação.** Os mesmos
  passos, sem a animação entre eles. Desligar o passo esconderia dado de quem pediu menos
  movimento.

### 5. O traço rodando existe, e fica trancado até o exercício fechar

A leitura pediu "ver o traço rodar" preenchendo a tabela linha por linha. **Isso é entregar
a resposta**, e o princípio 3 proíbe enquanto há tentativa em aberto. Ele aparece só depois
de resolvido ou com a escada esgotada, aí a mesma animação deixa de ser cola e vira a
explicação que o aluno veio buscar.

### 6. A versão em TypeScript é derivada, nunca autorada

O pseudocódigo continua canônico (princípio 1). A alternância chama
`toTypeScriptOrNull`, que transla por dicionário declarado, palavras de controle
operadores, idiomas (`anexar v em visitados`) e identificadores de domínio.

Quando o bloco tem passo em prosa, a função devolve `null` e a alternância **não aparece**.
`sorting.c3` é o caso real: "mover o que restou de E para o fim de S" não vira código sem
inventar código. A checagem `tradução` exige que esse resíduo seja declarado em
`pseudocodeIsProse`, nos dois sentidos, declarar sem precisar também reprova.

`scripts/test-transliterate.ts` cobre o modo de falha que importa, que não é falhar alto:
chaves equilibradas, nenhum identificador acentuado, nenhum operador matemático solto, e
**nenhuma comparação virada atribuição**, `=` em pseudocódigo é sempre comparação, e
traduzi-lo como `=` ensinaria o oposto da convenção mais mal lida da folha. Uma varredura
local marca quem nasceu de `conjunto com …`, para que `anexar` vire `.add` e não `.push`:
um `.push` num Set é código que parece certo e não roda, que é exatamente o que este app
existe para ensinar a detectar.

### 7. O gate reprova em vez de quebrar

Declarar um campo obrigatório derrubava o validador com `TypeError`, porque as checagens
seguintes leem o dado supondo o schema. Aconteceu duas vezes nesta sessão. Agora schema
quebrado interrompe a rodada e diz isso.

A primeira tentativa, remover a unidade inválida e seguir, foi pior: produziu 100
violações de glossário inexistentes, porque as referências cruzadas apontavam para ciclos
que tinham acabado de sair da lista. Relatório com o schema quebrado é ruído que esconde a
causa.

### 8. Contraste

A rampa de cinza inteira passa em 4,5:1 contra as quatro superfícies. Os três tons de baixo
estavam em 2,68, 2,05 e 2,54, e caíam em navegação, rótulo e estado, que é o texto de quem
ainda não sabe o que procurar. Piso tipográfico da navegação em 12 px.

## Opções consideradas

### A, Reescrever a prosa dos 62 ciclos
**Descartada.** A leitura foi explícita: o texto atual é bom e é a identidade do app. O que
falta é a instância antes dele, não outra voz.

### B, Alternador Iniciante / Revisão
**REVERTIDA pelo ADR-0027.** O argumento abaixo tratava esconder como perda, e esconder só é
perda quando quem esconde não é o leitor. Fica registrado como estava.

Proposto pela leitura: modo iniciante mostraria a frase simples, o exemplo aberto e a
animação já rodada.
**Descartada, e vale dizer por quê.** Depois das decisões 1 a 4, as três coisas que esse
modo mostraria passaram a ser **incondicionais**: a frase de abertura existe em todos os 62
ciclos, o exemplo trabalhado existe e abre em todos, e o stepper não roda sozinho para
ninguém. O alternador só poderia *esconder* conteúdo de quem escolhesse "revisão", e a
mesma leitura pediu para não tirar nada de quem já é servido hoje. Um modo que só remove
não é um modo, é um jeito de estragar a tela.

A única coisa genuinamente dependente do leitor era a linguagem do código, e ela ganhou
alternância própria e persistida.

### C, Escrever a versão em TypeScript à mão, por ciclo
**Descartada.** Duas fontes divergem na primeira correção, e o pseudocódigo deixaria de ser
canônico. É o princípio 1 do projeto.

### D, Checagem com tolerância na regra do número
Reprovar só quando a maioria dos ciclos de uma unidade não tem instância.
**Descartada** pelo mesmo argumento do ADR-0016: é nível de aviso disfarçado de número.

## Análise de trade-off

O custo de autoria subiu de novo, e agora são 25 checagens. Escrever uma unidade exige
frase de abertura, número concreto na abertura e exemplo trabalhado por ciclo.

O risco continua sendo o do ADR-0016, um andar acima: **nenhuma das checagens novas sabe se
a peça é boa.** `número` aceita qualquer dígito, e um número decorativo passa. A checagem
garante que o autor teve de pensar num caso concreto; não garante que ele pensou bem.

E há um custo que a decisão 6 cria: a transliteração é código que precisa acompanhar o
pseudocódigo. Um idioma novo na prosa do autor quebra a tradução, e o teste acusa, que é
por isso que ele existe.

## Consequências

- **Fica mais fácil:** entrar. A primeira tela de cada ciclo agora tem uma frase sem jargão
  e um caso com número antes de qualquer categoria.
- **Fica mais difícil:** escrever pseudocódigo com idioma novo sem atualizar o dicionário.
- **Fica exposto:** a qualidade das 62 frases de abertura e dos 36 exemplos trabalhados
  escritos nesta leva. Eles passam nas checagens; se são bons é julgamento, e é do
  `/audit-unit`.
- **A observar:** se a alternância de linguagem esvazia o pseudocódigo. Se todo mundo lê em
  TypeScript, o princípio 1 virou decoração e a decisão merece ser reaberta.

## Itens de ação

1. [x] `número` e `abertura` no validador; `workedExample` obrigatório
2. [x] 62 frases de abertura, 36 exemplos trabalhados, 46 aberturas com número
3. [x] `Stepper` nas quatro figuras com passos, e `prefers-reduced-motion`
4. [x] Traço rodando, trancado até o exercício fechar
5. [x] `tradução`, `toTypeScriptOrNull` e `scripts/test-transliterate.ts`
6. [x] Rampa de cinza em 4,5:1; navegação em 12 px
7. [x] Vocabulário do app no glossário; estreia de termo ligada na prosa
8. [x] `/como-funciona`, com todo número derivado do conteúdo
9. [x] Cartão por rodada abaixo de `lg` na tabela de traço
10. [ ] Conferir o catálogo de armadilhas contra alguém usando o app: as 52 são previsões,
    escritas a partir de erros de livro e de fórum. É a dívida do ADR-0018, e nenhuma
    decisão desta rampa toca nela
