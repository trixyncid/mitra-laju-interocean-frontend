"use client"

import { forwardRef } from "react"
import { IconArrowRight } from "@tabler/icons-react"

import type { Shipment } from "@/app/dashboard/shipments/columns"
import { dayMonth } from "@/components/shipments/shipment-format"
import { ShipmentTypeTag } from "@/components/ui/shipment-type-tag"
import { vesselLabel } from "@/lib/shipment-reference"
import { cn } from "@/lib/utils"

const STATUS_DOT: Record<string, string> = {
  DRAFT: "bg-[var(--chart-5)]",
  BACKUP: "bg-[var(--mli-on-backup-container)]",
  ONGOING: "bg-[var(--mli-positive)]",
  FINISHED: "bg-primary",
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  BACKUP: "Backup",
  ONGOING: "Ongoing",
  FINISHED: "Finished",
}

type Props = {
  shipment: Shipment
  selected?: boolean
  /** The field the list is grouped by; its group header already shows it, so the row leaves it out. */
  groupBy?: "customer" | "vessel" | null
  onSelect: () => void
}

/** Dense, scannable list row — about a fifth of a full ticket's height. */
export const ShipmentCompactRow = forwardRef<HTMLButtonElement, Props>(function ShipmentCompactRow(
  { shipment, selected = false, groupBy = null, onSelect },
  ref
) {
  const op = shipment.shipmentOperational
  const from = op?.portDeparture?.portName
  const to = op?.portDestination?.portName
  const eta = dayMonth(op?.eta)
  const containers = op?.shipmentOperationalContainers?.length ?? 0
  const status = shipment.status?.toUpperCase?.() ?? ""
  const customer = shipment.customerCode?.customerName?.trim() || "No customer"
  const vessel = vesselLabel(op?.vessel) ?? "No vessel"
  const title =
    groupBy === "customer" ? vessel : groupBy === "vessel" ? customer : `${customer} · ${vessel}`

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      data-shipment-id={shipment.id}
      className={cn(
        "group relative flex w-full cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-ring/30",
        selected ? "bg-secondary" : "hover:bg-muted"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-2 left-0 w-[3px] rounded-full transition-colors",
          selected ? "bg-primary" : "bg-transparent"
        )}
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground" title={title}>
            {title}
          </span>
          {op?.shipmentType ? <ShipmentTypeTag type={op.shipmentType} className="shrink-0" /> : null}
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", STATUS_DOT[status] ?? "bg-input")} />
            {STATUS_LABEL[status] ?? status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="flex min-w-0 items-center gap-1 text-foreground/85">
            <span className="truncate">{from ?? "Origin not set"}</span>
            <IconArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{to ?? "Destination not set"}</span>
          </span>
          <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
            {eta ? `ETA ${eta}` : "No ETA"}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {op?.bookingNumber?.trim() ? `${op.bookingNumber.trim()} · ` : ""}
          {`${containers} ctr`}
        </p>
      </div>
    </button>
  )
})
