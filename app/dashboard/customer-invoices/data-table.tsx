"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { ActiveColumnFilters } from "@/components/column-filter/column-filter"
import { formatIdr, formatIdrCompact } from "@/components/dashboard/overview-card"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import type { CustomerInvoice, CustomerInvoiceSummary } from "@/lib/types/customer-invoice"

/** Totals across every filtered invoice (all pages), matching the split view's summary. */
function InvoiceTotals({ summary }: { summary: CustomerInvoiceSummary }) {
  const billed = Number(summary.total)
  const outstanding = Number(summary.outstanding)
  return (
    <dl className="mb-4 flex flex-wrap gap-x-6 gap-y-2 rounded-xl bg-muted/70 px-4 py-3 text-sm" aria-live="polite">
      <div className="flex items-baseline gap-2">
        <dt className="text-xs text-muted-foreground">Invoices</dt>
        <dd className="font-semibold tabular-nums">{summary.invoices.toLocaleString("id-ID")}</dd>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="text-xs text-muted-foreground">Billed</dt>
        <dd className="font-semibold tabular-nums" title={formatIdr(billed)}>
          {formatIdrCompact(billed)}
        </dd>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="text-xs text-muted-foreground">Still to collect</dt>
        <dd
          className={outstanding > 0 ? "font-semibold tabular-nums text-[var(--mli-on-warning-container)]" : "font-semibold tabular-nums"}
          title={formatIdr(outstanding)}
        >
          {formatIdrCompact(outstanding)}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            ({summary.unpaidInvoices} unpaid)
          </span>
        </dd>
      </div>
      <p className="basis-full text-[11px] text-muted-foreground sm:ml-auto sm:basis-auto sm:self-center">Incl. tax · all matching invoices</p>
    </dl>
  )
}

export function DataTable({
  columns,
  data,
  summary,
  page,
  pageSize,
  totalPages,
  totalRows,
  applied,
  onApply,
  onPageChange,
  onPageSizeChange,
}: {
  columns: ColumnDef<CustomerInvoice>[]
  data: CustomerInvoice[]
  summary?: CustomerInvoiceSummary
  page: number
  pageSize: number
  totalPages: number
  totalRows: number
  applied: AppliedTableFilters
  onApply: (next: AppliedTableFilters) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  return (
    <ServerEntityDataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      totalRows={totalRows}
      applied={applied}
      onApply={onApply}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      searchPlaceholder="Search invoice #, customer, sales # or tax invoice…"
      beforeTable={
        <>
          <ActiveColumnFilters />
          {summary ? <InvoiceTotals summary={summary} /> : null}
        </>
      }
    />
  )
}
