# ADR-0021: Perfil local, e o que a ausência de conta obriga

**Status:** Aceito
**Data:** 2026-08-29
**Decisores:** Rafael Neves

## Contexto

O ADR-0009 decidiu persistência local sem conta, e essa decisão pagou: custo marginal zero
por leitor, nada para hospedar, nada para vazar. O que ela não tinha resolvido é o outro
lado da conta: **sem servidor, portabilidade e apagamento deixam de ser cortesias e passam
a ser obrigação**, porque não há um "esqueci minha senha" para socorrer ninguém.

E havia uma segunda chave solta, `euclides.codeLanguage`, ao lado de `euclides.progress.v1`.
Duas chaves para um estado só é a garantia de que exportar o perfil leva metade dele.

## Decisão

### O perfil é opcional e mora no mesmo lugar que o progresso

`euclides.progress.v2` absorve o perfil e a chave de idioma. O `units` do v1 é o `units` do
v2, então a migração é acrescentar as chaves novas e ler a chave solta uma última vez.

**A migração não inventa nome.** Quem já usava o app nunca informou um, e preencher um
perfil por alguém que não foi perguntado é decidir no lugar dele.

**O v1 é deixado no lugar.** Se a migração estiver errada, o dado original ainda existe.
`clearAll` apaga os três, e é a única coisa que apaga.

### O nome é pedido no fim do /como-funciona, nunca antes

Pedir nome na porta cobra compromisso de quem ainda não sabe o que o app é. No fim daquela
página a pessoa já leu o que a trilha faz, o que significa cada palavra do produto e o que
vai ter de escrever; aí a pergunta tem contexto e a recusa é barata, com um "pular" ao lado.

**Nada do que se pergunta identifica ninguém.** Não há e-mail, idade, empresa nem cargo. As
duas perguntas escolhem o modo de leitura e calibram a sondagem, as duas são opcionais, e o
app funciona idêntico com as três em branco.

### O nome aparece em três lugares, e em nenhum outro

Cartão de retomada, cabeçalho do perfil, e o markdown de lacunas **quando pedido**.
Cumprimentar a cada tela é ruído, não acolhimento: é a mesma regra do ADR-0018, onde
acolhimento só entra como afirmação verificável.

**No export de lacunas o padrão é sem nome.** Aquele arquivo é feito para ser colado num
chat, que é um lugar fora deste navegador. Levar o nome junto tem de ser uma escolha por
vez, com a caixa nascendo desmarcada, e não o comportamento que ninguém revisa.

### Exportar, importar e apagar são de primeira classe

São a contrapartida de não ter conta. Um arquivo JSON que o dono guarda é mais privado que
uma conta que alguém hospeda, e apagar é imediato e sem pedir licença.

`importProfile` aceita um arquivo v1 e migra na entrada, para que um backup antigo não vire
lixo. Arquivo estranho é recusado com o motivo, e o perfil que já estava lá continua de pé.

## Opções consideradas

### A — Pedir o nome na primeira tela
**Descartada.** É a tela em que a pessoa ainda está decidindo se fica.

### B — Manter `euclides.codeLanguage` separada
**Descartada.** Exportar levaria metade do estado, e o bug só apareceria no navegador de
destino, longe de quem o causou.

### C — Migrar apagando o v1
**Descartada.** Migração sem rede é migração que só dá para conferir depois que já era.

### D — Perfil com conta, para sincronizar entre máquinas
**Descartada,** e é a decisão do ADR-0009 sendo reafirmada. Sincronizar exige servidor,
servidor exige identidade, e identidade num app de estudo é o dado que ninguém precisava ter
dado. Export e import resolvem o caso real, que é trocar de máquina, sem criar o resto.

## Análise de trade-off

O custo é que trocar de navegador vira um gesto manual. Isso é real e é o preço da opção D
descartada.

O risco é o perfil crescer. Todo campo novo aqui é um campo que sai do navegador quando
alguém exporta e cola em algum lugar. A regra que fica: **um campo só entra no perfil se o
app fizer algo diferente por causa dele.** `experience` liga o modo iniciante; `reviewsCode`
vai calibrar a sondagem. Um campo que só descreve a pessoa não entra.

## Consequências

- **Fica mais fácil:** trocar de máquina, e ir embora.
- **Fica mais difícil:** adicionar estado de leitor sem pensar. Chave solta virou defeito.
- **Fica exposto:** o `import` sobrescreve o navegador inteiro sem mesclar. É o
  comportamento previsível, e a tela avisa.
- **A observar:** se alguém preenche o nome. Se ninguém preencher, a pergunta é ruído e
  merece sair, e não há telemetria para saber, o que é a consequência de não ter servidor.

## Itens de ação

1. [x] `progress.v2` com `profile` e `placement`; migração não destrutiva do v1
2. [x] `euclides.codeLanguage` absorvida; a chave solta some no `clearAll`
3. [x] Formulário no fim do `/como-funciona`, com "pular" ao lado
4. [x] `/perfil` com modo, idioma, as oito unidades e as três ações
5. [x] Nome no export de lacunas apenas quando pedido, caixa desmarcada por padrão
6. [x] `scripts/test-profile.ts` cobrindo migração, ida e volta, e recusa de arquivo estranho
7. [ ] `placement` só é escrito na Fase 2; hoje o campo existe e ninguém preenche
