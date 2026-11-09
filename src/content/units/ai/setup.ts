import type { SetupGuide } from '../../setup'

/**
 * Preparar a máquina para escrever o micrograd. Só a fase 1: Python puro, sem
 * GPU e sem biblioteca de IA. PyTorch, modelo local e fine-tuning ficam fora
 * desta página até a trilha de SLM pedir por eles. ADR-0033.
 *
 * Os comandos foram rodados no uv 0.11. O `uv python pin 3.12` do desenho
 * original saiu: o `uv init` atual cria o projeto pedindo Python 3.13 ou mais,
 * e o pin para 3.12 falha. Sem pin, o uv usa o Python que o projeto pede.
 *
 * Os números dos testes são os do exemplo trabalhado de `ai.c5`, que já estão
 * na prosa. O teste do carrinho, que é o `ai.e5`, vai com `...` e só depois de
 * o exercício fechar: com o micrograd pronto, um teste que falha imprime o
 * valor calculado, e rodar antes entregaria a tabela.
 */
export const aiSetup: SetupGuide = {
  unitId: 'ai',
  title: 'Preparar a máquina',
  summary: 'O micrograd rodando no seu computador, em Python puro, conferido por 4 testes.',
  lede: [
    'No fim desta página o seu micrograd roda no seu computador: uma classe `Value` que faz soma, produto e tanh e calcula sozinha o gradient de cada número. Quem diz que está certo são 4 testes, e os números deles saem desta unidade.',
    'É Python puro. Não precisa de GPU, de modelo baixado nem de biblioteca de IA: essas entram depois, quando a trilha de SLM pedir por elas.',
  ],
  steps: [
    {
      title: 'Instalar o uv',
      why: 'O uv instala o Python e isola as dependências de cada projeto. É um programa só no lugar de pyenv, venv e pip.',
      blocks: [
        { kind: 'shell', os: 'unix', source: 'curl -LsSf https://astral.sh/uv/install.sh | sh' },
        { kind: 'shell', os: 'windows', source: 'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"' },
      ],
      doneWhen: 'Num terminal novo, `uv --version` imprime a versão. Precisa ser um terminal novo porque o instalador muda o PATH, e o terminal que já estava aberto não vê a mudança.',
    },
    {
      title: 'Criar o projeto de estudo',
      why: 'O `uv init` cria a pasta com um `pyproject.toml` e um `main.py` de exemplo, que você pode apagar. O pytest entra como dependência de desenvolvimento: é ele que roda os testes. Se a máquina não tiver Python, o uv baixa um nesse momento.',
      blocks: [
        { kind: 'shell', source: 'uv init slm-estudo\ncd slm-estudo\nuv add --dev pytest' },
      ],
      doneWhen: '`uv run pytest` termina com "no tests ran". Ainda não existe teste nenhum, e é exatamente isso que ele diz.',
    },
    {
      title: 'Escrever os testes antes do código',
      why: 'Os dois primeiros testes usam os números do exemplo trabalhado da backpropagation: o neurônio com w = 2, x = 7 e b = 9, e o a × a com a = 8. O terceiro não traz o valor esperado: ele empurra a entrada um pouco, mede, e compara com o que o seu código calcula. Assim você não precisa saber de cor o impacto local da tanh.',
      cycles: ['ai.c5', 'ai.c3'],
      blocks: [
        {
          kind: 'file',
          path: 'test_micrograd.py',
          mode: 'new',
          source: `import math

from micrograd import Value


def test_one_neuron():
    w, x, b = Value(2), Value(7), Value(9)
    y = w * x + b
    y.backward()
    assert y.data == 23
    assert (w.grad, x.grad, b.grad) == (7, 2, 1)


def test_value_used_twice():
    a = Value(8)
    y = a * a
    y.backward()
    assert a.grad == 16


def test_tanh_matches_the_measurement():
    x = Value(0.5)
    y = x.tanh()
    y.backward()
    nudge = 1e-6
    measured = (math.tanh(0.5 + nudge) - math.tanh(0.5)) / nudge
    assert abs(x.grad - measured) < 1e-4`,
        },
      ],
      doneWhen: '`uv run pytest` falha com "No module named \'micrograd\'". O arquivo que ele procura é o próximo passo.',
    },
    {
      title: 'Escrever o micrograd.py',
      why: 'Um arquivo com uma classe, ao lado do arquivo de testes. Cada parte é o que um ciclo desta unidade ensinou, nesta ordem:',
      build: [
        { text: '`Value` guarda o número em `data`, começa com `grad` 0 e lembra de quais `Value` ele saiu.', cycle: 'ai.c5' },
        { text: 'Soma e produto (`__add__` e `__mul__`) devolvem um `Value` novo e deixam guardado como mandar o gradient de volta a cada operando: o impacto local vezes o gradient de quem está em cima.', cycle: 'ai.c4' },
        { text: 'Essa volta soma no `grad` do operando, com `+=`, e não substitui. É o que o teste do a × a confere.', cycle: 'ai.c5' },
        { text: '`backward()` monta a ordem em que cada nó vem depois de todos que usam o valor dele, põe 1 no `grad` do resultado e percorre essa ordem do resultado até as entradas.', cycle: 'ai.c5' },
        { text: '`tanh()` é uma conta de um operando só. O impacto local dela é o que o terceiro teste mede.', cycle: 'ai.c1' },
      ],
      blocks: [],
      doneWhen: '`uv run pytest` passa os 3 testes.',
    },
    {
      title: 'Conferir o carrinho',
      why: 'Com o micrograd pronto, um teste que falha imprime o valor que o código calculou, e rodar isto antes entregaria a tabela. Troque cada `...` pelo gradient que você escreveu nela.',
      after: 'ai.e5',
      blocks: [
        {
          kind: 'file',
          path: 'test_micrograd.py',
          mode: 'append',
          source: `

def test_cart():
    price, quantity = Value(4), Value(5)
    shipping, factor = Value(6), Value(3)
    total = (price * quantity + shipping) * factor
    total.backward()
    assert price.grad == ...
    assert quantity.grad == ...
    assert shipping.grad == ...
    assert factor.grad == ...`,
        },
      ],
      doneWhen: 'Os 4 testes passam. Se o do carrinho falhar, o código e a tabela discordam: refaça à mão a linha da tabela antes de mexer no código.',
    },
  ],
  next: {
    text: 'Com os testes passando, leia o engine.py do micrograd original. São menos de 100 linhas. Ele usa relu no lugar de tanh e tem também potência, subtração e divisão: cada uma é mais um impacto local para você conferir com um teste.',
    href: 'https://github.com/karpathy/micrograd/blob/master/micrograd/engine.py',
    label: 'karpathy/micrograd, engine.py',
  },
}
