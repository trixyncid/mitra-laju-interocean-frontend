import type { ColumnFilterField } from "@/components/column-filter/types"

/** Excel-style filters on the customer list. */
export const CUSTOMER_FILTER_FIELDS: Record<string, ColumnFilterField> = {
  customer: { label: "Customer", kind: "list" },
  shipmentType: { label: "Shipment type", kind: "list" },
  modified: { label: "Modified at", kind: "date" },
  status: { label: "Status", kind: "list" },
}

export const CUSTOMER_SORT_LABELS: Record<string, string> = {
  customerName: "Customer name",
  customerCode: "Customer code",
  modified: "Modified at",
}

/** The pills above the card view, which has no column headers. */
export const CUSTOMER_FILTER_BAR = [
  { field: "customer", sortKey: "customerName", label: "Customer" },
  { field: "shipmentType", label: "Shipment type" },
  { field: "status", label: "Status" },
  { field: "modified", sortKey: "modified", label: "Modified at" },
  { sortKey: "customerCode", label: "Code" },
]
