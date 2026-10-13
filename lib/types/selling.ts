import type { CostingSource } from "@/lib/types/costing"

/** A costing linked to a selling: the cost this charge recovers. */
export type SellingLinkedCosting = {
  id: string
  costingSource: CostingSource
  costingDescription: string | null
  quantity: number
  price: number | string
  currencyPrice: number | string
  vatPercentage: number | string
  pph23Percentage: number | string
  vendor: { id: string; vendorName: string; vendorCode?: string | null }
  vendorInvoiceBreakdowns: { id: string; productDescription: string }[]
}

/** One selling line: what is charged to the customer. */
export type Selling = {
  id: string
  sellingDescription: string
  quantity: number
  price: number | string
  currencyPrice: number | string
  vatPercentage: number | string
  pph23Percentage: number | string
  salesId?: string | null
  sales?: {
    id: string
    salesNumber: string
    salesType: "SHIPMENT" | "OTHERS"
    customer?: { id: string; customerName: string; customerCode: string } | null
  } | null
  costings: SellingLinkedCosting[]
  /** The customer invoice this line is billed on, if any. */
  customerInvoice?: { id: string; customerInvoiceNumber: string; customerInvoiceStatus: "PAID" | "UNPAID" } | null
  createdAt: string
  updatedAt: string
  updatedBy?: { id: string; name: string } | null
  createdBy?: { id: string; name: string } | null
}

export type SellingSummary = {
  lines: number
  gross: string
  vat: string
  pph23: string
  net: string
  /** Gross (before tax) of linked costings. */
  cost: string
  costedLines: number
}

export type SellingInput = {
  sellingDescription: string
  quantity: number
  price: number
  currencyPrice: number
  vatPercentage: number
  pph23Percentage: number
  salesId?: string | null
  costingIds?: string[]
}
