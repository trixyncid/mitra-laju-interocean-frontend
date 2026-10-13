import { useSyncExternalStore } from "react"

const DESKTOP_QUERY = "(min-width: 1024px)"

/** True at the `lg` breakpoint and up; the server render assumes desktop. */
export function useIsDesktop() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(DESKTOP_QUERY)
      query.addEventListener("change", notify)
      return () => query.removeEventListener("change", notify)
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true
  )
}
