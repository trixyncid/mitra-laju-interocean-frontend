"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { IconAlertTriangle } from "@tabler/icons-react"

import {
  COSTING_FILTER_FIELDS,
  COSTING_SORT_LABELS,
} from "@/app/dashboard/costings/column-filter-fields"
import { ActiveColumnFilters, ColumnFilterHeader, ColumnFilterProvider } from "@/components/column-filter/column-filter"
import { columnValues } from "@/components/column-filter/types"
import { formatIdr } from "@/components/dashboard/overview-card"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import ErrorPage from "@/components/error-page"
import TableSkeleton from "@/components/loading/table-skeleton"
import { RecordLink } from "@/components/record-link"
import { CostingRowActions } from "@/components/costings/costing-row-actions"
import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import { useCostingsQuery } from "@/hooks/use-costings"
import { actionColumn } from "@/lib/data-table"
import { primaryText, secondaryText } from "@/lib/design"
import { costingKeys } from "@/lib/query-keys"
import { costingLabel, type Costing } from "@/lib/types/costing"
import {
  cn,
  localDate,
  vendorInvoiceInvoiceLineNet,
  vendorInvoiceLineGross,
  vendorInvoiceLinePph23Amount,
  vendorInvoiceLineVatAmount,
} from "@/lib/utils"
import { costingService } from "@/services/costing.service"

const money = "block text-right tabular-nums"

function Money({ value, strong }: { value: number; strong?: boolean }) {
  return <span className={cn(money, strong ? "font-medium text-foreground" : secondaryText)}>{formatIdr(value)}</span>
}

/** Amount with its rate underneath, e.g. VAT 1.1%. */
function TaxAmount({ value, percent }: { value: number; percent: number | string }) {
  return (
    <span className={money}>
      <span className={secondaryText}>{formatIdr(value)}</span>
      <span className="block text-[11px] text-muted-foreground">{Number(percent).toLocaleString("id-ID")}%</span>
    </span>
  )
}

const rightHeader = (label: string) => <span className="block text-right">{label}</span>

export const costingColumns: ColumnDef<Costing>[] = [
  {
    id: "description",
    header: () => <ColumnFilterHeader sortKey="description" label="Description" />,
    cell: ({ row }) => (
      <Link
        href={`/dashboard/costings/${row.original.id}`}
        className={cn(primaryText, "block max-w-[16rem] truncate hover:underline")}
        title={costingLabel(row.original)}
      >
        {costingLabel(row.original)}
      </Link>
    ),
  },
  {
    id: "vendor",
    header: () => <ColumnFilterHeader field="vendor" sortKey="vendor" label="Vendor" />,
    cell: ({ row }) => <span className={cn(secondaryText, "whitespace-nowrap")}>{row.original.vendor.vendorName}</span>,
  },
  {
    id: "source",
    header: () => <ColumnFilterHeader field="source" label="Source" />,
    cell: ({ row }) => (
      <span className={cn(secondaryText, "whitespace-nowrap")}>
        {row.original.costingSource === "VENDOR_INVOICE" ? "From vendor invoice" : "Typed in"}
      </span>
    ),
  },
  {
    id: "vendorBill",
    header: () => <ColumnFilterHeader field="vendorBill" label="Vendor bill" />,
    cell: ({ row }) => {
      const bill = row.original.vendorInvoiceBreakdowns[0]?.vendorInvoice
      return bill ? (
        <RecordLink
          module="VENDOR_INVOICE"
          href={`/dashboard/vendor-invoices/${bill.id}`}
          className="font-mono text-xs whitespace-nowrap text-foreground hover:underline"
        >
          {bill.vendorInvoiceNumber}
        </RecordLink>
      ) : (
        <span className="text-xs whitespace-nowrap text-muted-foreground">No vendor bill yet</span>
      )
    },
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
    id: "charged",
    header: () => <ColumnFilterHeader field="charged" label="Charged on" />,
    cell: ({ row }) =>
      row.original.selling ? (
        <RecordLink
          module="SELLING"
          href={`/dashboard/sellings/${row.original.selling.id}`}
          className="block max-w-[12rem] truncate text-xs text-foreground hover:underline"
        >
          {row.original.selling.sellingDescription}
        </RecordLink>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mli-warning-container)] px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-[var(--mli-on-warning-container)]">
          <IconAlertTriangle className="size-3" />
          Not charged
        </span>
      ),
  },
  {
    id: "quantity",
    header: () => rightHeader("Qty"),
    cell: ({ row }) => <span className={cn(money, secondaryText)}>{Number(row.original.quantity).toLocaleString("id-ID")}</span>,
  },
  {
    id: "price",
    header: () => rightHeader("Unit price"),
    cell: ({ row }) => <Money value={Number(row.original.price)} />,
  },
  {
    id: "rate",
    header: () => rightHeader("Rate"),
    cell: ({ row }) => (
      <span className={cn(money, secondaryText)}>{Number(row.original.currencyPrice).toLocaleString("id-ID")}</span>
    ),
  },
  {
    id: "gross",
    header: () => rightHeader("Before tax"),
    cell: ({ row }) => <Money value={vendorInvoiceLineGross(row.original)} strong />,
  },
  {
    id: "vat",
    header: () => rightHeader("VAT"),
    cell: ({ row }) => <TaxAmount value={vendorInvoiceLineVatAmount(row.original)} percent={row.original.vatPercentage} />,
  },
  {
    id: "pph23",
    header: () => rightHeader("PPh 23"),
    cell: ({ row }) => (
      <TaxAmount value={vendorInvoiceLinePph23Amount(row.original)} percent={row.original.pph23Percentage} />
    ),
  },
  {
    id: "net",
    header: () => rightHeader("Net"),
    cell: ({ row }) => <Money value={vendorInvoiceInvoiceLineNet(row.original)} strong />,
  },
  {
    id: "createdDate",
    header: () => <ColumnFilterHeader field="createdDate" sortKey="createdDate" label="Created" />,
    cell: ({ row }) => <span className={cn(secondaryText, "whitespace-nowrap")}>{localDate(row.original.createdAt)}</span>,
  },
  {
    ...actionColumn,
    header: () => <span className="block text-right">Actions</span>,
    cell: ({ row }) => <CostingRowActions costing={row.original} />,
  },
]

function SummaryStrip({ items }: { items: { label: string; value: string; tone?: string }[] }) {
  return (
    <dl className="mb-4 flex flex-wrap gap-x-6 gap-y-2 rounded-xl bg-muted/70 px-4 py-3 text-sm" aria-live="polite">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-1.5">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className={cn("font-medium tabular-nums text-foreground", item.tone)}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export { SummaryStrip }

/**
 * Every costing as a table, with Excel-style header filters that share the
 * split view's saved filters, and totals for whatever is filtered.
 */
export function CostingTable({
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
    columns: columnValues(applied.columns, COSTING_FILTER_FIELDS),
    sortBy: applied.sort?.by,
    sortDir: applied.sort?.dir,
  }
  const { data, isLoading, error } = useCostingsQuery({ page, pageSize, ...listParams })
  const facetParams = { search: listParams.search, columns: listParams.columns }

  if (error) return <ErrorPage message={error.message} />
  if (isLoading || !data) return <TableSkeleton />

  const summary = data.summary
  const pagination = data.pagination

  return (
    <ColumnFilterProvider
      columns={applied.columns}
      sort={applied.sort}
      fields={COSTING_FILTER_FIELDS}
      sortLabels={COSTING_SORT_LABELS}
      onChange={({ columns, sort }) => onApply({ ...applied, columns, sort })}
      facetKey={[...costingKeys.all, "facets", facetParams]}
      fetchFacets={(field) => costingService.getFacets(field, facetParams)}
    >
      <ServerEntityDataTable
        columns={costingColumns}
        data={data.items}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        totalRows={pagination.total}
        applied={applied}
        onApply={onApply}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        searchPlaceholder="Search description, vendor or sales number…"
        beforeTable={
          <>
            <ActiveColumnFilters />
            <SummaryStrip
              items={[
                { label: "Lines", value: pagination.total.toLocaleString("id-ID") },
                { label: "Before tax", value: formatIdr(summary.gross) },
                { label: "VAT", value: formatIdr(summary.vat) },
                { label: "PPh 23", value: formatIdr(summary.pph23) },
                { label: "Net", value: formatIdr(summary.net) },
                {
                  label: "Billed by vendors",
                  value: `${formatIdr(summary.billed)} · ${summary.matchedLines.toLocaleString("id-ID")} lines`,
                },
              ]}
            />
          </>
        }
      />
    </ColumnFilterProvider>
  )
}
