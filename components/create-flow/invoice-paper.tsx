import { cn, localDate } from "@/lib/utils"

export type PaperLine = {
  key: string
  description: string
  quantity: number
  /** Unit price already in IDR (price × exchange rate). */
  unitIdr: number
  gross: number
  vatPercentage: number
  pph23Percentage: number
  container: string | null
}

export type PaperTotals = {
  gross: number
  vatAmount: number
  pph23Amount: number
  net: number
}

export function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

function Blank({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-[rgba(var(--mli-inset-rgb),0.9)] px-1.5 font-normal text-muted-foreground/80">
      {children}
    </span>
  )
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 truncate text-sm text-foreground">{children}</dd>
    </div>
  )
}

/**
 * A sheet-of-paper preview of the vendor invoice being typed in.
 * Purely visual: it reads the form values and never changes them.
 */
export function InvoicePaper({
  documentType,
  vendor,
  number,
  invoiceDate,
  vessel,
  paymentDate,
  lines,
  totals,
  className,
}: {
  documentType: "INVOICE" | "REIMBURSEMENT"
  vendor: string | null
  number: string
  invoiceDate: string
  vessel: string
  paymentDate: string
  lines: PaperLine[]
  totals: PaperTotals
  className?: string
}) {
  const filled = lines.filter((line) => line.description.trim() || line.gross)
  const paid = Boolean(paymentDate)

  return (
    <article
      aria-label="Invoice preview"
      className={cn(
        "relative overflow-hidden rounded-md bg-white text-foreground shadow-[0_1px_0_rgba(15,23,42,0.04),0_18px_40px_-12px_rgba(15,23,42,0.22)] ring-1 ring-black/5",
        className
      )}
    >
      <div aria-hidden className="h-1.5 bg-primary bg-[image:var(--mli-gradient-brand)]" />

      {/* Paid / unpaid stamp */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-16 right-5 rotate-[-12deg] rounded-md border-2 px-2.5 py-0.5 text-xs font-bold tracking-[0.2em] uppercase",
          paid
            ? "border-emerald-600/70 text-emerald-700/80"
            : "border-amber-500/70 text-amber-600/80"
        )}
      >
        {paid ? "Paid" : "Unpaid"}
      </div>

      <div className="px-5 pt-5 pb-4 sm:px-6">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
          {documentType === "INVOICE" ? "Invoice" : "Reimbursement"}
        </p>
        <p className="mt-1 max-w-[75%] truncate text-xl font-semibold tracking-tight">
          {vendor ?? <Blank>Vendor name</Blank>}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <Meta label="Number">
            {number.trim() ? <span className="font-mono text-[13px]">{number}</span> : <Blank>Not set</Blank>}
          </Meta>
          <Meta label="Date">{invoiceDate ? localDate(invoiceDate) : <Blank>Not set</Blank>}</Meta>
          <Meta label="Vessel">{vessel.trim() ? vessel : <span className="text-muted-foreground">—</span>}</Meta>
          <Meta label="Paid on">
            {paid ? localDate(paymentDate) : <span className="text-muted-foreground">Not paid yet</span>}
          </Meta>
        </dl>
      </div>

      <div className="border-y border-dashed border-border px-5 py-3 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          <span>Charge</span>
          <span className="text-right">Amount</span>
        </div>
        {filled.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Charges you add will show here.
          </p>
        ) : (
          <ol className="divide-y divide-border/60">
            {filled.map((line, index) => (
              <li key={line.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    <span className="mr-1.5 text-muted-foreground tabular-nums">{index + 1}.</span>
                    {line.description.trim() || <Blank>No name yet</Blank>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground tabular-nums">
                    {line.quantity} × {formatIdr(line.unitIdr)}
                    {line.vatPercentage ? ` · VAT ${line.vatPercentage}%` : ""}
                    {line.pph23Percentage ? ` · PPH 23 ${line.pph23Percentage}%` : ""}
                  </p>
                  {line.container ? (
                    <p className="truncate text-xs text-muted-foreground">{line.container}</p>
                  ) : null}
                </div>
                <p className="text-sm font-medium tabular-nums">{formatIdr(line.gross)}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <dl className="space-y-1.5 px-5 pt-4 pb-5 text-sm sm:px-6">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Gross</dt>
          <dd className="tabular-nums">{formatIdr(totals.gross)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">VAT</dt>
          <dd className="tabular-nums">+ {formatIdr(totals.vatAmount)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">PPH 23 withheld</dt>
          <dd className="tabular-nums">− {formatIdr(totals.pph23Amount)}</dd>
        </div>
        <div className="mt-3 flex items-end justify-between gap-4 rounded-lg brand-fill px-4 py-3 text-primary-foreground">
          <dt className="text-sm font-medium">To pay the vendor</dt>
          <dd className="text-lg font-semibold tracking-tight tabular-nums">{formatIdr(totals.net)}</dd>
        </div>
      </dl>
    </article>
  )
}
