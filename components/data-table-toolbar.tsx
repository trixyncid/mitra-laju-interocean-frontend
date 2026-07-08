"use client"

import { Search, X } from "lucide-react"
import { FormEvent, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DateRangePicker,
  type TableDateRange,
} from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  hasDateRange,
  type TableFilterConfig,
} from "@/lib/data-table-filters"
import { tableSearchInput } from "@/lib/design"
import { cn } from "@/lib/utils"

export type AppliedTableFilters = {
  search: string
  status: string
  dateRange: TableDateRange
}

type DataTableToolbarProps<TData> = {
  searchPlaceholder: string
  showSearch?: boolean
  filters?: TableFilterConfig<TData>
  applied: AppliedTableFilters
  onApply: (next: AppliedTableFilters) => void
  className?: string
}

export function DataTableToolbar<TData>({
  searchPlaceholder,
  showSearch = true,
  filters,
  applied,
  onApply,
  className,
}: DataTableToolbarProps<TData>) {
  const [draftSearch, setDraftSearch] = useState(applied.search)

  useEffect(() => {
    setDraftSearch(applied.search)
  }, [applied.search])

  const hasActiveFilters =
    applied.search !== "" ||
    applied.status !== "all" ||
    hasDateRange(applied.dateRange)

  const submitSearch = (event?: FormEvent) => {
    event?.preventDefault()
    onApply({
      ...applied,
      search: draftSearch.trim(),
    })
  }

  const clearAll = () => {
    setDraftSearch("")
    onApply({
      search: "",
      status: "all",
      dateRange: {},
    })
  }

  return (
    <div className={cn("flex flex-col gap-3 pb-6", className)}>
      {showSearch ? (
        <form
          onSubmit={submitSearch}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Input
            placeholder={searchPlaceholder}
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            className={cn(tableSearchInput, "max-w-none sm:max-w-xl")}
            aria-label="Search"
          />
          <div className="flex items-center gap-2">
            <Button type="submit" className="cursor-pointer">
              <Search className="size-4" />
              Search
            </Button>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={clearAll}
              >
                <X className="size-4" />
                Clear
              </Button>
            ) : null}
          </div>
        </form>
      ) : hasActiveFilters ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={clearAll}
          >
            <X className="size-4" />
            Clear filters
          </Button>
        </div>
      ) : null}

      {filters?.status || filters?.date ? (
        <div className="flex flex-wrap items-end gap-3">
          {filters.status ? (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {filters.status.label ?? "Status"}
              </Label>
              <Select
                value={applied.status}
                onValueChange={(value) =>
                  onApply({ ...applied, status: value })
                }
              >
                <SelectTrigger
                  className="w-full min-w-[10rem] bg-card sm:w-auto"
                  aria-label={filters.status.label ?? "Status"}
                >
                  <SelectValue placeholder={filters.status.label ?? "Status"} />
                </SelectTrigger>
                <SelectContent>
                  {filters.status.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {filters.date ? (
            <DateRangePicker
              label={filters.date.label}
              value={applied.dateRange}
              onChange={(dateRange) => onApply({ ...applied, dateRange })}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
