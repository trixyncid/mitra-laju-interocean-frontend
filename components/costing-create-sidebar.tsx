"use client"

import { IconFileInvoice, IconListDetails, IconLink } from "@tabler/icons-react"

export function CostingCreateSidebar() {
  return (
    <div className="overflow-hidden rounded-lg border border-[rgba(214,227,255,0.55)] bg-[rgba(232,238,246,0.72)] shadow-[0_8px_32px_rgba(27,54,93,0.07)] backdrop-blur-xl">
      <div className="bg-gradient-to-br from-primary via-[var(--mli-primary-container)] to-primary px-6 py-8 text-primary-foreground">
        <p className="text-xs font-semibold tracking-[0.08em] text-primary-foreground/70 uppercase">
          New costing
        </p>
        <h2 className="mt-1 text-xl font-semibold">Vendor invoice</h2>
        <p className="mt-2 text-sm text-primary-foreground/80">
          Start from the vendor invoice, add each charge as a line, then link
          lines to shipments after creation.
        </p>
      </div>

      <div className="space-y-5 px-6 py-6">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
            <IconFileInvoice className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              Invoice
            </p>
            <p className="text-sm text-muted-foreground">
              Vendor, period, invoice number/date, vessel, and VAT identify the
              document. The costing number is generated from the period.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
            <IconListDetails className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              Line items
            </p>
            <p className="text-sm text-muted-foreground">
              One row per charge — freight, THC, trucking, and optional
              container details.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
            <IconLink className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              After creation
            </p>
            <p className="text-sm text-muted-foreground">
              Link lines to shipments and upload attachments from the costing
              detail page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
