import { THIN_MARGIN_PERCENT } from "@/components/sellings/selling-margin"
import type { Sales } from "@/lib/types/sales"
import { vendorInvoiceLineGross } from "@/lib/utils"

/** "nothing" = no sellings yet, so there is no revenue to measure against. */
export type JobState = "nothing" | "healthy" | "thin" | "loss"

/**
 * Job profit before tax: sellings (revenue) minus costings (cost). VAT passes
 * through and PPH 23 is withheld, so neither counts, as on a single selling.
 */
export function salesPnl(sales: Pick<Sales, "costings" | "sellings">) {
  const revenue = sales.sellings.reduce((sum, selling) => sum + vendorInvoiceLineGross(selling), 0)
  const cost = sales.costings.reduce((sum, costing) => sum + vendorInvoiceLineGross(costing), 0)
  const margin = revenue - cost
  const percent = revenue > 0 ? (margin / revenue) * 100 : 0
  // Costs not yet charged on through any selling line.
  const unbilled = sales.costings.filter((costing) => !costing.sellingId)
  const state: JobState =
    sales.sellings.length === 0 ? "nothing" : margin < 0 ? "loss" : percent < THIN_MARGIN_PERCENT ? "thin" : "healthy"
  return { revenue, cost, margin, percent, state, unbilled }
}

export const JOB_STATE_LABEL: Record<JobState, string> = {
  nothing: "No sellings yet",
  healthy: "Healthy margin",
  thin: "Thin margin",
  loss: "Running at a loss",
}

const ROMAN_MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]

/** Current month and year in Jakarta, matching how the server numbers jobs. */
function jakartaMonthYear(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", year: "numeric", month: "numeric" }).formatToParts(date)
  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return { month: pick("month"), year: pick("year") }
}

/**
 * Shape of the number the server will assign: SA··###/M<roman month>··/<year>.
 * The dots are random letters and ### is the month's next sequence.
 */
export function salesNumberPattern(date = new Date()) {
  const { month, year } = jakartaMonthYear(date)
  return { prefix: "SA", roman: ROMAN_MONTHS[month - 1], year }
}
