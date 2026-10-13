"use client"

import { useState } from "react"
import { IconArrowRight, IconCheck, IconSearch, IconShip } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"

import { dayMonth } from "@/components/shipments/shipment-format"
import { ShipmentTypeTag } from "@/components/ui/shipment-type-tag"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useSalesShipmentOptions } from "@/hooks/use-sales"
import { shipmentReference } from "@/lib/shipment-reference"
import type { SalesShipment } from "@/lib/types/sales"
import { cn } from "@/lib/utils"

/** One line per shipment: reference, customer, route and ETA. */
export function ShipmentSummary({ shipment, className }: { shipment: SalesShipment; className?: string }) {
  const op = shipment.shipmentOperational
  const from = op?.portDeparture?.portName
  const to = op?.portDestination?.portName
  const eta = dayMonth(op?.eta)
  return (
    <span className={cn("min-w-0 flex-1", className)}>
      <span className="flex items-center gap-2">
        <span className="truncate text-sm font-semibold text-foreground">{shipmentReference(shipment)}</span>
        <ShipmentTypeTag type={op?.shipmentType} />
      </span>
      <span className="block truncate text-xs text-muted-foreground">
        {op?.bookingNumber?.trim() || "No booking"}
        {from || to ? (
          <>
            {" · "}
            {from ?? "—"} <IconArrowRight className="inline size-3 align-[-1px]" /> {to ?? "—"}
          </>
        ) : null}
        {eta ? ` · ETA ${eta}` : ""}
      </span>
    </span>
  )
}

/** Pick one shipment that isn't part of a sales job yet. */
export function ShipmentPicker({
  value,
  onChange,
  enabled = true,
  error,
}: {
  value: SalesShipment | null
  onChange: (shipment: SalesShipment | null) => void
  enabled?: boolean
  error?: string
}) {
  const [search, setSearch] = useState("")
  const debounced = useDebouncedValue(search.trim(), 300)
  const { data, isLoading, isFetching } = useSalesShipmentOptions(debounced, enabled)
  const results = data ?? []
  // Keep the chosen shipment visible even when a search hides it.
  const options = value && !results.some((s) => s.id === value.id) ? [value, ...results] : results

  return (
    <div className="space-y-2">
      <label className="relative block">
        <span className="sr-only">Search shipments</span>
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customer, vessel, booking or BL…"
          aria-invalid={Boolean(error)}
          className="h-9 w-full rounded-full border border-border bg-card pl-10 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground hover:border-input focus:border-input focus:ring-[3px] focus:ring-ring/10 aria-invalid:border-destructive"
        />
        {isFetching ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </label>
      <div role="radiogroup" aria-label="Shipments" className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
        {isLoading && options.length === 0 ? (
          <p className="py-5 text-center text-sm text-muted-foreground">Loading…</p>
        ) : options.length === 0 ? (
          <p className="rounded-xl bg-muted/70 px-3 py-5 text-center text-sm text-muted-foreground">
            {debounced ? "No free shipments match." : "Every shipment already belongs to a sales job."}
          </p>
        ) : (
          options.map((shipment) => {
            const checked = value?.id === shipment.id
            return (
              <button
                key={shipment.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => onChange(checked ? null : shipment)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
                  checked ? "border-primary bg-secondary" : "border-border hover:border-input hover:bg-muted/60"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    checked ? "brand-fill" : "bg-muted text-muted-foreground"
                  )}
                >
                  {checked ? <IconCheck className="size-4" /> : <IconShip className="size-4" />}
                </span>
                <ShipmentSummary shipment={shipment} />
              </button>
            )
          })
        )}
      </div>
      {error ? <p className="px-1 text-xs text-destructive">{error}</p> : null}
      <p className="px-1 text-xs text-muted-foreground">Only shipments not yet in a sales job are listed.</p>
    </div>
  )
}
