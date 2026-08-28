# O problema

## O aluno

Desenvolvedor júnior, dois anos de profissão, graduação concluída. Entrou no mercado já
com IA generativa disponível.

A autoavaliação dele é o ponto de partida do projeto: a base técnica não é sólida o
suficiente para conduzir bem as ferramentas de IA. Ele consegue produzir código. Ele não
confia no próprio julgamento sobre o que recebe.

Isso não é preguiça nem falta de estudo. É uma consequência estrutural de aprender a
programar num ambiente onde a resposta chega antes da pergunta. Quem nunca precisou
derivar não desenvolveu o músculo de verificar.

## O que esta trilha não é

Não é preparação para entrevista de big tech. Não é curso de linguagem. Não é revisão de
faculdade. É reconstrução de fundamento com finalidade prática: **autonomia de julgamento
técnico**.

A diferença importa na hora de cortar escopo. Um curso de entrevista otimiza para
reconhecer padrões rápido; este otimiza para desconfiar de um padrão que parece certo.

## Definição de sucesso

Uma frase, e ela é operacional:

> Diante de um trecho de código gerado por IA, o aluno consegue dizer o que ele faz,
> qual seu custo, onde ele quebra e o que trocaria — **sem executar**.

Cada palavra puxa uma decisão de produto. "Sem executar" é por que existe teste de mesa
interativo. "Onde ele quebra" é por que todo `CostClaim` carrega hipóteses. "O que
trocaria" é por que toda implementação declara o cenário em que ela é a escolha errada.

## Os três objetivos derivados

1. Avaliar criticamente código gerado por IA.
2. Escolher estruturas e enxergar trade-offs sem consultar ferramenta.
3. Raciocinar sobre corretude, complexidade e falhas de forma autônoma.

## Escopo do primeiro módulo

Lógica e teste de mesa; análise assintótica; estruturas lineares; tabelas hash; árvores;
grafos; ordenação e busca; e uma síntese que exige justificar a escolha de estrutura
diante de um problema novo.

A unidade de tabelas hash foi implementada primeiro, deliberadamente: é a que mais
estressa o modelo de conteúdo, porque quebra o modelo mental ingênuo mais comum da área
("hash é O(1)") e exercita todos os tipos de exercício.
