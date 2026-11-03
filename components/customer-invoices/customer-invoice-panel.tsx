"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { IconArrowUpRight, IconBriefcase, IconFileInvoice, IconPencil, IconPrinter, IconReceiptRefund, IconUser, IconX } from "@tabler/icons-react"

import { RecordLink } from "@/components/record-link"
import { formatIdr } from "@/components/dashboard/overview-card"
import { CustomerInvoiceFormDialog } from "@/components/customer-invoices/customer-invoice-form-dialog"
import { DeleteInvoiceButton, InvoicePaymentButton } from "@/components/customer-invoices/invoice-actions"
import { INVOICE_STATUS_TONE, invoiceTotals } from "@/components/customer-invoices/invoice-format"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomerInvoice } from "@/hooks/use-customer-invoices"
import { usePermissions } from "@/hooks/use-permissions"
import { shipmentReference } from "@/lib/shipment-reference"
import { INVOICE_STATUS_LABEL, INVOICE_TYPE_LABEL } from "@/lib/types/customer-invoice"
import { cn, localDate, vendorInvoiceLineGross } from "@/lib/utils"

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium text-foreground">{children}</dd>
    </div>
  )
}

export function CustomerInvoicePanel({
  invoiceId,
  onClose,
  onDeleted,
  showOpenFullPage = true,
  className,
}: {
  invoiceId: string
  onClose?: () => void
  onDeleted?: () => void
  showOpenFullPage?: boolean
  className?: string
}) {
  const { data: invoice, isLoading, error } = useCustomerInvoice(invoiceId)
  const { can, canRead, canView } = usePermissions()

  if (isLoading) {
    return (
      <div className={cn("space-y-5 p-6", className)}>
        <Skeleton className="h-12 w-2/3 rounded-full" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }
  if (error || !invoice) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 p-10 text-center", className)}>
        <p className="text-sm text-muted-foreground">{error?.message ?? "This invoice could not be loaded."}</p>
        {onClose ? <Button variant="outline" onClick={onClose}>Close</Button> : null}
      </div>
    )
  }

  const totals = invoiceTotals(invoice.sellings)
  const customer = invoice.sales.customer
  const shipment = invoice.sales.shipment
  const paid = invoice.customerInvoiceStatus === "PAID"
  const TypeIcon = invoice.customerInvoiceType === "REIMBURSEMENT" ? IconReceiptRefund : IconFileInvoice

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <header className="border-b border-border p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl brand-fill">
              <TypeIcon className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h2 className="font-mono text-base font-semibold tracking-[-0.01em] text-foreground sm:text-xl">
                  {invoice.customerInvoiceNumber.split("/").map((part, index) => (
                    <span key={index}>
                      {index ? <wbr /> : null}
                      {index ? "/" : ""}
                      {part}
                    </span>
                  ))}
                </h2>
                <CopyButton value={invoice.customerInvoiceNumber} label="Invoice number" />
              </div>
              <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <IconUser className="size-4 shrink-0" />
                {customer && canView("CUSTOMER") ? (
                  <Link href={`/dashboard/customers/${customer.id}`} className="truncate hover:text-foreground hover:underline">
                    {customer.customerName} ({customer.customerCode})
                  </Link>
                ) : (
                  <span className="truncate">{customer ? `${customer.customerName} (${customer.customerCode})` : "No customer"}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {showOpenFullPage ? (
              <Button asChild variant="ghost" size="icon" aria-label="Open full page" title="Open full page">
                <Link href={`/dashboard/customer-invoices/${invoice.id}`}>
                  <IconArrowUpRight />
                </Link>
              </Button>
            ) : null}
            {can("CUSTOMER_INVOICE", "delete") ? <DeleteInvoiceButton invoice={invoice} onDeleted={onDeleted} /> : null}
            {onClose ? (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
                <IconX />
              </Button>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-medium", INVOICE_STATUS_TONE[invoice.customerInvoiceStatus])}>
            {INVOICE_STATUS_LABEL[invoice.customerInvoiceStatus]}
            {paid && invoice.paymentDate ? ` · ${localDate(invoice.paymentDate)}` : ""}
          </span>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {INVOICE_TYPE_LABEL[invoice.customerInvoiceType]}
          </span>
          {can("CUSTOMER_INVOICE", "edit") ? (
            <>
              <InvoicePaymentButton invoice={invoice} />
              <CustomerInvoiceFormDialog
                mode="edit"
                salesId={invoice.salesId}
                invoice={invoice}
                trigger={
                  <Button variant="outline" size="sm">
                    <IconPencil className="size-4" />
                    Edit
                  </Button>
                }
              />
            </>
          ) : null}
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/customer-invoices/${invoice.id}/print`} target="_blank" rel="noopener">
              <IconPrinter className="size-4" />
              Print
            </Link>
          </Button>
          {invoice.updatedBy?.name ? (
            <p className="ml-auto text-xs text-muted-foreground">
              Updated {localDate(invoice.updatedAt)} by {invoice.updatedBy.name}
            </p>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        <section aria-label="Amount" className="rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{paid ? "Amount paid" : "Amount due"}</p>
              <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">{formatIdr(totals.due)}</p>
            </div>
            <dl className="grid w-full gap-1 text-xs sm:w-auto sm:grid-cols-3 sm:gap-x-5">
              {[
                ["Subtotal", formatIdr(totals.subtotal)],
                ["VAT", `+ ${formatIdr(totals.vat)}`],
                ["PPh 23", `− ${formatIdr(totals.pph23)}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 sm:block sm:text-right">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-label="Invoice details" className="rounded-xl bg-muted/70 p-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <Detail label="Invoice date">{invoice.customerInvoiceDate ? localDate(invoice.customerInvoiceDate) : "—"}</Detail>
            <Detail label="Tax invoice">{invoice.taxInvoice ?? "—"}</Detail>
            <Detail label="Tax invoice date">{invoice.taxInvoiceDate ? localDate(invoice.taxInvoiceDate) : "—"}</Detail>
            <Detail label="Sales job">
              {can("SALES", "view") ? (
                <Link href={`/dashboard/sales?sales=${invoice.sales.id}`} className="font-mono hover:underline">
                  {invoice.sales.salesNumber}
                </Link>
              ) : (
                <span className="font-mono">{invoice.sales.salesNumber}</span>
              )}
            </Detail>
            <Detail label="Shipment">
              {shipment ? (
                canRead("shipments") ? (
                  <Link href={`/dashboard/shipments?shipment=${shipment.id}`} className="hover:underline">
                    {shipmentReference(shipment)}
                  </Link>
                ) : (
                  shipmentReference(shipment)
                )
              ) : (
                "—"
              )}
            </Detail>
            <Detail label="Payment date">{invoice.paymentDate ? localDate(invoice.paymentDate) : "—"}</Detail>
          </dl>
        </section>

        <section aria-label="Billed sellings" className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <IconBriefcase className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Billed sellings <span className="text-muted-foreground tabular-nums">· {invoice.sellings.length}</span>
              </h3>
              <p className="text-xs text-muted-foreground">From sales job {invoice.sales.salesNumber}</p>
            </div>
          </div>
          {invoice.sellings.length === 0 ? (
            <p className="mt-4 rounded-lg bg-muted/70 px-3 py-4 text-center text-sm text-muted-foreground">
              No sellings on this invoice yet. Edit it to pick them.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {invoice.sellings.map((line) => (
                <li key={line.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <RecordLink module="SELLING"
                      href={`/dashboard/sellings?selling=${line.id}`}
                      className="block truncate text-sm font-medium text-foreground hover:underline"
                    >
                      {line.sellingDescription}
                    </RecordLink>
                    <p className="truncate text-xs text-muted-foreground">
                      {Number(line.quantity).toLocaleString("id-ID")} × {formatIdr(Number(line.price) * Number(line.currencyPrice))}
                      {Number(line.vatPercentage) ? ` · VAT ${Number(line.vatPercentage)}%` : ""}
                      {Number(line.pph23Percentage) ? ` · PPh 23 ${Number(line.pph23Percentage)}%` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">{formatIdr(vendorInvoiceLineGross(line))}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {invoice.remarks ? (
          <section aria-label="Remarks" className="rounded-xl border border-border p-4">
            <h3 className="text-sm font-medium text-foreground">Remarks</h3>
            <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">{invoice.remarks}</p>
          </section>
        ) : null}
      </div>
    </div>
  )
}
