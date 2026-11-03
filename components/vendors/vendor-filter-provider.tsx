"use client"

import { useMemo, type ReactNode } from "react"

import { ColumnFilterProvider } from "@/components/column-filter/column-filter"
import { columnValues, type ColumnSort, type FilterEntry } from "@/components/column-filter/types"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { VENDOR_FILTER_FIELDS, VENDOR_SORT_LABELS } from "@/components/vendors/vendor-filter-fields"
import { vendorKeys } from "@/lib/query-keys"
import { vendorsService, type VendorListParams } from "@/services/vendors.service"

type StatusFilter = NonNullable<VendorListParams["status"]>
type ShipmentTypeFilter = NonNullable<VendorListParams["shipmentType"]>

/** Search, the status / type pills and the column filters, as request params (no paging or sort). */
export function vendorFilterParams(applied: AppliedTableFilters) {
  return {
    search: applied.search || undefined,
    status: (applied.status || "all") as StatusFilter,
    shipmentType: (applied.shipmentType ?? "all") as ShipmentTypeFilter,
    columns: columnValues(applied.columns, VENDOR_FILTER_FIELDS),
  }
}

/** Column filters for the vendor table and roster, sharing one saved state. */
export function VendorFilterProvider({
  applied,
  onChange,
  children,
}: {
  applied: AppliedTableFilters
  onChange: (next: { columns: Record<string, FilterEntry[]>; sort: ColumnSort | undefined }) => void
  children: ReactNode
}) {
  const facetParams = useMemo(
    () => ({
      search: applied.search || undefined,
      status: (applied.status || "all") as StatusFilter,
      shipmentType: (applied.shipmentType ?? "all") as ShipmentTypeFilter,
      columns: columnValues(applied.columns, VENDOR_FILTER_FIELDS),
    }),
    [applied.search, applied.status, applied.shipmentType, applied.columns]
  )
  return (
    <ColumnFilterProvider
      columns={applied.columns}
      sort={applied.sort}
      fields={VENDOR_FILTER_FIELDS}
      sortLabels={VENDOR_SORT_LABELS}
      onChange={onChange}
      facetKey={[...vendorKeys.all, "facets", facetParams]}
      fetchFacets={(field) => vendorsService.getFacets(field, facetParams)}
    >
      {children}
    </ColumnFilterProvider>
  )
}
