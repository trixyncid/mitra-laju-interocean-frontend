"use client"

import { Search, X } from "lucide-react"
import { FormEvent, type ReactNode, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DateRangePicker,
  type TableDateRange,
} from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"
import { StatusFilter } from "@/components/ui/status-filter"
import {
  hasDateRange,
  type TableFilterConfig,
} from "@/lib/data-table-filters"
import { glassControl, tableSearchInput } from "@/lib/design"
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
  extra?: ReactNode
  className?: string
}

export function DataTableToolbar<TData>({
  searchPlaceholder,
  showSearch = true,
  filters,
  applied,
  onApply,
  extra,
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

  const hasFilterControls = Boolean(filters?.status || filters?.date || extra)

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

  const clearButton = hasActiveFilters ? (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn(glassControl, "shrink-0 cursor-pointer")}
      onClick={clearAll}
    >
      <X className="size-4" />
      Clear
    </Button>
  ) : null

  return (
    <div
      className={cn(
        "flex flex-col gap-2 pb-5 sm:flex-row sm:flex-wrap sm:items-center",
        className
      )}
    >
      {showSearch ? (
        <form
          onSubmit={submitSearch}
          className="flex min-w-0 flex-1 items-center gap-2 sm:min-w-[20rem]"
        >
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/70"
              aria-hidden
            />
            <Input
              placeholder={searchPlaceholder}
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              className={cn(tableSearchInput, "max-w-none pl-11")}
              aria-label="Search"
            />
          </div>
          <Button type="submit" size="lg" className="shrink-0 cursor-pointer">
            Search
          </Button>
          {!hasFilterControls ? clearButton : null}
        </form>
      ) : null}

      {hasFilterControls || (!showSearch && hasActiveFilters) ? (
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {filters?.status ? (
            <StatusFilter
              label={filters.status.label ?? "Status"}
              value={applied.status}
              options={filters.status.options}
              onChange={(status) => onApply({ ...applied, status })}
            />
          ) : null}

          {filters?.date ? (
            <DateRangePicker
              layout="toolbar"
              label={filters.date.label}
              value={applied.dateRange}
              onChange={(dateRange) => onApply({ ...applied, dateRange })}
            />
          ) : null}

          {extra ? (
            <>
              <div
                className="mx-0.5 hidden h-6 w-px bg-[rgba(214,227,255,0.7)] sm:block"
                aria-hidden
              />
              {extra}
            </>
          ) : null}

          {showSearch || hasActiveFilters ? clearButton : null}
        </div>
      ) : null}
    </div>
  )
}
