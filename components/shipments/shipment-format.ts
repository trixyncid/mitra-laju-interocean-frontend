import { format } from "date-fns"
import { formatCalendarDate, parseLocalDate } from "@/lib/date-input"

export { vendorLabel, type VendorRef } from "@/lib/vendor-label"

export function shortDate(value: string | null | undefined) {
  const formatted = formatCalendarDate(value, "")
  return formatted || null
}

/** "4 Oct" — day and month only, for tight labels. */
export function dayMonth(value: string | null | undefined) {
  const parsed = parseLocalDate(value)
  if (!parsed) return null
  return format(parsed, "d MMM")
}

type ContainerLike = {
  containerSize?: { name: string } | null
  containerType?: { name: string } | null
}

/** "2 × 40' DRY · 1 × 20' RF" — groups containers by size and type. */
export function summarizeContainers(containers: ContainerLike[]) {
  const groups = new Map<string, number>()
  for (const container of containers) {
    const size = container.containerSize?.name
    const type = container.containerType?.name
    const key = [size ? `${size}'` : null, type].filter(Boolean).join(" ") || "Unspecified"
    groups.set(key, (groups.get(key) ?? 0) + 1)
  }
  return [...groups.entries()].map(([key, count]) => `${count} × ${key}`).join(" · ")
}

export function modifiedByName(value: unknown) {
  if (!value) return null
  if (typeof value === "string") return value
  if (typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name
    return typeof name === "string" ? name : null
  }
  return null
}
