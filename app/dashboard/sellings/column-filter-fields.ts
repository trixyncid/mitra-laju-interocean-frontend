import type { ColumnFilterField } from "@/components/column-filter/types"

/** Excel-style filters above the selling list (it has no column headers). */
export const SELLING_FILTER_FIELDS: Record<string, ColumnFilterField> = {
  invoice: { label: "Billing", kind: "list" },
  costs: { label: "Costs", kind: "list" },
  salesJob: { label: "Sales job", kind: "list" },
  createdDate: { label: "Created", kind: "date" },
}

/** Pills in display order; a pill with only a sort key just sorts. */
export const SELLING_FILTER_PILLS = [
  { field: "invoice", label: "Billing" },
  { field: "costs", label: "Costs" },
  { field: "salesJob", label: "Sales job" },
  { field: "createdDate", sortKey: "createdDate", label: "Created" },
  { sortKey: "description", label: "Description" },
]

export const SELLING_SORT_LABELS: Record<string, string> = {
  createdDate: "Created date",
  description: "Description",
}
