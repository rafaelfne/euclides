'use client'

import { progress as progressSchema, type Progress } from '@/content/schema'

/**
 * localStorage, versioned and validated on read. No backend, no auth, which
 * is what keeps the marginal cost per reader at zero and lets this be public.
 *
 * A schema mismatch never breaks the screen: it resets and says so.
 */
const KEY = 'euclides.progress.v1'
const empty = (): Progress => ({ schemaVersion: 1, units: {} })

export function read(): Progress {
  if (typeof window === 'undefined') return empty()
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return empty()
    const parsed = progressSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : empty()
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

export function recordAttempt(
  unitId: string, exerciseId: string,
  patch: { solved: boolean; misconception?: string },
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
  unit.exercises[exerciseId] = {
    attempts: prev.attempts + 1,
    solved: prev.solved || patch.solved,
    // Solving on the first attempt with no misconception triggered is the only
    // thing that counts as mastery. Getting there in four tries is getting there.
    solvedClean: prev.solvedClean || (patch.solved && prev.attempts === 0 && triggered.length === 0),
    misconceptionsTriggered: triggered,
    freeText: prev.freeText,
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
