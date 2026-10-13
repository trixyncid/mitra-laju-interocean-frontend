import type { ColumnFilterField } from "@/components/column-filter/types"

/** Excel-style filters above the sales job list. */
export const SALES_FILTER_FIELDS: Record<string, ColumnFilterField> = {
  customer: { label: "Customer", kind: "list" },
  jobType: { label: "Job type", kind: "list" },
  shipmentType: { label: "Shipment type", kind: "list" },
  opened: { label: "Opened", kind: "date" },
  billing: { label: "Billing", kind: "list" },
}

export const SALES_SORT_LABELS: Record<string, string> = {
  salesNumber: "Sales number",
  customer: "Customer",
  opened: "Opened date",
}

/** The pills, in reading order; some also sort the list. */
export const SALES_FILTER_BAR = [
  { field: "customer", sortKey: "customer", label: "Customer" },
  { field: "jobType", label: "Job type" },
  { field: "shipmentType", label: "Shipment type" },
  { field: "opened", sortKey: "opened", label: "Opened" },
  { field: "billing", label: "Billing" },
  { sortKey: "salesNumber", label: "Sales #" },
]
