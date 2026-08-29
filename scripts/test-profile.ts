import { progress as progressSchema } from '../src/content/schema'

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${name}${detail && !ok ? ` , ${detail}` : ''}`)
  if (!ok) failures++
}

console.log('\n  perfil e migração v1 para v2\n')

void run()

async function run() {

  /*
    A migração roda no navegador e lê window.localStorage. O teste monta um
    localStorage de mentira e importa o módulo depois, para exercitar o caminho
    real em vez de uma cópia da lógica.
  */
  const store = new Map<string, string>()
  const g = globalThis as unknown as { window?: unknown; localStorage?: unknown }
  g.window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v) },
      removeItem: (k: string) => { store.delete(k) },
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }

  const V1 = {
    schemaVersion: 1,
    units: {
      hash: {
        exercises: {
          'hash.e1': {
            attempts: 2, solved: true, solvedClean: false,
            misconceptionsTriggered: ['hash.copia-em-vez-de-reinserir'],
            lastVisited: '2026-08-01T00:00:00.000Z',
          },
        },
      },
    },
  }

  store.set('euclides.progress.v1', JSON.stringify(V1))
  store.set('euclides.codeLanguage', 'ts')

  const { read, clearAll, exportProfile, importProfile, saveProfile } =
    await import('../src/lib/progress')

  const migrated = read()
  check('a migração produz um v2 válido', progressSchema.safeParse(migrated).success)
  check('o progresso do v1 sobrevive inteiro',
    migrated.units.hash?.exercises['hash.e1']?.attempts === 2
    && migrated.units.hash?.exercises['hash.e1']?.misconceptionsTriggered.length === 1)
  check('a chave solta de idioma é absorvida', migrated.profile?.codeLanguage === 'typescript')
  check('a migração não inventa nome', migrated.profile?.name === undefined)
  check('o v1 é preservado depois de migrar', store.has('euclides.progress.v1'))
  check('o v2 foi gravado', store.has('euclides.progress.v2'))

  // Migrar de novo tem de ser idempotente: a segunda leitura lê o v2 e não
  // reescreve por cima com um perfil novo.
  const antes = migrated.profile?.createdAt
  check('ler duas vezes não recria o perfil', read().profile?.createdAt === antes)

  saveProfile({ name: 'Marina', mode: 'iniciante' })
  check('salvar o perfil preserva o progresso',
    read().units.hash?.exercises['hash.e1']?.attempts === 2 && read().profile?.name === 'Marina')

  const dump = exportProfile()
  clearAll()
  check('apagar remove as três chaves', store.size === 0)
  check('apagar zera o progresso', Object.keys(read().units).length === 0)

  check('importar restaura o que foi exportado', importProfile(dump).ok)
  check('o progresso volta na íntegra', read().units.hash?.exercises['hash.e1']?.attempts === 2)
  check('o nome volta junto', read().profile?.name === 'Marina')

  const lixo = importProfile('{"isto":"não é um perfil"}')
  check('arquivo estranho é recusado sem quebrar', !lixo.ok)
  check('recusa explica o motivo', !lixo.ok && lixo.reason.length > 0)
  check('o perfil importado antes continua de pé', read().profile?.name === 'Marina')

  console.log(failures ? `\n  ${failures} falha(s)\n` : '\n  todas passaram\n')
    process.exit(failures ? 1 : 0)
  }
