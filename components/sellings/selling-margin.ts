import type { Selling, SellingLinkedCosting } from "@/lib/types/selling"
import { vendorInvoiceInvoiceLineNet, vendorInvoiceLineGross } from "@/lib/utils"

export type MarginState = "uncosted" | "healthy" | "thin" | "loss"

/** Below this share of revenue a margin is flagged as thin. */
export const THIN_MARGIN_PERCENT = 10

/** Name for a linked costing: its description, else its vendor invoice line's. */
export function linkedCostingLabel(costing: Pick<SellingLinkedCosting, "costingDescription" | "vendorInvoiceBreakdowns">) {
  return costing.costingDescription || costing.vendorInvoiceBreakdowns[0]?.productDescription || "Untitled cost"
}

/**
 * Margin is measured before tax (gross revenue − gross cost): VAT passes through
 * and PPH 23 is withheld, so neither is real income or cost.
 */
export function sellingMargin(
  selling: Pick<Selling, "price" | "currencyPrice" | "quantity" | "vatPercentage" | "pph23Percentage">,
  costings: Pick<SellingLinkedCosting, "price" | "currencyPrice" | "quantity">[]
) {
  const revenue = vendorInvoiceLineGross(selling)
  const net = vendorInvoiceInvoiceLineNet(selling)
  const cost = costings.reduce((sum, costing) => sum + vendorInvoiceLineGross(costing), 0)
  const margin = revenue - cost
  const percent = revenue > 0 ? (margin / revenue) * 100 : 0
  const state: MarginState =
    costings.length === 0 ? "uncosted" : margin < 0 ? "loss" : percent < THIN_MARGIN_PERCENT ? "thin" : "healthy"
  return { revenue, net, cost, margin, percent, state }
}

export const MARGIN_LABEL: Record<MarginState, string> = {
  uncosted: "No costings linked",
  healthy: "Healthy margin",
  thin: "Thin margin",
  loss: "Selling at a loss",
}

export const MARGIN_TONE: Record<MarginState, string> = {
  uncosted: "bg-muted text-muted-foreground",
  healthy: "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]",
  thin: "bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)]",
  loss: "bg-[var(--mli-error-container)] text-[var(--mli-on-error-container)]",
}

export const MARGIN_DOT: Record<MarginState, string> = {
  uncosted: "bg-input",
  healthy: "bg-[var(--mli-positive)]",
  thin: "bg-[var(--mli-on-backup-container)]",
  loss: "bg-[var(--mli-negative)]",
}

export function formatPercent(value: number) {
  return `${value.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`
}
