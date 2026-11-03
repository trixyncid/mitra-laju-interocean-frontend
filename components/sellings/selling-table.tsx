"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"

import {
  SELLING_FILTER_FIELDS,
  SELLING_SORT_LABELS,
} from "@/app/dashboard/sellings/column-filter-fields"
import { ActiveColumnFilters, ColumnFilterHeader, ColumnFilterProvider } from "@/components/column-filter/column-filter"
import { columnValues } from "@/components/column-filter/types"
import { SummaryStrip } from "@/components/costings/costing-table"
import { INVOICE_STATUS_TONE } from "@/components/customer-invoices/invoice-format"
import { formatIdr } from "@/components/dashboard/overview-card"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import ErrorPage from "@/components/error-page"
import TableSkeleton from "@/components/loading/table-skeleton"
import { RecordLink } from "@/components/record-link"
import { formatPercent, MARGIN_TONE, sellingMargin } from "@/components/sellings/selling-margin"
import { SellingRowActions } from "@/components/sellings/selling-row-actions"
import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import { TableExportButton } from "@/components/table-export-button"
import { useSellingLinesPage } from "@/hooks/use-selling-lines"
import { actionColumn } from "@/lib/data-table"
import { primaryText, secondaryText } from "@/lib/design"
import { sellingLineKeys } from "@/lib/query-keys"
import type { Selling } from "@/lib/types/selling"
import { cn, localDate, vendorInvoiceLineGross } from "@/lib/utils"
import { sellingLineService } from "@/services/selling-line.service"

const money = "block text-right tabular-nums"
const rightHeader = (label: string) => <span className="block text-right">{label}</span>

export const sellingColumns: ColumnDef<Selling>[] = [
  {
    id: "description",
    header: () => <ColumnFilterHeader sortKey="description" label="Description" />,
    cell: ({ row }) => (
      <Link
        href={`/dashboard/sellings/${row.original.id}`}
        className={cn(primaryText, "block max-w-[16rem] truncate hover:underline")}
        title={row.original.sellingDescription}
      >
        {row.original.sellingDescription}
      </Link>
    ),
  },
  {
    id: "salesJob",
    header: () => <ColumnFilterHeader field="salesJob" label="Sales job" />,
    cell: ({ row }) =>
      row.original.sales ? (
        <RecordLink
          module="SALES"
          href={`/dashboard/sales/${row.original.sales.id}`}
          className="font-mono text-xs whitespace-nowrap text-foreground hover:underline"
        >
          {row.original.sales.salesNumber}
        </RecordLink>
      ) : (
        <span className="text-xs whitespace-nowrap text-muted-foreground">Not in a job</span>
      ),
  },
  {
    id: "quantity",
    header: () => rightHeader("Qty"),
    cell: ({ row }) => <span className={cn(money, secondaryText)}>{Number(row.original.quantity).toLocaleString("id-ID")}</span>,
  },
  {
    id: "price",
    header: () => rightHeader("Price"),
    cell: ({ row }) => (
      <span className={cn(money, secondaryText)}>
        {formatIdr(Number(row.original.price) * Number(row.original.currencyPrice))}
      </span>
    ),
  },
  {
    id: "gross",
    header: () => rightHeader("Before tax"),
    cell: ({ row }) => <span className={cn(money, "font-medium text-foreground")}>{formatIdr(vendorInvoiceLineGross(row.original))}</span>,
  },
  {
    id: "costs",
    header: () => <ColumnFilterHeader field="costs" label="Costs linked" />,
    cell: ({ row }) => {
      const costs = row.original.costings
      if (!costs.length) return <span className="text-xs whitespace-nowrap text-muted-foreground">None</span>
      const total = costs.reduce((sum, costing) => sum + vendorInvoiceLineGross(costing), 0)
      return (
        <span className="whitespace-nowrap text-xs">
          <span className="text-foreground tabular-nums">{formatIdr(total)}</span>
          <span className="text-muted-foreground"> · {costs.length} cost{costs.length === 1 ? "" : "s"}</span>
        </span>
      )
    },
  },
  {
    id: "margin",
    header: () => rightHeader("Margin"),
    cell: ({ row }) => {
      const { margin, percent, state } = sellingMargin(row.original, row.original.costings)
      return (
        <span className="block text-right">
          <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums", MARGIN_TONE[state])}>
            {state === "uncosted" ? "No costs" : `${formatIdr(margin)} · ${formatPercent(percent)}`}
          </span>
        </span>
      )
    },
  },
  {
    id: "invoice",
    header: () => <ColumnFilterHeader field="invoice" label="Billing" />,
    cell: ({ row }) => {
      const invoice = row.original.customerInvoice
      return invoice ? (
        <RecordLink
          module="CUSTOMER_INVOICE"
          href={`/dashboard/customer-invoices?invoice=${invoice.id}`}
          className={cn(
            "inline-block rounded-full px-2 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap hover:underline",
            INVOICE_STATUS_TONE[invoice.customerInvoiceStatus]
          )}
        >
          {invoice.customerInvoiceNumber}
        </RecordLink>
      ) : (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-muted-foreground">
          Not billed
        </span>
      )
    },
  },
  {
    id: "createdDate",
    header: () => <ColumnFilterHeader field="createdDate" sortKey="createdDate" label="Created" />,
    cell: ({ row }) => <span className={cn(secondaryText, "whitespace-nowrap")}>{localDate(row.original.createdAt)}</span>,
  },
  {
    ...actionColumn,
    header: () => <span className="block text-right">Actions</span>,
    cell: ({ row }) => <SellingRowActions selling={row.original} />,
  },
]

/**
 * Every selling line as a table, with Excel-style header filters that share
 * the split view's saved filters, and totals for whatever is filtered.
 */
export function SellingTable({
  applied,
  onApply,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  applied: AppliedTableFilters
  onApply: (next: AppliedTableFilters) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const listParams = {
    search: applied.search || undefined,
    columns: columnValues(applied.columns, SELLING_FILTER_FIELDS),
    sortBy: applied.sort?.by,
    sortDir: applied.sort?.dir,
  }
  const { data, isLoading, error } = useSellingLinesPage({ page, pageSize, ...listParams })
  const facetParams = { search: listParams.search, columns: listParams.columns }

  if (error) return <ErrorPage message={error.message} />
  if (isLoading || !data) return <TableSkeleton />

  const { summary, pagination } = data
  const revenue = Number(summary.gross)
  const cost = Number(summary.cost)
  const margin = revenue - cost

  return (
    <ColumnFilterProvider
      columns={applied.columns}
      sort={applied.sort}
      fields={SELLING_FILTER_FIELDS}
      sortLabels={SELLING_SORT_LABELS}
      onChange={({ columns, sort }) => onApply({ ...applied, columns, sort })}
      facetKey={[...sellingLineKeys.all, "facets", facetParams]}
      fetchFacets={(field) => sellingLineService.getFacets(field, facetParams)}
    >
      <ServerEntityDataTable
        columns={sellingColumns}
        data={data.items}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        totalRows={pagination.total}
        applied={applied}
        onApply={onApply}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        searchPlaceholder="Search description or sales number…"
        extra={
          <TableExportButton
            module="SELLING"
            noun="selling lines"
            totalRows={pagination.total}
            onExport={() => sellingLineService.exportExcel(listParams)}
          />
        }
        beforeTable={
          <>
            <ActiveColumnFilters />
            <SummaryStrip
              items={[
                { label: "Lines", value: pagination.total.toLocaleString("id-ID") },
                { label: "Costed", value: summary.costedLines.toLocaleString("id-ID") },
                { label: "Revenue", value: formatIdr(revenue) },
                { label: "Cost", value: formatIdr(cost) },
                {
                  label: "Margin",
                  value: `${formatIdr(margin)}${revenue > 0 ? ` · ${formatPercent((margin / revenue) * 100)}` : ""}`,
                  tone: margin < 0 ? "text-[var(--mli-negative)]" : undefined,
                },
              ]}
            />
          </>
        }
      />
    </ColumnFilterProvider>
  )
}
