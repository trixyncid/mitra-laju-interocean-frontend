"use client"

import { forwardRef } from "react"

import { formatIdr, formatIdrCompact } from "@/components/dashboard/overview-card"
import { INVOICE_STATUS_DOT, invoiceTotals } from "@/components/customer-invoices/invoice-format"
import { INVOICE_STATUS_LABEL, type CustomerInvoice } from "@/lib/types/customer-invoice"
import { cn, localDate } from "@/lib/utils"

type Props = { invoice: CustomerInvoice; selected?: boolean; onSelect: () => void }

/** Dense list row: the number, who owes it, how much, and whether it's paid. */
export const CustomerInvoiceRow = forwardRef<HTMLButtonElement, Props>(function CustomerInvoiceRow(
  { invoice, selected = false, onSelect },
  ref
) {
  const { due } = invoiceTotals(invoice.sellings)
  const customer = invoice.sales.customer?.customerName ?? invoice.sales.shipment?.customerCode?.customerName
  const paid = invoice.customerInvoiceStatus === "PAID"
  const vessel = invoice.sales.shipment?.shipmentOperational?.vessel?.vesselName

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "group relative flex w-full cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-ring/30",
        selected ? "bg-secondary" : "hover:bg-muted"
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-2 left-0 w-[3px] rounded-full transition-colors", selected ? "bg-primary" : "bg-transparent")}
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-[13px] font-semibold text-foreground">{invoice.customerInvoiceNumber}</span>
          {invoice.customerInvoiceType === "REIMBURSEMENT" ? (
            <span className={cn("shrink-0 rounded-full bg-muted px-2 py-px text-[11px] font-medium text-muted-foreground", selected && "bg-card")}>
              Reimb.
            </span>
          ) : null}
          <span className="ml-auto shrink-0 text-sm font-semibold tabular-nums text-foreground" title={`Amount due ${formatIdr(due)}`}>
            {invoice.sellings.length ? formatIdrCompact(due) : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="truncate text-foreground/85">{customer ?? "No customer"}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", INVOICE_STATUS_DOT[invoice.customerInvoiceStatus])} />
            {paid && invoice.paymentDate ? `Paid ${localDate(invoice.paymentDate)}` : INVOICE_STATUS_LABEL[invoice.customerInvoiceStatus]}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {invoice.customerInvoiceDate ? localDate(invoice.customerInvoiceDate) : "No date"}
          {vessel ? ` · ${vessel}` : ""} · {invoice.sellings.length} selling
          {invoice.sellings.length === 1 ? "" : "s"}
        </p>
      </div>
    </button>
  )
})
