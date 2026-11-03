"use client"

import { useMemo, type ReactNode } from "react"

import { ColumnFilterProvider } from "@/components/column-filter/column-filter"
import { columnValues, type ColumnSort, type FilterEntry } from "@/components/column-filter/types"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { USER_FILTER_FIELDS, USER_SORT_LABELS } from "@/components/users/user-filter-fields"
import { userKeys } from "@/lib/query-keys"
import { usersService } from "@/services/users.service"

/** The search, column filters and sort of the team list, as request params. */
export function userFilterParams(applied: AppliedTableFilters) {
  return {
    search: applied.search || undefined,
    columns: columnValues(applied.columns, USER_FILTER_FIELDS),
    sortBy: applied.sort?.by,
    sortDir: applied.sort?.dir,
  }
}

/** Column filters for the team table, shared with the cards view's pills. */
export function UserFilterProvider({
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
      columns: columnValues(applied.columns, USER_FILTER_FIELDS),
    }),
    [applied.search, applied.columns]
  )
  return (
    <ColumnFilterProvider
      columns={applied.columns}
      sort={applied.sort}
      fields={USER_FILTER_FIELDS}
      sortLabels={USER_SORT_LABELS}
      onChange={onChange}
      facetKey={[...userKeys.all, "facets", facetParams]}
      fetchFacets={(field) => usersService.getFacets(field, facetParams)}
    >
      {children}
    </ColumnFilterProvider>
  )
}
