"use client"

import { useMemo, type ReactNode } from "react"

import { ColumnFilterProvider } from "@/components/column-filter/column-filter"
import { columnValues, type ColumnSort, type FilterEntry } from "@/components/column-filter/types"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { SALES_FILTER_FIELDS, SALES_SORT_LABELS } from "@/components/sales/sales-filter-fields"
import { salesKeys } from "@/lib/query-keys"
import { salesService } from "@/services/sales.service"

/** The column filters and sort of the sales list, as request params. */
export function salesFilterParams(applied: AppliedTableFilters) {
  return {
    search: applied.search || undefined,
    columns: columnValues(applied.columns, SALES_FILTER_FIELDS),
    sortBy: applied.sort?.by,
    sortDir: applied.sort?.dir,
  }
}

/** Column filters for the sales table, sharing state with the split view's pills. */
export function SalesFilterProvider({
  applied,
  onChange,
  children,
}: {
  applied: AppliedTableFilters
  onChange: (next: { columns: Record<string, FilterEntry[]>; sort: ColumnSort | undefined }) => void
  children: ReactNode
}) {
  const facetParams = useMemo(
    () => ({ search: applied.search || undefined, columns: columnValues(applied.columns, SALES_FILTER_FIELDS) }),
    [applied.search, applied.columns]
  )
  return (
    <ColumnFilterProvider
      columns={applied.columns}
      sort={applied.sort}
      fields={SALES_FILTER_FIELDS}
      sortLabels={SALES_SORT_LABELS}
      onChange={onChange}
      facetKey={[...salesKeys.all, "facets", facetParams]}
      fetchFacets={(field) => salesService.getFacets(field, facetParams)}
    >
      {children}
    </ColumnFilterProvider>
  )
}
