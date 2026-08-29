# Spec, Unidade 6: Grafos

**Status:** spec, não implementada
**Kind:** `structure`. Encaixa na espinha sem conflito, é a unidade mais parecida com hash
em forma, e a mais distante em conteúdo.

## Problema motivador

Uma tela de permissões: um usuário pertence a times, times herdam de times, e a pergunta é
"esse usuário pode ver este documento?". A implementação atual faz uma consulta por nível
e o time de suporte relata que, para alguns usuários, a tela trava.

O que o aluno já tem: sabe percorrer uma lista e uma árvore. O que ele não tem: a árvore
não tem ciclo, e a hierarquia de times tem, alguém pôs o time A dentro do B e o B dentro
do A. O percurso que funciona em árvore não termina aqui.

A pergunta que abre a unidade: **o que muda quando o caminho pode voltar?**

## Contrato

`Grafo`, vértices e as ligações entre eles.

| operação | garantia |
|---|---|
| `vizinhos(v)` | os vértices ligados diretamente a v |
| `existeAresta(u, v)` | sim ou não |
| `adicionarAresta(u, v)` | liga u a v |
| `vertices()` | todos os vértices |

**Responde:** perguntas sobre vizinhança direta.

**Não responde**, a resposta do último ciclo: se existe caminho entre dois vértices; qual
o caminho mais curto; se há ciclo; quais vértices são alcançáveis. **Nada disso é operação
do contrato**, tudo é algoritmo escrito sobre ele, e essa distinção é o conteúdo mais
importante da unidade.

**Decisão de forma que isso força:** os percursos (busca em largura, busca em profundidade)
não são operações do TAD. Onde eles moram na espinha? Na banda `cost`, como consequência?
Numa terceira implementação? **A DEFINIR**, e é o item que mais provavelmente revela um
limite do ADR-0003, porque grafo é a primeira unidade em que o valor não está nas
implementações do contrato, e sim nos algoritmos escritos sobre ele.

## Implementações comparadas

**Lista de adjacência**, cada vértice guarda a lista dos seus vizinhos.
Invariante: `v` aparece em `adj[u]` se e somente se existe aresta de u para v.
Custo: espaço O(V+E); `vizinhos(v)` O(grau de v); `existeAresta` O(grau de u).
Errada quando: o grafo é denso e a pergunta dominante é `existeAresta`. Use matriz.
Âncora: é como toda biblioteca de grafo representa por padrão, e o motivo é que grafo real
é esparso, um usuário pertence a cinco times, não a todos.

**Matriz de adjacência**, uma tabela V×V de sim/não.
Invariante: `M[u][v]` é verdadeiro se e somente se existe aresta de u para v.
Custo: espaço O(V²) **independente do número de arestas**; `existeAresta` O(1);
`vizinhos(v)` O(V), mesmo que v tenha um vizinho só.
Errada quando: o grafo é esparso, dez mil vértices e vinte mil arestas gastam cem milhões
de células para guardar vinte mil fatos.
Âncora: é a representação natural quando o grafo é pequeno e fixo, e a que aparece em
matriz de distâncias.

O trade-off aqui é o mais limpo da trilha: **espaço contra tempo de uma operação
específica**, com um ponto de virada calculável a partir da densidade. É bom material para
o exercício de escolha.

## Ciclos (proposta)

| # | banda | título | termos novos |
|---|---|---|---|
| c0 | contrato | O que o grafo promete: vizinhança, e só | grafo, vértice, aresta |
| c1 | contrato | Dirigido, não dirigido, com peso | dirigido, peso |
| c2 | implementação | Lista de adjacência | lista de adjacência, grau |
| c3 | implementação | Matriz de adjacência e o custo do vazio | matriz de adjacência, densidade |
| c4 | custo | Esparso contra denso: onde a escolha vira | esparso, denso |
| c5 | ? | Percorrer sem voltar: o conjunto de visitados | busca em largura, visitado |
| c6 | ? | Largura e profundidade respondem perguntas diferentes | busca em profundidade |
| c7 | custo | Quando o grafo é a escolha errada | *(a definir)* |

**c5 e c6 sem banda definida**, é a pergunta lá em cima. Eles são o coração da unidade e
não são implementações do contrato.

## Armadilhas conhecidas

- `percurso-sem-visitados`, a que o problema motivador ativa: laço infinito no ciclo
- `bfs-e-dfs-equivalentes`, supor que a ordem do percurso não muda a resposta
- `caminho-mais-curto-com-peso`, usar busca em largura em grafo com peso e chamar de mais curto
- `matriz-para-esparso`, a que o custo de espaço denuncia
- `arvore-e-grafo`, supor que o que vale em árvore vale aqui (é a ponte com a unidade 5)

`percurso-sem-visitados` é a mais valiosa e a mais barata de exercitar: é um exercício de
traço em que o aluno preenche a fila e o conjunto de visitados passo a passo, e o traço
**não termina** se ele esquecer o conjunto. O erro aparece na própria tabela.

**A DEFINIR**, sua leitura.

## Critério de domínio (proposta)

Diante de código que percorre uma estrutura ligada: dizer se ele termina para entrada com
ciclo; nomear a representação que o custo de espaço denuncia; e dizer qual pergunta a busca
em largura responde que a busca em profundidade não responde.

## Perguntas em aberto

1. **Onde os percursos moram na espinha.** É a decisão que trava o spec, e ela pode ser
   informação sobre o modelo, não só sobre esta unidade.
2. **Peso entra?** Sem peso, "caminho mais curto" é busca em largura e cabe. Com peso, é
   Dijkstra, e é outra unidade de tamanho.
3. **Um exercício de traço de busca em largura precisa de gerador novo** em
   `src/lib/reference/`, com id prefixado `graphs.`. O formato da célula "conjunto de
   visitados" precisa de `placeholder` e provavelmente de entrada em `traceConventions`
   (ADR-0013), conjunto não tem ordem, e comparar por igualdade de string reprovaria quem
   escreveu na ordem diferente. `sameCell` não cobre esse caso hoje.
