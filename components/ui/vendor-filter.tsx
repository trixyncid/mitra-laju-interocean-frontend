"use client"

import { useMemo, useState } from "react"
import { Check, Search } from "lucide-react"

import { FilterChip, FilterChipButton } from "@/components/ui/filter-chip"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useVendorSearch } from "@/hooks/use-entity-searches"
import { glassMenu } from "@/lib/design"
import { cn } from "@/lib/utils"

export function VendorFilter({
  label = "Vendor",
  value,
  valueLabel,
  onChange,
  enabled = true,
}: {
  label?: string
  value?: string
  valueLabel?: string
  onChange: (next: { vendorId?: string; vendorLabel?: string }) => void
  enabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { data, isLoading, isFetching, isError } = useVendorSearch(
    search,
    enabled && open,
    "true"
  )

  const items = useMemo(
    () =>
      (data?.items ?? [])
        .filter((vendor): vendor is typeof vendor & { id: string } =>
          Boolean(vendor.id)
        )
        .map((vendor) => ({
          value: vendor.id,
          label: vendor.vendorName,
        })),
    [data?.items]
  )

  const isActive = Boolean(value)
  const displayLabel = valueLabel || (isActive ? "Selected" : "All")

  return (
    <FilterChip
      active={isActive}
      onClear={() => onChange({ vendorId: undefined, vendorLabel: undefined })}
      clearLabel={`Clear ${label} filter`}
    >
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) setSearch("")
        }}
      >
        <PopoverTrigger asChild>
          <FilterChipButton
            label={label}
            value={displayLabel}
            muted={!isActive}
            aria-label={label}
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(glassMenu, "w-72 p-2")}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vendor..."
              fieldSize="sm"
              className="pl-8"
              aria-label="Search vendors"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            <button
              type="button"
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-[rgba(232,238,246,0.9)]",
                !isActive && "bg-[rgba(214,227,255,0.28)]"
              )}
              onClick={() => {
                onChange({ vendorId: undefined, vendorLabel: undefined })
                setOpen(false)
              }}
            >
              <Check
                className={cn(
                  "size-4 shrink-0 text-[var(--mli-primary-container)]",
                  isActive ? "opacity-0" : "opacity-100"
                )}
              />
              All vendors
            </button>
            {isLoading && items.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                Loading vendors...
              </p>
            ) : isError ? (
              <p className="px-2 py-3 text-sm text-destructive">
                Failed to load vendors.
              </p>
            ) : items.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                No vendors found.
              </p>
            ) : (
              items.map((item) => {
                const selected = item.value === value
                return (
                  <button
                    key={item.value}
                    type="button"
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-[rgba(232,238,246,0.9)]",
                      selected && "bg-[rgba(214,227,255,0.28)]"
                    )}
                    onClick={() => {
                      onChange({
                        vendorId: item.value,
                        vendorLabel: item.label,
                      })
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "size-4 shrink-0 text-[var(--mli-primary-container)]",
                        selected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })
            )}
            {isFetching && !isLoading ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">
                Updating…
              </p>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </FilterChip>
  )
}
