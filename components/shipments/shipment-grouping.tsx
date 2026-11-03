"use client"

import Link from "next/link"
import { IconArrowsSort, IconPlus, IconStack2 } from "@tabler/icons-react"

import type { Shipment } from "@/app/dashboard/shipments/columns"
import { SHIPMENT_SORT_LABELS } from "@/app/dashboard/shipments/column-filter-fields"
import type { ColumnSort } from "@/components/column-filter/types"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { PermissionGate } from "@/components/permission-gate"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePersistedChoice } from "@/hooks/use-persisted-choice"
import { formatCalendarDate } from "@/lib/date-input"
import { vesselLabel } from "@/lib/shipment-reference"
import { cn } from "@/lib/utils"

export type ShipmentGroupBy = "none" | "customer" | "vessel"

const GROUP_OPTIONS: { value: ShipmentGroupBy; label: string }[] = [
  { value: "none", label: "No grouping" },
  { value: "customer", label: "Customer" },
  { value: "vessel", label: "Vessel" },
]

export type ShipmentGroup = {
  key: string
  label: string
  hint?: string
  /** Vessel groups: the voyage, for its ETD and Quick Add. */
  vesselId?: string
  etd?: string | null
  shipments: Shipment[]
}

/** The split view and the table share one grouping choice. */
export function useShipmentGroupBy() {
  return usePersistedChoice<ShipmentGroupBy>("mli:shipments:group", ["none", "customer", "vessel"], "none")
}

/**
 * Grouping sorts by the grouped field first, so a group's shipments arrive
 * together instead of scattering across batches or pages.
 */
export function groupSortParams(groupBy: ShipmentGroupBy, applied: AppliedTableFilters) {
  if (groupBy === "none") return {}
  // ETD order already keeps each voyage's shipments together.
  if (groupBy === "vessel" && applied.sort?.by === "etd") return {}
  return { sortBy: groupBy, sortDir: applied.sort?.by === groupBy ? applied.sort.dir : ("asc" as const) }
}

/** Buckets shipments; groups keep the order they first appear in. */
export function groupShipments(shipments: Shipment[], groupBy: ShipmentGroupBy): ShipmentGroup[] {
  if (groupBy === "none") return [{ key: "all", label: "", shipments }]
  const groups = new Map<string, ShipmentGroup>()
  for (const shipment of shipments) {
    let key: string
    let label: string
    let hint: string | undefined
    let vesselId: string | undefined
    let etd: string | null | undefined
    if (groupBy === "customer") {
      const customer = shipment.customerCode
      key = shipment.customerCodeId || "none"
      label = customer?.customerName?.trim() || "No customer"
      hint = customer?.customerCode
    } else {
      const vessel = shipment.shipmentOperational?.vessel
      const name = vesselLabel(vessel)
      key = vessel?.id ?? name ?? "none"
      label = name ?? "No vessel"
      vesselId = vessel?.id
      etd = vessel?.etd
    }
    const group = groups.get(key)
    if (group) group.shipments.push(shipment)
    else groups.set(key, { key, label, hint, vesselId, etd, shipments: [shipment] })
  }
  return [...groups.values()]
}

export function ShipmentGroupMenu({
  value,
  onChange,
  className,
}: {
  value: ShipmentGroupBy
  onChange: (value: ShipmentGroupBy) => void
  className?: string
}) {
  const active = value !== "none"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Group shipments"
          title="Group shipments"
          className={cn(
            "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
            active ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
            className
          )}
        >
          <IconStack2 className="size-4" />
          {active ? GROUP_OPTIONS.find((option) => option.value === value)?.label : "Group"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Group by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={(next) => onChange(next as ShipmentGroupBy)}>
          {GROUP_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** ETD and a Quick Add link for a vessel group header. */
export function VesselGroupExtras({ group }: { group: ShipmentGroup }) {
  if (!group.vesselId) return null
  return (
    <>
      <span className="shrink-0 text-xs text-muted-foreground">
        ETD {formatCalendarDate(group.etd, "—")}
      </span>
      <ShipmentQuickAddLink vesselId={group.vesselId} vesselName={group.label} />
    </>
  )
}

/** Opens the new-shipment form with this voyage preselected. Hidden without write access. */
export function ShipmentQuickAddLink({
  vesselId,
  vesselName,
  className,
}: {
  vesselId: string
  vesselName: string
  className?: string
}) {
  return (
    <PermissionGate resource="shipments" write fallback={null}>
      <Link
        href={`/dashboard/shipments/new?vesselId=${encodeURIComponent(vesselId)}`}
        aria-label={`Quick add a shipment on ${vesselName}`}
        title={`Add a shipment on ${vesselName}`}
        className={cn(
          "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20",
          className
        )}
      >
        <IconPlus className="size-3.5" />
        Quick Add
      </Link>
    </PermissionGate>
  )
}

const SORT_OPTIONS: { value: string; label: string; sort: ColumnSort | undefined }[] = [
  { value: "default", label: "Recently edited", sort: undefined },
  { value: "latest", label: "Latest", sort: { by: "latest", dir: "desc" } },
  { value: "etd-desc", label: "ETD (no ETD, then newest)", sort: { by: "etd", dir: "desc" } },
  { value: "etd-asc", label: "ETD (oldest first)", sort: { by: "etd", dir: "asc" } },
]

function sortValue(sort: ColumnSort | undefined) {
  if (!sort) return "default"
  if (sort.by === "latest") return "latest"
  if (sort.by === "etd") return `etd-${sort.dir}`
  return "column"
}

/** Quick sort choices; a sort picked from a column menu shows as its column. */
export function ShipmentSortMenu({
  value,
  onChange,
  className,
}: {
  value: ColumnSort | undefined
  onChange: (sort: ColumnSort | undefined) => void
  className?: string
}) {
  const current = sortValue(value)
  const label =
    current === "column"
      ? `${SHIPMENT_SORT_LABELS[value!.by] ?? value!.by} ${value!.dir === "asc" ? "↑" : "↓"}`
      : current === "default"
        ? "Sort"
        : SORT_OPTIONS.find((option) => option.value === current)?.label
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Sort shipments"
          title="Sort shipments"
          className={cn(
            "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium whitespace-nowrap transition-colors",
            current !== "default"
              ? "bg-secondary text-secondary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground",
            className
          )}
        >
          <IconArrowsSort className="size-4" />
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={current}
          onValueChange={(next) => onChange(SORT_OPTIONS.find((option) => option.value === next)?.sort)}
        >
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
