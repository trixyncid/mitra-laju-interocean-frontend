"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { ActiveColumnFilters } from "@/components/column-filter/column-filter"
import { formatIdr, formatIdrCompact } from "@/components/dashboard/overview-card"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { salesFilterParams } from "@/components/sales/sales-filter-provider"
import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import { formatPercent } from "@/components/sellings/selling-margin"
import { TableExportButton } from "@/components/table-export-button"
import type { Sales, SalesSummary } from "@/lib/types/sales"
import { cn } from "@/lib/utils"
import { salesService } from "@/services/sales.service"

/** Totals across every filtered job (all pages), matching the split view's summary. */
function SalesTotals({ summary, total }: { summary: SalesSummary; total: number }) {
  const revenue = Number(summary.revenue)
  const cost = Number(summary.cost)
  const profit = revenue - cost
  const items = [
    { label: "Jobs", value: total.toLocaleString("id-ID"), title: undefined },
    { label: "Revenue", value: formatIdrCompact(revenue), title: formatIdr(revenue) },
    { label: "Cost", value: formatIdrCompact(cost), title: formatIdr(cost) },
    {
      label: "Profit",
      value: `${formatIdrCompact(profit)}${revenue > 0 ? ` · ${formatPercent((profit / revenue) * 100)}` : ""}`,
      title: formatIdr(profit),
      tone: profit < 0 ? "text-[var(--mli-negative)]" : "text-[var(--mli-positive)]",
    },
  ]
  return (
    <dl className="mb-4 flex flex-wrap gap-x-6 gap-y-2 rounded-xl bg-muted/70 px-4 py-3 text-sm" aria-live="polite">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-2">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className={cn("font-semibold tabular-nums text-foreground", item.tone)} title={item.title}>
            {item.value}
          </dd>
        </div>
      ))}
      <p className="basis-full text-[11px] text-muted-foreground sm:ml-auto sm:basis-auto sm:self-center">Before tax · all matching jobs</p>
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
  columns: ColumnDef<Sales>[]
  data: Sales[]
  summary?: SalesSummary
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
      searchPlaceholder="Search number, customer, booking or BL…"
      extra={
        <TableExportButton
          module="SALES"
          noun="sales jobs"
          totalRows={totalRows}
          onExport={() => salesService.exportExcel(salesFilterParams(applied))}
        />
      }
      beforeTable={
        <>
          <ActiveColumnFilters />
          {summary ? <SalesTotals summary={summary} total={totalRows} /> : null}
        </>
      }
    />
  )
}
