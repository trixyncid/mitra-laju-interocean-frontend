import type { CostingSource } from "@/lib/types/costing"
import type { CustomerInvoiceRef, SalesCustomerInvoice } from "@/lib/types/customer-invoice"
import type { ShipmentType } from "@/lib/permissions"

export type SalesType = "SHIPMENT" | "OTHERS"

type Amounts = {
  quantity: number
  price: number | string
  currencyPrice: number | string
  vatPercentage: number | string
  pph23Percentage: number | string
}

type CustomerRef = { id: string; customerName: string; customerCode: string }

/** The shipment a SHIPMENT job is built around (also a shipment picker option). */
export type SalesShipment = {
  id: string
  status: string
  customerCodeId: string
  customerCode: { customerName: string; customerCode: string } | null
  shipmentOperational: {
    shipmentType: ShipmentType | null
    bookingNumber: string | null
    blNumber: string | null
    eta: string | null
    portDeparture: { portName: string } | null
    portDestination: { portName: string } | null
    vessel: { vesselName: string; voyageNumber: string | null } | null
  } | null
}

export type SalesCosting = Amounts & {
  id: string
  costingSource: CostingSource
  costingDescription: string | null
  sellingId: string | null
  vendor: { id: string; vendorName: string; vendorCode?: string | null }
  vendorInvoiceBreakdowns: { id: string; productDescription: string }[]
}

export type SalesSelling = Amounts & {
  id: string
  sellingDescription: string
  customer: CustomerRef | null
  /** The invoice this line is billed on, if any. */
  customerInvoice: CustomerInvoiceRef | null
}

/** A sales job: one shipment (SHIPMENT) or none (OTHERS), plus its costings and sellings. */
export type Sales = {
  id: string
  salesNumber: string
  salesType: SalesType
  customerId: string | null
  customer: CustomerRef | null
  shipment: SalesShipment | null
  costings: SalesCosting[]
  sellings: SalesSelling[]
  customerInvoices: SalesCustomerInvoice[]
  _count: { customerInvoices: number }
  createdAt: string
  updatedAt: string
  updatedBy?: { id: string; name: string } | null
  createdBy?: { id: string; name: string } | null
}

/** Before-tax totals across every filtered job. */
export type SalesSummary = { jobs: number; revenue: string; cost: string }

export type SalesInput = {
  salesType: SalesType
  shipmentId?: string
  customerId?: string | null
  costingIds?: string[]
  sellingIds?: string[]
}

export type SalesUpdate = {
  salesType?: SalesType
  shipmentId?: string | null
  customerId?: string | null
}

export const SALES_TYPE_LABEL: Record<SalesType, string> = { SHIPMENT: "Shipment", OTHERS: "Others" }
