# Spec — Unidade 8: Síntese

**Status:** spec — não implementada
**Kind:** `method`, **classificado por eliminação e ainda não confirmado.** O ADR-0012 diz
isso em voz alta e diz o que fazer se não couber: *"se o critério dela não couber em `parts`
+ `whenOmitted`, é sinal de que existe uma terceira espinha, e ela merece ADR próprio em vez
de um campo opcional aqui."*

Este spec é, entre outras coisas, o teste dessa hipótese. A seção de critério abaixo é a
tentativa de fazer caber; se ela parecer forçada na sua leitura, é resultado, não fracasso.

## Problema motivador

Uma tarefa nova, sem estrutura declarada: "preciso guardar as sessões ativas, responder se
uma sessão existe a cada requisição, e expirar as vinte mais antigas por minuto".

O que o aluno já tem, depois de sete unidades: sabe o custo de cada estrutura isolada. O que
ele não tem: o hábito de derivar a escolha a partir da carga de trabalho, em vez de
reconhecer um padrão. E é a diferença entre saber a tabela e saber usá-la.

A pergunta que abre a unidade: **como se escolhe uma estrutura para um problema que você
nunca viu?**

O exercício `hash.e5` já é uma versão pequena disto, e a resposta certa dele — "nenhuma das
duas sozinha" — é o movimento que esta unidade generaliza.

## Critério — o julgamento que a unidade ensina a produzir

`Justificativa de escolha` — o argumento que sustenta uma estrutura numa revisão.

| parte | o que ela afirma |
|---|---|
| operação dominante | qual operação roda mais, e com que frequência relativa |
| custo nas candidatas | o custo dessa operação em pelo menos duas estruturas, com regime e hipóteses |
| condição que inverte | o que teria de mudar na carga para a outra ganhar |
| ausência que dói | o que o contrato escolhido não promete, e por que isso é aceitável aqui |

**Quando cada parte é omitida:**

- sem **operação dominante**: "usei hash porque é rápido"
- sem **custo nas candidatas**: "hash é O(1)" — sem o outro lado, não há escolha, há preferência
- sem **condição que inverte**: a escolha não é revisável; ninguém sabe quando ela expira
- sem **ausência que dói**: é o erro do `hash.e5` — escolher pela operação dominante e
  descobrir na produção que o contrato não responde a segunda pergunta

## Técnicas comparadas

**Perfil de carga primeiro** — contar as operações do enunciado antes de olhar estrutura.
Invariante: a contagem tem de ser de operações do contrato, não de nomes de estrutura.
Errada quando: a carga não é conhecida ou muda — sistema novo, uso não medido. Aí a escolha
é pela ausência que menos dói, não pelo custo.
Âncora: é o que um `EXPLAIN ANALYZE` mostra depois, e que dava para prever antes.

**Eliminação por ausência** — listar o que o problema exige, cortar todo contrato que não
promete alguma dessas coisas, e só então comparar custo entre os que sobraram.
Invariante: cortar por contrato, nunca por custo — custo só compara o que já promete o que
você precisa.
Errada quando: nada sobrevive ao corte. É sinal de que a resposta é composição de duas
estruturas, não escolha entre elas.
Âncora: é exatamente o raciocínio de `hash.e5`, e é o motivo de uma LRU cache ser tabela
hash **mais** lista ligada.

**A DEFINIR** — duas bastam? A terceira candidata seria "medir", e ela é honesta e
antipedagógica aqui: a trilha inteira existe para julgar **sem executar**.

## Ciclos (proposta)

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | critério | O que sustenta uma escolha numa revisão | operação dominante, carga de trabalho |
| c1 | técnica | Contar a carga antes de nomear a estrutura | *(a definir)* |
| c2 | técnica | Cortar pelo que o contrato não promete | *(a definir)* |
| c3 | falha | Quando nenhuma serve: compor duas | composição |
| c4 | falha | A escolha que não sobrevive ao crescimento | *(a definir)* |

**A DEFINIR** — a unidade tem exercícios próprios ou é montada a partir dos exercícios das
sete anteriores, num formato de revisão? A segunda opção é atraente e não tem `kind` que a
suporte: nada no schema hoje permite um exercício que referencie outra unidade.

## Armadilhas conhecidas

- `escolha-por-reconhecimento` — "isso é um problema de cache, então hash", sem contar carga
- `custo-sem-alternativa` — justificar com o custo de uma estrutura só
- `dominante-por-intuicao` — supor qual operação domina sem ler a frequência no enunciado
- `composicao-nao-considerada` — assumir que a resposta é uma estrutura
- `escolha-sem-validade` — não dizer sob qual condição ela deixa de valer

**A DEFINIR** — sua leitura, e aqui ela pesa mais que nas outras: esta unidade é o teste
final do objetivo declarado do projeto, e as armadilhas dela são as que definem o que conta
como sucesso.

## Critério de domínio (proposta)

Diante de um requisito escrito em português, sem estrutura sugerida: nomear a operação
dominante e sua frequência; comparar duas candidatas com regime e hipóteses declarados;
dizer a condição que inverte a escolha; e nomear a ausência do contrato escolhido que
alguém vai sentir em produção.

Isto é, literalmente, a definição de sucesso de `docs/discovery/00-problema.md` aplicada a
um problema novo.

## Perguntas em aberto

1. **`kind: 'method'` cabe?** Se `parts` + `whenOmitted` acomodarem a tabela acima sem
   forçar, cabe. A parte que mais estica é `custo nas candidatas`, que não é uma afirmação
   única — é uma comparação, e comparação é duas afirmações mais uma relação. Se isso
   incomodar na leitura, é o sinal que o ADR-0012 mandou observar.
2. **Exercício que atravessa unidades.** Não há suporte no schema, e esta é a unidade que
   pede. Vale um `kind` novo, ou o critério de domínio dela é simplesmente resolver limpo os
   `requiresClean` das sete anteriores?
3. **Ela é avaliação ou conteúdo?** Se for majoritariamente avaliação, talvez não seja uma
   unidade — talvez seja o painel de lacunas, com outra pergunta. `/gaps` já sabe o que o
   aluno resolveu limpo; ele não sabe fazer pergunta nova.
4. **Ela depende das sete.** É a única com essa propriedade, e o schema não representa
   dependência entre unidades: `prerequisites` é um array de strings em prosa. Isso é
   suficiente ou vira ligação verificável?
