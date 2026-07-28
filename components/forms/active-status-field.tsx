"use client"

import { Dot } from "lucide-react"

import { Label } from "@/components/ui/label"
import { glassInset } from "@/lib/design"
import { cn } from "@/lib/utils"

type ActiveStatusFieldProps = {
  id: string
  value: boolean
  onChange: (next: boolean) => void
  className?: string
  description?: string
}

export function ActiveStatusField({
  id,
  value,
  onChange,
  className,
  description = "Inactive records remain in history but are hidden from new selections.",
}: ActiveStatusFieldProps) {
  const labelId = `${id}-status-label`

  return (
    <div className={cn("space-y-2", className)}>
      <Label id={labelId} className="text-sm font-medium text-foreground">
        Status
      </Label>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className={cn(glassInset, "grid grid-cols-2 gap-1.5 p-1.5")}
      >
        <button
          type="button"
          id={`${id}-active`}
          role="radio"
          aria-checked={value}
          tabIndex={value ? 0 : -1}
          onClick={() => onChange(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
              event.preventDefault()
              onChange(false)
              document.getElementById(`${id}-inactive`)?.focus()
            }
          }}
          className={cn(
            "flex h-11 cursor-pointer items-center justify-center gap-1 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20",
            value
              ? "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)] shadow-sm"
              : "text-muted-foreground hover:bg-[rgba(247,249,251,0.9)] hover:text-foreground"
          )}
        >
          <Dot
            className={cn(
              "-ml-0.5 size-4",
              value
                ? "text-[var(--mli-on-success-container)]"
                : "text-muted-foreground/70"
            )}
          />
          Active
        </button>
        <button
          type="button"
          id={`${id}-inactive`}
          role="radio"
          aria-checked={!value}
          tabIndex={!value ? 0 : -1}
          onClick={() => onChange(false)}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
              event.preventDefault()
              onChange(true)
              document.getElementById(`${id}-active`)?.focus()
            }
          }}
          className={cn(
            "flex h-11 cursor-pointer items-center justify-center gap-1 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20",
            !value
              ? "bg-[var(--mli-error-container)] text-[var(--mli-on-error-container)] shadow-sm"
              : "text-muted-foreground hover:bg-[rgba(247,249,251,0.9)] hover:text-foreground"
          )}
        >
          <Dot
            className={cn(
              "-ml-0.5 size-4",
              !value
                ? "text-[var(--mli-on-error-container)]"
                : "text-muted-foreground/70"
            )}
          />
          Inactive
        </button>
      </div>
      {description ? (
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
