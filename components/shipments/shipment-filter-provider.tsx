"use client"

import { useMemo, type ReactNode } from "react"

import { SHIPMENT_FILTER_FIELDS, SHIPMENT_SORT_LABELS } from "@/app/dashboard/shipments/column-filter-fields"
import { ColumnFilterProvider } from "@/components/column-filter/column-filter"
import { columnValues, type ColumnSort, type FilterEntry } from "@/components/column-filter/types"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { shipmentKeys } from "@/lib/query-keys"
import { shipmentsService } from "@/services/shipments.service"

/** The column filters and sort of the shipment list, as request params. */
export function shipmentFilterParams(applied: AppliedTableFilters) {
  return {
    search: applied.search || undefined,
    columns: columnValues(applied.columns, SHIPMENT_FILTER_FIELDS),
    sortBy: applied.sort?.by,
    sortDir: applied.sort?.dir,
  }
}

/**
 * Column filters for both shipment views (table headers and split-view
 * pills), so a filter set in one view is still there in the other.
 */
export function ShipmentFilterProvider({
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
      columns: columnValues(applied.columns, SHIPMENT_FILTER_FIELDS),
    }),
    [applied.search, applied.columns]
  )
  return (
    <ColumnFilterProvider
      columns={applied.columns}
      sort={applied.sort}
      fields={SHIPMENT_FILTER_FIELDS}
      sortLabels={SHIPMENT_SORT_LABELS}
      onChange={onChange}
      facetKey={[...shipmentKeys.all, "facets", facetParams]}
      fetchFacets={(field) => shipmentsService.getFacets(field, facetParams)}
    >
      {children}
    </ColumnFilterProvider>
  )
}
