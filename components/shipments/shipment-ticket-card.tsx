"use client"

import { forwardRef, type ReactNode } from "react"
import { IconShip } from "@tabler/icons-react"

import type { Shipment } from "@/app/dashboard/shipments/columns"
import {
  dayMonth,
  modifiedByName,
  summarizeContainers,
} from "@/components/shipments/shipment-format"
import { summarizeServices } from "@/components/shipments/shipment-service-list"
import { ShipmentTypeTag } from "@/components/ui/shipment-type-tag"
import { ShipmentLifecycleChip } from "@/components/ui/status-chip"
import { shipmentReference, vesselLabel } from "@/lib/shipment-reference"
import { cn, localDate } from "@/lib/utils"

function Port({
  label,
  name,
  country,
  align = "left",
}: {
  label: string
  name: string | undefined
  country: string | undefined
  align?: "left" | "right"
}) {
  return (
    <div className={cn("min-w-0", align === "right" && "text-right")}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "truncate text-[17px] font-semibold leading-tight tracking-[-0.02em]",
          name ? "text-foreground" : "text-muted-foreground"
        )}
        title={name}
      >
        {name ?? "Not set"}
      </p>
      <p className="truncate text-xs text-muted-foreground">{country ?? "—"}</p>
    </div>
  )
}

function StubField({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="truncate text-[13px] font-medium text-foreground">{children}</dd>
    </div>
  )
}

/** Perforated tear line with half-circle notches cut into both edges. */
function TearLine() {
  return (
    <div aria-hidden className="relative my-0.5 h-5">
      <span className="absolute -left-[11px] top-1/2 size-5 -translate-y-1/2 rounded-full bg-background shadow-[inset_-1px_0_0_var(--border)]" />
      <span className="absolute -right-[11px] top-1/2 size-5 -translate-y-1/2 rounded-full bg-background shadow-[inset_1px_0_0_var(--border)]" />
      <span className="absolute inset-x-4 top-1/2 border-t-2 border-dashed border-border" />
    </div>
  )
}

type Props = {
  shipment: Shipment
  selected?: boolean
  onSelect: () => void
}

export const ShipmentTicketCard = forwardRef<HTMLButtonElement, Props>(function ShipmentTicketCard(
  { shipment, selected = false, onSelect },
  ref
) {
  const op = shipment.shipmentOperational
  const containers = op?.shipmentOperationalContainers ?? []
  const loadIn = dayMonth(op?.loadingInAt)
  const eta = dayMonth(op?.eta)
  const remarks = op?.remarks?.trim()
  const updatedBy = modifiedByName(shipment.updatedBy)
  const reference = shipmentReference(shipment)

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      data-shipment-id={shipment.id}
      className={cn(
        "group relative block w-full cursor-pointer rounded-xl bg-card text-left outline-none transition-[box-shadow,transform] duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(var(--mli-ink-rgb),0.08)]",
        "focus-visible:ring-[3px] focus-visible:ring-ring/30",
        selected
          ? "shadow-[0_12px_32px_rgba(var(--mli-ink-rgb),0.10)] ring-2 ring-primary"
          : "ring-1 ring-border"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
              selected ? "brand-fill" : "bg-secondary text-secondary-foreground"
            )}
          >
            <IconShip className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              {reference}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {shipment.customerCode?.customerCode ?? "No customer"}
              {shipment.customerShipper?.name ? ` · ${shipment.customerShipper.name}` : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <ShipmentLifecycleChip status={shipment.status} className="px-2.5 py-0.5" />
          {op?.shipmentType ? <ShipmentTypeTag type={op.shipmentType} /> : null}
        </div>
      </div>

      {/* Route */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-5 pb-3 pt-4 sm:gap-3">
        <Port
          label={loadIn ? `Load in · ${loadIn}` : "Origin"}
          name={op?.portDeparture?.portName}
          country={op?.portDeparture?.portCountry}
        />
        <div className="flex w-16 flex-col items-center sm:w-24">
          <div className="relative flex w-full items-center">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="flex-1 border-t-2 border-dashed border-primary/35" />
            <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-primary">
              <IconShip className="size-4" />
            </span>
            <span className="flex-1 border-t-2 border-dashed border-primary/35" />
            <span className="size-1.5 rounded-full border-2 border-primary bg-card" />
          </div>
        </div>
        <Port
          label={eta ? `ETA · ${eta}` : "Destination"}
          name={op?.portDestination?.portName}
          country={op?.portDestination?.portCountry}
          align="right"
        />
      </div>

      <p className="mx-5 mb-2 flex items-center justify-center gap-1.5 truncate rounded-full bg-muted px-3 py-1 text-xs text-foreground/80">
        <IconShip className="size-3.5 shrink-0 text-primary" />
        {op?.vessel ? (
          <span className="truncate">
            <span className="font-medium text-foreground">{vesselLabel(op.vessel)}</span>
          </span>
        ) : (
          <span>No vessel assigned</span>
        )}
      </p>

      <TearLine />

      {/* Stub */}
      <div className="px-5 pb-4 pt-1">
        {op ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <StubField label="Booking">{op.bookingNumber?.trim() || "—"}</StubField>
            <StubField label="BL number">{op.blNumber?.trim() || "—"}</StubField>
            <StubField label={`Services (${op.services?.length ?? 0})`} className="col-span-2">
              {op.services?.length ? (
                <span title={summarizeServices(op.services)}>{summarizeServices(op.services)}</span>
              ) : (
                "None yet"
              )}
            </StubField>
            <StubField label={`Containers (${containers.length})`} className="col-span-2">
              {containers.length > 0 ? (
                <span title={summarizeContainers(containers)}>{summarizeContainers(containers)}</span>
              ) : (
                "None yet"
              )}
            </StubField>
          </dl>
        ) : (
          <p className="rounded-lg bg-[var(--mli-warning-container)] px-3 py-2 text-xs font-medium text-[var(--mli-on-warning-container)]">
            Operational details not set up yet
          </p>
        )}

        {remarks || updatedBy ? (
          <div className="mt-3 flex items-end justify-between gap-3 border-t border-border/70 pt-2.5">
            <p className="line-clamp-1 min-w-0 text-xs italic text-muted-foreground" title={remarks}>
              {remarks ? `“${remarks}”` : ""}
            </p>
            {updatedBy && shipment.updatedAt ? (
              <p className="shrink-0 text-[11px] text-muted-foreground">
                {updatedBy} · {localDate(shipment.updatedAt)}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </button>
  )
})
