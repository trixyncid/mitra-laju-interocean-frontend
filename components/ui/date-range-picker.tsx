"use client"

import { useEffect, useMemo, useState } from "react"
import {
  format,
  isSameMonth,
  isSameYear,
  startOfMonth,
  subDays,
} from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { FilterChip, FilterChipButton } from "@/components/ui/filter-chip"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { parseLocalDate, toIsoDateOnly } from "@/lib/date-input"
import { glassControl, glassMenu } from "@/lib/design"
import { useIsMobile } from "@/hooks/use-mobile"
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
  /** Compact glass chip for page headers; toolbar sits inline with search. */
  layout?: "stacked" | "inline" | "toolbar" | "embedded"
  /** When false, hides the "All dates" preset (useful for required ranges). */
  showAllOption?: boolean
}

type DatePreset = {
  id: string
  label: string
  range: TableDateRange
}

function getDatePresets(today = new Date()): DatePreset[] {
  const todayIso = toIsoDateOnly(today)
  return [
    {
      id: "today",
      label: "Today",
      range: { from: todayIso, to: todayIso },
    },
    {
      id: "7d",
      label: "Last 7 days",
      range: { from: toIsoDateOnly(subDays(today, 6)), to: todayIso },
    },
    {
      id: "30d",
      label: "Last 30 days",
      range: { from: toIsoDateOnly(subDays(today, 29)), to: todayIso },
    },
    {
      id: "month",
      label: "This month",
      range: { from: toIsoDateOnly(startOfMonth(today)), to: todayIso },
    },
  ]
}

function isSameRange(a: TableDateRange, b: TableDateRange) {
  return a.from === b.from && a.to === b.to
}

function formatRangeLabel(value: TableDateRange, emptyLabel = "Pick date range") {
  const from = parseLocalDate(value.from)
  const to = parseLocalDate(value.to)

  if (from && to) {
    return `${format(from, "dd MMM yyyy")} – ${format(to, "dd MMM yyyy")}`
  }
  if (from) return `From ${format(from, "dd MMM yyyy")}`
  if (to) return `Until ${format(to, "dd MMM yyyy")}`
  return emptyLabel
}

function formatChipRangeLabel(value: TableDateRange) {
  const from = parseLocalDate(value.from)
  const to = parseLocalDate(value.to)

  if (from && to) {
    if (isSameMonth(from, to) && isSameYear(from, to)) {
      return `${format(from, "d")} – ${format(to, "d MMM")}`
    }
    if (isSameYear(from, to)) {
      return `${format(from, "d MMM")} – ${format(to, "d MMM")}`
    }
    return `${format(from, "d MMM yyyy")} – ${format(to, "d MMM yyyy")}`
  }
  if (from) return `From ${format(from, "d MMM")}`
  if (to) return `Until ${format(to, "d MMM")}`
  return "All dates"
}

function toDateRange(value: TableDateRange): DateRange | undefined {
  if (!value.from && !value.to) return undefined
  return {
    from: parseLocalDate(value.from),
    to: parseLocalDate(value.to),
  }
}

function DateRangePanel({
  value,
  onChange,
  onPresetSelect,
  open = true,
  showAllOption = true,
  autoApplyComplete = false,
  numberOfMonths = 2,
}: {
  value: TableDateRange
  onChange: (next: TableDateRange) => void
  onPresetSelect?: () => void
  open?: boolean
  showAllOption?: boolean
  /** Commit as soon as both ends of the range are chosen (skip Apply). */
  autoApplyComplete?: boolean
  numberOfMonths?: number
}) {
  const presets = useMemo(() => getDatePresets(), [])
  const [draft, setDraft] = useState<DateRange | undefined>(() =>
    toDateRange(value)
  )
  const [month, setMonth] = useState<Date>(
    () => draft?.from ?? draft?.to ?? new Date()
  )

  useEffect(() => {
    if (!open) return
    const next = toDateRange(value)
    setDraft(next)
    setMonth(next?.from ?? next?.to ?? new Date())
  }, [open, value.from, value.to])

  const summary = formatRangeLabel(
    {
      from: draft?.from ? toIsoDateOnly(draft.from) : undefined,
      to: draft?.to ? toIsoDateOnly(draft.to) : undefined,
    },
    "Select a start and end date"
  )

  const applyRange = (range: TableDateRange, close = false) => {
    setDraft(toDateRange(range))
    onChange(range)
    const nextMonth = parseLocalDate(range.from) ?? parseLocalDate(range.to)
    if (nextMonth) setMonth(nextMonth)
    if (close) onPresetSelect?.()
  }

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-wrap gap-1 border-b border-[rgba(214,227,255,0.4)] p-2 md:w-40 md:flex-col md:flex-nowrap md:border-r md:border-b-0">
          {presets.map((preset) => {
            const isSelected = isSameRange(value, preset.range)
            return (
              <button
                key={preset.id}
                type="button"
                className={cn(
                  "h-8 cursor-pointer rounded-md px-2.5 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-[rgba(232,238,246,0.9)]"
                )}
                onClick={() => applyRange(preset.range, true)}
              >
                {preset.label}
              </button>
            )
          })}
          {showAllOption ? (
            <button
              type="button"
              className={cn(
                "h-8 cursor-pointer rounded-md px-2.5 text-left text-sm transition-colors",
                !value.from && !value.to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-[rgba(232,238,246,0.9)] hover:text-foreground"
              )}
              onClick={() => applyRange({}, true)}
            >
              All dates
            </button>
          ) : null}
        </div>
        <Calendar
          mode="range"
          min={1}
          numberOfMonths={numberOfMonths}
          month={month}
          onMonthChange={setMonth}
          selected={draft}
          onSelect={(range) => {
            setDraft(range)
            if (range?.from) setMonth(range.from)
            if (autoApplyComplete && range?.from && range?.to) {
              applyRange(
                {
                  from: toIsoDateOnly(range.from),
                  to: toIsoDateOnly(range.to),
                },
                false
              )
            }
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[rgba(214,227,255,0.4)] px-3 py-2">
        <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {summary}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {draft?.from || draft?.to ? (
            <button
              type="button"
              className="cursor-pointer text-xs font-medium text-[var(--mli-primary-container)] hover:underline"
              onClick={() => {
                setDraft(undefined)
                if (autoApplyComplete) onChange({})
              }}
            >
              Clear
            </button>
          ) : null}
          {autoApplyComplete ? null : (
            <Button
              type="button"
              size="sm"
              className="h-8 cursor-pointer px-3"
              disabled={!draft?.from || !draft?.to}
              onClick={() => {
                if (!draft?.from || !draft.to) return
                applyRange(
                  {
                    from: toIsoDateOnly(draft.from),
                    to: toIsoDateOnly(draft.to),
                  },
                  true
                )
              }}
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function DateRangePicker({
  label,
  value,
  onChange,
  className,
  layout = "stacked",
  showAllOption = true,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const hasRange = Boolean(value.from || value.to)
  const compact = layout === "inline"

  if (layout === "embedded") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
        <div className="overflow-x-auto rounded-md border border-[rgba(214,227,255,0.45)] bg-[rgba(247,249,251,0.72)]">
          <DateRangePanel
            value={value}
            onChange={onChange}
            showAllOption={showAllOption}
            autoApplyComplete
            numberOfMonths={isMobile ? 1 : 2}
          />
        </div>
      </div>
    )
  }

  const trigger = (
    <div
      className={cn(
        "flex items-center",
        layout === "inline"
          ? "min-w-[12rem] gap-1 sm:min-w-[15rem]"
          : "w-fit min-w-[16rem] gap-2"
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              glassControl,
              "flex-1 justify-start border text-sm font-normal text-foreground shadow-none hover:text-foreground",
              layout === "inline"
                ? "h-9 bg-transparent px-3 has-[>svg]:px-3 hover:bg-[rgba(247,249,251,0.55)]"
                : "h-11 px-5 has-[>svg]:px-5"
            )}
            aria-label={`${label} date range`}
          >
            <CalendarIcon className="size-4 shrink-0 text-[var(--mli-primary-container)]/70" />
            <span className="truncate">{formatRangeLabel(value)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(glassMenu, "w-auto p-0")}
          align={layout === "inline" ? "end" : "start"}
        >
          <DateRangePanel
            open={open}
            value={value}
            onChange={onChange}
            onPresetSelect={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
      {hasRange ? (
        <button
          type="button"
          className={cn(
            "flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-[rgba(232,238,246,0.8)] hover:text-foreground",
            compact ? "size-8" : "size-11"
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

  if (layout === "toolbar") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <FilterChip
          active={hasRange}
          onClear={() => onChange({})}
          clearLabel={`Clear ${label} filter`}
          className={className}
        >
          <PopoverTrigger asChild>
            <FilterChipButton
              label={label}
              value={formatChipRangeLabel(value)}
              muted={!hasRange}
              aria-label={`${label} date range`}
            />
          </PopoverTrigger>
        </FilterChip>
        <PopoverContent className={cn(glassMenu, "w-auto p-0")} align="end">
          <DateRangePanel
            open={open}
            value={value}
            onChange={onChange}
            onPresetSelect={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
    )
  }

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
