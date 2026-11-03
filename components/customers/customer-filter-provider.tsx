"use client"

import { useMemo, type ReactNode } from "react"

import { ColumnFilterProvider } from "@/components/column-filter/column-filter"
import { columnValues, type ColumnSort, type FilterEntry } from "@/components/column-filter/types"
import { CUSTOMER_FILTER_FIELDS, CUSTOMER_SORT_LABELS } from "@/components/customers/customer-filter-fields"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { customerKeys } from "@/lib/query-keys"
import { customersService, type CustomerListParams } from "@/services/customers.service"

type CustomerFilterParams = Omit<CustomerListParams, "page" | "pageSize">

/** Search, the stat-tile quick filters, the column filters and the sort, as request params. */
export function customerFilterParams(applied: AppliedTableFilters): CustomerFilterParams {
  return {
    search: applied.search || undefined,
    status: (applied.status ?? "all") as CustomerFilterParams["status"],
    shipmentType: (applied.shipmentType ?? "all") as CustomerFilterParams["shipmentType"],
    columns: columnValues(applied.columns, CUSTOMER_FILTER_FIELDS),
    sortBy: applied.sort?.by,
    sortDir: applied.sort?.dir,
  }
}

/** Column filters for the customer table and the card view's pills. */
export function CustomerFilterProvider({
  applied,
  onChange,
  children,
}: {
  applied: AppliedTableFilters
  onChange: (next: { columns: Record<string, FilterEntry[]>; sort: ColumnSort | undefined }) => void
  children: ReactNode
}) {
  const facetParams = useMemo(() => {
    const { search, status, shipmentType, columns } = customerFilterParams(applied)
    return { search, status, shipmentType, columns }
  }, [applied])
  return (
    <ColumnFilterProvider
      columns={applied.columns}
      sort={applied.sort}
      fields={CUSTOMER_FILTER_FIELDS}
      sortLabels={CUSTOMER_SORT_LABELS}
      onChange={onChange}
      facetKey={[...customerKeys.all, "facets", facetParams]}
      fetchFacets={(field) => customersService.getFacets(field, facetParams)}
    >
      {children}
    </ColumnFilterProvider>
  )
}
