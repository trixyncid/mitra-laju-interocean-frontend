"use client"

import { IconRoute, IconShip, IconStack2 } from "@tabler/icons-react"

export function ShipmentCreateSidebar() {
  return (
    <div className="overflow-hidden rounded-lg border border-[rgba(214,227,255,0.55)] bg-[rgba(232,238,246,0.72)] shadow-[0_8px_32px_rgba(27,54,93,0.07)] backdrop-blur-xl">
      <div className="bg-gradient-to-br from-primary via-[var(--mli-primary-container)] to-primary px-6 py-8 text-primary-foreground">
        <p className="text-xs font-semibold tracking-[0.08em] text-primary-foreground/70 uppercase">
          New shipment
        </p>
        <h2 className="mt-1 text-xl font-semibold">Create order</h2>
        <p className="mt-2 text-sm text-primary-foreground/80">
          Capture the customer, period, and operational route in one step so
          the shipment is ready for containers and documents.
        </p>
      </div>

      <div className="space-y-5 px-6 py-6">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
            <IconShip className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              Shipment details
            </p>
            <p className="text-sm text-muted-foreground">
              Status, period, customer, and shipper identify the booking.
              New orders default to Draft.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
            <IconRoute className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              Operational
            </p>
            <p className="text-sm text-muted-foreground">
              Shipment type, vessel, and ports unlock containers and documents.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
            <IconStack2 className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              After creation
            </p>
            <p className="text-sm text-muted-foreground">
              Add containers and upload documents from the shipment detail page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
