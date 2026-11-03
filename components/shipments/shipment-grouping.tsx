"use client"

import { IconStack2 } from "@tabler/icons-react"

import type { Shipment } from "@/app/dashboard/shipments/columns"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePersistedChoice } from "@/hooks/use-persisted-choice"
import { vesselLabel } from "@/lib/shipment-reference"
import { cn } from "@/lib/utils"

export type ShipmentGroupBy = "none" | "customer" | "vessel"

const GROUP_OPTIONS: { value: ShipmentGroupBy; label: string }[] = [
  { value: "none", label: "No grouping" },
  { value: "customer", label: "Customer" },
  { value: "vessel", label: "Vessel" },
]

export type ShipmentGroup = { key: string; label: string; hint?: string; shipments: Shipment[] }

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
    if (groupBy === "customer") {
      const customer = shipment.customerCode
      key = shipment.customerCodeId || "none"
      label = customer?.customerName?.trim() || "No customer"
      hint = customer?.customerCode
    } else {
      const vessel = vesselLabel(shipment.shipmentOperational?.vessel)
      key = vessel ?? "none"
      label = vessel ?? "No vessel"
    }
    const group = groups.get(key)
    if (group) group.shipments.push(shipment)
    else groups.set(key, { key, label, hint, shipments: [shipment] })
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
