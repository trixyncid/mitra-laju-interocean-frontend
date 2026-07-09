"use client"

import { format, subDays } from "date-fns"

import type { DashboardQueryParams } from "@/app/dashboard/dashboard-types"
import { DatePicker } from "@/components/ui/date-picker"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

export type DateRangePreset = "7" | "30" | "90" | "custom"

export function getDateRangeFromPreset(preset: DateRangePreset): DashboardQueryParams {
  const end = new Date()
  const days = preset === "7" ? 7 : preset === "90" ? 90 : 30
  const start = subDays(end, days)

  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  }
}

interface DashboardDateRangeProps {
  preset: DateRangePreset
  startDate: string
  endDate: string
  onPresetChange: (preset: DateRangePreset) => void
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  className?: string
}

export function DashboardDateRange({
  preset,
  startDate,
  endDate,
  onPresetChange,
  onStartDateChange,
  onEndDateChange,
  className,
}: DashboardDateRangeProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end", className)}>
      <ToggleGroup
        type="single"
        value={preset === "custom" ? "" : preset}
        onValueChange={(value) => {
          if (value === "7" || value === "30" || value === "90") {
            onPresetChange(value)
          }
        }}
        className="justify-start"
      >
        <ToggleGroupItem value="7" className="rounded-full px-4">
          7 days
        </ToggleGroupItem>
        <ToggleGroupItem value="30" className="rounded-full px-4">
          30 days
        </ToggleGroupItem>
        <ToggleGroupItem value="90" className="rounded-full px-4">
          90 days
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="flex flex-wrap items-end gap-3">
        <DatePicker
          label="From"
          value={startDate}
          onValueChange={(date) => {
            onPresetChange("custom")
            onStartDateChange(date)
          }}
          outputFormat="date-only"
          className="min-w-[10.5rem]"
        />
        <DatePicker
          label="To"
          value={endDate}
          onValueChange={(date) => {
            onPresetChange("custom")
            onEndDateChange(date)
          }}
          outputFormat="date-only"
          className="min-w-[10.5rem]"
        />
      </div>
    </div>
  )
}
