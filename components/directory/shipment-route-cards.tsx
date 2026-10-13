"use client"

import Link from "next/link"
import { useState } from "react"
import { IconCalendarEvent, IconSearch, IconShip } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShipmentLifecycleChip } from "@/components/ui/status-chip"
import { tableSearchInput } from "@/lib/design"
import { SHIPMENT_STATUS_OPTIONS } from "@/lib/shipment-status"
import type { CustomerShipment } from "@/lib/types/entity-details"
import { cn, localDate } from "@/lib/utils"

const PAGE = 12

function RouteCard({ shipment }: { shipment: CustomerShipment }) {
  const op = shipment.shipmentOperational
  const from = op?.portDeparture
  const to = op?.portDestination
  const vessel = op?.vessel

  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl surface p-5 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-elev-2">
      <div className="flex items-center justify-between gap-2">
        <ShipmentLifecycleChip status={shipment.status} />
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <IconCalendarEvent className="size-3.5" />
          {op?.eta ? `ETA ${localDate(op.eta)}` : "No ETA yet"}
        </span>
      </div>

      {/* Origin → destination, drawn like a sea lane. */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-foreground">{from?.portName ?? "Not set"}</p>
          <p className="truncate text-xs text-muted-foreground">{from?.portCountry ?? "Origin"}</p>
        </div>
        <div className="flex w-20 items-center sm:w-28 xl:w-36">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="h-px flex-1 border-t border-dashed border-primary/50" />
          <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-primary transition-transform group-hover:translate-x-0.5">
            <IconShip className="size-4" />
          </span>
          <span className="h-px flex-1 border-t border-dashed border-primary/50" />
          <span className="size-1.5 rounded-full border border-primary" />
        </div>
        <div className="min-w-0 text-right">
          <p className="truncate text-base font-semibold text-foreground">{to?.portName ?? "Not set"}</p>
          <p className="truncate text-xs text-muted-foreground">{to?.portCountry ?? "Destination"}</p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border/70 pt-3 text-xs">
        <div className="min-w-0">
          <p className="text-muted-foreground">Vessel</p>
          <p className="truncate font-medium text-foreground">
            <Link
              href={`/dashboard/shipments/${shipment.id}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {vessel ? `${vessel.vesselName}${vessel.voyageNumber ? ` · ${vessel.voyageNumber}` : ""}` : "No vessel yet"}
            </Link>
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground">Booking / BL</p>
          <p className="truncate font-mono text-[11px] text-foreground">
            {op?.bookingNumber || "—"} / {op?.blNumber || "—"}
          </p>
        </div>
      </div>
    </article>
  )
}

/** A customer's shipments as route cards, with a quick search and status filter. */
export function ShipmentRouteCards({ shipments }: { shipments: CustomerShipment[] }) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [limit, setLimit] = useState(PAGE)

  const q = query.trim().toLowerCase()
  const filtered = shipments.filter((shipment) => {
    if (status !== "all" && shipment.status !== status) return false
    if (!q) return true
    const op = shipment.shipmentOperational
    return [
      op?.portDeparture?.portName,
      op?.portDestination?.portName,
      op?.vessel?.vesselName,
      op?.bookingNumber,
      op?.blNumber,
      shipment.customerShipper?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q)
  })

  const counts = new Map<string, number>()
  for (const shipment of shipments) counts.set(shipment.status, (counts.get(shipment.status) ?? 0) + 1)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setLimit(PAGE)
            }}
            placeholder="Search port, vessel, booking or BL…"
            className={cn(tableSearchInput, "h-10 max-w-none pl-10 text-sm")}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-full bg-muted p-1 [scrollbar-width:none]">
          {[{ value: "all", label: "All" }, ...SHIPMENT_STATUS_OPTIONS].map((option) => {
            const count = option.value === "all" ? shipments.length : (counts.get(option.value) ?? 0)
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={status === option.value}
                onClick={() => {
                  setStatus(option.value)
                  setLimit(PAGE)
                }}
                className={cn(
                  "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
                  status === option.value
                    ? "bg-card text-foreground shadow-elev-1"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
                <span className="tabular-nums text-muted-foreground">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl surface-inset px-6 py-12 text-center text-sm text-muted-foreground">
          No shipments match. Try another word or status.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.slice(0, limit).map((shipment) => (
            <RouteCard key={shipment.id} shipment={shipment} />
          ))}
        </div>
      )}

      {filtered.length > limit ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setLimit((current) => current + PAGE)}>
            Show more ({filtered.length - limit} left)
          </Button>
        </div>
      ) : null}
    </div>
  )
}
