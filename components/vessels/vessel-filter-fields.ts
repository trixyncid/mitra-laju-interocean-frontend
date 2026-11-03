import type { ColumnFilterField } from "@/components/column-filter/types"

/** Excel-style filters on the vessel table and the sailing schedule. */
export const VESSEL_FILTER_FIELDS: Record<string, ColumnFilterField> = {
  vesselName: { label: "Vessel", kind: "list" },
  voyageNumber: { label: "Voyage", kind: "list" },
  etd: { label: "ETD", kind: "date" },
  eta: { label: "ETA", kind: "date" },
  closingReefer: { label: "Closing reefer", kind: "date" },
  status: { label: "Status", kind: "list" },
}

export const VESSEL_SORT_LABELS: Record<string, string> = {
  vesselName: "Vessel",
  voyageNumber: "Voyage",
  etd: "ETD",
  eta: "ETA",
  closingReefer: "Closing reefer",
}

/** The schedule has no column headers: one pill per column, departures first. */
export const VESSEL_FILTER_BAR = [
  { field: "etd", sortKey: "etd", label: "ETD" },
  { field: "vesselName", sortKey: "vesselName", label: "Vessel" },
  { field: "voyageNumber", sortKey: "voyageNumber", label: "Voyage" },
  { field: "eta", sortKey: "eta", label: "ETA" },
  { field: "closingReefer", sortKey: "closingReefer", label: "Closing reefer" },
  { field: "status", label: "Status" },
]
