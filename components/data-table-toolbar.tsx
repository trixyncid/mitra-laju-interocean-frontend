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
import { VendorFilter } from "@/components/ui/vendor-filter"
import { SingleDateFilter } from "@/components/ui/single-date-filter"
import {
  hasDateRange,
  type TableFilterConfig,
} from "@/lib/data-table-filters"
import { glassControl, tableSearchInput } from "@/lib/design"
import { cn } from "@/lib/utils"

export type AppliedTableFilters = {
  search: string
  status: string
  lifecycleStatus?: string
  shipmentType?: string
  vendorId?: string
  vendorLabel?: string
  date?: string
  paymentDate?: string
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
    (applied.lifecycleStatus !== undefined && applied.lifecycleStatus !== "all") ||
    (applied.shipmentType !== undefined && applied.shipmentType !== "all") ||
    Boolean(applied.vendorId) ||
    Boolean(applied.date) ||
    Boolean(applied.paymentDate) ||
    hasDateRange(applied.dateRange)

  const hasFilterControls = Boolean(
    filters?.status ||
      filters?.lifecycleStatus ||
      filters?.shipmentType ||
      filters?.vendor ||
      filters?.date ||
      filters?.paymentDate ||
      extra
  )

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
      lifecycleStatus: "all",
      shipmentType: "all",
      vendorId: undefined,
      vendorLabel: undefined,
      date: undefined,
      paymentDate: undefined,
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
    <div className={cn("flex flex-col gap-3 pb-5", className)}>
      {showSearch ? (
        <form
          onSubmit={submitSearch}
          className="flex w-full min-w-0 items-center gap-2"
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
        <div className="flex w-full flex-wrap items-center gap-2">
          {filters?.status ? (
            <StatusFilter
              label={filters.status.label ?? "Status"}
              value={applied.status}
              options={filters.status.options}
              onChange={(status) => onApply({ ...applied, status })}
            />
          ) : null}

          {filters?.lifecycleStatus ? (
            <StatusFilter
              label={filters.lifecycleStatus.label ?? "Lifecycle"}
              value={applied.lifecycleStatus ?? "all"}
              options={filters.lifecycleStatus.options}
              onChange={(lifecycleStatus) =>
                onApply({ ...applied, lifecycleStatus })
              }
            />
          ) : null}

          {filters?.shipmentType ? (
            <StatusFilter
              label={filters.shipmentType.label ?? "Shipment Type"}
              value={applied.shipmentType ?? "all"}
              options={filters.shipmentType.options}
              onChange={(shipmentType) =>
                onApply({ ...applied, shipmentType })
              }
            />
          ) : null}

          {filters?.vendor ? (
            <VendorFilter
              label={filters.vendor.label ?? "Vendor"}
              value={applied.vendorId}
              valueLabel={applied.vendorLabel}
              onChange={({ vendorId, vendorLabel }) =>
                onApply({ ...applied, vendorId, vendorLabel })
              }
            />
          ) : null}

          {filters?.date ? (
            filters.date.mode === "single" ? (
              <SingleDateFilter
                label={filters.date.label}
                value={applied.date}
                onChange={(date) => onApply({ ...applied, date })}
              />
            ) : (
              <DateRangePicker
                layout="toolbar"
                label={filters.date.label}
                value={applied.dateRange}
                onChange={(dateRange) => onApply({ ...applied, dateRange })}
              />
            )
          ) : null}

          {filters?.paymentDate ? (
            <SingleDateFilter
              label={filters.paymentDate.label ?? "Payment date"}
              value={applied.paymentDate}
              onChange={(paymentDate) => onApply({ ...applied, paymentDate })}
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
