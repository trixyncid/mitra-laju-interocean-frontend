"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  glassInset,
  tableCellClass,
  tableHeaderCell,
  tableHeaderRow,
  tableRowClass,
  tableShell,
} from "@/lib/design"
import { cn } from "@/lib/utils"

export type MonthlySummaryRow = {
  key: string
  label: string
  sellingCount: number
  sellingTotal: number
  costingCount: number
  costingTotal: number
  netTotal: number
}

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

export default function MonthlySummary({ rows }: { rows: MonthlySummaryRow[] }) {
  if (rows.length === 0) {
    return (
      <div className={cn(glassInset, "px-6 py-10 text-center text-sm text-muted-foreground")}>
        No selling or costing transactions yet to summarize.
      </div>
    )
  }

  const totals = rows.reduce(
    (acc, row) => ({
      sellingCount: acc.sellingCount + row.sellingCount,
      sellingTotal: acc.sellingTotal + row.sellingTotal,
      costingCount: acc.costingCount + row.costingCount,
      costingTotal: acc.costingTotal + row.costingTotal,
      netTotal: acc.netTotal + row.netTotal,
    }),
    {
      sellingCount: 0,
      sellingTotal: 0,
      costingCount: 0,
      costingTotal: 0,
      netTotal: 0,
    }
  )

  return (
    <div className={tableShell}>
      <Table>
        <TableHeader>
          <TableRow className={tableHeaderRow}>
            <TableHead className={tableHeaderCell}>Month</TableHead>
            <TableHead className={cn(tableHeaderCell, "text-right")}>Sellings</TableHead>
            <TableHead className={cn(tableHeaderCell, "text-right")}>Selling total</TableHead>
            <TableHead className={cn(tableHeaderCell, "text-right")}>Costings</TableHead>
            <TableHead className={cn(tableHeaderCell, "text-right")}>Costing total</TableHead>
            <TableHead className={cn(tableHeaderCell, "text-right")}>Net (selling − costing)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key} className={tableRowClass}>
              <TableCell className={cn(tableCellClass, "font-medium")}>{row.label}</TableCell>
              <TableCell className={cn(tableCellClass, "text-right tabular-nums")}>
                {row.sellingCount}
              </TableCell>
              <TableCell className={cn(tableCellClass, "text-right tabular-nums")}>
                {formatIdr(row.sellingTotal)}
              </TableCell>
              <TableCell className={cn(tableCellClass, "text-right tabular-nums")}>
                {row.costingCount}
              </TableCell>
              <TableCell className={cn(tableCellClass, "text-right tabular-nums")}>
                {formatIdr(row.costingTotal)}
              </TableCell>
              <TableCell
                className={cn(
                  tableCellClass,
                  "text-right tabular-nums font-medium",
                  row.netTotal >= 0
                    ? "text-[var(--mli-on-success-container)]"
                    : "text-[var(--mli-on-error-container)]"
                )}
              >
                {formatIdr(row.netTotal)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className={cn(tableHeaderRow, "border-t border-[rgba(214,227,255,0.45)]")}>
            <TableCell className={cn(tableCellClass, "font-semibold")}>All months</TableCell>
            <TableCell className={cn(tableCellClass, "text-right tabular-nums font-semibold")}>
              {totals.sellingCount}
            </TableCell>
            <TableCell className={cn(tableCellClass, "text-right tabular-nums font-semibold")}>
              {formatIdr(totals.sellingTotal)}
            </TableCell>
            <TableCell className={cn(tableCellClass, "text-right tabular-nums font-semibold")}>
              {totals.costingCount}
            </TableCell>
            <TableCell className={cn(tableCellClass, "text-right tabular-nums font-semibold")}>
              {formatIdr(totals.costingTotal)}
            </TableCell>
            <TableCell
              className={cn(
                tableCellClass,
                "text-right tabular-nums font-semibold",
                totals.netTotal >= 0
                  ? "text-[var(--mli-on-success-container)]"
                  : "text-[var(--mli-on-error-container)]"
              )}
            >
              {formatIdr(totals.netTotal)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
