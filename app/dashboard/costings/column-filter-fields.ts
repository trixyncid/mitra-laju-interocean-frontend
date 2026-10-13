import type { ColumnFilterField } from "@/components/column-filter/types"

/** Excel-style filters above the costing list (it has no column headers). */
export const COSTING_FILTER_FIELDS: Record<string, ColumnFilterField> = {
  vendor: { label: "Vendor", kind: "list" },
  vendorBill: { label: "Vendor bill", kind: "list" },
  charged: { label: "Charged", kind: "list" },
  salesJob: { label: "Sales job", kind: "list" },
  source: { label: "Source", kind: "list" },
  createdDate: { label: "Created", kind: "date" },
}

/** Pills in display order; a pill with only a sort key just sorts. */
export const COSTING_FILTER_PILLS = [
  { field: "vendor", sortKey: "vendor", label: "Vendor" },
  { field: "vendorBill", label: "Vendor bill" },
  { field: "charged", label: "Charged" },
  { field: "salesJob", label: "Sales job" },
  { field: "source", label: "Source" },
  { field: "createdDate", sortKey: "createdDate", label: "Created" },
  { sortKey: "description", label: "Description" },
]

export const COSTING_SORT_LABELS: Record<string, string> = {
  vendor: "Vendor",
  createdDate: "Created date",
  description: "Description",
}
