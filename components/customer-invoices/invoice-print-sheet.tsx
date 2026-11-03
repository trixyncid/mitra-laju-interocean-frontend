import { COMPANY_LETTERHEAD } from "@/lib/company-letterhead"
import { invoiceTotals } from "@/components/customer-invoices/invoice-format"
import { vesselLabel } from "@/lib/shipment-reference"
import type { CustomerInvoice, CustomerInvoiceSelling } from "@/lib/types/customer-invoice"
import { INVOICE_TYPE_LABEL } from "@/lib/types/customer-invoice"
import { localDate, vendorInvoiceLineGross } from "@/lib/utils"

/** Plain rupiah without the currency sign, for table cells. */
const amount = (value: number) =>
  value.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export type InvoiceBillTo = {
  name: string
  code?: string
  npwp?: string | null
  addressLines?: string[]
}

function Letterhead() {
  const company = COMPANY_LETTERHEAD
  return (
    <header className="flex items-start gap-5 border-b-2 border-neutral-900 pb-4">
      {company.logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- printed as-is; no need for next/image here
        <img src={company.logoSrc} alt={`${company.name} logo`} className="h-[22mm] w-auto object-contain" />
      ) : (
        <div className="flex h-[22mm] w-[22mm] shrink-0 items-center justify-center rounded border-2 border-dashed border-neutral-400 text-center text-[9pt] font-semibold leading-tight text-neutral-500">
          MLI
          <br />
          logo
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[16pt] font-bold tracking-tight">{company.name}</p>
        <p className="text-[9pt] font-medium uppercase tracking-[0.12em] text-neutral-600">{company.tagline}</p>
        <div className="mt-1.5 text-[8.5pt] leading-snug text-neutral-700">
          {company.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>{company.contactLine}</p>
          <p>NPWP {company.npwp}</p>
        </div>
      </div>
    </header>
  )
}

/**
 * One invoice on an A4 page: letterhead, bill-to, the chosen selling lines
 * and their totals. Totals follow the lines passed in, so leaving a line out
 * leaves it out of the amount due too.
 */
export function InvoicePrintSheet({
  invoice,
  lines,
  billTo,
  letterhead,
}: {
  invoice: CustomerInvoice
  lines: CustomerInvoiceSelling[]
  billTo: InvoiceBillTo
  /** False for paper with a pre-printed letterhead: the space stays blank. */
  letterhead: boolean
}) {
  const totals = invoiceTotals(lines)
  const op = invoice.sales.shipment?.shipmentOperational
  const vessel = vesselLabel(op?.vessel)
  const company = COMPANY_LETTERHEAD

  const references = [
    ["Invoice no.", invoice.customerInvoiceNumber],
    ["Invoice date", invoice.customerInvoiceDate ? localDate(invoice.customerInvoiceDate) : "—"],
    ["Sales job", invoice.sales.salesNumber],
    ...(invoice.taxInvoice
      ? [["Tax invoice", `${invoice.taxInvoice}${invoice.taxInvoiceDate ? ` (${localDate(invoice.taxInvoiceDate)})` : ""}`]]
      : []),
  ]
  const shipmentRefs = [
    ["Vessel / voyage", vessel],
    ["BL no.", op?.blNumber],
    ["Booking no.", op?.bookingNumber],
  ].filter(([, value]) => value) as [string, string][]

  return (
    <article className="invoice-sheet mx-auto flex min-h-[297mm] w-[210mm] flex-col bg-white p-[14mm] text-[10pt] text-neutral-900 shadow-[0_8px_40px_rgba(15,23,42,0.18)] print:min-h-0 print:w-auto print:p-0 print:shadow-none">
      {letterhead ? <Letterhead /> : <div aria-hidden className="h-[34mm] shrink-0" />}

      <div className="mt-6 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[8pt] font-semibold uppercase tracking-[0.14em] text-neutral-500">Bill to</p>
          <p className="mt-1 text-[11pt] font-semibold">{billTo.name}</p>
          {billTo.code ? <p className="text-[9pt] text-neutral-600">Customer code {billTo.code}</p> : null}
          {billTo.addressLines?.map((line) => (
            <p key={line} className="text-[9pt] text-neutral-700">{line}</p>
          ))}
          {billTo.npwp ? <p className="text-[9pt] text-neutral-700">NPWP {billTo.npwp}</p> : null}
        </div>
        <div className="shrink-0 text-right">
          <h1 className="text-[20pt] font-bold uppercase tracking-[0.08em]">
            {INVOICE_TYPE_LABEL[invoice.customerInvoiceType]}
          </h1>
          <dl className="mt-1 grid grid-cols-[auto_auto] justify-end gap-x-3 gap-y-0.5 text-[9pt]">
            {references.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-neutral-500">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {shipmentRefs.length ? (
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 rounded border border-neutral-300 px-3 py-2 text-[9pt]">
          {shipmentRefs.map(([label, value]) => (
            <div key={label} className="flex gap-1.5">
              <dt className="text-neutral-500">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <table className="mt-5 w-full border-collapse text-[9.5pt]">
        <thead>
          <tr className="border-y-2 border-neutral-900 text-left text-[8pt] uppercase tracking-[0.08em]">
            <th className="w-[8mm] py-2 pr-2 font-semibold">No</th>
            <th className="py-2 pr-2 font-semibold">Description</th>
            <th className="py-2 pr-2 text-right font-semibold">Qty</th>
            <th className="py-2 pr-2 text-right font-semibold">Unit price (IDR)</th>
            <th className="py-2 pr-2 text-right font-semibold">VAT</th>
            <th className="py-2 text-right font-semibold">Amount (IDR)</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={line.id} className="break-inside-avoid border-b border-neutral-200 align-top">
              <td className="py-2 pr-2 tabular-nums text-neutral-500">{index + 1}</td>
              <td className="py-2 pr-2">{line.sellingDescription}</td>
              <td className="py-2 pr-2 text-right tabular-nums">{Number(line.quantity).toLocaleString("id-ID")}</td>
              <td className="py-2 pr-2 text-right tabular-nums">
                {amount(Number(line.price) * Number(line.currencyPrice))}
              </td>
              <td className="py-2 pr-2 text-right tabular-nums">
                {Number(line.vatPercentage) ? `${Number(line.vatPercentage)}%` : "—"}
              </td>
              <td className="py-2 text-right tabular-nums">{amount(vendorInvoiceLineGross(line))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex break-inside-avoid justify-end">
        <dl className="w-[78mm] text-[9.5pt]">
          {[
            ["Subtotal", amount(totals.subtotal)],
            ["VAT", amount(totals.vat)],
            ...(totals.pph23 ? [["PPh 23 withheld", `(${amount(totals.pph23)})`]] : []),
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-1">
              <dt className="text-neutral-600">{label}</dt>
              <dd className="tabular-nums">{value}</dd>
            </div>
          ))}
          <div className="mt-1 flex justify-between gap-4 border-y-2 border-neutral-900 py-2 text-[11pt] font-bold">
            <dt>Total due</dt>
            <dd className="tabular-nums">IDR {amount(totals.due)}</dd>
          </div>
        </dl>
      </div>

      {invoice.remarks ? (
        <div className="mt-5 break-inside-avoid text-[9pt]">
          <p className="font-semibold">Remarks</p>
          <p className="whitespace-pre-line text-neutral-700">{invoice.remarks}</p>
        </div>
      ) : null}

      <div className="mt-auto flex break-inside-avoid items-end justify-between gap-8 pt-10 text-[9pt]">
        <div>
          <p className="font-semibold">Payment to</p>
          <p className="text-neutral-700">{company.bank.name}</p>
          <p className="text-neutral-700">a/n {company.bank.accountName}</p>
          <p className="font-medium tabular-nums">{company.bank.accountNumber}</p>
        </div>
        <div className="w-[60mm] text-center">
          <p className="text-neutral-600">{company.name}</p>
          <div className="mt-[22mm] border-t border-neutral-900 pt-1">
            <p className="font-semibold">{company.signatory.name}</p>
            <p className="text-neutral-600">{company.signatory.title}</p>
          </div>
        </div>
      </div>
    </article>
  )
}
