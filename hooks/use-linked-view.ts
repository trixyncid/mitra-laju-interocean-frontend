"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

/**
 * The view to show on a list page that remembers split vs table.
 * A link to one record (e.g. `?selling=<id>`) opens the split view so the record
 * is visible, without changing the saved choice; picking a view drops that link.
 */
export function useLinkedView<T extends string>(view: T, setView: (next: T) => void, param: string, split: T) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const linked = searchParams.has(param)

  const choose = (next: T) => {
    setView(next)
    if (next !== split && linked) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete(param)
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    }
  }

  return [linked ? split : view, choose] as const
}
