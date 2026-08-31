'use client'

import { progress as progressSchema, type Progress, type Profile } from '@/content/schema'

/**
 * localStorage, versioned and validated on read. No backend, no auth, which
 * is what keeps the marginal cost per reader at zero and lets this be public.
 *
 * A schema mismatch never breaks the screen: it resets and says so.
 */
const KEY = 'euclides.progress.v2'
const KEY_V1 = 'euclides.progress.v1'
const KEY_LANG = 'euclides.codeLanguage'

const empty = (): Progress => ({ schemaVersion: 2, units: {} })

/**
 * Migração do v1, não destrutiva e sem perguntar nada.
 *
 * O `units` do v1 já é o `units` do v2, então a migração é acrescentar as
 * chaves novas e absorver `euclides.codeLanguage`, que vivia solta ao lado. Duas
 * chaves para um estado só é a garantia de que exportar o perfil leva metade
 * dele. Ver ADR-0021.
 *
 * O v1 é DEIXADO no lugar de propósito: se a migração estiver errada, o dado
 * original ainda existe. `clearAll` apaga os dois.
 */
function migrate(raw: unknown): Progress | null {
  if (!raw || typeof raw !== 'object') return null
  const v1 = raw as { schemaVersion?: number; units?: Progress['units'] }
  if (v1.schemaVersion !== 1 || !v1.units) return null

  let codeLanguage: 'pseudo' | 'typescript' = 'pseudo'
  try {
    const saved = window.localStorage.getItem(KEY_LANG)
    if (saved === 'ts' || saved === 'typescript') codeLanguage = 'typescript'
  } catch { /* modo privado */ }

  return {
    schemaVersion: 2,
    // Sem nome: quem já estava usando o app nunca informou um, e inventar um
    // perfil na migração seria decidir por quem não foi perguntado.
    profile: { createdAt: new Date().toISOString(), codeLanguage },
    units: v1.units,
  }
}

export function read(): Progress {
  if (typeof window === 'undefined') return empty()
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) {
      const parsed = progressSchema.safeParse(JSON.parse(raw))
      if (parsed.success) return parsed.data
    }

    const old = window.localStorage.getItem(KEY_V1)
    if (old) {
      const migrated = migrate(JSON.parse(old))
      if (migrated) {
        const parsed = progressSchema.safeParse(migrated)
        if (parsed.success) { write(parsed.data); return parsed.data }
      }
    }
    return empty()
  } catch {
    return empty()
  }
}

/** Quem escuta é quem mostra progresso fora do exercício: a matriz de
 *  trade-off, o mapa e o rail. Sem isto eles só liam na montagem, e a matriz
 *  prometia destravar ao resolver sem nunca destravar na mesma visita. */
export const PROGRESS_EVENT = 'euclides:progress'

export function write(next: Progress): void {
  try { window.localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* modo privado */ }
  try { window.dispatchEvent(new Event(PROGRESS_EVENT)) } catch { /* sem window */ }
}

export type ExerciseState = Progress['units'][string]['exercises'][string]
export type TraceRow = Record<string, string>

export function recordAttempt(
  unitId: string, exerciseId: string,
  patch: {
    solved: boolean
    misconception?: string
    savedRows?: TraceRow[]
    /** Do critério da unidade. Sem ele não dá para saber se esta volta é revisita. */
    revisitAfterDays?: number
  },
): Progress {
  const p = read()
  const unit = p.units[unitId] ?? { exercises: {} }
  const prev: ExerciseState = unit.exercises[exerciseId] ?? {
    attempts: 0, solved: false, solvedClean: false,
    misconceptionsTriggered: [], lastVisited: new Date().toISOString(),
  }
  const triggered = patch.misconception && !prev.misconceptionsTriggered.includes(patch.misconception)
    ? [...prev.misconceptionsTriggered, patch.misconception]
    : prev.misconceptionsTriggered
  /*
    Uma volta só é revisita se o exercício JÁ estava resolvido e o intervalo já
    tinha passado. Responder de novo no mesmo dia é insistência, e insistência
    não honra nada. ADR-0023.
  */
  const daysSince = (Date.now() - new Date(prev.lastVisited).getTime()) / 86_400_000
  const isRevisit = prev.solved
    && patch.revisitAfterDays !== undefined
    && daysSince >= patch.revisitAfterDays

  const revisits = isRevisit
    ? [...(prev.revisits ?? []), { at: new Date().toISOString(), clean: patch.solved && !patch.misconception }]
    : prev.revisits

  unit.exercises[exerciseId] = {
    attempts: prev.attempts + 1,
    solved: prev.solved || patch.solved,
    // Solving on the first attempt with no misconception triggered is the only
    // thing that counts as mastery. Getting there in four tries is getting there.
    solvedClean: prev.solvedClean || (patch.solved && prev.attempts === 0 && triggered.length === 0),
    misconceptionsTriggered: triggered,
    freeText: prev.freeText,
    savedRows: patch.savedRows ?? prev.savedRows,
    revisits,
    lastVisited: new Date().toISOString(),
  }
  p.units[unitId] = unit
  write(p)
  return p
}

/** O estado de um exercício, para a tela reidratar em vez de zerar na recarga. */
export function exerciseState(unitId: string, exerciseId: string): ExerciseState | undefined {
  return read().units[unitId]?.exercises[exerciseId]
}

export function saveExerciseNote(unitId: string, exerciseId: string, freeText: string): Progress {
  const p = read()
  const unit = p.units[unitId] ?? { exercises: {} }
  const prev: ExerciseState = unit.exercises[exerciseId] ?? {
    attempts: 0, solved: false, solvedClean: false,
    misconceptionsTriggered: [], lastVisited: new Date().toISOString(),
  }
  unit.exercises[exerciseId] = { ...prev, freeText: freeText.trim() || undefined }
  p.units[unitId] = unit
  write(p)
  return p
}

export type CycleStatus = 'pending' | 'attempted' | 'clean' | 'review'

export function cycleStatus(
  p: Progress, unitId: string, exerciseId: string, revisitDays: number,
): CycleStatus {
  const st = p.units[unitId]?.exercises[exerciseId]
  if (!st) return 'pending'
  if (!st.solved) return 'attempted'
  if (!st.solvedClean) return 'attempted'
  const days = (Date.now() - new Date(st.lastVisited).getTime()) / 86_400_000
  return days >= revisitDays ? 'review' : 'clean'
}


export interface Resume {
  unitId: string
  cycleId: string
  cycleTitle: string
  unitTitle: string
  /** Dias desde a última visita, arredondado para baixo. */
  daysAgo: number
}

/**
 * Onde o aluno parou.
 *
 * `lastVisited` era gravado desde o scaffold e nenhuma tela lia. É a mesma
 * ponto cego que escondeu `code` e `faultyLines` por muito tempo: dado obrigatório
 * que o validador confere e que nenhuma tela consome. Ver ADR-0016.
 *
 * O ciclo devolvido é o do exercício mais recente que ainda NÃO saiu limpo, e
 * na falta dele o próximo ciclo não tentado. Retomar num ciclo já dominado
 * seria mandar o aluno reler o que ele acertou de primeira.
 */
export function resumePoint(
  units: Array<{ id: string; title: string; cycles: Array<{ id: string; title: string; exerciseId: string }> }>,
): Resume | null {
  const p = read()
  const hasAttempts = Object.values(p.units).some((unit) => Object.keys(unit.exercises).length > 0)
  if (!hasAttempts) return null
  let best: (Resume & { at: number }) | null = null

  for (const u of units) {
    for (const c of u.cycles) {
      const st = p.units[u.id]?.exercises[c.exerciseId]
      if (!st || st.solvedClean) continue
      const at = new Date(st.lastVisited).getTime()
      if (best && at <= best.at) continue
      best = {
        at,
        unitId: u.id,
        cycleId: c.id,
        cycleTitle: c.title,
        unitTitle: u.title,
        daysAgo: Math.floor((Date.now() - at) / 86_400_000),
      }
    }
  }

  if (best) { const { at: _at, ...rest } = best; return rest }

  // Tudo o que foi tentado saiu limpo: o ponto de retomada é o primeiro ciclo
  // que ainda não foi tentado.
  for (const u of units) {
    for (const c of u.cycles) {
      if (p.units[u.id]?.exercises[c.exerciseId]) continue
      return { unitId: u.id, cycleId: c.id, cycleTitle: c.title, unitTitle: u.title, daysAgo: 0 }
    }
  }
  return null
}


// ---------------------------------------------------------------------------
// Perfil
// ---------------------------------------------------------------------------

export function readProfile(): Profile | undefined {
  return read().profile
}

export function saveProfile(patch: Partial<Profile>): Progress {
  const p = read()
  const next: Progress = {
    ...p,
    profile: {
      createdAt: p.profile?.createdAt ?? new Date().toISOString(),
      codeLanguage: p.profile?.codeLanguage ?? 'pseudo',
      ...p.profile,
      ...patch,
    },
  }
  write(next)
  return next
}

/**
 * O export do perfil inteiro, para levar o progresso para outro navegador.
 *
 * É o contrapeso de não ter conta: sem servidor, a portabilidade tem de ser
 * explícita, e um arquivo que o dono guarda é mais privado que uma conta que
 * alguém hospeda.
 */
export function exportProfile(): string {
  return JSON.stringify(read(), null, 2)
}

export function importProfile(json: string): { ok: true } | { ok: false; reason: string } {
  try {
    const parsed = progressSchema.safeParse(JSON.parse(json))
    if (!parsed.success) {
      const migrated = migrate(JSON.parse(json))
      const retry = migrated ? progressSchema.safeParse(migrated) : null
      if (!retry?.success) return { ok: false, reason: 'o arquivo não é um perfil do Euclides' }
      write(retry.data)
      return { ok: true }
    }
    write(parsed.data)
    return { ok: true }
  } catch {
    return { ok: false, reason: 'o arquivo não é JSON válido' }
  }
}

/** Apaga tudo, inclusive o v1 que a migração deixou para trás de propósito. */
export function clearAll(): void {
  for (const k of [KEY, KEY_V1, KEY_LANG]) {
    try { window.localStorage.removeItem(k) } catch { /* modo privado */ }
  }
  try { window.dispatchEvent(new Event(PROGRESS_EVENT)) } catch { /* sem window */ }
}

export function resetTrail(): Progress {
  const current = read()
  const next: Progress = {
    schemaVersion: 2,
    profile: current.profile,
    units: {},
  }
  write(next)
  return next
}
