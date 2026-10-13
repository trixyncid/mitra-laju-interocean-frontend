import type { Costing } from "@/lib/types/costing"
import { vendorInvoiceInvoiceLineNet } from "@/lib/utils"

export type ReconciliationState = "unbilled" | "matched" | "over" | "under"

/** Differences under one rupiah are rounding, not a real variance. */
const TOLERANCE = 1

/** Expected (costing) vs billed (matched vendor invoice lines) for one costing line. */
export function reconcile(costing: Pick<Costing, "price" | "currencyPrice" | "quantity" | "vatPercentage" | "pph23Percentage" | "vendorInvoiceBreakdowns">) {
  const expected = vendorInvoiceInvoiceLineNet(costing)
  const lines = costing.vendorInvoiceBreakdowns ?? []
  const billed = lines.reduce((sum, line) => sum + vendorInvoiceInvoiceLineNet(line), 0)
  const variance = billed - expected
  const state: ReconciliationState =
    lines.length === 0
      ? "unbilled"
      : Math.abs(variance) < TOLERANCE
        ? "matched"
        : variance > 0
          ? "over"
          : "under"
  return { expected, billed, variance, state, matchedCount: lines.length }
}

export const RECONCILIATION_LABEL: Record<ReconciliationState, string> = {
  unbilled: "Not billed yet",
  matched: "Billed in full",
  over: "Over budget",
  under: "Partly billed",
}

export const RECONCILIATION_TONE: Record<ReconciliationState, string> = {
  unbilled: "bg-muted text-muted-foreground",
  matched: "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]",
  over: "bg-[var(--mli-error-container)] text-[var(--mli-on-error-container)]",
  under: "bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)]",
}

export const RECONCILIATION_DOT: Record<ReconciliationState, string> = {
  unbilled: "bg-input",
  matched: "bg-[var(--mli-positive)]",
  over: "bg-[var(--mli-negative)]",
  under: "bg-[var(--mli-on-backup-container)]",
}
