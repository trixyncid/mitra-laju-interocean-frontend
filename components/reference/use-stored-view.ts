"use client"

import { useCallback, useSyncExternalStore } from "react"

const EVENT = "mli:reference-view"
// Keeps the choice for this visit when the browser blocks storage.
const memory = new Map<string, string>()

function read(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? memory.get(key) ?? null
  } catch {
    return memory.get(key) ?? null
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  window.addEventListener(EVENT, callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(EVENT, callback)
  }
}

/** A remembered view choice (e.g. board or table). Falls back safely without storage. */
export function useStoredView<T extends string>(key: string, options: readonly T[], fallback: T) {
  const stored = useSyncExternalStore(subscribe, () => read(key), () => null)
  const view = options.includes(stored as T) ? (stored as T) : fallback

  const setView = useCallback(
    (next: T) => {
      memory.set(key, next)
      try {
        localStorage.setItem(key, next)
      } catch {
        // Private mode or blocked storage: the choice just isn't remembered.
      }
      window.dispatchEvent(new Event(EVENT))
    },
    [key]
  )

  return [view, setView] as const
}
