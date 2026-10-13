"use client"

import { forwardRef } from "react"

import type { VendorInvoice } from "@/app/dashboard/vendor-invoices/columns"
import { formatIdr, formatIdrCompact } from "@/components/dashboard/overview-card"
import { dayMonth } from "@/components/shipments/shipment-format"
import { formatVendorInvoiceContainerMix } from "@/components/ui/container-summary-tags"
import { cn, vendorInvoiceInvoiceTotals } from "@/lib/utils"

type Props = {
  invoice: VendorInvoice
  selected?: boolean
  onSelect: () => void
}

/** Dense list row: vendor, invoice number, amount payable and payment state. */
export const VendorInvoiceRow = forwardRef<HTMLButtonElement, Props>(function VendorInvoiceRow(
  { invoice, selected = false, onSelect },
  ref
) {
  const lines = invoice.vendorInvoiceBreakdowns ?? []
  const lineCount = invoice._count?.vendorInvoiceBreakdowns ?? lines.length
  const { net } = vendorInvoiceInvoiceTotals(lines)
  const paid = invoice.status === "PAID"
  const containers = formatVendorInvoiceContainerMix(lines)
  const date = dayMonth(invoice.vendorInvoiceDate)

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      data-invoice-id={invoice.id}
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
          <span className="truncate text-sm font-semibold text-foreground">
            {invoice.vendor?.vendorName ?? "Unknown vendor"}
          </span>
          {invoice.vendorInvoiceType === "REIMBURSEMENT" ? (
            <span className="shrink-0 rounded-full bg-[var(--mli-warning-container)] px-2 py-px text-[10px] font-medium text-[var(--mli-on-warning-container)]">
              Reimb.
            </span>
          ) : null}
          {lineCount > 0 ? (
            <span
              className="ml-auto shrink-0 text-sm font-semibold tabular-nums text-foreground"
              title={formatIdr(net)}
            >
              {formatIdrCompact(net)}
            </span>
          ) : (
            <span className="ml-auto shrink-0 text-xs font-medium text-[var(--mli-on-warning-container)]">No lines</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="truncate font-mono text-foreground/85">{invoice.vendorInvoiceNumber}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn("size-2 rounded-full", paid ? "bg-[var(--mli-positive)]" : "bg-[var(--mli-on-backup-container)]")}
            />
            {paid ? "Paid" : "Unpaid"}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {date ? `${date} · ` : "No date · "}
          {lineCount} line{lineCount === 1 ? "" : "s"}
          {containers ? ` · ${containers}` : ""}
        </p>
      </div>
    </button>
  )
})
