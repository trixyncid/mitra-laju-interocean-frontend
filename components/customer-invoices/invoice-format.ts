import type { CustomerInvoiceStatus } from "@/lib/types/customer-invoice"
import { toIsoDateOnly } from "@/lib/date-input"
import { vendorInvoiceInvoiceTotals } from "@/lib/utils"

type AmountLine = {
  quantity: number
  price: number | string
  currencyPrice: number | string
  vatPercentage: number | string
  pph23Percentage: number | string
}

/** What the customer owes: subtotal + VAT − PPh 23 withheld, from the billed sellings. */
export function invoiceTotals(lines: AmountLine[]) {
  const { gross, vatAmount, pph23Amount, net } = vendorInvoiceInvoiceTotals(lines)
  return { subtotal: gross, vat: vatAmount, pph23: pph23Amount, due: net }
}

export const INVOICE_STATUS_TONE: Record<CustomerInvoiceStatus, string> = {
  PAID: "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]",
  UNPAID: "bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)]",
}

export const INVOICE_STATUS_DOT: Record<CustomerInvoiceStatus, string> = {
  PAID: "bg-[var(--mli-positive)]",
  UNPAID: "bg-[var(--mli-on-warning-container)]",
}

/** Today as `YYYY-MM-DD` in local time, for date-only fields. */
export function todayDateOnly() {
  return toIsoDateOnly(new Date())
}

/** A stored timestamp as the local `YYYY-MM-DD` a date field edits. */
export function toDateOnly(value: string | null | undefined) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? toIsoDateOnly(date) : ""
}
