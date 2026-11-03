"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { IconArrowLeft, IconPrinter } from "@tabler/icons-react"

import { formatIdr } from "@/components/dashboard/overview-card"
import { invoiceTotals } from "@/components/customer-invoices/invoice-format"
import { InvoicePrintSheet, type InvoiceBillTo } from "@/components/customer-invoices/invoice-print-sheet"
import ErrorPage from "@/components/error-page"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useCustomerById } from "@/hooks/use-customers"
import { useCustomerInvoice } from "@/hooks/use-customer-invoices"
import type { CustomerDetail, CustomerLocation } from "@/lib/types/entity-details"
import { vendorInvoiceLineGross } from "@/lib/utils"

function formatAddress(location: CustomerLocation) {
  return [
    location.addressLine1,
    location.addressLine2,
    location.addressLine3,
    [location.city, location.province, location.postalCode].filter(Boolean).join(", "),
    location.country,
  ].filter((line): line is string => Boolean(line?.trim()))
}

/** The customer's first office address, when the role may read it. */
function firstAddress(customer: CustomerDetail | undefined) {
  const location = customer?.customerShippers
    ?.filter((shipper) => shipper.isActive !== false)
    .flatMap((shipper) => shipper.customerLocations ?? [])[0]
  return location ? formatAddress(location) : undefined
}

export default function CustomerInvoicePrintPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = use(params)
  const { data: invoice, isLoading, error } = useCustomerInvoice(invoiceId)
  const customerId = invoice?.sales.customer?.id ?? ""
  const { data: customer } = useCustomerById(customerId)

  // Every selling on the invoice is printed unless it is unticked here.
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set())
  const [letterhead, setLetterhead] = useState(true)

  const lines = useMemo(
    () => (invoice?.sellings ?? []).filter((line) => !excluded.has(line.id)),
    [invoice?.sellings, excluded]
  )

  // The browser suggests the page title as the PDF file name.
  useEffect(() => {
    if (!invoice) return
    const previous = document.title
    document.title = `Invoice ${invoice.customerInvoiceNumber.replaceAll("/", "-")}`
    return () => {
      document.title = previous
    }
  }, [invoice])

  if (error) return <ErrorPage message={error.message} />

  if (isLoading || !invoice) {
    return (
      <div className="mx-auto flex w-full max-w-[var(--mli-container-max)] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="hidden h-96 w-72 rounded-2xl lg:block" />
        <Skeleton className="h-[80svh] flex-1 rounded-2xl" />
      </div>
    )
  }

  const billTo: InvoiceBillTo = {
    name: invoice.sales.customer?.customerName ?? invoice.sales.shipment?.customerCode?.customerName ?? "—",
    code: invoice.sales.customer?.customerCode,
    npwp: customer?.npwp || null,
    addressLines: firstAddress(customer),
  }

  const allIncluded = excluded.size === 0
  const toggle = (id: string) =>
    setExcluded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="mx-auto grid w-full max-w-[var(--mli-container-max)] items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:px-8 print:block print:max-w-none print:p-0">
      {/* Print setup — screen only. */}
      <aside className="space-y-4 rounded-2xl surface p-4 lg:sticky lg:top-24 print:hidden">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href={`/dashboard/customer-invoices/${invoice.id}`}>
            <IconArrowLeft className="size-4" />
            Back to invoice
          </Link>
        </Button>

        <div>
          <h1 className="font-mono text-base font-semibold text-foreground">{invoice.customerInvoiceNumber}</h1>
          <p className="text-xs text-muted-foreground">Choose what goes on the printed invoice.</p>
        </div>

        <section aria-label="Selling items" className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-foreground">
              Selling items <span className="text-muted-foreground tabular-nums">· {lines.length}/{invoice.sellings.length}</span>
            </h2>
            {invoice.sellings.length > 1 ? (
              <button
                type="button"
                className="cursor-pointer text-xs font-medium text-primary hover:underline"
                onClick={() =>
                  setExcluded(allIncluded ? new Set(invoice.sellings.map((line) => line.id)) : new Set())
                }
              >
                {allIncluded ? "Clear all" : "Select all"}
              </button>
            ) : null}
          </div>
          {invoice.sellings.length === 0 ? (
            <p className="rounded-lg bg-muted/70 px-3 py-3 text-xs text-muted-foreground">
              This invoice has no sellings yet. Edit the invoice to add them.
            </p>
          ) : (
            <ul className="max-h-[45svh] space-y-1 overflow-y-auto">
              {invoice.sellings.map((line) => (
                <li key={line.id}>
                  <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted">
                    <Checkbox
                      className="mt-0.5"
                      checked={!excluded.has(line.id)}
                      onCheckedChange={() => toggle(line.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">{line.sellingDescription}</span>
                      <span className="block text-xs tabular-nums text-muted-foreground">
                        {formatIdr(vendorInvoiceLineGross(line))}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2.5">
          <span>
            <span className="block text-sm font-medium text-foreground">Print letterhead</span>
            <span className="block text-xs text-muted-foreground">
              Turn off for paper with the official letterhead already printed.
            </span>
          </span>
          <Switch checked={letterhead} onCheckedChange={setLetterhead} aria-label="Print letterhead" />
        </label>

        <div className="space-y-2 border-t border-border/70 pt-3">
          <p className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total due</span>
            <span className="font-semibold tabular-nums text-foreground">{formatIdr(invoiceTotals(lines).due)}</span>
          </p>
          <Button className="w-full" disabled={lines.length === 0} onClick={() => window.print()}>
            <IconPrinter className="size-4" />
            Print or save as PDF
          </Button>
          {lines.length === 0 ? (
            <p className="text-xs text-[var(--mli-on-warning-container)]">Tick at least one selling item.</p>
          ) : !allIncluded ? (
            <p className="text-xs text-muted-foreground">
              Unticked items are left off the printout and its total. The invoice itself is unchanged.
            </p>
          ) : null}
        </div>
      </aside>

      {/* The page itself; scrolls sideways on narrow screens instead of squashing the A4 layout. */}
      <div className="min-w-0 overflow-x-auto pb-6 print:overflow-visible print:p-0">
        <InvoicePrintSheet invoice={invoice} lines={lines} billTo={billTo} letterhead={letterhead} />
      </div>

      <style>{`@media print { @page { size: A4; margin: 14mm; } html, body { background: #fff !important; } }`}</style>
    </div>
  )
}
