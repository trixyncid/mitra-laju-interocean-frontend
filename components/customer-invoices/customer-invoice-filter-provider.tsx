"use client"

import { useMemo, type ReactNode } from "react"

import { ColumnFilterProvider } from "@/components/column-filter/column-filter"
import { columnValues, type ColumnSort, type FilterEntry } from "@/components/column-filter/types"
import {
  CUSTOMER_INVOICE_FILTER_FIELDS,
  CUSTOMER_INVOICE_SORT_LABELS,
} from "@/components/customer-invoices/customer-invoice-filter-fields"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { customerInvoiceKeys } from "@/lib/query-keys"
import { customerInvoiceService } from "@/services/customer-invoice.service"

/** The column filters and sort of the invoice list, as request params. */
export function customerInvoiceFilterParams(applied: AppliedTableFilters) {
  return {
    search: applied.search || undefined,
    columns: columnValues(applied.columns, CUSTOMER_INVOICE_FILTER_FIELDS),
    sortBy: applied.sort?.by,
    sortDir: applied.sort?.dir,
  }
}

/** Column filters for the invoice table, sharing state with the split view's pills. */
export function CustomerInvoiceFilterProvider({
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
      columns: columnValues(applied.columns, CUSTOMER_INVOICE_FILTER_FIELDS),
    }),
    [applied.search, applied.columns]
  )
  return (
    <ColumnFilterProvider
      columns={applied.columns}
      sort={applied.sort}
      fields={CUSTOMER_INVOICE_FILTER_FIELDS}
      sortLabels={CUSTOMER_INVOICE_SORT_LABELS}
      onChange={onChange}
      facetKey={[...customerInvoiceKeys.all, "facets", facetParams]}
      fetchFacets={(field) => customerInvoiceService.getFacets(field, facetParams)}
    >
      {children}
    </ColumnFilterProvider>
  )
}
