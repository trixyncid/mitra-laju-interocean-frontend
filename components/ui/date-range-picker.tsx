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
}: DateRangePickerProps) {
  const selected: DateRange | undefined =
    value.from || value.to
      ? {
          from: parseLocalDate(value.from),
          to: parseLocalDate(value.to),
        }
      : undefined

  const hasRange = Boolean(value.from || value.to)

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="relative w-fit min-w-[16rem]">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-11 w-full justify-start rounded-full bg-card px-4 font-normal",
                hasRange && "pr-10",
                !hasRange && "text-muted-foreground"
              )}
              aria-label={`${label} date range`}
            >
              <CalendarIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{formatRangeLabel(value)}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto rounded-2xl p-0" align="start">
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
            className="absolute top-1/2 right-3 z-10 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
    </div>
  )
}
