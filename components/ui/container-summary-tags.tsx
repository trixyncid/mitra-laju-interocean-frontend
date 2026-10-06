"use client"

import { secondaryText } from "@/lib/design"
import { cn } from "@/lib/utils"

export type ContainerSummary = {
  containerNumber: string | null
  sealNumber: string | null
  containerSize?: { name: string } | null
  containerType?: { name: string } | null
}

/** Breakdown (or similar) row that may carry optional container metadata. */
export type CostingContainerSource = {
  id?: string
  containerNumber?: string | null
  containerSizeId?: string | null
  containerTypeId?: string | null
  containerSize?: { id?: string; name: string } | null
  containerType?: { id?: string; name: string } | null
}

export type DetectedCostingContainer = {
  key: string
  containerNumber: string | null
  containerSize: { id?: string; name: string } | null
  containerType: { id?: string; name: string } | null
  lineCount: number
}

const tagClassName =
  "inline-flex max-w-full items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium leading-4 text-secondary-foreground"

export function formatContainerTag(container: ContainerSummary) {
  return [
    container.containerNumber,
    container.sealNumber,
    container.containerSize?.name,
    container.containerType?.name,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" · ")
}

export function hasCostingContainer(line: CostingContainerSource) {
  return Boolean(
    line.containerNumber?.trim() ||
      line.containerSize?.name?.trim() ||
      line.containerType?.name?.trim() ||
      line.containerSizeId ||
      line.containerTypeId
  )
}

/** Unique containers inferred from costing breakdown lines (deduped by number). */
export function extractCostingContainers(
  lines: CostingContainerSource[] | null | undefined
): DetectedCostingContainer[] {
  const byKey = new Map<string, DetectedCostingContainer>()

  for (const [index, line] of (lines ?? []).entries()) {
    if (!hasCostingContainer(line)) continue

    const number = line.containerNumber?.trim() || null
    const key = number
      ? `num:${number.toUpperCase()}`
      : `line:${line.id ?? index}`

    const existing = byKey.get(key)
    if (existing) {
      existing.lineCount += 1
      if (!existing.containerSize && line.containerSize) {
        existing.containerSize = line.containerSize
      }
      if (!existing.containerType && line.containerType) {
        existing.containerType = line.containerType
      }
      continue
    }

    byKey.set(key, {
      key,
      containerNumber: number,
      containerSize: line.containerSize ?? null,
      containerType: line.containerType ?? null,
      lineCount: 1,
    })
  }

  return [...byKey.values()].sort((a, b) => {
    const aLabel = a.containerNumber ?? ""
    const bLabel = b.containerNumber ?? ""
    if (aLabel && bLabel) return aLabel.localeCompare(bLabel)
    if (aLabel) return -1
    if (bLabel) return 1
    const aMix = containerMixLabel(a)
    const bMix = containerMixLabel(b)
    return aMix.localeCompare(bMix)
  })
}

function containerMixLabel(container: {
  containerSize?: { name: string } | null
  containerType?: { name: string } | null
}) {
  const size = container.containerSize?.name?.trim() ?? ""
  const type = container.containerType?.name?.trim() ?? ""
  return `${size}${type}` || "?"
}

/** e.g. "1x 20DRY · 2x 40RF" from breakdown container fields. */
export function formatCostingContainerMix(
  lines: CostingContainerSource[] | null | undefined
) {
  return getCostingContainerMixEntries(lines)
    .map(({ count, label }) => `${count}x ${label}`)
    .join(" · ")
}

export function getCostingContainerMixEntries(
  lines: CostingContainerSource[] | null | undefined
) {
  const containers = extractCostingContainers(lines)
  if (containers.length === 0) return []

  const counts = new Map<string, number>()
  for (const container of containers) {
    const label = containerMixLabel(container)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([label, count]) => ({ label, count }))
}

function mixBadgeClassName(label: string) {
  const upper = label.toUpperCase()
  if (upper.includes("RF")) {
    return "bg-[rgba(191,219,254,0.65)] text-[var(--mli-primary-container)]"
  }
  if (upper.includes("DRY")) {
    return "bg-[rgba(214,227,255,0.7)] text-[var(--mli-primary-container)]"
  }
  return "bg-secondary text-secondary-foreground"
}

/** Badge row for costing list Container column, e.g. `1x 20DRY` · `2x 40RF`. */
export function CostingContainerMixBadges({
  lines,
}: {
  lines?: CostingContainerSource[] | null
}) {
  const entries = getCostingContainerMixEntries(lines)
  if (entries.length === 0) {
    return <span className={secondaryText}>—</span>
  }

  const title = entries.map(({ count, label }) => `${count}x ${label}`).join(" · ")

  return (
    <div className="flex max-w-[16rem] flex-wrap items-center gap-1.5" title={title}>
      {entries.map(({ count, label }) => (
        <span
          key={label}
          className={cn(
            "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold tracking-[0.02em] tabular-nums",
            mixBadgeClassName(label)
          )}
        >
          {count}x {label}
        </span>
      ))}
    </div>
  )
}

export function ContainerSummaryTags({
  containers = [],
}: {
  containers?: ContainerSummary[] | null
}) {
  const tags = (containers ?? [])
    .map((container) => ({
      key: [
        container.containerNumber,
        container.sealNumber,
        container.containerSize?.name,
        container.containerType?.name,
      ].join("-"),
      label: formatContainerTag(container),
    }))
    .filter((tag) => tag.label)

  const first = tags[0]
  if (!first) {
    return <span className={secondaryText}>—</span>
  }

  const rest = tags.slice(1)

  return (
    <div className="flex min-w-0 items-center gap-1">
      <span title={first.label} className={tagClassName}>
        <span className="truncate">{first.label}</span>
      </span>
      {rest.length > 0 ? (
        <span
          title={rest.map((tag) => tag.label).join("\n")}
          className={cn(tagClassName, "shrink-0")}
        >
          +1
        </span>
      ) : null}
    </div>
  )
}
