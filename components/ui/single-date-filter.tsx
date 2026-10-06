"use client"

import { useState } from "react"

import { Calendar } from "@/components/ui/calendar"
import { FilterChip, FilterChipButton } from "@/components/ui/filter-chip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatSingleDateLabel, parseLocalDate, toIsoDateOnly } from "@/lib/date-input"
import { glassMenu } from "@/lib/design"
import { cn } from "@/lib/utils"

export function SingleDateFilter({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string
  onChange: (next?: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = parseLocalDate(value)
  const isActive = Boolean(value)

  return (
    <FilterChip
      active={isActive}
      onClear={() => onChange(undefined)}
      clearLabel={`Clear ${label} filter`}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FilterChipButton
            label={label}
            value={formatSingleDateLabel(value, "All dates")}
            muted={!isActive}
            aria-label={label}
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(glassMenu, "w-auto p-2")}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (!date) {
                onChange(undefined)
                return
              }
              onChange(toIsoDateOnly(date))
              setOpen(false)
            }}
            defaultMonth={selected ?? new Date()}
          />
        </PopoverContent>
      </Popover>
    </FilterChip>
  )
}
