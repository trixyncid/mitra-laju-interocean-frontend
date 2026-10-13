"use client"

import { IconLayoutColumns, IconTable } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

export type LineViewMode = "split" | "table"

const OPTIONS = [
  { value: "split" as const, label: "Split view", short: "List", icon: IconLayoutColumns },
  { value: "table" as const, label: "Table", short: "Table", icon: IconTable },
]

/** Split view (list + details) or a full-width table, as on Shipments. */
export function LineViewToggle({ view, onChange }: { view: LineViewMode; onChange: (view: LineViewMode) => void }) {
  return (
    <div role="radiogroup" aria-label="View" className="flex h-10 items-center rounded-full bg-card p-1">
      {OPTIONS.map(({ value, label, short, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={view === value}
          onClick={() => onChange(value)}
          className={cn(
            "flex h-full cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
            view === value ? "brand-fill" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-4" />
          <span className="lg:hidden">{short}</span>
          <span className="hidden lg:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
