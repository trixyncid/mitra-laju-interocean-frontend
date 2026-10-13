"use client"

import { cn } from "@/lib/utils"
import { SHIPMENT_STATUS_OPTIONS, type ShipmentStatus } from "@/lib/shipment-status"

const HINT: Record<ShipmentStatus, string> = {
  DRAFT: "Still planning",
  BACKUP: "Kept as a spare",
  ONGOING: "Moving now",
  FINISHED: "Already done",
}

const DOT: Record<ShipmentStatus, string> = {
  DRAFT: "bg-slate-400",
  BACKUP: "bg-amber-500",
  ONGOING: "bg-emerald-500",
  FINISHED: "bg-[var(--mli-primary-container)]",
}

/** Four status cards in a radio group. Arrow keys move between them. */
export function ShipmentStatusPicker({
  id,
  value,
  onValueChange,
}: {
  id: string
  value: ShipmentStatus
  onValueChange: (status: ShipmentStatus) => void
}) {
  const options = SHIPMENT_STATUS_OPTIONS
  return (
    <div>
      <p id={`${id}-label`} className="mb-2 text-sm font-medium text-foreground">
        Shipment status <span className="text-destructive">*</span>
      </p>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {options.map((option, index) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              id={index === 0 ? id : undefined}
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onValueChange(option.value)}
              onKeyDown={(event) => {
                const step =
                  event.key === "ArrowRight" || event.key === "ArrowDown"
                    ? 1
                    : event.key === "ArrowLeft" || event.key === "ArrowUp"
                      ? -1
                      : 0
                if (!step) return
                event.preventDefault()
                const nextIndex = (index + step + options.length) % options.length
                onValueChange(options[nextIndex].value)
                ;(event.currentTarget.parentElement?.children[nextIndex] as HTMLElement | undefined)?.focus()
              }}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                active
                  ? "bg-card shadow-elev-1 ring-2 ring-primary"
                  : "bg-[rgba(var(--mli-inset-rgb),0.85)] hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span aria-hidden className={cn("size-2 rounded-full", DOT[option.value])} />
                {option.label}
              </span>
              <span className="text-xs text-muted-foreground">{HINT[option.value]}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        New shipments usually start as Draft. You can change it later.
      </p>
    </div>
  )
}
