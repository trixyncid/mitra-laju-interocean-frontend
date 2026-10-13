"use client"

import Link from "next/link"
import { IconFileInvoice, IconPencil, IconPlus } from "@tabler/icons-react"

import { formatIdr } from "@/components/dashboard/overview-card"
import { CustomerInvoiceFormDialog } from "@/components/customer-invoices/customer-invoice-form-dialog"
import { DeleteInvoiceButton, InvoicePaymentButton } from "@/components/customer-invoices/invoice-actions"
import { INVOICE_STATUS_TONE, invoiceTotals } from "@/components/customer-invoices/invoice-format"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/use-permissions"
import { INVOICE_STATUS_LABEL, INVOICE_TYPE_LABEL } from "@/lib/types/customer-invoice"
import type { Sales } from "@/lib/types/sales"
import { cn, localDate, vendorInvoiceLineGross } from "@/lib/utils"

/** The job's invoices, and how much of what it charges has been billed. */
export function SalesInvoicesSection({ sales, embedded = false }: { sales: Sales; embedded?: boolean }) {
  const { can } = usePermissions()
  const invoices = sales.customerInvoices ?? []
  const revenue = sales.sellings.reduce((sum, line) => sum + vendorInvoiceLineGross(line), 0)
  const unbilled = sales.sellings.filter((line) => !line.customerInvoice)
  const billedGross = revenue - unbilled.reduce((sum, line) => sum + vendorInvoiceLineGross(line), 0)
  const billedShare = revenue > 0 ? Math.min(100, (billedGross / revenue) * 100) : 0
  const outstanding = invoices
    .filter((invoice) => invoice.customerInvoiceStatus === "UNPAID")
    .reduce((sum, invoice) => sum + invoiceTotals(sales.sellings.filter((line) => line.customerInvoice?.id === invoice.id)).due, 0)

  return (
    <section aria-label="Customer invoices" className={embedded ? undefined : "rounded-xl border border-border p-4"}>
      <div className="flex flex-wrap items-center gap-2">
        {embedded ? null : (
          <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <IconFileInvoice className="size-4" />
          </span>
        )}
        <div className="mr-auto">
          <h3 className="text-sm font-medium text-foreground">
            {embedded ? (
              "What we bill the customer"
            ) : (
              <>
                Customer invoices <span className="text-muted-foreground tabular-nums">· {invoices.length}</span>
              </>
            )}
          </h3>
          <p className="text-xs text-muted-foreground">
            {outstanding > 0 ? (
              <>
                Unpaid incl. tax <span className="font-medium tabular-nums text-foreground">{formatIdr(outstanding)}</span>
              </>
            ) : invoices.length ? (
              "Everything billed is paid"
            ) : (
              "Bill the customer for this job’s sellings"
            )}
          </p>
        </div>
        {can("CUSTOMER_INVOICE", "create") ? (
          <CustomerInvoiceFormDialog
            mode="create"
            salesId={sales.id}
            trigger={
              <Button size="sm" disabled={unbilled.length === 0} title={unbilled.length ? undefined : "Every selling is billed"}>
                <IconPlus className="size-4" />
                New invoice
              </Button>
            }
          />
        ) : null}
      </div>

      {sales.sellings.length > 0 ? (
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
            <span>
              Billed <span className="font-medium tabular-nums text-foreground">{formatIdr(billedGross)}</span> of{" "}
              {formatIdr(revenue)} before tax
            </span>
            <span>
              {unbilled.length ? `${unbilled.length} selling${unbilled.length === 1 ? "" : "s"} not billed` : "All billed"}
            </span>
          </div>
          <div
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label={`${Math.round(billedShare)}% of this job's sellings are billed`}
          >
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${billedShare}%` }} />
          </div>
        </div>
      ) : null}

      {embedded && invoices.length > 0 && unbilled.length > 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border p-3">
          <p className="text-xs font-medium text-muted-foreground">Ready to bill</p>
          <ul className="mt-1.5 space-y-1">
            {unbilled.map((line) => (
              <li key={line.id} className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="truncate text-foreground">{line.sellingDescription}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{formatIdr(vendorInvoiceLineGross(line))}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {invoices.length === 0 ? (
        <p className="mt-4 rounded-lg bg-muted/70 px-3 py-4 text-center text-sm text-muted-foreground">
          {sales.sellings.length
            ? "No invoices yet. The first one takes the sales number."
            : "Add sellings first, then bill them here."}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {invoices.map((invoice) => {
            const lines = sales.sellings.filter((line) => line.customerInvoice?.id === invoice.id)
            const { due } = invoiceTotals(lines)
            return (
              <li key={invoice.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={`/dashboard/customer-invoices?invoice=${invoice.id}`}
                        className="truncate font-mono text-sm font-semibold text-foreground hover:underline"
                      >
                        {invoice.customerInvoiceNumber}
                      </Link>
                      <span className={cn("rounded-full px-2 py-px text-[11px] font-medium", INVOICE_STATUS_TONE[invoice.customerInvoiceStatus])}>
                        {INVOICE_STATUS_LABEL[invoice.customerInvoiceStatus]}
                      </span>
                      {invoice.customerInvoiceType === "REIMBURSEMENT" ? (
                        <span className="rounded-full bg-muted px-2 py-px text-[11px] font-medium text-muted-foreground">
                          {INVOICE_TYPE_LABEL.REIMBURSEMENT}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {invoice.customerInvoiceDate ? localDate(invoice.customerInvoiceDate) : "No invoice date"} · {lines.length} selling
                      {lines.length === 1 ? "" : "s"}
                      {invoice.customerInvoiceStatus === "PAID" && invoice.paymentDate ? ` · paid ${localDate(invoice.paymentDate)}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{formatIdr(due)}</span>
                </div>
                {can("CUSTOMER_INVOICE", "edit") || can("CUSTOMER_INVOICE", "delete") ? (
                  <div className="mt-2 flex flex-wrap items-center justify-end gap-1">
                    {can("CUSTOMER_INVOICE", "edit") ? (
                      <>
                        <InvoicePaymentButton invoice={invoice} />
                        <CustomerInvoiceFormDialog
                          mode="edit"
                          salesId={sales.id}
                          invoice={invoice}
                          trigger={
                            <Button variant="ghost" size="icon-sm" aria-label={`Edit invoice ${invoice.customerInvoiceNumber}`} title="Edit invoice">
                              <IconPencil className="size-4" />
                            </Button>
                          }
                        />
                      </>
                    ) : null}
                    {can("CUSTOMER_INVOICE", "delete") ? <DeleteInvoiceButton invoice={invoice} /> : null}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
