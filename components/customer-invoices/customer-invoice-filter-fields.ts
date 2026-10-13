import type { ColumnFilterField } from "@/components/column-filter/types"

/** Excel-style filters above the customer invoice list. */
export const CUSTOMER_INVOICE_FILTER_FIELDS: Record<string, ColumnFilterField> = {
  status: { label: "Status", kind: "list" },
  customer: { label: "Customer", kind: "list" },
  type: { label: "Type", kind: "list" },
  invoiceDate: { label: "Invoice date", kind: "date" },
  paymentDate: { label: "Payment date", kind: "date" },
  taxInvoice: { label: "Tax invoice", kind: "list" },
}

export const CUSTOMER_INVOICE_SORT_LABELS: Record<string, string> = {
  invoiceNumber: "Invoice number",
  customer: "Customer",
  invoiceDate: "Invoice date",
  paymentDate: "Payment date",
}

/** The pills, most-used first (finance chases unpaid invoices); some also sort. */
export const CUSTOMER_INVOICE_FILTER_BAR = [
  { field: "status", label: "Status" },
  { field: "customer", sortKey: "customer", label: "Customer" },
  { field: "invoiceDate", sortKey: "invoiceDate", label: "Invoice date" },
  { field: "paymentDate", sortKey: "paymentDate", label: "Payment date" },
  { field: "type", label: "Type" },
  { field: "taxInvoice", label: "Tax invoice" },
  { sortKey: "invoiceNumber", label: "Invoice #" },
]
