# ADR-0017: A figura é dado declarado; o SVG é o renderizador

**Status:** Aceito
**Data:** 2026-08-28
**Decisores:** Rafael Neves

## Contexto

A leitura de aluno apontou que o app não tem nenhum recurso visual, e listou cinco lugares
em que uma imagem faz o trabalho de três parágrafos. O primeiro deles é literalmente o
exercício de `asymptotics.c1`: as curvas de 1000·n e n² se cruzando.

A saída é inline SVG — não há outra num export estático sem dependência. A pergunta que
este ADR responde é outra: **quem escreve o SVG?**

## Decisão

O conteúdo declara a **afirmação**; o componente desenha.

```ts
figure: {
  kind: 'growth',
  xMax: 1400,
  curves: [
    { label: '1000·n', shape: 'linear', factor: 1000 },
    { label: 'n²', shape: 'quadratic', factor: 1 },
  ],
  highlight: { from: 20, to: 200, label: 'as coleções reais' },
}
```

`shape` é enum, e `EVAL` em `src/components/GrowthFigure.tsx` é exaustivo por forma: uma
forma nova não compila até ser definida. O autor nunca escreve um caminho, uma coordenada
ou uma cor.

## Opções consideradas

### A — SVG autorado no conteúdo
Um campo `svg: string` no ciclo, ou um arquivo importado.
**Descartada**, por três razões que valem mais que a liberdade que ela dá.

**Uma figura afirma alguma coisa, e nenhuma checagem consegue conferir um caminho.** Se o
cruzamento das duas curvas for desenhado no lugar errado, o gráfico mente e passa. Aqui o
cruzamento é achado por varredura sobre as próprias funções declaradas: trocar o fator de
1000 para 500 move a marca sozinha, e não há como o desenho discordar do dado.

**É a mesma regra do `CostClaim`, um andar acima.** O ADR-0004 recusou complexidade como
string porque uma string aceita "é rápido". Uma figura como caminho SVG aceita qualquer
coisa, incluindo uma curva que não é a função que o rótulo diz que é.

**Cor autorada não sobrevive a redesenho.** O ADR-0015 trocou a paleta inteira. Um SVG no
conteúdo teria hex dentro, e a troca teria deixado seis figuras com a paleta antiga sem que
nada avisasse — que é exatamente a deriva 4 do `CLAUDE.md` numa camada nova. O renderizador
usa as variáveis de tema, então a figura acompanha.

### B — Biblioteca de gráficos
**Descartada.** Peso para um caso, e o ADR-0015 acabou de aceitar peso uma vez; aceitar de
novo sem necessidade é como o argumento de kB morre. Duas polilinhas não justificam uma
dependência.

### C — Figura como dado declarado
Adotada.

## Análise de trade-off

O custo é real e vale ser dito sem enfeite: **cada tipo de figura novo é código novo.** As
outras quatro visualizações que a leitura pediu — colisão e chaining, o deslocamento no
array, a árvore degenerando, largura contra profundidade — não cabem em `growth`. Cada uma
precisa do seu `kind`, do seu renderizador e da sua checagem.

Isso é mais trabalho do que desenhar cada uma em SVG à mão. A troca é: desenhar é mais
rápido uma vez, e declarar é o que impede a figura de mentir na décima. Num projeto cujo
nome é "nada é assumido que não esteja declarado", a figura não podia ser a única peça
autorada que ninguém confere.

## Consequências

- **Fica mais fácil:** trocar a paleta, corrigir um fator, confiar que o desenho concorda
  com o rótulo.
- **Fica mais difícil:** a próxima figura, se ela não for uma comparação de crescimento.
- **A observar:** se três `kind` diferentes nascerem e nenhum for reaproveitado, a
  abstração não pagou e a opção A merece ser reaberta — com a ressalva de que aí é preciso
  inventar como conferir o que o desenho afirma.

## Itens de ação

1. [x] `figure` no schema, com `curveShape` como enum
2. [x] `GrowthFigure` com `EVAL` exaustivo e cruzamento calculado
3. [x] Checagem `figura`: curvas distintas, e faixa que cabe no eixo
4. [ ] Decidir os `kind` das outras quatro visualizações — ou reabrir a opção A
