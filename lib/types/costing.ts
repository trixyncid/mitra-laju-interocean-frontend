/** A vendor invoice line matched against a costing (what the vendor actually billed). */
export type CostingMatchedLine = {
  id: string
  productDescription: string
  quantity: number
  price: number | string
  currencyPrice: number | string
  vatPercentage?: number | string | null
  pph23Percentage?: number | string | null
  containerNumber?: string | null
  vendorInvoice: {
    id: string
    vendorInvoiceNumber: string
    status: string
    vendorInvoiceDate?: string | null
  }
}

export type CostingSource = "MANUAL" | "VENDOR_INVOICE"

/** One costing line: an expected cost from a vendor, optionally under a sales job. */
export type Costing = {
  id: string
  /** VENDOR_INVOICE costings copy their amounts from (and follow) one vendor invoice line. */
  costingSource: CostingSource
  /** Optional for VENDOR_INVOICE costings; see `costingLabel`. */
  costingDescription: string | null
  quantity: number
  price: number | string
  currencyPrice: number | string
  vatPercentage: number | string
  pph23Percentage: number | string
  vendorId: string
  vendor: { id: string; vendorName: string; vendorCode?: string | null }
  salesId?: string | null
  sales?: {
    id: string
    salesNumber: string
    salesType: "SHIPMENT" | "OTHERS"
    customer?: { id: string; customerName: string; customerCode: string } | null
  } | null
  vendorInvoiceBreakdowns: CostingMatchedLine[]
  /** The selling line this cost is recovered through, if any. */
  selling?: { id: string; sellingDescription: string; isActive: boolean } | null
  createdAt: string
  updatedAt: string
  updatedBy?: { id: string; name: string } | null
  createdBy?: { id: string; name: string } | null
}

export type CostingSummary = {
  lines: number
  gross: string
  vat: string
  pph23: string
  net: string
  billed: string
  matchedLines: number
}

export type ManualCostingInput = {
  source: "MANUAL"
  costingDescription: string
  quantity: number
  price: number
  currencyPrice: number
  vatPercentage: number
  pph23Percentage: number
  vendorId: string
  salesId?: string | null
}

/** A vendor invoice line to create together with the costing. */
export type NewVendorInvoiceLineDraft = {
  productDescription: string
  quantity: number
  price: number
  currencyPrice: number
  vatPercentage: number
  pph23Percentage: number
  containerNumber?: string
}

export type NewVendorInvoiceHeaderDraft = {
  vendorId: string
  vendorInvoiceNumber: string
  vendorInvoiceType: "INVOICE" | "REIMBURSEMENT"
  vendorInvoiceDate?: string
  vendorVessel?: string
}

export type VendorInvoiceCostingInput = {
  source: "VENDOR_INVOICE"
  /** An existing, unmatched line… */
  breakdownId?: string
  /** …or a new line on an existing invoice (`vendorInvoiceId`) or a new one (`vendorInvoice`). */
  newLine?: {
    vendorInvoiceId?: string
    vendorInvoice?: NewVendorInvoiceHeaderDraft
    breakdown: NewVendorInvoiceLineDraft
  }
  costingDescription?: string | null
  salesId?: string | null
}

export type CostingInput = ManualCostingInput | VendorInvoiceCostingInput

/** What to call a costing: its own description, else its vendor invoice line's. */
export function costingLabel(costing: Pick<Costing, "costingDescription" | "vendorInvoiceBreakdowns">) {
  return (
    costing.costingDescription ||
    costing.vendorInvoiceBreakdowns?.[0]?.productDescription ||
    "Untitled cost"
  )
}

export type SalesOption = {
  id: string
  salesNumber: string
  salesType: "SHIPMENT" | "OTHERS"
  customer?: { id: string; customerName: string; customerCode: string } | null
}
