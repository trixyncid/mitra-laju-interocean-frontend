import type { ColumnFilterField } from "@/components/column-filter/types"

/** Excel-style column filters on the shipment list (table headers and split-view pills). */
export const SHIPMENT_FILTER_FIELDS: Record<string, ColumnFilterField> = {
  customer: { label: "Customer", kind: "list" },
  type: { label: "Type", kind: "list" },
  status: { label: "Status", kind: "list" },
  vessel: { label: "Vessel", kind: "list" },
  departure: { label: "From", kind: "list" },
  destination: { label: "To", kind: "list" },
  loading: { label: "Loading out", kind: "date" },
  eta: { label: "ETA", kind: "date" },
  bl: { label: "BL number", kind: "list" },
  service: { label: "Services", kind: "list" },
  serviceVendor: { label: "Service vendor", kind: "list" },
}

export const SHIPMENT_SORT_LABELS: Record<string, string> = {
  customer: "Customer",
  type: "Type",
  status: "Status",
  vessel: "Vessel",
  departure: "From",
  destination: "To",
  loading: "Loading out",
  eta: "ETA",
}

/**
 * Pills above the split-view list. The status tabs pick one status; the
 * Status pill is there for ticking several.
 */
export const SHIPMENT_FILTER_PILLS: { field?: string; sortKey?: string; label: string }[] = [
  { field: "customer", sortKey: "customer", label: "Customer" },
  { field: "status", sortKey: "status", label: "Status" },
  { field: "type", sortKey: "type", label: "Type" },
  { field: "vessel", sortKey: "vessel", label: "Vessel" },
  { field: "departure", sortKey: "departure", label: "From" },
  { field: "destination", sortKey: "destination", label: "To" },
  { field: "loading", sortKey: "loading", label: "Loading out" },
  { field: "eta", sortKey: "eta", label: "ETA" },
  { field: "bl", label: "BL number" },
  { field: "service", label: "Services" },
  { field: "serviceVendor", label: "Service vendor" },
]
