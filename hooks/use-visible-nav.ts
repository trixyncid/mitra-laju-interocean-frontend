import { useMemo } from "react"

import { usePermissions } from "@/hooks/use-permissions"
import { isModuleEnabled } from "@/lib/feature-flags"
import { NAV_ENTRIES, type NavEntry, type NavLinkItem } from "@/lib/nav"
import { canManageRoles } from "@/lib/permissions"

/** Navigation entries the current user may see; empty groups are dropped. */
export function useVisibleNav() {
  const { can, role, isPending } = usePermissions()

  const entries = useMemo(() => {
    const isVisible = (item: NavLinkItem) => {
      if (!isModuleEnabled(item.module)) return false
      if (item.module === "ROLE") return canManageRoles(role)
      return can(item.module, "view")
    }

    return NAV_ENTRIES.flatMap<NavEntry>((entry) => {
      if (entry.kind === "link") return isVisible(entry) ? [entry] : []
      const items = entry.items.filter(isVisible)
      return items.length > 0 ? [{ ...entry, items }] : []
    })
  }, [can, role])

  const links = useMemo(
    () =>
      entries.flatMap((entry) => (entry.kind === "link" ? [entry] : entry.items)),
    [entries]
  )

  return { entries, links, isPending }
}
