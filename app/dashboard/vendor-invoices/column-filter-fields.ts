import type { ColumnFilterField } from "@/components/column-filter/types"

/** Column filters on the "Invoices" table. */
export const INVOICE_FILTER_FIELDS: Record<string, ColumnFilterField> = {
  vendor: { label: "Vendor", kind: "list" },
  type: { label: "Type", kind: "list" },
  invoiceMonth: { label: "Invoice date", kind: "date" },
  taxInvoice: { label: "Tax invoice", kind: "list" },
  status: { label: "Status", kind: "list" },
  paymentMonth: { label: "Payment date", kind: "date" },
}

/** Column filters on the "All lines" table. */
export const LINE_FILTER_FIELDS: Record<string, ColumnFilterField> = {
  vendor: { label: "Vendor", kind: "list" },
  invoiceMonth: { label: "Invoice date", kind: "date" },
  costing: { label: "Costing", kind: "list" },
  status: { label: "Payment", kind: "list" },
}

export const VENDOR_INVOICE_SORT_LABELS: Record<string, string> = {
  vendor: "Vendor",
  invoiceNumber: "Invoice #",
  invoiceDate: "Invoice date",
  paymentDate: "Payment date",
  status: "Status",
  type: "Type",
}

export { columnValues } from "@/components/column-filter/types"
