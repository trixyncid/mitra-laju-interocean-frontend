"use client"

import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { parseLocalDate, toIsoDateOnly } from "@/lib/date-input"
import { glassControl } from "@/lib/design"
import { cn } from "@/lib/utils"

export type TableDateRange = {
  from?: string
  to?: string
}

type DateRangePickerProps = {
  label: string
  value: TableDateRange
  onChange: (next: TableDateRange) => void
  className?: string
  /** Compact glass chip for page headers; default stacked layout for toolbars. */
  layout?: "stacked" | "inline"
}

function formatRangeLabel(value: TableDateRange) {
  const from = parseLocalDate(value.from)
  const to = parseLocalDate(value.to)

  if (from && to) {
    return `${format(from, "dd MMM yyyy")} – ${format(to, "dd MMM yyyy")}`
  }
  if (from) return `From ${format(from, "dd MMM yyyy")}`
  if (to) return `Until ${format(to, "dd MMM yyyy")}`
  return "Pick date range"
}

export function DateRangePicker({
  label,
  value,
  onChange,
  className,
  layout = "stacked",
}: DateRangePickerProps) {
  const selected: DateRange | undefined =
    value.from || value.to
      ? {
          from: parseLocalDate(value.from),
          to: parseLocalDate(value.to),
        }
      : undefined

  const hasRange = Boolean(value.from || value.to)

  const trigger = (
    <div
      className={cn(
        "flex items-center",
        layout === "inline"
          ? "min-w-[12rem] gap-1 sm:min-w-[15rem]"
          : "w-fit min-w-[16rem] gap-2"
      )}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              glassControl,
              "flex-1 justify-start border text-sm font-normal text-foreground shadow-none hover:text-foreground",
              layout === "inline"
                ? "h-9 px-3 has-[>svg]:px-3 bg-transparent hover:bg-[rgba(247,249,251,0.55)]"
                : "h-11 px-5 has-[>svg]:px-5"
            )}
            aria-label={`${label} date range`}
          >
            <CalendarIcon className="size-4 shrink-0 text-[var(--mli-primary-container)]/70" />
            <span className="truncate">{formatRangeLabel(value)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto rounded-lg border-[rgba(214,227,255,0.45)] bg-[rgba(247,249,251,0.96)] p-0 shadow-[0_16px_40px_rgba(27,54,93,0.12)] backdrop-blur-xl"
          align={layout === "inline" ? "end" : "start"}
        >
          <Calendar
            mode="range"
            numberOfMonths={2}
            defaultMonth={selected?.from ?? selected?.to}
            selected={selected}
            onSelect={(range) => {
              onChange({
                from: range?.from ? toIsoDateOnly(range.from) : undefined,
                to: range?.to ? toIsoDateOnly(range.to) : undefined,
              })
            }}
          />
        </PopoverContent>
      </Popover>
      {hasRange ? (
        <button
          type="button"
          className={cn(
            "flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-[rgba(232,238,246,0.8)] hover:text-foreground",
            layout === "inline" ? "size-8" : "size-11"
          )}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onChange({})
          }}
          aria-label={`Clear ${label} date range`}
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  )

  if (layout === "inline") {
    return (
      <div
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border border-[rgba(214,227,255,0.55)] bg-[rgba(232,238,246,0.72)] px-3 py-2 shadow-[0_8px_32px_rgba(27,54,93,0.06)] backdrop-blur-xl sm:w-auto",
          className
        )}
      >
        <span className="shrink-0 text-[10px] font-semibold tracking-[0.12em] text-[var(--mli-primary-container)]/70 uppercase">
          {label}
        </span>
        {trigger}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {trigger}
    </div>
  )
}
