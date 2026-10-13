import { useCallback, useSyncExternalStore } from "react"

const listeners = new Set<() => void>()

function subscribe(notify: () => void) {
  listeners.add(notify)
  window.addEventListener("storage", notify)
  return () => {
    listeners.delete(notify)
    window.removeEventListener("storage", notify)
  }
}

/**
 * A small UI preference remembered in this browser (view mode, density…).
 * The server render uses `fallback`; stored values outside `options` are ignored.
 */
export function usePersistedChoice<T extends string>(
  key: string,
  options: readonly T[],
  fallback: T
) {
  const read = () => {
    try {
      const stored = window.localStorage.getItem(key)
      return options.includes(stored as T) ? (stored as T) : fallback
    } catch {
      return fallback
    }
  }

  const value = useSyncExternalStore(subscribe, read, () => fallback)

  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, next)
      } catch {
        // Storage unavailable — the choice simply won't persist.
      }
      listeners.forEach((notify) => notify())
    },
    [key]
  )

  return [value, setValue] as const
}
