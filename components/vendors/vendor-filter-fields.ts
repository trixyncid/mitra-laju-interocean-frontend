import type { ColumnFilterField } from "@/components/column-filter/types"

/** Excel-style filters on the vendor list (table headers and roster pills). */
export const VENDOR_FILTER_FIELDS: Record<string, ColumnFilterField> = {
  vendor: { label: "Vendor", kind: "list" },
  status: { label: "Status", kind: "list" },
  shipmentType: { label: "Shipment type", kind: "list" },
  service: { label: "Services", kind: "list" },
  modifiedDate: { label: "Modified", kind: "date" },
}

export const VENDOR_SORT_LABELS: Record<string, string> = {
  vendorName: "Vendor name",
  vendorCode: "Vendor code",
  updatedAt: "Modified",
}

/**
 * Pills above the A–Z roster, which has no column headers. The roster is
 * always alphabetical, so the pills only filter.
 */
export const VENDOR_FILTER_PILLS: { field?: string; sortKey?: string; label: string }[] = [
  { field: "vendor", label: "Vendor" },
  { field: "service", label: "Services" },
  { field: "shipmentType", label: "Shipment type" },
  { field: "status", label: "Status" },
  { field: "modifiedDate", label: "Modified" },
]
