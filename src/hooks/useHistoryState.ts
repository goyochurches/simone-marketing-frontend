import { useCallback, useMemo, useState } from 'react'

const MAX_HISTORY = 60

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

export interface UseHistoryState<T> {
  state: T
  /** Replaces the current state. Pass `commit: false` while a drag/continuous edit is in progress, then commit once on release. */
  set: (updater: T | ((prev: T) => T), options?: { commit?: boolean }) => void
  /** Seals a finished drag/continuous edit into history: `origin` is the state captured before the gesture started. */
  commitDrag: (origin: T) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  reset: (next: T) => void
}

export function useHistoryState<T>(initial: T): UseHistoryState<T> {
  const [history, setHistory] = useState<HistoryState<T>>({ past: [], present: initial, future: [] })

  const set = useCallback((updater: T | ((prev: T) => T), options?: { commit?: boolean }) => {
    const commit = options?.commit ?? true
    setHistory(h => {
      const next = typeof updater === 'function' ? (updater as (prev: T) => T)(h.present) : updater
      if (next === h.present) return h
      if (!commit) return { ...h, present: next }
      const past = [...h.past, h.present].slice(-MAX_HISTORY)
      return { past, present: next, future: [] }
    })
  }, [])

  const commitDrag = useCallback((origin: T) => {
    setHistory(h => {
      if (origin === h.present) return h
      return { past: [...h.past, origin].slice(-MAX_HISTORY), present: h.present, future: [] }
    })
  }, [])

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.past.length === 0) return h
      const previous = h.past[h.past.length - 1]
      return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory(h => {
      if (h.future.length === 0) return h
      const next = h.future[0]
      return { past: [...h.past, h.present], present: next, future: h.future.slice(1) }
    })
  }, [])

  const reset = useCallback((next: T) => {
    setHistory({ past: [], present: next, future: [] })
  }, [])

  return useMemo(
    () => ({
      state: history.present,
      set,
      commitDrag,
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      reset,
    }),
    [history, set, commitDrag, undo, redo, reset],
  )
}
