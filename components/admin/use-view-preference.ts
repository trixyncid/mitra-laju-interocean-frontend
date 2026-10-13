"use client"

import { useSyncExternalStore } from "react"

const EVENT = "mli-view-preference"
/** Used when storage is blocked, so the choice still lasts until reload. */
const memory = new Map<string, string>()

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null
  } catch {
    return memory.get(key) ?? null
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

/** A per-browser view choice (cards or table). Falls back quietly when storage is blocked. */
export function useViewPreference<T extends string>(key: string, options: readonly T[], fallback: T) {
  const stored = useSyncExternalStore(subscribe, () => read(key), () => null)
  const value = stored && (options as readonly string[]).includes(stored) ? (stored as T) : fallback

  const setValue = (next: T) => {
    memory.set(key, next)
    try {
      window.localStorage.setItem(key, next)
    } catch {
      // Storage blocked: the in-memory copy is used instead.
    }
    window.dispatchEvent(new Event(EVENT))
  }

  return [value, setValue] as const
}
