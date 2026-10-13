import type { SalesType } from "@/lib/types/sales"

export type CustomerInvoiceType = "INVOICE" | "REIMBURSEMENT"
export type CustomerInvoiceStatus = "PAID" | "UNPAID"

/** How a billed selling points at its invoice. */
export type CustomerInvoiceRef = {
  id: string
  customerInvoiceNumber: string
  customerInvoiceStatus: CustomerInvoiceStatus
}

type InvoiceFields = {
  customerInvoiceNumber: string
  customerInvoiceType: CustomerInvoiceType
  customerInvoiceDate: string | null
  customerInvoiceStatus: CustomerInvoiceStatus
  paymentDate: string | null
  taxInvoice: string | null
  taxInvoiceDate: string | null
  remarks: string | null
}

/** An invoice as listed on its sales job (amounts come from the job's sellings). */
export type SalesCustomerInvoice = InvoiceFields & { id: string }

export type CustomerInvoiceSelling = {
  id: string
  sellingDescription: string
  quantity: number
  price: number | string
  currencyPrice: number | string
  vatPercentage: number | string
  pph23Percentage: number | string
}

/** A bill to the customer for some of a sales job's selling lines. */
export type CustomerInvoice = InvoiceFields & {
  id: string
  salesId: string
  sales: {
    id: string
    salesNumber: string
    salesType: SalesType
    customer: { id: string; customerName: string; customerCode: string } | null
    shipment: {
      id: string
      customerCode: { customerName: string } | null
      shipmentOperational: {
        bookingNumber: string | null
        blNumber: string | null
        vessel: { vesselName: string; voyageNumber: string | null } | null
      } | null
    } | null
  }
  sellings: CustomerInvoiceSelling[]
  createdAt: string
  updatedAt: string
  updatedBy?: { id: string; name: string } | null
  createdBy?: { id: string; name: string } | null
}

/** Amount due (subtotal + VAT − PPh 23) across every filtered invoice. */
export type CustomerInvoiceSummary = { invoices: number; unpaidInvoices: number; total: string; outstanding: string }

export type CustomerInvoiceInput = {
  salesId: string
  /** Omit to use the sales number (the server adds a suffix when it is taken). */
  customerInvoiceNumber?: string
  customerInvoiceType: CustomerInvoiceType
  customerInvoiceDate?: string | null
  customerInvoiceStatus?: CustomerInvoiceStatus
  paymentDate?: string | null
  taxInvoice?: string | null
  taxInvoiceDate?: string | null
  remarks?: string | null
  sellingIds: string[]
}

export type CustomerInvoiceUpdate = Partial<Omit<CustomerInvoiceInput, "salesId">>

export const INVOICE_TYPE_LABEL: Record<CustomerInvoiceType, string> = {
  INVOICE: "Invoice",
  REIMBURSEMENT: "Reimbursement",
}

export const INVOICE_STATUS_LABEL: Record<CustomerInvoiceStatus, string> = { PAID: "Paid", UNPAID: "Unpaid" }
