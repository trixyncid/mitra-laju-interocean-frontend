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

export type VendorMonthlySummaryRow = {
  key: string
  label: string
  vendorInvoiceCount: number
  vendorInvoiceTotal: number
  paidTotal: number
  unpaidTotal: number
}

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

export default function MonthlySummary({ rows }: { rows: VendorMonthlySummaryRow[] }) {
  if (rows.length === 0) {
    return (
      <div className={cn(glassInset, "px-6 py-10 text-center text-sm text-muted-foreground")}>
        No vendor invoice transactions yet to summarize.
      </div>
    )
  }

  const totals = rows.reduce(
    (acc, row) => ({
      vendorInvoiceCount: acc.vendorInvoiceCount + row.vendorInvoiceCount,
      vendorInvoiceTotal: acc.vendorInvoiceTotal + row.vendorInvoiceTotal,
      paidTotal: acc.paidTotal + row.paidTotal,
      unpaidTotal: acc.unpaidTotal + row.unpaidTotal,
    }),
    {
      vendorInvoiceCount: 0,
      vendorInvoiceTotal: 0,
      paidTotal: 0,
      unpaidTotal: 0,
    }
  )

  return (
    <div className={tableShell}>
      <Table>
        <TableHeader>
          <TableRow className={tableHeaderRow}>
            <TableHead className={tableHeaderCell}>Month</TableHead>
            <TableHead className={cn(tableHeaderCell, "text-right")}>VendorInvoices</TableHead>
            <TableHead className={cn(tableHeaderCell, "text-right")}>Total</TableHead>
            <TableHead className={cn(tableHeaderCell, "text-right")}>Paid</TableHead>
            <TableHead className={cn(tableHeaderCell, "text-right")}>Unpaid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key} className={tableRowClass}>
              <TableCell className={cn(tableCellClass, "font-medium")}>{row.label}</TableCell>
              <TableCell className={cn(tableCellClass, "text-right tabular-nums")}>
                {row.vendorInvoiceCount}
              </TableCell>
              <TableCell className={cn(tableCellClass, "text-right tabular-nums")}>
                {formatIdr(row.vendorInvoiceTotal)}
              </TableCell>
              <TableCell
                className={cn(
                  tableCellClass,
                  "text-right tabular-nums text-[var(--mli-on-success-container)]"
                )}
              >
                {formatIdr(row.paidTotal)}
              </TableCell>
              <TableCell
                className={cn(
                  tableCellClass,
                  "text-right tabular-nums text-[var(--mli-on-error-container)]"
                )}
              >
                {formatIdr(row.unpaidTotal)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className={cn(tableHeaderRow, "border-t border-[rgba(var(--mli-tint-rgb),0.45)]")}>
            <TableCell className={cn(tableCellClass, "font-semibold")}>All months</TableCell>
            <TableCell className={cn(tableCellClass, "text-right tabular-nums font-semibold")}>
              {totals.vendorInvoiceCount}
            </TableCell>
            <TableCell className={cn(tableCellClass, "text-right tabular-nums font-semibold")}>
              {formatIdr(totals.vendorInvoiceTotal)}
            </TableCell>
            <TableCell
              className={cn(
                tableCellClass,
                "text-right tabular-nums font-semibold text-[var(--mli-on-success-container)]"
              )}
            >
              {formatIdr(totals.paidTotal)}
            </TableCell>
            <TableCell
              className={cn(
                tableCellClass,
                "text-right tabular-nums font-semibold text-[var(--mli-on-error-container)]"
              )}
            >
              {formatIdr(totals.unpaidTotal)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
