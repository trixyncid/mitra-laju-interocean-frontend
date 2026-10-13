import type { ComponentType, ReactNode } from "react"

import { cn } from "@/lib/utils"

/** A small read-only card of facts about a record (dates, tax ID, address…). */
export function RecordFacts({
  title,
  rows,
  className,
}: {
  title: string
  rows: { icon: ComponentType<{ className?: string }>; label: string; value: ReactNode }[]
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl surface p-5", className)}>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <dl className="mt-4 space-y-3.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <row.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{row.label}</dt>
              <dd className="text-sm font-medium break-words text-foreground">{row.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  )
}
