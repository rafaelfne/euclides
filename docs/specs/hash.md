# Spec, Unidade 4: Tabelas Hash

**Status:** implementada
**Serve de modelo** para os próximos specs. A estrutura abaixo é o contrato mínimo que
`/implement-unit` espera.

## Problema motivador

Dez milhões de e-mails cadastrados. A cada signup é preciso responder "esse e-mail já
existe?" em tempo que não cresça com o cadastro.

O que o aluno já tem: array não ordenado responde em O(n); array ordenado responde em
O(log n) mas insere em O(n); BST balanceada faz O(log n) nas duas. Nenhum dá O(1).

A pergunta que abre a unidade, e que o aluno precisa responder sozinho: **por que não dá,
e o que teria que ser verdade para dar?**

## Contrato

`Map`, associa chave a valor.

| operação | garantia |
|---|---|
| `inserir(chave, valor)` | associa; se a chave já existe, substitui |
| `contém(chave)` | sim ou não |
| `obter(chave)` | o valor associado, ou `NÃO_ENCONTRADO` |
| `remover(chave)` | descarta o par, se existir |

**Responde:** perguntas sobre uma chave por vez.

**Não responde**, e esta lista é a resposta do último ciclo: qual a menor ou a maior
chave; quais chaves estão numa faixa; em que ordem foram inseridas; quais são as k
primeiras segundo qualquer critério.

## Implementações comparadas

**Chaining**, cada bucket guarda a lista dos pares que colidiram ali.
Invariante: todo par em `bucket[i]` satisfaz `h(k) mod m = i`.
Âncora: o índice padrão do PostgreSQL é B-tree e não hash, porque índice hash responde
`=` e nada mais.

**Open addressing**, tudo no próprio array, sondando a próxima posição livre.
Perfil oposto: melhor localidade de cache, degradação muito mais abrupta. Entre α = 0,8 e
α = 0,9 a busca sem sucesso vai de 12,5 para 48,1 sondagens medidas, contra 1,40 → 1,45 do
chaining.

## Ciclos

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | contrato | O contrato, antes da estrutura | tipo abstrato de dados, Map |
| c1 | implementação | A aposta: transformar chave em endereço | função de hash |
| c2 | implementação | Colisão é matemática, não defeito | colisão, casa dos pombos |
| c3 | implementação | Chaining e a invariante de posição | bucket, chaining, invariante de posição |
| c4 | custo | Load factor: pares por bucket | load factor |
| c5 | implementação | Rehash e o custo amortizado | rehash, amortizado |
| c6 | custo | Quando a busca deixa de custar constante | hashing uniforme, pior caso, caso médio |
| c7 | implementação *(aprofundamento)* | Open addressing e a deleção que apaga demais | open addressing, probing, clustering, tombstone |
| c8 | custo | Quando a tabela hash é a escolha errada | hash flooding |

## Armadilhas conhecidas

`o1-sem-qualificar` · `colisao-e-bug` · `rehash-copia-buckets` · `duplicata-inofensiva` ·
`load-factor-memoria` · `delecao-ingenua` · `ordem`

A mais valiosa é `rehash-copia-buckets`, e vale registrar por quê: se o rehash copia
buckets em vez de reinserir, **o defeito é parcial**, no trace de exemplo, 3 e 11 seguem
encontráveis e só o 7 some. É exatamente por isso que esse bug passa em teste manual e
aparece em produção.

## Critério de domínio

Diante de uma implementação de tabela hash que nunca viu, em menos de cinco minutos e sem
executar: nomear a política de resolução de colisão; dizer qual load factor a degrada;
apontar a operação que dispara o rehash; e construir uma entrada concreta que a leve a
O(n).

Operacionalmente: `hash.e1` e `hash.e3` resolvidos **sem ativar nenhuma armadilha**, numa
revisita feita ao menos sete dias depois.

## Decisões de conteúdo que a implementação não deixa ver

**A implementação de referência do trace `hash.e1` usa `h(k) = k`.** É deliberado: o que
o trace ensina é rehash, invariante de posição e a mudança de endereço; uma h realista só
acrescentaria aritmética que o aluno teria de simular à mão a cada passo, e o erro dele
passaria a ser de conta, não de raciocínio.

O trace pede apenas três resultados por inserção: se houve rehash, o número de buckets e
onde as chaves ficaram. `n` repete o número do passo e α pode ser derivado de n/m; cobrar
os dois na mesma tabela mede preenchimento, não compreensão do redimensionamento.

O custo é que a aposta anunciada no ciclo `hash.c1`, transformar chave em endereço, o
aluno lê na prosa e nunca executa no trace. Se um exercício futuro precisar exercitar a
função em si, ele é outro exercício, com outro gerador; não é uma troca de `h` neste.

## Lacunas conhecidas

- Exercício de implementação verificada (property-based) ainda não escrito
- `hash.e7` cobre deleção ingênua mas não cobre clustering diretamente
- Falta um exercício que ataque `hash.chave-mutavel`, armadilha desenhada e ainda não
  catalogada no código
