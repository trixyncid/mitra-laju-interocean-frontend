"use client"

import { IconBuilding, IconMapPin, IconUsers } from "@tabler/icons-react"

export function CustomerCreateSidebar() {
  return (
    <div className="overflow-hidden rounded-[3rem] border border-border bg-card shadow-ambient-hover">
      <div className="bg-gradient-to-br from-primary via-[var(--mli-primary-container)] to-primary px-6 py-8 text-primary-foreground">
        <p className="text-xs font-semibold tracking-[0.08em] text-primary-foreground/70 uppercase">
          New customer
        </p>
        <h2 className="mt-1 text-xl font-semibold">Create profile</h2>
        <p className="mt-2 text-sm text-primary-foreground/80">
          Add a customer account with billing identity details for shipments and
          costing.
        </p>
      </div>

      <div className="space-y-5 px-6 py-6">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
            <IconBuilding className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              Basic details
            </p>
            <p className="text-sm text-muted-foreground">
              Customer code and name identify the company across orders and reports.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
            <IconUsers className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              After creation
            </p>
            <p className="text-sm text-muted-foreground">
              You can add shippers, locations, and contacts from the customer detail page.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
            <IconMapPin className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              Locations
            </p>
            <p className="text-sm text-muted-foreground">
              Keep delivery and billing addresses organized per shipper.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
