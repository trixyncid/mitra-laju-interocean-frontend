"use client"

import { format, subDays } from "date-fns"
import { CalendarIcon } from "lucide-react"

import type { DashboardQueryParams } from "@/app/dashboard/dashboard-types"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
        <DateField
          label="From"
          value={startDate}
          onChange={(date) => {
            onPresetChange("custom")
            onStartDateChange(date)
          }}
        />
        <DateField
          label="To"
          value={endDate}
          onChange={(date) => {
            onPresetChange("custom")
            onEndDateChange(date)
          }}
        />
      </div>
    </div>
  )
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (isoDate: string) => void
}) {
  const selected = value ? new Date(`${value}T12:00:00`) : undefined

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-11 min-w-[10.5rem] justify-start rounded-full px-4 font-normal"
          >
            <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
            {value ? format(selected!, "dd MMM yyyy") : "Pick date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-2xl p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) onChange(format(date, "yyyy-MM-dd"))
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
