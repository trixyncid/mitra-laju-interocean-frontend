"use client"

import { useMemo, type ReactNode } from "react"

import { ColumnFilterProvider } from "@/components/column-filter/column-filter"
import { columnValues, type ColumnSort, type FilterEntry } from "@/components/column-filter/types"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { VESSEL_FILTER_FIELDS, VESSEL_SORT_LABELS } from "@/components/vessels/vessel-filter-fields"
import { vesselKeys } from "@/lib/query-keys"
import { vesselsService } from "@/services/vessels.service"

/** The search, column filters and sort of the vessel list, as request params. */
export function vesselFilterParams(applied: AppliedTableFilters) {
  return {
    search: applied.search || undefined,
    columns: columnValues(applied.columns, VESSEL_FILTER_FIELDS),
    sortBy: applied.sort?.by,
    sortDir: applied.sort?.dir,
  }
}

/** Column filters for the vessel table, shared with the schedule view's pills. */
export function VesselFilterProvider({
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
      columns: columnValues(applied.columns, VESSEL_FILTER_FIELDS),
    }),
    [applied.search, applied.columns]
  )
  return (
    <ColumnFilterProvider
      columns={applied.columns}
      sort={applied.sort}
      fields={VESSEL_FILTER_FIELDS}
      sortLabels={VESSEL_SORT_LABELS}
      onChange={onChange}
      facetKey={[...vesselKeys.all, "facets", facetParams]}
      fetchFacets={(field) => vesselsService.getFacets(field, facetParams)}
    >
      {children}
    </ColumnFilterProvider>
  )
}
