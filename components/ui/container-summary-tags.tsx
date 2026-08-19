"use client"

import { secondaryText } from "@/lib/design"
import { cn } from "@/lib/utils"

export type ContainerSummary = {
  containerNumber: string | null
  sealNumber: string | null
  containerSize?: { name: string } | null
  containerType?: { name: string } | null
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
