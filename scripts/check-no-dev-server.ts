/**
 * O build recusa rodar com o servidor de desenvolvimento de pé.
 *
 * `next dev` e `next build` escrevem o mesmo `.next`, e o build por cima do
 * dev corrompe o cache dele: a página volta sem CSS e o console acusa módulo
 * faltando. Não é defeito de conteúdo, e já custou três diagnósticos.
 *
 * Separar os diretórios por `distDir` foi tentado e descartado: com
 * `output: 'export'` o `distDir` também move o destino do export, e o `out/`
 * que o ADR-0001 promete deixa de existir. A guarda é mais barata que a briga.
 */
import { createServer } from 'node:net'

const PORT = Number(process.env.PORT ?? 3000)

const probe = createServer()
probe.once('listening', () => probe.close())
probe.once('error', (err: NodeJS.ErrnoException) => {
  if (err.code !== 'EADDRINUSE') throw err
  console.error(`
  A porta ${PORT} está ocupada, o servidor de desenvolvimento provavelmente está de pé.

  Rodar o build agora corrompe o cache que o dev usa: a próxima página volta sem
  CSS e o console acusa módulo faltando. Pare o dev, ou:

      rm -rf .next && npm run build

  Se o que ocupa a porta não é o dev, use outra: PORT=3001 npm run build
`)
  process.exit(1)
})
probe.listen(PORT)
