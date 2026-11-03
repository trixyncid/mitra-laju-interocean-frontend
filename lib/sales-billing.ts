export type Billing = { label: string; tone: string }

const MUTED = "bg-muted text-muted-foreground"
const WARN = "bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)]"
const OK = "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]"

type BillableSelling = {
  customerInvoice: { customerInvoiceStatus: string } | null
}

/** Where a sales job's billing stands, from its sellings and their invoices. */
export function salesBilling({ sellings }: { sellings: BillableSelling[] }): Billing {
  if (!sellings.length) return { label: "Nothing to bill", tone: MUTED }
  const billed = sellings.filter((selling) => selling.customerInvoice)
  if (!billed.length) return { label: "Not billed", tone: WARN }
  if (billed.length < sellings.length) return { label: "Partly billed", tone: WARN }
  const unpaid = billed.some((selling) => selling.customerInvoice?.customerInvoiceStatus === "UNPAID")
  return unpaid ? { label: "Billed, unpaid", tone: WARN } : { label: "Paid", tone: OK }
}
